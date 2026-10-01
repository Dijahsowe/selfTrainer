import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const baseUrl = process.env.SMOKE_TEST_BASE_URL || 'http://localhost:3001';
const email = `mobile-smoke-${Date.now()}@example.test`;
const otherEmail = `mobile-smoke-other-${Date.now()}@example.test`;
const password = 'MobileSmokePass123!';
const sourceText = [
  'Photosynthesis is the process by which plants convert light energy into chemical energy.',
  'Chlorophyll in chloroplasts absorbs light, which powers reactions that turn carbon dioxide and water into glucose and oxygen.',
  'The light-dependent reactions produce ATP and NADPH, while the Calvin cycle uses these molecules to fix carbon.',
  'Photosynthesis supports most food webs by storing energy in organic molecules and releasing oxygen into the atmosphere.',
].join(' ');
const userIds = [];

async function request(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

function pass(label, condition = true) {
  assert.ok(condition, label);
  console.log(`PASS ${label}`);
}

try {
  let result = await request('/api/study-materials');
  pass('protected API rejects anonymous requests', result.response.status === 401);

  result = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Mobile smoke test', email, password }),
  });
  pass('registration creates a user', result.response.status === 201 && !!result.payload.user?.id);
  userIds.push(result.payload.user.id);

  result = await request('/api/auth/mobile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const token = result.payload.accessToken;
  pass('mobile sign-in returns a bearer token', result.response.ok && typeof token === 'string' && token.length > 20);

  result = await request('/api/dashboard/stats', { token });
  pass('bearer token authorizes dashboard stats', result.response.ok && result.payload.stats.totalMaterials === 0);

  result = await request('/api/subjects', {
    method: 'POST', token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Mobile smoke subject' }),
  });
  pass('subjects can be created with bearer auth', result.response.status === 201);
  const subjectId = result.payload.subject.id;

  result = await request('/api/study-materials', {
    method: 'POST', token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Photosynthesis smoke test', sourceText, subjectId }),
  });
  pass('study materials can be created with bearer auth', result.response.status === 201);
  const materialId = result.payload.material.id;

  result = await request('/api/study-materials', { token });
  pass('materials list returns the new material', result.response.ok && result.payload.materials.some((material) => material.id === materialId));

  result = await request(`/api/study-materials/${materialId}/summarize`, { method: 'POST', token });
  pass('summary generation works from a mobile-authenticated request', result.response.status === 201 && !!result.payload.summary?.content);

  result = await request(`/api/study-materials/${materialId}/flashcards`, { method: 'POST', token });
  pass('flashcard generation works from a mobile-authenticated request', result.response.status === 201 && result.payload.deck.flashcards.length > 0);

  result = await request(`/api/study-materials/${materialId}/quizzes`, { method: 'POST', token });
  pass('quiz generation withholds answers before submission', result.response.status === 201 && result.payload.quiz.questions.length > 0 && result.payload.quiz.questions.every((question) => !('correctAnswer' in question)));
  const quizId = result.payload.quiz.id;

  result = await request(`/api/study-materials/${materialId}`, { token });
  const questions = result.payload.material.quizzes[0].questions;
  pass('material detail withholds quiz answers before submission', result.response.ok && questions.length > 0 && questions.every((question) => !('correctAnswer' in question)));

  result = await request(`/api/quizzes/${quizId}/attempt`, {
    method: 'POST', token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAnswers: Object.fromEntries(questions.map((question) => [question.id, question.options[0]])) }),
  });
  pass('quiz attempt returns scored answer feedback', result.response.status === 201 && result.payload.questionResults[questions[0].id]?.correctAnswer);

  await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Other smoke user', email: otherEmail, password }),
  }).then(({ response, payload }) => {
    assert.equal(response.status, 201, payload.error);
    userIds.push(payload.user.id);
  });
  const otherLogin = await request('/api/auth/mobile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: otherEmail, password }),
  });
  const otherToken = otherLogin.payload.accessToken;
  result = await request(`/api/quizzes/${quizId}/attempt`, {
    method: 'POST', token: otherToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAnswers: {} }),
  });
  pass('quiz attempts cannot be attached to another user\'s quiz', result.response.status === 404);

  result = await request('/api/study-plans', {
    method: 'POST', token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Smoke plan', topic: 'Photosynthesis', durationMin: 30 }),
  });
  pass('study plans can be created with bearer auth', result.response.status === 201);

  result = await request('/api/study-sessions', {
    method: 'POST', token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Smoke session', topic: 'Photosynthesis', durationMin: 25, completed: true }),
  });
  pass('study sessions can be logged with bearer auth', result.response.status === 201);

  result = await request('/api/study-plans', { token });
  pass('study plan list is available to bearer sessions', result.response.ok && result.payload.plans.length === 1);
  result = await request('/api/study-sessions', { token });
  pass('study session list is available to bearer sessions', result.response.ok && result.payload.sessions.length === 1);

  result = await request(`/api/study-materials/${materialId}`, {
    method: 'PATCH', token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Edited photosynthesis notes' }),
  });
  pass('study materials can be edited with bearer auth', result.response.ok && result.payload.material.title === 'Edited photosynthesis notes');

  const form = new FormData();
  form.append('file', new File([sourceText], 'mobile-smoke.txt', { type: 'text/plain' }));
  result = await request('/api/study-materials/upload', { method: 'POST', token, body: form });
  pass('document upload works with bearer auth', result.response.status === 201 && !!result.payload.material?.id);

  result = await request(`/api/study-materials/${materialId}`, { method: 'DELETE', token });
  pass('materials can be deleted with bearer auth', result.response.ok);
} finally {
  if (userIds.length) await prisma.user.deleteMany({ where: { id: { in: userIds } } }).catch(() => undefined);
  await prisma.$disconnect();
}

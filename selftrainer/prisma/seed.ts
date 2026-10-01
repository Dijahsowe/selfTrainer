import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database for Phase 8 Beta Release...");

  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "betauser@example.com" },
    update: {},
    create: {
      email: "betauser@example.com",
      name: "Beta Learner",
      password: hashedPassword,
    },
  });

  const subject = await prisma.subject.upsert({
    where: {
      userId_name: {
        userId: user.id,
        name: "Computer Science",
      },
    },
    update: {},
    create: {
      userId: user.id,
      name: "Computer Science",
    },
  });

  const material = await prisma.studyMaterial.create({
    data: {
      userId: user.id,
      subjectId: subject.id,
      title: "Introduction to Algorithms & Data Structures",
      sourceText:
        "Data structures are foundational concepts in computer science used to organize and store data efficiently. Common data structures include arrays, linked lists, stacks, queues, trees, and graphs. Choosing the right data structure directly impacts algorithmic time and space complexity.",
      wordCount: 120,
      status: "completed",
    },
  });

  await prisma.summary.create({
    data: {
      studyMaterialId: material.id,
      userId: user.id,
      content:
        "Data structures organize and store data efficiently. Common structures include arrays, linked lists, stacks, queues, and trees. Proper choice directly optimizes time and space complexity.",
      keyPoints: JSON.stringify([
        "Data structures govern efficient data storage.",
        "Key types: arrays, lists, stacks, queues, trees.",
        "Impacts algorithm time and space complexity.",
      ]),
      keyTerms: JSON.stringify([
        {
          term: "Time Complexity",
          definition: "A measure of computational time required by an algorithm.",
        },
        {
          term: "Data Structure",
          definition: "A specialized format for organizing, processing, and storing data.",
        },
      ]),
      model: "mock",
      promptVersion: "v1.0",
    },
  });

  await prisma.flashcardDeck.create({
    data: {
      studyMaterialId: material.id,
      title: "Algorithms & Data Structures Flashcards",
      flashcards: {
        create: [
          {
            question: "What is a data structure?",
            answer: "A data structure is a way of organizing and storing data so it can be accessed and modified efficiently.",
            explanation: "Data structures define how data is stored and processed.",
            difficulty: "beginner",
          },
          {
            question: "Why does choice of data structure matter?",
            answer: "It directly affects time complexity, space complexity, and performance of algorithms.",
            explanation: "Different structures optimize different operations.",
            difficulty: "beginner",
          },
        ],
      },
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

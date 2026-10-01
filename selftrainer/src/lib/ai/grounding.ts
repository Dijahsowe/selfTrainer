export function getGroundingSentences(text: string, maxSentences = 8): string[] {
  if (!text || !text.trim()) {
    return [];
  }

  const normalized = text.replace(/\r/g, " ").replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  const sentencePattern = /[^.!?]+[.!?]+|[^.!?]+$/g;

  const sentences = Array.from(normalized.match(sentencePattern) ?? [normalized])
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((sentence) => sentence.length >= 25)
    .filter((sentence, index, all) => all.indexOf(sentence) === index);

  if (sentences.length <= maxSentences) {
    return sentences;
  }

  return sentences.slice(0, maxSentences);
}

export function getGroundingText(text: string, maxSentences = 8): string {
  return getGroundingSentences(text, maxSentences).join("\n\n");
}

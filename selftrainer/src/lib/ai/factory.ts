import { AIProvider } from "./types";
import { MockAIProvider } from "./adapters/mock-adapter";
import { OpenAIProvider } from "./adapters/openai-adapter";

export function getAIProvider(): AIProvider {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider();
  }

  return new MockAIProvider();
}

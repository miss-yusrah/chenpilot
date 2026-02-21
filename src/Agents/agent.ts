import Anthropic from "@anthropic-ai/sdk";
import config from "../config/config";
import { memoryStore } from "./memory/memory";
import logger from "../config/logger";
import { randomUUID } from "crypto";

const client = new Anthropic({
  apiKey: config.apiKey,
});

export class AgentLLM {
  async callLLM(
    agentId: string,
    prompt: string,
    userInput: string,
    asJson = true,
    traceId?: string
  ): Promise<any> {
    const trace = traceId || randomUUID();
    const memoryContext = memoryStore.get(agentId).join("\n");
    const fullPrompt = `${
      memoryContext ? "Previous context:\n" + memoryContext + "\n\n" : ""
    }${prompt}\n\nUser input: ${userInput}${
      asJson ? "\n\nPlease respond with valid JSON only." : ""
    }`;

    logger.info("LLM call initiated", { traceId: trace, agentId, asJson });

    const message = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
    });

    const content =
      message.content[0].type === "text" ? message.content[0].text : "{}";

    logger.info("LLM call completed", { traceId: trace, agentId, contentLength: content.length });

    if (asJson) {
      try {
        const parsed = JSON.parse(content);
        return parsed;
      } catch (err) {
        logger.error("JSON parse error", { traceId: trace, error: err, rawContent: content });
        return {};
      }
    } else {
      return content;
    }
  }
}

export const agentLLM = new AgentLLM();

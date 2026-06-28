interface GemmaResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

import prisma from "@config/db";
import { GoogleGenAI } from "@google/genai";
import { Response } from "express";
import OpenAI from "openai";
import {
  RpgCharacterDraft,
  RPG_CHARACTER_JSON_SCHEMA,
  GEMMA_SYSTEM_INSTRUCTION,
  CHARACTER_CONTENTS_PREFIX,
  CharacterApiProvider,
  parseRpgCharacterDraft,
} from "./HelperBotService.model";
import { cerebrasService } from "./cerebras/CerebrasService";

// Initialize the client. It automatically pulls the key from process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

const MODEL = "gemma-4-26b-a4b-it";
const CHARACTER_DRAFT_MODEL = "gemini-2.5-flash";
// const CHARACTER_DRAFT_MODEL = "gemma-4-26b-a4b-it";
const NVIDIA_NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_NIM_MODEL = "meta/llama-3.1-8b-instruct";

class HelperBotService {
  private extractErrorMessage(error: any): string {
    let message = error?.message || "An error occurred while streaming.";

    try {
      while (typeof message === "string") {
        const parsed = JSON.parse(message);
        if (parsed && typeof parsed === "object") {
          const nestedMessage = parsed.error?.message || parsed.message;
          if (nestedMessage && nestedMessage !== message) {
            message = nestedMessage;
          } else {
            break;
          }
        } else {
          break;
        }
      }
    } catch (e) {
      // Not JSON, keep current message
    }

    return typeof message === "string" ? message : JSON.stringify(message);
  }

  async askGemma(prompt: string): Promise<RpgCharacterDraft> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey)
      throw new Error("Missing GEMINI_API_KEY environment variable.");

    if (!prompt?.trim()) {
      throw new Error("A character description is required.");
    }


    console.log("Prompt sent to Gemma:", prompt); // Debugging line
    console.log("RPG Character JSON Schema:", JSON.stringify(RPG_CHARACTER_JSON_SCHEMA, null, 2)); // Debugging line


    const aiResponse = await ai.models.generateContent({
      model: CHARACTER_DRAFT_MODEL,
      contents: `${CHARACTER_CONTENTS_PREFIX}
        <user-description>
        ${prompt.trim()}
        </user-description>`,
      config: {
        temperature: 0.4,
        maxOutputTokens: 1200,
        responseMimeType: "application/json",
        responseJsonSchema: RPG_CHARACTER_JSON_SCHEMA,
      },
    });

    const outputText = aiResponse.text;
    if (!outputText) {
      throw new Error("No character draft was returned from the model.");
    }

    console.log("Raw AI Response:", outputText); // Debugging lines
    return parseRpgCharacterDraft(outputText);
  }

  async generateFantasyCharacter(
    prompt: string,
    provider: CharacterApiProvider
  ): Promise<RpgCharacterDraft> {
    if (provider === "cerebras") {
      return cerebrasService.createCharacterDraft(prompt);
    }

    return this.askGemma(prompt);
  }

  async simpleAskGemma(prompt: string): Promise<string> {
    //Using the Gemma 4 26B Mixture of Experts endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: "Give as much code examples as possible. Be concise and direct. Do NOT show your thinking, notes, tropes, or brainstorming ideas. Output only the final code.",
            },
          ],
        },
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 100,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data: GemmaResponse = await response.json();

    console.log(data);

    // Navigate Google's deeply nested JSON response safely
    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return outputText || "No text returned from model.";
  }

  async streamGemmaToClient(prompt: string, res: Response): Promise<void> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable.");
    }

    // Adding ?alt=sse forces Google to output clear, line-by-line SSE events
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Google API upstream failure: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const textChunk = decoder.decode(value, { stream: true });

      // Write the raw SSE chunk directly to our client response stream
      res.write(textChunk);
    }
  }

  async streamBotSDK(
    prompt: string,
    res: Response,
    model?: string
  ): Promise<void> {
    try {
      const selectedModel = model || MODEL;
      console.log(`Selected model for streaming: ${selectedModel}`);

      const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents: prompt,
        config: {
          temperature: 0.35,
          maxOutputTokens: 3000,
          systemInstruction: {
            parts: [{ text: GEMMA_SYSTEM_INSTRUCTION }],
          },
        },
      });

      const prismaResponse = await prisma.helperBot.create({
        data: { prompt, model: selectedModel },
      });
      console.log("PRISMA RESPONSE: ", prismaResponse);

      console.log(`🤖 Gemma 4 Thinking...\n`);

      // 3. Iterate over the incoming data chunks asynchronously
      // 3. Iterate over the incoming data chunks asynchronously
      for await (const chunk of responseStream) {
        // Use standard fallbacks if chunk.text resolves to empty
        const textToStream =
          chunk.text || chunk.candidates?.[0]?.content?.parts?.[0]?.text;

        if (textToStream) {
          // Output to terminal logs
          process.stdout.write(textToStream);

          // Push the token chunk immediately out to the client browser/app
          res.write(textToStream);

          // Explicitly flush the Node response stream down the network pipe
          if ("flush" in res && typeof res.flush === "function") {
            (res as any).flush();
          }
        }
      }
      console.log("\n\n--- Stream Completed ---");
    } catch (error: any) {
      console.error("API Error:", error);
      res.write(
        `data: ${JSON.stringify({ error: this.extractErrorMessage(error) })}\n\n`
      );
      res.end();
    }
  }

  async askNim(prompt: string) {
    const apiKey = process.env.NVIDIA_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("Missing NVIDIA_API_KEY environment variable.");
    }

    const baseURL =
      process.env.NVIDIA_NIM_BASE_URL?.trim() || NVIDIA_NIM_BASE_URL;
    const model = process.env.NVIDIA_NIM_MODEL?.trim() || NVIDIA_NIM_MODEL;
    const nimClient = new OpenAI({ apiKey, baseURL });

    const completionParams: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
      {
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 1024,
      };

    const completion =
      await nimClient.chat.completions.create(completionParams);

    if (!completion) {
      const errorText = "Unknown error from NIM API.";
      throw new Error(`API Error: ${errorText}`);
    }

    const outputText = completion.choices?.[0]?.message?.content;
    return outputText || "No text returned from model.";
  }
}

export const helperBotService = new HelperBotService();

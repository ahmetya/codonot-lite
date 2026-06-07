interface GemmaResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

import { Response } from "express";
import { GoogleGenAI } from "@google/genai";
import prisma from "@config/db";

// Initialize the client. It automatically pulls the key from process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

const MODEL = "gemma-4-26b-a4b-it";
// const MODEL = "gemini-3.5-flash";

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

  async askGemma(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey)
      throw new Error("Missing GEMINI_API_KEY environment variable.");

    // Using the Gemma 4 26B Mixture of Experts endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

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
          temperature: 1,
          maxOutputTokens: 3000,
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
      console.log(`Selected model for streaming: ${model}`); // Debug log to verify model selection

      // 1. Ini
      // tiate a streaming request so the user doesn't wait for the full response
      const responseStream = await ai.models.generateContentStream({
        model: model || MODEL,
        contents: prompt,
        // 2. Pass standard runtime configurations efficiently inline
        config: {
          temperature: 0.7,
          maxOutputTokens: 3000,
          systemInstruction: {
            parts: [
              {
                text: `You are an expert software engineer. Rules:
                - Start with brief and simple introduction. 
                - Give as much code examples as possible. 
                - Do not show your thinking, notes, tropes, or brainstorming ideas.
                - Do not show constraints. Do not show final check on instructions. 
                - Use code blocks with language hints using \`\`\`
                - Do not make final check on instructions. Just output the final code.
                - Do not use more than 3 sentences in your introduction. Be concise and direct.
                - Use some emojis in your introduction to make it more friendly and engaging.
                - Do not use markown formattting.
                - No meta-commentary. Never say what you are about to do, just do it.
                - No thinking out loud. No notes, no brainstorming, no self-checks.
                - Divide code into multiple code blocks. Make smaller examples. Use language hints in code blocks. Use \`\`\`js for JavaScript code, \`\`\`python for Python code, etc.
                - Add brief explanation before each code block, but do not explain the code itself. Just a one-line introduction to what the next code block is doing.   
                - Always finish code block with \`\`\` even if it is the last one. Never finish stream without it.
                - Allwaays finish with a brief explanation after the last code block, but do not explain the code itself. Just a one-line conclusion to what was shown in the code blocks.         
                `,
              },
            ],
          },
        },
      });

      const prismaResponse = await prisma.helperBot.create({
        data: { prompt, model: MODEL },
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
}

export const helperBotService = new HelperBotService();

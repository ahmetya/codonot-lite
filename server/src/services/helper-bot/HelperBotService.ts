interface GemmaResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

import { Response } from 'express';
import { GoogleGenAI } from '@google/genai';

// Initialize the client. It automatically pulls the key from process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

const MODEL = 'gemma-4-26b-a4b-it';

class HelperBotService {
  async askGemma(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey)
      throw new Error('Missing GEMINI_API_KEY environment variable.');

    // Using the Gemma 4 26B Mixture of Experts endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: 'You are a direct, concise joke generator. Do NOT show your thinking, notes, tropes, or brainstorming ideas. Output exactly one short punchline.',
            },
          ],
        },
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 2,
          maxOutputTokens: 1000,
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
    return outputText || 'No text returned from model.';
  }

  async streamGemmaToClient(prompt: string, res: Response): Promise<void> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY environment variable.');
    }

    // Adding ?alt=sse forces Google to output clear, line-by-line SSE events
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  async streamBotSDK(prompt: string, res: Response): Promise<void> {
    try {
      // 1. Initiate a streaming request so the user doesn't wait for the full response
      const responseStream = await ai.models.generateContentStream({
        model: MODEL,
        contents: prompt,
        // 2. Pass standard runtime configurations efficiently inline
        config: {
          temperature: 1,
          maxOutputTokens: 6000,
          systemInstruction: {
            parts: [
                {text: "Use a lot of emojis"},
            ],
          }
        },
      });

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
          if ('flush' in res && typeof res.flush === 'function') {
            (res as any).flush();
          }
        }
      }
      console.log('\n\n--- Stream Completed ---');
    } catch (error) {
      console.error('API Error:', error);
    }
  }
}

export const helperBotService = new HelperBotService();

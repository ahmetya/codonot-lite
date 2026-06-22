import { Request, Response } from "express";
import { helperBotService } from "@services/helper-bot/HelperBotService";
import { cerebrasPortraitService } from "@services/helper-bot/cerebras/CerebrasPortraitService";
import { googleAiPortraitService } from "@services/helper-bot/google/GoogleAiPortraitService";

export class HelperBotController {
  async characterPortrait(req: Request, res: Response) {
    try {
      const portrait = await cerebrasPortraitService.generate(req.body);
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "private, max-age=86400");
      res.send(portrait);
    } catch (err: any) {
      console.error("Character portrait generation error:", err);
      res.status(502).json({
        error: err?.message || "Character portrait generation failed.",
      });
    }
  }

  async googleCharacterPortrait(req: Request, res: Response) {
    try {
      const portrait = await googleAiPortraitService.generate(req.body);
      res.setHeader("Content-Type", portrait.mimeType);
      res.setHeader("Cache-Control", "private, max-age=86400");
      res.send(portrait.data);
    } catch (err: any) {
      console.error("Google character portrait generation error:", err);
      res.status(502).json({
        error: err?.message || "Character portrait generation failed.",
      });
    }
  }

  async talkBot(req: Request, res: Response) {
    const { prompt, provider = "google" } = req.body;

    if (provider !== "google" && provider !== "cerebras") {
      res.status(400).json({ error: "Provider must be google or cerebras." });
      return;
    }

    try {
      const posts = await helperBotService.askCharacter(prompt, provider);
      res.json(posts);
    } catch (err: any) {
      console.error("Character generation error:", err);
      res.status(502).json({
        error: err?.message || "Character generation failed.",
      });
    }
  }

  async streamBot(req: Request, res: Response) {
    const { prompt } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      await helperBotService.streamGemmaToClient(prompt, res);
      // End the response stream cleanly once Google is finished
      res.end();
    } catch (error: any) {
      console.error("Streaming Error:", error);
      // If headers haven't sent yet, we can send a proper status code
      if (!res.headersSent) {
        res
          .status(500)
          .json({ error: error.message || "Internal streaming crash." });
      } else {
        // Otherwise write an error frame inside the stream and end it
        res.write(`data: {"error": "Stream interrupted mid-generation"}\n\n`);
        res.end();
      }
    }
  }

  async streamBotSDK(req: Request, res: Response) {
    const { prompt } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // ← tells Nginx not to buffer
    res.flushHeaders(); // ← send headers immediately

    console.log(`Request query:`, req.query.model); // add this for debugging

    try {
      await helperBotService.streamBotSDK(
        prompt,
        res,
        req.query.model as string
      );
      // End the response stream cleanly once Google is finished
      res.end();
    } catch (error: any) {
      console.error("###### Streaming Error:", error);
      // If headers haven't sent yet, we can send a proper status code
      if (!res.headersSent) {
        res
          .status(500)
          .json({ error: error.message || "Internal streaming crash." });
      } else {
        // Otherwise write an error frame inside the stream and end it
        res.write(`data: {"error": "Stream interrupted mid-generation"}\n\n`);
        res.end();
      }
    }
  }

  async nimClient(req: Request, res: Response) {
    const { prompt } = req.body;

    try {
      const response = await helperBotService.askNim(prompt);
      res.json(response);
    } catch (error: any) {
      console.error("Nim Client Error:", error);
      res.status(502).json({
        error: error?.message || "Failed to fetch response from NVIDIA NIM.",
      });
    }
  }
}

export const helperBotController = new HelperBotController();

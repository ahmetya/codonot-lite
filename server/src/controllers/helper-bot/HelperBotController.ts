import { Request, Response } from "express";
import { helperBotService } from "@services/helper-bot/HelperBotService";

export class HelperBotController {
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

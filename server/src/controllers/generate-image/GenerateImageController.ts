import { Request, Response } from "express";


export class GenerateImageController {

    async generateRPGPortrait(req: Request, res: Response) {
        try {
            const { prompt } = req.body;

            if (!prompt) {
                res.status(400).json({ error: "Prompt is required." });
                return;
            }

            // Here you would call your image generation service
            // For example:
            // const image = await imageGenerationService.generateRPGPortrait(prompt);

            // For demonstration, let's assume we have a placeholder image
            const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."; // Placeholder

            res.setHeader("Content-Type", "image/png");
            res.send(image);
        } catch (err: any) {
            console.error("RPG portrait generation error:", err);
            res.status(502).json({
                error: err?.message || "RPG portrait generation failed.",
            });
        }
    }


}export const generateImageController = new GenerateImageController();
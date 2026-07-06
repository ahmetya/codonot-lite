import { generateImageService } from "@services/generate-image/GenerateImageService";
import { Request, Response } from "express";

export class GenerateImageController {
  async generateRPGPortrait(req: Request, res: Response) {
    console.log("Received request for RPG portrait generation:", req.body);
    try {
      const { prompt } = req.body;

      console.log("Prompt received for RPG portrait generation:", prompt);

      if (!prompt) {
        console.log("No prompt provided for RPG portrait generation.");
        res.status(400).json({ error: "Prompt is required." });
        return;
      }

      const response = generateImageService.generateRPGPortrait(prompt);
      const imageProps = await response;


      res.send(imageProps);
    } catch (err: any) {
      console.error("RPG portrait generation error:", err);
      res.status(502).json({
        error: err?.message || "RPG portrait generation failed.",
      });
    }
  }

  async viewImage(req: Request, res: Response) {
    const { filename, subfolder, type } = req.query;
    
    console.log("Received request to view image:", { filename, subfolder, type });

    if (!filename || !type) {
      res.status(400).json({ error: "Filename and type are required." });
      return;
    }


    const imageBuffer = await generateImageService.viewImage(
      filename as string,
      subfolder as string,
      type as string
    );

    res.setHeader("Content-Type", "image/png");
    res.send(imageBuffer);    

    // const imagePath = `./images/${subfolder ? `${subfolder}/` : ""}${filename}`;

    // try {
    //   res.sendFile(imagePath, { root: process.cwd() });
    // } catch (err: any) {
    //   console.error("Error sending image file:", err);
    //   res.status(404).json({ error: "Image not found." });
    // }


  }

}
export const generateImageController = new GenerateImageController();

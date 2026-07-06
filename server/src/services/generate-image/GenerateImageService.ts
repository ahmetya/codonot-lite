import { RPG_CHARACTER_PORTRAIT_WORKFLOW } from "./GenerateImageService.consts";

class GenerateImageService {
  async generateRPGPortrait(prompt: string) {
    console.log(`Generating RPG portrait with prompt: ${prompt}`);

    const response = await fetch("http://127.0.0.1:8188/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: RPG_CHARACTER_PORTRAIT_WORKFLOW }),
    });

    const data = await response.json();
    const promptId = data.prompt_id;
  }
}

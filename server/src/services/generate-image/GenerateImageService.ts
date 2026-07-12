import { RPG_CHARACTER_PORTRAIT_WORKFLOW, RPG_PORTRAIT_STYLE_SUFFIX } from "./GenerateImageService.consts";

class GenerateImageService {
  async generateRPGPortrait(prompt: string) {
    console.log(`Generating RPG portrait with prompt: ${prompt}`);

    RPG_CHARACTER_PORTRAIT_WORKFLOW["3"].inputs.seed = Math.floor(
      Math.random() * 1_000_000_000_000
    );
    RPG_CHARACTER_PORTRAIT_WORKFLOW["6"].inputs.text = `fantasy rpg character portrait of ${prompt}${RPG_PORTRAIT_STYLE_SUFFIX}`;


    console.log("Workflow sent to ComfyUI:", JSON.stringify(RPG_CHARACTER_PORTRAIT_WORKFLOW, null, 2)); // Debugging line

    const response = await fetch("http://127.0.0.1:8188/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: RPG_CHARACTER_PORTRAIT_WORKFLOW }),
    });

    console.log("Response from ComfyUI:", response);

    const data = await response.json();
    console.log("Data from ComfyUI:", data);
    const promptId = data.prompt_id;

    const historyRes = await this.waitForComfyImage(promptId);

    console.log("History response from ComfyUI:", historyRes);
    return historyRes;
  }

  async waitForComfyImage(promptId: string) {
    for (let i = 0; i < 60; i++) {
      const res = await fetch(`http://127.0.0.1:8188/history/${promptId}`);
      const history = await res.json();

      console.log("history:", history);

      const result = history[promptId];

      if (result?.outputs) {
        for (const nodeId of Object.keys(result.outputs)) {
          const output = result.outputs[nodeId];

          if (output.images?.length) {
            const image = output.images[0];

            return {
              filename: image.filename,
              subfolder: image.subfolder ?? "",
              type: image.type ?? "output",
              imageUrl:
                `/api/images/view?` +
                new URLSearchParams({
                  filename: image.filename,
                  subfolder: image.subfolder ?? "",
                  type: image.type ?? "output",
                }).toString(),
            };
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    throw new Error("Timed out waiting for ComfyUI image");
  }

  async viewImage(filename: string, subfolder: string, type: string) {

    const url = `http://127.0.0.1:8188/view?filename=${filename}&subfolder=${subfolder}&type=${type}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    return Buffer.from(imageBuffer);
  }

}

export const generateImageService = new GenerateImageService();

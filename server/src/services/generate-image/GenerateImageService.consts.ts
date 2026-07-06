export const RPG_CHARACTER_PORTRAIT_WORKFLOW = {
  "3": {
    inputs: {
      seed: 108102164829100,
      steps: 25,
      cfg: 7,
      sampler_name: "dpmpp_2m_sde",
      scheduler: "karras",
      denoise: 1,
      model: ["20", 0],
      positive: ["6", 0],
      negative: ["7", 0],
      latent_image: ["5", 0],
    },
    class_type: "KSampler",
    _meta: {
      title: "KSampler",
    },
  },
  "4": {
    inputs: {
      ckpt_name: "DreamShaper_8_pruned.safetensors",
    },
    class_type: "CheckpointLoaderSimple",
    _meta: {
      title: "Load Checkpoint",
    },
  },
  "5": {
    inputs: {
      width: 312,
      height: 392,
      batch_size: 1,
    },
    class_type: "EmptyLatentImage",
    _meta: {
      title: "Empty Latent Image",
    },
  },
  "6": {
    inputs: {
      text: "fantasy rpg character portrait of a chaotic good half elf sorcerer, female, comicbook illustration with a suitable background, suitable nature, tavern or city scenery for background, natural, matching skin color with race, with suitable weapon or equipment related with class, modest clothing and armor matching with class, hand drawn, pastel colors, matte colors",
      clip: ["20", 1],
    },
    class_type: "CLIPTextEncode",
    _meta: {
      title: "CLIP Text Encode (Positive Prompt)",
    },
  },
  "7": {
    inputs: {
      text: "blurry, low quality, worst quality, distorted face, bad eyes, asymmetrical eyes, crossed eyes, bad anatomy, bad hands, extra fingers, missing fingers, extra\n  limbs, full body, tiny character, distant character, landscape, wide shot, anime, doll face, neon colors, oversaturated, text, watermark, signature, 3d, reflections, shine, 3d render, shiny, text, no weapon, big breasts, frame, white background, empty background, bright colors, picture frame, blank background",
      clip: ["20", 1],
    },
    class_type: "CLIPTextEncode",
    _meta: {
      title: "CLIP Text Encode (Negative Prompt)",
    },
  },
  "8": {
    inputs: {
      samples: ["3", 0],
      vae: ["4", 2],
    },
    class_type: "VAEDecode",
    _meta: {
      title: "VAE Decode",
    },
  },
  "9": {
    inputs: {
      filename_prefix: "ComfyUI",
      images: ["8", 0],
    },
    class_type: "SaveImage",
    _meta: {
      title: "Save Image",
    },
  },
  "20": {
    inputs: {
      lora_name: "more_details.safetensors",
      strength_model: 1,
      strength_clip: 1.03,
      model: ["4", 0],
      clip: ["4", 1],
    },
    class_type: "LoraLoader",
    _meta: {
      title: "Load LoRA (Model and CLIP)",
    },
  },
};

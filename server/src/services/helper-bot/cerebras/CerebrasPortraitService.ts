import Cerebras from "@cerebras/cerebras_cloud_sdk";

const CEREBRAS_PORTRAIT_MODEL = "gpt-oss-120b";

const SKIN_TONES = [
  "#f2c9a5",
  "#d89b72",
  "#a9684b",
  "#704536",
  "#8fa37a",
  "#7895a8",
] as const;
const HAIR_COLORS = [
  "#171b24",
  "#4a3028",
  "#7a4e32",
  "#b77b38",
  "#c4c9d1",
  "#8f5cad",
] as const;
const ARMOR_COLORS = [
  "#39475a",
  "#596579",
  "#6e4938",
  "#315d52",
  "#603f68",
  "#72552d",
] as const;
const ACCENT_COLORS = [
  "#56d67e",
  "#58a6ff",
  "#e3b341",
  "#ff7b72",
  "#bc8cff",
  "#f778ba",
] as const;
const BACKGROUND_COLORS = [
  "#101722",
  "#17221b",
  "#211821",
  "#221b16",
  "#151b26",
] as const;
const EYE_COLORS = ["#8fdcff", "#8ce99a", "#f3c969", "#d7b5ff"] as const;
const HAIR_STYLES = ["bald", "cropped", "long", "braided", "mohawk", "hood"] as const;
const FACIAL_HAIR_STYLES = ["none", "stubble", "short-beard", "long-beard"] as const;
const EAR_STYLES = ["round", "pointed", "wide", "hidden"] as const;
const ACCESSORIES = ["none", "scar", "eyepatch", "circlet", "horns"] as const;
const EXPRESSIONS = ["calm", "stern", "fierce", "wise"] as const;

const portraitSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    skinTone: { type: "string", enum: SKIN_TONES },
    hairColor: { type: "string", enum: HAIR_COLORS },
    armorColor: { type: "string", enum: ARMOR_COLORS },
    accentColor: { type: "string", enum: ACCENT_COLORS },
    backgroundColor: { type: "string", enum: BACKGROUND_COLORS },
    eyeColor: { type: "string", enum: EYE_COLORS },
    hairStyle: {
      type: "string",
      enum: HAIR_STYLES,
    },
    facialHair: {
      type: "string",
      enum: FACIAL_HAIR_STYLES,
    },
    ears: {
      type: "string",
      enum: EAR_STYLES,
    },
    accessory: {
      type: "string",
      enum: ACCESSORIES,
    },
    expression: {
      type: "string",
      enum: EXPRESSIONS,
    },
  },
  required: [
    "skinTone",
    "hairColor",
    "armorColor",
    "accentColor",
    "backgroundColor",
    "eyeColor",
    "hairStyle",
    "facialHair",
    "ears",
    "accessory",
    "expression",
  ],
};

type PortraitSpec = {
  skinTone: (typeof SKIN_TONES)[number];
  hairColor: (typeof HAIR_COLORS)[number];
  armorColor: (typeof ARMOR_COLORS)[number];
  accentColor: (typeof ACCENT_COLORS)[number];
  backgroundColor: (typeof BACKGROUND_COLORS)[number];
  eyeColor: (typeof EYE_COLORS)[number];
  hairStyle: (typeof HAIR_STYLES)[number];
  facialHair: (typeof FACIAL_HAIR_STYLES)[number];
  ears: (typeof EAR_STYLES)[number];
  accessory: (typeof ACCESSORIES)[number];
  expression: (typeof EXPRESSIONS)[number];
};

export interface CharacterPortraitInput {
  name: string;
  race: string;
  characterClass: string;
  appearance: string;
  equipment: string[];
}

function limitedText(value: unknown, maximumLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function parsePortraitSpec(content: string): PortraitSpec {
  let value: unknown;

  try {
    value = JSON.parse(content);
  } catch {
    throw new Error("Cerebras returned an invalid portrait design.");
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Cerebras returned an invalid portrait design.");
  }

  const spec = value as Record<string, unknown>;
  const allowedValues = {
    skinTone: SKIN_TONES,
    hairColor: HAIR_COLORS,
    armorColor: ARMOR_COLORS,
    accentColor: ACCENT_COLORS,
    backgroundColor: BACKGROUND_COLORS,
    eyeColor: EYE_COLORS,
    hairStyle: HAIR_STYLES,
    facialHair: FACIAL_HAIR_STYLES,
    ears: EAR_STYLES,
    accessory: ACCESSORIES,
    expression: EXPRESSIONS,
  };

  const isInvalid = Object.entries(allowedValues).some(
    ([key, allowed]) => !(allowed as readonly unknown[]).includes(spec[key])
  );

  if (isInvalid) {
    throw new Error("Cerebras returned unsupported portrait values.");
  }

  return spec as PortraitSpec;
}

function renderPixelPortrait(spec: PortraitSpec): Buffer {
  const hair = {
    bald: "",
    cropped: `<path fill="${spec.hairColor}" d="M5 3h6v1H4V5H3V3h2Z"/>`,
    long: `<path fill="${spec.hairColor}" d="M4 3h8v1h1v8h-2V5H5v7H3V4h1Z"/>`,
    braided: `<path fill="${spec.hairColor}" d="M4 3h8v2h-1v5h1v1h-1v2h-1V5H5v7H3V4h1Z"/>`,
    mohawk: `<path fill="${spec.hairColor}" d="M7 1h2v1h1v2H6V2h1Z"/>`,
    hood: `<path fill="${spec.armorColor}" d="M5 2h6v1h2v8h-2V5H5v6H3V3h2Z"/>`,
  }[spec.hairStyle];

  const ears = {
    round: `<path fill="${spec.skinTone}" d="M3 6h2v3H3zm8 0h2v3h-2z"/>`,
    pointed: `<path fill="${spec.skinTone}" d="M2 5h3v4H4V7H3zm9 0h3l-1 2h-1v2h-1z"/>`,
    wide: `<path fill="${spec.skinTone}" d="M1 6h4v3H3V8H2zm10 0h4l-1 2h-1v1h-2z"/>`,
    hidden: "",
  }[spec.ears];

  const beard = {
    none: "",
    stubble: `<path fill="${spec.hairColor}" opacity=".65" d="M6 9h4v2H9v1H7v-1H6Z"/>`,
    "short-beard": `<path fill="${spec.hairColor}" d="M5 9h6v2h-1v2H7v-1H6v-1H5Z"/>`,
    "long-beard": `<path fill="${spec.hairColor}" d="M5 9h6v3h-1v2H9v1H7v-1H6v-2H5Z"/>`,
  }[spec.facialHair];

  const accessory = {
    none: "",
    scar: `<path fill="${spec.accentColor}" d="M10 5h1v1h-1v1H9V6h1Z"/>`,
    eyepatch: `<path fill="#171b24" d="M4 5h8v1H9v2H7V6H4Z"/>`,
    circlet: `<path fill="${spec.accentColor}" d="M5 4h6v1H9V4H7v1H5Z"/>`,
    horns: `<path fill="${spec.accentColor}" d="M3 1h1v2h2v1H3zm9 0h1v3h-3V3h2Z"/>`,
  }[spec.accessory];

  const brows =
    spec.expression === "fierce"
      ? `<path fill="${spec.hairColor}" d="M5 5h2v1H5zm4 1h2V5H9Z"/>`
      : spec.expression === "stern"
        ? `<path fill="${spec.hairColor}" d="M5 5h2v1H5zm4 0h2v1H9Z"/>`
        : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 16 16" shape-rendering="crispEdges">
<rect width="16" height="16" fill="${spec.backgroundColor}"/>
<path fill="${spec.accentColor}" opacity=".12" d="M2 2h3V1h6v1h3v3h1v6h-1v3h-3v1H5v-1H2v-3H1V5h1Z"/>
<path fill="${spec.armorColor}" d="M3 12h2v-1h6v1h2v1h2v3H1v-3h2Z"/>
<path fill="${spec.accentColor}" d="M2 14h3v2H2zm9 0h3v2h-3Z"/>
<path fill="${spec.skinTone}" d="M7 10h2v3H7Z"/>
${ears}
<path fill="${spec.skinTone}" d="M5 3h6v1h1v6h-1v1h-2v1H7v-1H5v-1H4V4h1Z"/>
${hair}${brows}
<path fill="${spec.eyeColor}" d="M5 6h2v1H5zm4 0h2v1H9Z"/>
<path fill="#171b24" d="M6 6h1v1H6zm3 0h1v1H9Z"/>
<path fill="#704536" opacity=".55" d="M8 7h1v2H7V8h1Z"/>
<path fill="#2b2022" d="M7 10h2v1H7Z"/>
${beard}${accessory}
</svg>`;

  return Buffer.from(svg);
}

class CerebrasPortraitService {
  async generate(input: CharacterPortraitInput): Promise<Buffer> {
    const apiKey = process.env.CEREBRAS_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("Missing CEREBRAS_API_KEY environment variable.");
    }

    const name = limitedText(input.name, 80);
    const race = limitedText(input.race, 80);
    const characterClass = limitedText(input.characterClass, 80);
    const appearance = limitedText(input.appearance, 500);
    const equipment = Array.isArray(input.equipment)
      ? input.equipment.filter((item) => typeof item === "string").slice(0, 5)
      : [];

    if (!name || !race || !characterClass || !appearance) {
      throw new Error("Incomplete character details for portrait generation.");
    }

    const cerebras = new Cerebras({ apiKey });
    const completion = await cerebras.chat.completions.create(
      {
        model: CEREBRAS_PORTRAIT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Design a coherent pixel-art RPG portrait using only the supplied schema options.",
          },
          {
            role: "user",
            content: `Character: ${name}, ${race}, ${characterClass}\nAppearance: ${appearance}\nEquipment: ${equipment.join(", ")}`,
          },
        ],
        max_completion_tokens: 300,
        temperature: 0.2,
        stream: false,
        reasoning_effort: "low",
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "pixel_portrait",
            strict: true,
            schema: portraitSchema,
          },
        },
      },
      { timeout: 25_000, maxRetries: 0 }
    );

    const { choices } = completion as unknown as {
      choices: Array<{ message: { content?: string | null } }>;
    };
    const content = choices[0]?.message.content;
    if (!content) {
      throw new Error("Cerebras did not return a portrait design.");
    }

    return renderPixelPortrait(parsePortraitSpec(content));
  }
}

export const cerebrasPortraitService = new CerebrasPortraitService();

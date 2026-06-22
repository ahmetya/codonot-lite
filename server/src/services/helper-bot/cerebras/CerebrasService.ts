import Cerebras from "@cerebras/cerebras_cloud_sdk";
import {
  CHARACTER_CONTENTS_PREFIX,
  parseRpgCharacterDraft,
  RPG_CHARACTER_JSON_SCHEMA,
  RpgCharacterDraft,
} from "../HelperBotService.model";

const CEREBRAS_CHARACTER_MODEL = "gpt-oss-120b";

function createCerebrasSchema(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(createCerebrasSchema);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(
        ([key]) =>
          key !== "description" && key !== "minItems" && key !== "maxItems"
      )
      .map(([key, nestedValue]) => [key, createCerebrasSchema(nestedValue)])
  );
}

const CEREBRAS_CHARACTER_JSON_SCHEMA = createCerebrasSchema(
  RPG_CHARACTER_JSON_SCHEMA
);

class CerebrasService {
  async createCharacterDraft(prompt: string): Promise<RpgCharacterDraft> {
    const apiKey = process.env.CEREBRAS_API_KEY?.trim();

    if (!apiKey) {
      throw new Error("Missing CEREBRAS_API_KEY environment variable.");
    }

    if (!prompt?.trim()) {
      throw new Error("A character description is required.");
    }

    const cerebras = new Cerebras({ apiKey });
    const completion = await cerebras.chat.completions.create({
      model: CEREBRAS_CHARACTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Generate one RPG character draft matching the supplied JSON schema.",
        },
        {
          role: "user",
          content: `${CHARACTER_CONTENTS_PREFIX}
<user-description>
${prompt.trim()}
</user-description>`,
        },
      ],
      max_completion_tokens: 1200,
      temperature: 0.2,
      top_p: 1,
      stream: false,
      reasoning_effort: "medium",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rpg_character_draft",
          strict: true,
          schema: CEREBRAS_CHARACTER_JSON_SCHEMA,
        },
      },
    });

    const { choices } = completion as unknown as {
      choices: Array<{ message: { content?: string | null } }>;
    };
    const outputText = choices[0]?.message.content;
    if (!outputText) {
      throw new Error("No character draft was returned from Cerebras.");
    }

    return parseRpgCharacterDraft(outputText);
  }
}

export const cerebrasService = new CerebrasService();

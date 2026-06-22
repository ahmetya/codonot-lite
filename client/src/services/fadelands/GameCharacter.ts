import { Observable } from "rxjs";

export type CharacterAlignment =
  | "lawful-good"
  | "neutral-good"
  | "chaotic-good"
  | "lawful-neutral"
  | "true-neutral"
  | "chaotic-neutral"
  | "lawful-evil"
  | "neutral-evil"
  | "chaotic-evil";

export interface CharacterAbilities {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterDraft {
  name: string;
  race: string;
  characterClass: string;
  level: number;
  alignment: CharacterAlignment;
  background: string;
  appearance: string;
  personality: string[];
  motivations: string[];
  flaws: string[];
  abilities: CharacterAbilities;
  equipment: string[];
  draftSummary: string;
}

export type CharacterApiProvider = "google" | "cerebras";

export async function generateCharacterPortrait(
  character: CharacterDraft,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch("/api/helperbot/portrait/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: character.name,
      race: character.race,
      characterClass: character.characterClass,
      appearance: character.appearance,
      equipment: character.equipment,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error("Portrait generation failed.");
  }

  return URL.createObjectURL(await response.blob());
}

export class GameCharacter implements CharacterDraft {
  name: string;
  race: string;
  characterClass: string;
  level = 1;
  alignment: CharacterAlignment = "true-neutral";
  background = "";
  appearance = "";
  personality: string[] = [];
  motivations: string[] = [];
  flaws: string[] = [];
  equipment: string[] = [];
  draftSummary = "";
  abilities: CharacterAbilities = {
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
  };

  readonly aiDraft$: Observable<GameCharacter>;

  constructor(
    name: string,
    race: string,
    characterClass: string,
    private readonly prompt: string,
    private readonly provider: CharacterApiProvider,
  ) {
    this.name = name;
    this.race = race;
    this.characterClass = characterClass;
    this.aiDraft$ = this.createDraft();
  }

  private createDraft() {
    return new Observable<GameCharacter>((subscriber) => {
      const controller = new AbortController();
      fetch("/api/helperbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: this.prompt.trim(),
          provider: this.provider,
        }),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as {
              error?: string;
            } | null;
            throw new Error(payload?.error || "Character generation failed.");
          }

          return response.json() as Promise<CharacterDraft>;
        })
        .then((draft) => {
          Object.assign(this, draft);
          subscriber.next(this);
          subscriber.complete();
        })
        .catch((error: unknown) => {
          if (!controller.signal.aborted) subscriber.error(error);
        });

      return () => controller.abort();
    });
  }
}

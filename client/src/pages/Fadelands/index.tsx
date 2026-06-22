import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "../../components/shared-layout/SiteFooter";
import { SiteHeader } from "../../components/shared-layout/SiteHeader";
import dwarfImage from "../../assets/realistic-dwarf-portrait.png";
import {
  CharacterApiProvider,
  GameCharacter,
  generateCharacterPortrait,
} from "../../services/fadelands/GameCharacter";
import "./index.css";

const USE_POLLINATIONS_IMAGE_GENERATION = true;

const abilityLabels = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
} as const;

function formatAlignment(alignment: string) {
  return alignment.replaceAll("-", " ");
}

export default function Fadelands() {
  const [prompt, setPrompt] = useState(
    "Create a battle-worn dwarf guardian who protects a forgotten mountain archive.",
  );
  const [character, setCharacter] = useState<GameCharacter | null>(null);
  const [provider, setProvider] = useState<CharacterApiProvider>("google");
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [portraitPrompt, setPortraitPrompt] = useState("");
  const [isPortraitLoading, setIsPortraitLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!character) return;

    setPortraitUrl(null);
    setIsPortraitLoading(true);

    if (USE_POLLINATIONS_IMAGE_GENERATION) {
      const encodedPrompt = encodeURIComponent(portraitPrompt);
      setPortraitUrl(
        `https://image.pollinations.ai/p/${encodedPrompt}?width=196&height=196&nologo=true&quality=low`,
      );
      return;
    }

    const controller = new AbortController();
    let generatedUrl: string | null = null;

    generateCharacterPortrait(character, controller.signal)
      .then((url) => {
        generatedUrl = url;
        if (controller.signal.aborted) {
          URL.revokeObjectURL(url);
        } else {
          setPortraitUrl(url);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPortraitUrl(null);
          setIsPortraitLoading(false);
        }
      });

    return () => {
      controller.abort();
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    };
  }, [character, portraitPrompt]);

  const createCharacter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const characterPrompt = prompt.trim();
    if (!characterPrompt) {
      setError("Describe the character you want to forge.");
      return;
    }

    setIsLoading(true);
    setError("");
    setPortraitPrompt(characterPrompt);

    const draft = new GameCharacter(
      "Unnamed adventurer",
      "Unknown",
      "Adventurer",
      characterPrompt,
      provider,
    );
    draft.aiDraft$.subscribe({
      next: setCharacter,
      error: (reason: unknown) => {
        setError(
          reason instanceof Error ? reason.message : "Character generation failed.",
        );
        setIsLoading(false);
      },
      complete: () => setIsLoading(false),
    });
  };

  return (
    <div className="fadelands-page">
      <SiteHeader status="Fadelands / Character forge">
        <Link to="/">Home</Link>
      </SiteHeader>

      <main className="fadelands-main">
        <section className="fadelands-intro">
          <div>
            <p className="fadelands-eyebrow">AI character forge</p>
            <h1>Fadelands</h1>
            <p className="fadelands-lede">
              Shape a complete adventurer from a single idea. The forge fills in
              the history, traits, equipment, and ability scores.
            </p>
          </div>
          <form className="forge-form" onSubmit={createCharacter}>
            <div className="forge-form__header">
              <label htmlFor="character-prompt">Character brief</label>
              <span>Prompt / 01</span>
            </div>
            <textarea
              id="character-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe a race, class, history, or personality…"
              rows={4}
              disabled={isLoading}
            />
            <fieldset className="provider-selector" disabled={isLoading}>
              <legend>AI provider</legend>
              <label>
                <input
                  type="radio"
                  name="character-provider"
                  value="google"
                  checked={provider === "google"}
                  onChange={() => setProvider("google")}
                />
                <span>Google API</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="character-provider"
                  value="cerebras"
                  checked={provider === "cerebras"}
                  onChange={() => setProvider("cerebras")}
                />
                <span>Cerebras</span>
              </label>
            </fieldset>
            <div className="forge-form__footer">
              <span>Race, class, history, temperament — add as much or as little as you want.</span>
              <button
                className="forge-button"
                type="submit"
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? "Forging…" : character ? "Forge again →" : "Forge character →"}
              </button>
            </div>
          </form>
        </section>

        {error ? <p className="fadelands-error" role="alert">{error}</p> : null}

        {!character && !isLoading ? (
          <section className="forge-empty">
            <span>Fadelands Awaits...</span>
            <p>Your generated character sheet will appear here.</p>
          </section>
        ) : null}

        {isLoading && !character ? (
          <section className="forge-empty is-loading" aria-live="polite">
            <span>•••</span>
            <p>Consulting the Fadelands archives…</p>
          </section>
        ) : null}

        {character ? (
          <article className="character-sheet" aria-label={`${character.name} character sheet`}>
            <header className="character-hero">
              <div className="character-profile">
                <figure className="character-portrait-wrap">
                  <img
                    className={`character-image${isPortraitLoading ? " is-generating" : ""}`}
                    src={portraitUrl || dwarfImage}
                    alt={`Portrait of ${character.name}`}
                    onLoad={() => {
                      if (portraitUrl) setIsPortraitLoading(false);
                    }}
                    onError={() => {
                      if (portraitUrl) setPortraitUrl(null);
                      setIsPortraitLoading(false);
                    }}
                  />
                  {isPortraitLoading ? (
                    <span className="portrait-status">Generating portrait…</span>
                  ) : null}
                  <figcaption className="level-badge">
                    Level {character.level}
                  </figcaption>
                </figure>
                <section className="ability-grid" aria-label="Ability scores">
                  {Object.entries(abilityLabels).map(([ability, label]) => (
                    <div className="ability-score" key={ability}>
                      <span>{label}</span>
                      <strong>
                        {character.abilities[ability as keyof typeof character.abilities]}
                      </strong>
                    </div>
                  ))}
                </section>
              </div>
              <div className="character-identity">
                <p className="character-overline">
                  {character.race} / {character.characterClass}
                </p>
                <h2>{character.name}</h2>
                <p className="character-summary">{character.draftSummary}</p>
                <span className="alignment-badge">
                  {formatAlignment(character.alignment)}
                </span>
              </div>
            </header>

            <div className="character-content">
              <div className="character-narrative">
                <section>
                  <p className="section-label">Background</p>
                  <h3>Origin</h3>
                  <p>{character.background}</p>
                </section>
                <section>
                  <p className="section-label">Appearance</p>
                  <h3>Presence</h3>
                  <p>{character.appearance}</p>
                </section>
              </div>

              <aside className="character-details">
                <DetailList title="Personality" items={character.personality} />
                <DetailList title="Motivations" items={character.motivations} />
                <DetailList title="Flaws" items={character.flaws} />
                <DetailList title="Equipment" items={character.equipment} tags />
              </aside>
            </div>
          </article>
        ) : null}
      </main>

      <SiteFooter note="Fadelands / AI character forge" />
    </div>
  );
}

function DetailList({
  title,
  items,
  tags = false,
}: {
  title: string;
  items: string[];
  tags?: boolean;
}) {
  return (
    <section className={tags ? "detail-list detail-list--tags" : "detail-list"}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

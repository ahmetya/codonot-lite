import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "../../components/shared-layout/SiteFooter";
import { SiteHeader } from "../../components/shared-layout/SiteHeader";
import fallbackPortrait from "../../assets/fadelands-fallback.webp";
import {
  CharacterApiProvider,
  GameCharacter,
  generateCharacterPortrait,
} from "../../services/fadelands/GameCharacter";
import "./index.css";

const USE_POLLINATIONS_IMAGE_GENERATION = true;
const PORTRAIT_LOAD_TIMEOUT_MS = 20_000;

const characterPrompts = [
  "Create a battle-worn dwarf guardian who protects a forgotten mountain archive.",
  "Create an elven cartographer mapping a forest that rearranges itself every night.",
  "Create a human tidecaller who hunts relics beneath a drowned coastal kingdom.",
  "Create an orc herbalist seeking a cure for the curse consuming their clan.",
  "Create a halfling smuggler who secretly ferries refugees across a haunted border.",
  "Create a tiefling archivist who can hear the memories trapped inside ancient books.",
  "Create a dragonborn knight exiled after refusing an order from a corrupt monarch.",
  "Create a goblin engineer building clockwork companions from battlefield scraps.",
  "Create an aasimar healer whose fading celestial light attracts dangerous spirits.",
  "Create an undead knight searching the desert for the name they lost in life.",
  "Create a gnome illusionist who runs a traveling theater used as a spy network.",
  "Create a half-elf diplomat trying to prevent war between rival island nations.",
  "Create a lizardfolk ranger guarding the last clean river in a poisoned marsh.",
  "Create a firbolg druid who carries seeds from a forest destroyed by wildfire.",
  "Create a tabaxi treasure hunter pursued by the living statue they accidentally awakened.",
  "Create a kenku spy who communicates through the stolen voices of powerful nobles.",
  "Create a water genasi sailor navigating a sea haunted by their vanished crew.",
  "Create a kobold priest restoring a ruined temple beneath an active volcano.",
  "Create a minotaur gladiator who escaped the arena to find their scattered family.",
  "Create a changeling detective investigating crimes committed using their own face.",
] as const;

function getRandomCharacterPrompt(currentPrompt?: string) {
  let index = Math.floor(Math.random() * characterPrompts.length);
  if (characterPrompts[index] === currentPrompt) {
    index = (index + 1) % characterPrompts.length;
  }
  return characterPrompts[index];
}

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
  const [prompt, setPrompt] = useState<string>(() => getRandomCharacterPrompt());
  const [character, setCharacter] = useState<GameCharacter | null>(null);
  const [provider, setProvider] = useState<CharacterApiProvider>("cerebras");
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [portraitPrompt, setPortraitPrompt] = useState("");
  const [isPortraitLoading, setIsPortraitLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState<{
    prompt: string;
    provider: CharacterApiProvider;
  } | null>(null);

  const normalizedPrompt = prompt.trim();
  const isRequestUnchanged =
    lastSubmittedRequest?.prompt === normalizedPrompt &&
    lastSubmittedRequest.provider === provider;

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

  useEffect(() => {
    if (!isPortraitLoading) return;

    const timeoutId = window.setTimeout(() => {
      setPortraitUrl(null);
      setIsPortraitLoading(false);
    }, PORTRAIT_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [isPortraitLoading, portraitUrl]);

  const createCharacter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const characterPrompt = normalizedPrompt;
    if (!characterPrompt) {
      setError("Describe the character you want to forge.");
      return;
    }
    if (isRequestUnchanged) return;

    setIsLoading(true);
    setError("");
    setPortraitPrompt(characterPrompt);
    setLastSubmittedRequest({ prompt: characterPrompt, provider });

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
      <SiteHeader status="Fadelands / Character Forge">
        <Link to="/">Home</Link>
      </SiteHeader>

      <main className="fadelands-main">
        <section className="fadelands-intro">
          <div className="fadelands-intro__header">
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
              <span>{characterPrompts.length} prompts</span>
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
              <div className="forge-form__buttons">
                <button
                  className="random-prompt-button"
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    setPrompt((currentPrompt) =>
                      getRandomCharacterPrompt(currentPrompt),
                    )
                  }
                >
                  Random prompt
                </button>
                <button
                  className="forge-button"
                  type="submit"
                  disabled={isLoading || !normalizedPrompt || isRequestUnchanged}
                >
                  {isLoading ? "Forging…" : (character && isRequestUnchanged) ? "Change prompt to forge again..." : "Forge Character"}
                </button>
              </div>
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
                    src={portraitUrl || fallbackPortrait}
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
                    <span className="portrait-status" role="status">
                      Generating portrait…
                    </span>
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
                <span
                  className="alignment-badge"
                  data-alignment={character.alignment}
                >
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

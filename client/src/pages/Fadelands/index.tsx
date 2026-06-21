import { useState } from "react";
import { Link } from "react-router-dom";
import { SiteFooter } from "../../components/shared-layout/SiteFooter";
import { SiteHeader } from "../../components/shared-layout/SiteHeader";
import dwarfImage from "../../assets/realistic-dwarf-portrait.png";
import { GameCharacter } from "../../services/fadelands/GameCharacter";
import "./index.css";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const createCharacter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const characterPrompt = prompt.trim();
    if (!characterPrompt) {
      setError("Describe the character you want to forge.");
      return;
    }

    setIsLoading(true);
    setError("");

    const draft = new GameCharacter(
      "Unnamed adventurer",
      "Unknown",
      "Adventurer",
      characterPrompt,
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
              <div className="character-portrait-wrap">
                <img
                  className="character-image"
                  src={dwarfImage}
                  alt={`Portrait of ${character.name}`}
                />
                <span>Level {character.level}</span>
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

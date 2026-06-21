import { GameCharacter } from "../../services/fadelands/GameCharacter";
import dwarfImage from "../../assets/realistic-dwarf-portrait.png";
import "./index.css";
import { Observable } from "rxjs";
import { useState } from "react";

export default function Fadelands() {
  const [characterName, setCharacterName] = useState("");
  const createCharacter = () => {
    const character = new GameCharacter("Aria", "Human", "Rogue");
    // Placeholder for character creation logic
    console.log("Creating character...", character);

    const character$ = new Observable<GameCharacter>((subscriber) => {
      const newCharacter = new GameCharacter("Aria", "Human", "Rogue");
      subscriber.next(newCharacter);
      subscriber.complete();
    });

    character.aiDraft$?.pipe().subscribe({
      next: (char) => {
        console.log("SUB Character created:", char);
        setCharacterName(char.name);
      },
      error: (err) => console.error("Error creating character:", err),
      complete: () => console.log("Character creation complete"),
    });

    character$.pipe().subscribe({
      next: (char) => {
        console.log("Character created:", char);
        setCharacterName(char.name);
      },
      error: (err) => console.error("Error creating character:", err),
      complete: () => console.log("Character creation complete"),
    });
  };

  return (
    <div>
      <img className="character-image" src={dwarfImage} alt="Dwarfs" />
      <button onClick={createCharacter}>Create Character</button>
      <h1>FADELANDS</h1>
      {characterName && <p>Character Name: {characterName}</p>}
    </div>
  );
}

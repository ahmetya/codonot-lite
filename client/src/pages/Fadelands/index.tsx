import { GameCharacter } from "../../services/fadelands/GameCharacter";



export default function Fadelands() {
  const createCharacter = () => {

    const character =  new GameCharacter("Aria", "Human", "Rogue");

    // Placeholder for character creation logic
    console.log("Creating character...", character);
  };

  return (
    <div>
      <button onClick={createCharacter}>Create Character</button>
      <h1>FADELANDS</h1>
    </div>

  );
}

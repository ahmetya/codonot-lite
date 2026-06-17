export class GameCharacter {
  private _name: string;
  private _race: string;
  private _class: string;

  private _level: number = 1;
  private _experience: number = 0;

  private _health: number = 100;
  private _mana: number = 100;
  private _stamina: number = 100;

  private _strength: number = 5;
  private _agility: number = 5;
  private _intelligence: number = 5;
  private _dexterity: number = 5;

  constructor(name: string, race: string, charClass: string) {
    this._name = name;
    this._race = race;
    this._class = charClass;
  }

  get name() {
    return this._name;
  }

  get race() {
    return this._race;
  }

  get charClass() {
    return this._class;
  }

  get level() {
    return this._level;
  }

  get experience() {
    return this._experience;
  }

  get health() {
    return this._health;
  }

  get mana() {
    return this._mana;
  }

  get stamina() {
    return this._stamina;
  }

  get strength() {
    return this._strength;
  }

  get agility() {
    return this._agility;
  }

  get intelligence() {
    return this._intelligence;
  }

  get dexterity() {
    return this._dexterity;
  }

  assignStats(
    strength: number,
    agility: number,
    intelligence: number,
    dexterity: number
  ) {
    this._strength = strength;
    this._agility = agility;
    this._intelligence = intelligence;
    this._dexterity = dexterity;
  }

  gainExperience(amount: number) {
    this._experience += amount;
    if (this._experience >= this.experienceToLevelUp()) {
      this.levelUp();
    }
  }

  private experienceToLevelUp() {
    return this._level * 100; // Simple formula for leveling up
  }

  private levelUp() {
    this._level++;
    this._experience = 0; // Reset experience after leveling up
    // Increase stats on level up (example)
    this._health += 20;
    this._mana += 10;
    this._stamina += 15;
    this._strength += 2;
    this._agility += 2;
    this._intelligence += 2;
    this._dexterity += 2;
  }
}



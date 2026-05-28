export class SlotMachine {
  private row1 = ["🍒", "🍋", "🍊", "🔔", "⭐", "💲", "💎"];
  private row2 = ["💎", "🍒", "🔔", "⭐", "🍋", "🍊", "💲"];
  private row3 = ["⭐", "💲", "🍒", "💎", "🍊", "🔔", "🍋"];

  private _initialMoney = 0;

  jackpotPayoutTable: Record<string, number> = {
    "💎": 50, // rarest
    "💲": 20,
    "⭐": 10,
    "🍒": 5, // most common
    "🔔": 3,
    "🍊": 3,
    "🍋": 3,
  };

  // 💎 💎 💎  →  50x bet
  // 💲 💲 💲  →  20x bet
  // ⭐ ⭐ ⭐  →  10x bet
  // 🍒 🍒 🍒  →   5x bet
  // any three of a kind  →   3x bet
  // any two matching     →   1x bet (get your bet back)
  // no match             →   0  (lose the bet)

  constructor(intialMoney: number) {
    this._initialMoney = intialMoney;
  }

  spin() {
    if (this._initialMoney < 10) {
      console.log("OUT OF MONEY");
    } else {
      this._initialMoney -= 10;

      this.row1 = this.shiftRow(this.row1);
      this.row2 = this.shiftRow(this.row2);
      this.row3 = this.shiftRow(this.row3);

      const win1 = this.calculateWin(this.row1[0], this.row2[0], this.row3[0]);
      const win2 = this.calculateWin(this.row1[1], this.row2[1], this.row3[1]);
      const win3 = this.calculateWin(this.row1[2], this.row2[2], this.row3[2]);

      const realWin = Math.max(win1, win2, win3);

      console.log("# HAPPY SLOT #");
      console.log(
        `${this.row1[0] + " | " + this.row2[0] + " | " + this.row3[0]}`
      );
      console.log(
        `${this.row1[1] + " | " + this.row2[1] + " | " + this.row3[1]}`
      );
      console.log(
        `${this.row1[2] + " | " + this.row2[2] + " | " + this.row3[2]}`
      );

      if (realWin > 0) {
        console.log("  # WIN: " + realWin + " # ");

        this._initialMoney += 10 * realWin;
      } else {
        console.log("# TRY AGAIN! #");
      }
    }
    console.log(this._initialMoney);
  }

  shiftRow(row: string[]): string[] {
    let shiftArr = new Array(row.length);
    const shift = Math.floor(Math.random() * 10);

    row.forEach((element, index) => {
      if (index + shift < shiftArr.length - 1) {
        shiftArr[index + shift] = element;
      } else {
        shiftArr[(index + shift) % shiftArr.length] = element;
      }
    });
    return shiftArr;
  }

  calculateWin(x: string, y: string, z: string): number {
    if (x === y && x === z) return this.jackpotPayoutTable[x] ?? 3;
    if (x === y || x === z || y === z) return 1;
    return 0;
  }
}

export class Account {
  private _owner: string;
  private _accountNumber: string;
  private _balance: number;

  constructor(owner: string) {
    this._owner = owner;
    this._accountNumber = "";
    this._balance = 0;
  }

  get owner() {
    return this._owner;
  }

  get accountNumber() {
    return this._accountNumber;
  }

  get balance() {
    return this._balance;
  }

  set owner(owner: string) {
    this._owner = owner;
  }

  set balance(balance: number) {
    this._balance = balance;
  }

  deposit(depositAmount: number) {
    this._balance += depositAmount;
  }

  withdrawal(withdrawalAmount: number) {
    this._balance -= withdrawalAmount;
  }
}

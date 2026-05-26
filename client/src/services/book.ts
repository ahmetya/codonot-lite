export class Book {
  private _title: string = "";
  private _author: string = "";
  private _isbn: string = "";
  private _isBorrowed: boolean = false;

  constructor(title: string, author: string, isbn: string) {
    this._title = title;
    this._author = author;
    this._isbn = isbn;
  }

  get title(): string {
    return this._title;
  }

  get author(): string {
    return this._author;
  }

  get isbn(): string {
    return this._isbn;
  }

  get isBorrowed(): boolean {
    return this._isBorrowed;
  }

  set title(title: string) {
    this._title = title;
  }

  set author(author: string) {
    this._author = author;
  }

  set isbn(isbn: string) {
    this._isbn = isbn;
  }

  set isBorrowed(isBorrowed: boolean) {
    this._isBorrowed = isBorrowed;
  }

  borrow() {
    if (!this._isBorrowed) {
      this._isBorrowed = true;
    } else {
      console.log("Book is already borrowed !");
    }
  }
}

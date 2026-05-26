import { Book } from "./book";

export class Library {
  private _name: string = "";
  private _allBooks: Book[] = [];

  static totalLibCount: number = 0;

  catalog: any;
  loan: any;

  constructor(name: string) {
    this._name = name;

    this.catalog = {
      add: (book: Book) => this.add(book),
      remove: (isbn: string) => this.remove(isbn),
      list: () => this.list(),
    };

    this.loan = {
      borrow: (isbn: string) => this.borrow(isbn),
      return: (isbn: string) => this.return(isbn),
      listBorrowed: () => this.listBorrowed(),
    };

    Library.totalLibCount++;
  }

  get name() {
    return this._name;
  }

  get allbooks() {
    return this._allBooks;
  }

  get totalLibCount() {
    return Library.totalLibCount;
  }

  add(book: Book) {
    console.log(book);
    this._allBooks.push(book);
  }

  remove(isbn: string) {
    console.log("remove() called...");
    this._allBooks = this._allBooks.filter((book) => book.isbn !== isbn);
  }

  list() {
    console.log("list() is called...");

    this.allbooks.forEach((book) => {
      console.log(book.title);
    });
  }

  borrow(isbn: string) {
    console.log("borrow() is called...");

    this.allbooks.forEach((book) => {
      if (book.isbn === isbn) {
        book.borrow();
      }
    });
  }

  return(isbn: string) {
    console.log("return() is called...");
    this.allbooks.forEach((book) => {
      if (book.isbn === isbn) {
        book.borrow();
      }
    });
  }

  listBorrowed() {
    console.log("listBorrowed() is called...");

    this._allBooks.forEach((book) => {
      if (book.isBorrowed) {
        console.log(book);
      }
    });
  }
}

export class Utils {
  private _name: string = "Utils";
  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
  }
  constructor(name?: string) {
    if (name) {
      this.name = name;
    }
  }

  sayHello() {
    console.log("Hello!");
  }

  sayGoodbye() {
    console.log("Goodbye!: ", this.name);
  }

  callbackTest(testNumber: number, callback: (result: number) => void) {
    const result = testNumber + 1;
    callback(result);
  }

  callbackWithPromise(
    testNumber: number,
    callback: (result: number) => void,
  ): Promise<number> {
    const result = testNumber + 1 + 5;
    callback(result);
    return Promise.resolve(result);
  }

  fetchWithPromise(
    url: string,
    callback: (result: string) => void,
  ): Promise<string> {
    const apiResult = fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        callback("SUCCESS: " + response.status.toString());
        return response.statusText;
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        callback("CATCH ERROR: " + error.toString());
        throw error;
      });

    return apiResult;
  }
}
  
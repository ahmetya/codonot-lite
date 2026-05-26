export class Utils {
  private _name: string = 'Utils';

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
    console.log('Hello! in React');
  }

  sayGoodbye() {
    console.log('Goodbye!: ', this.name);
  }

  callbackTest(testNumber: number, callback: (result: number) => void) {
    const result = testNumber + 1;
    callback(result);
  }

  callbackWithPromise(
    testNumber: number,
    callback: (result: number) => void
  ): Promise<number> {
    const result = testNumber + 1 + 5;
    callback(result);
    return Promise.resolve(result);
  }

  fetchWithPromise(
    url: string,
    callbackAlias: (result: string) => string,
    otherCallback?: (result: string) => string
  ): Promise<string> {
    const apiResult = fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        let responseStatus = response.status.toString();

        if (otherCallback) {
          const otherCallbackResult = otherCallback(
            responseStatus + ' from otherCallback'
          );
          return otherCallbackResult;
        }

        const callbackResult = callbackAlias(
          'SUCCESS: ' + response.status.toString()
        );
        return callbackResult;
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        const callbackResult = callbackAlias(
          'CATCH ERROR: ' + error.toString()
        );
        return callbackResult;
      });

    return apiResult;
  }

  doubleCallback(
    initialValue: number,
    callback: (result: number, result2: number) => void
  ) {
    const result = initialValue + 1;
    const result2 = initialValue + 2;
    callback(result, result2);
  }
}

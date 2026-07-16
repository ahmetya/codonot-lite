import { useState } from "react";
import { useEffect } from "react";
export default function Experimental() {
  console.log("RAAAAAJ");

  document.oncopy = (ev) => {
    console.log("somthing is copied", ev);
  };

  const [message, setMessage] = useState("");
  const [pokeResp, setPokeResp] = useState("");

  useEffect(() => {
    if (message) {
      console.log("Message is changed:", message);
    }
  }, [message]);

  function random(someNumber: number, callback: any) {
    someNumber++;
    console.log("Random clicked");
    setMessage(`Random clicked ${someNumber} times`);
    callback(someNumber);
  }

  const promiseTest: () => Promise<number> = () => {
    return new Promise((resolve, reject) => {
      const randomNumber = Math.floor(Math.random() * 100);
      console.log("Random number generated:", randomNumber);
      if (randomNumber > 50) {
        resolve(randomNumber);
      } else {
        reject(0);
      }
    });
  };

  const experimental: {
    random: (someNumber: number, callback: any) => void;
    promiseTest: () => Promise<number>;
  } = {
    random,
    promiseTest,
  };

  const someTestFunction = () => {
    experimental.random(0, (newNumber: number) => {
      console.log("New number from callback:", newNumber);
    });

    experimental
      .promiseTest()
      .then((result) => {
        console.log("Promise resolved with result:", result);
      })
      .catch((error) => {
        console.error("Promise rejected with error:", error);
      });
  };

  const testPokePromise = () => {
    return new Promise((resolve, reject) => {
      const resp = fetch("https://pokeapi.co/api/v2/pokemon/ditto");

      let a: any;

      const my = resp.then((resp) => {
        a = resp;
        return a;
      });

      // this wont work promise only resolves in then.
      console.log("resp", a);
      console.log(
        "my",
        my.then((res) => res)
      );

      resolve("resloved");
      reject("rejected");
    });
  };

  const testPokemonAsync = async () => {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
    console.log("info", response.headers);
  };

  const handlePromiseTest = () => {
    fetch("https://pokeapi.co/api/v2/pokemon/ditto")
      .then((resp) => {
        console.log("resp", resp);
        console.log("typeof resp.json()", typeof resp);
        return resp.json();
      })
      .then((respJson) => {
        console.log("respJson", respJson);
        console.log("typeof respJson", typeof respJson);
        setPokeResp(JSON.stringify(respJson));
      });
  };

  const handlePromiseHandler = () => {
    promiseTest()
      .then((result) => {
        console.log("Promise resolved with result:", result);
      })
      .catch((error) => {
        console.error("Promise rejected with error:", error);
      });
  };

  const testDocumet = () => {
    console.log(document);
  };

  return (
    <>
      <h1>Experimental</h1>

      <button onClick={testDocumet}>Document</button>

      <button onClick={testPokePromise}>Test Poke Promise</button>

      <button
        onClick={() => random(0, (newNumber: number) => console.log(newNumber))}
      >
        Random
      </button>
      <button
        onClick={() => {
          promiseTest()
            .then((result) => console.log(result))
            .catch((error) => console.error(error));
        }}
      >
        Promise
      </button>
      <button onClick={handlePromiseHandler}>Handle Promise</button>

      <button onClick={handlePromiseTest}>Poke</button>
      <p>{message}</p>
      <p>{pokeResp}</p>
    </>
  );
}

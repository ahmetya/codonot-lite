import { useState } from "react";
import { useEffect } from "react";
export default function Experimental() {
  const [message, setMessage] = useState("");
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

  const promiseTest = () => {
    return new Promise((resolve, reject) => {
      const randomNumber = Math.floor(Math.random() * 100);

      console.log("Random number generated:", randomNumber);

      if (randomNumber > 50) {
        resolve(randomNumber);
      } else {
        reject("nope");
      }
    });
  };

  return (
    <>
      <h1>Experimental</h1>
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

      <p>{message}</p>
    </>
  );
}

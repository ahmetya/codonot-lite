import { useState } from "react";
import { useEffect } from "react";
export default function Experimental() {
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

  const handlePromiseTest = async () => {
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

      <button onClick={handlePromiseTest}>Poke</button>
      <p>{message}</p>
      <p>{pokeResp}</p>
    </>
  );
}

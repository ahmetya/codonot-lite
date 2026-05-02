import { useState, useEffect } from "react";
import "./App.css";
import { Utils } from "./services/utils";

interface HelloResponse {
  message: string;
}

const utils = new Utils("Ahmet");

function App() {
  const [message, setMessage] = useState<string>("");
  const [pokeData, setPokeData] = useState<string>("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data: HelloResponse) => setMessage(data.message));
  }, []);

  const handlePoke = () => {
    fetch("/api/poke")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setPokeData(JSON.stringify(data.name)); // Store the height of the Pokemon as a string
        console.log("Poke API data:", data); // Log the height of the Pokemon
      });
    console.log("Fetching Pokemon data...");
  };

  const testCallbackWithPromise = () => {
    utils
      .callbackWithPromise(10, (result) => {
        console.log("Callback with Promise result:", result);
      })
      .then((finalResult) => {
        console.log("Final result from Promise:", finalResult);
      });
  };

  const testFetchWithPromise = async () => {
    await utils
      .fetchWithPromise("/api/hello", (result) => {
        console.log("Callback from fetchWithPromise:", result);
      })
      .then((finalResult) => {
        console.log("Final result from fetchWithPromise:", finalResult);
      })
      .catch((error) => {
        console.error("Error in fetchWithPromise:", error);
      });
  };

  const testFetchWithPromiseError = async () => {
    const res = await utils.fetchWithPromise("/api/hello", (result) => {
      console.log("Callback from fetchWithPromise (error case):", result);
    });

    console.log("Result from fetchWithPromise (error case):", res);
  };

  return (
    <>
      <div className="generic">
        <button onClick={handlePoke}>Poke Button</button>
        <button onClick={() => utils.sayHello()}>Say Hello</button>
        <button onClick={() => utils.sayGoodbye()}>Say Goodbye</button>
        <button onClick={testCallbackWithPromise}>
          Callback with Promise Test
        </button>
        <button onClick={testFetchWithPromise}>Fetch with Promise Test</button>
        <button onClick={testFetchWithPromiseError}>
          Fetch with Promise Error Test
        </button>

        <button
          onClick={() =>
            utils.callbackTest(5, (result) => {
              console.log("Callback result:", result);
            })
          }
        >
          Callback Test
        </button>
      </div>

      <h1>{pokeData ? pokeData : "No data"}</h1>
      <h1>{message}</h1>
    </>
  );
}

export default App;

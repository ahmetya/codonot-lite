import { useState, useEffect } from "react";
import "./index.css";
import { Utils } from "../../services/utils";
import { Library } from "../../services/library";
import { Book } from "../../services/book";
import { SlotMachine } from "../../services/slotMachine";

interface HelloResponse {
  message: string;
}

const utils = new Utils("Ahmet");
const slotMachine = new SlotMachine(100);

export default function Home() {
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
        setPokeData(data.name); // Store the height of the Pokemon as a string
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
        return result; // Return the result to be used in the next .then() block
      })
      .then((finalResult) => {
        console.log("Final result from fetchWithPromise:", finalResult);
      })
      .catch((error) => {
        console.error("Error in fetchWithPromise:", error);
      });
  };

  const someCallback = async (addWord: string): Promise<void> => {
    console.log("Callback with some word:", addWord);

    const res = await utils
      .fetchWithPromise("/api/hello", (result) => result)
      .then((result) => {
        console.log("Result from fetchWithPromise in someCallback:", result);
        return result;
      });

    const res2 = await utils.fetchWithPromise("/api/hello", (result) => result);

    console.log(
      "res2  Result from fetchWithPromise in someCallback (second call):",
      res2
    );

    console.log(
      "Result from fetchWithPromise in someCallback (immediately after call):",
      res
    );

    utils.doubleCallback(5, (result, result2) => {
      console.log("First callback result:", result);
      console.log("Second callback result:", result2);
    });

    utils
      .fetchWithPromise("/api/hello", (result) => {
        console.log(
          "re4 Callback from fetchWithPromise in doubleCallback:",
          result
        );

        return `${JSON.stringify(result)}AAAA`;
      })
      .then((result) => {
        console.log(
          `#################### ret Final result from fetchWithPromise in doubleCallback:`,
          result
        );
      });
  };

  const testFetchWithPromiseError = async () => {
    const res = await utils.fetchWithPromise("/api/hello", (result) => {
      console.log("Callback from fetchWithPromise (error case):", result);
      return result;
    });

    console.log("Result from fetchWithPromise (error case):", res);
  };

  // Gets pokemon data and writes to db
  const testPokemonService = async () => {
    await fetch("/api/pokemon", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pokeId: 1, name: "Bulbasaur" }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Created Pokemon:", data);
      })
      .catch((err) => {
        console.error("Error creating Pokemon:", err);
      });
  };

  const generateRandomId = () => {
    return Math.floor(Math.random() * 100) + 1; // Generate a random ID between 1 and 100
  };

  const testPokemonServiceExternal = async () => {
    const randomId = generateRandomId();
    await fetch(`/api/pokemon/${randomId}?poke=${randomId}&gender=male`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Pokemon:", data);
        setPokeData(data.name);
      })
      .catch((err) => {
        console.error("Error fetching Pokemon:", err);
      });
  };

  const saySimple = () => {
    console.log("Simple say function");
  };

  const arrayManipulation = () => {
    const numbers = [1, 2, 3, 4, 5];

    const squaredNumbers = numbers.map((num, index, array) => {
      console.log(`Number: ${num}, Index: ${index}, Array: ${array}`);

      return num * num;
    });

    numbers.reduce;

    console.log("Squared Numbers:", squaredNumbers);
  };

  const someSample = () => {
    const res = fetch("/api/hello")
      .then((res) => {
        return res.json().then((data) => {
          console.log("111 Data from /api/hello in someSample:", data);
          return { data, ...{ extra: "Extra data from someSample" } }; // Return the data along with extra information
        });
      })
      .then((data) => {
        console.log("222 Data from /api/hello in someSample:", data);
        return data;
      });

    console.log(utils.name); // Accessing the name property of the Utils instance
    // this allways being called immediately after the fetch call, not waiting for the fetch to complete
    console.log("Fetch result in someSample:", res);
  };

  const testLibrary = () => {
    const lib = new Library("Kutupanne");
    const hayat = new Book("Hayat Bilgisi", "Ahmet", "978-0135957059");
    const mezat = new Book("Mezat Bilgisi", "Ahmet", "978-0135957060");
    lib.catalog.add(hayat);
    lib.catalog.add(mezat);

    lib.loan.borrow("978-0135957059");
    lib.loan.borrow("978-0135957060");
    lib.loan.borrow("978-0135957060");
    lib.loan.listBorrowed();

    lib.return("978-0135957060");
    lib.loan.listBorrowed();

    console.log(lib.totalLibCount);
  };

  const getSlotMachine = () => {
    slotMachine.spin();
  };

  return (
    <>
      <div className="generic">
        <button onClick={getSlotMachine}>HAPPY SLOT </button>
        <button onClick={testLibrary}>Library Test</button>
        <button onClick={arrayManipulation}>Array Manipulation</button>
        <button onClick={someSample}>Some Sample</button>
        <button onClick={() => someCallback("Hello")}>Some Callback</button>
        <button onClick={handlePoke}>Poke Button</button>
        <button onClick={testPokemonService}>Test Pokemon Service</button>
        <button onClick={() => utils.sayHello()}>Say Hello</button>
        <button onClick={() => utils.sayGoodbye()}>Say Goodbye</button>
        <button onClick={() => saySimple()}>Say Simple</button>
        <button onClick={testCallbackWithPromise}>
          Callback with Promise Test
        </button>
        <button onClick={testFetchWithPromise}>Fetch with Promise Test</button>
        <button onClick={testFetchWithPromiseError}>
          Fetch with Promise Error Test
        </button>
        <button onClick={testPokemonServiceExternal}>
          Test Pokemon Service External
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

      <p>{pokeData ? pokeData : "No data"}</p>
      <p>{message}</p>
    </>
  );
}

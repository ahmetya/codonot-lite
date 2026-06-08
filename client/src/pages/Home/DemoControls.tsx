import { apiService } from "../../services/ApiService";
import { Book } from "../../services/book";
import { Library } from "../../services/library";
import { SlotMachine } from "../../services/slotMachine";
import { Utils } from "../../services/utils";

interface DemoControlsProps {
  isAuthenticated: boolean;
  onBotAnswerChange: (answer: string) => void;
  onPokeDataChange: (name: string) => void;
  onRawStream: () => void;
}

const utils = new Utils("Ahmet");
const slotMachine = new SlotMachine(100);

export function DemoControls({
  isAuthenticated,
  onBotAnswerChange,
  onPokeDataChange,
  onRawStream,
}: DemoControlsProps) {
  const register = async () => {
    try {
      const response = await apiService.register(
        "admin@example.com",
        "admin123",
        "admin"
      );
      console.log("Registration successful:", response);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const login = async () => {
    try {
      const response = await apiService.login(
        "admin@example.com",
        "admin123"
      );
      console.log("Login successful:", response);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const testCallbackWithPromise = () => {
    utils
      .callbackWithPromise(10, (result) => {
        console.log("Callback with Promise result:", result);
      })
      .then((result) => console.log("Final Promise result:", result));
  };

  const testFetchWithPromise = async () => {
    await utils
      .fetchWithPromise("/api/hello", (result) => {
        console.log("Callback from fetchWithPromise:", result);
        return result;
      })
      .then((result) => console.log("Final fetch result:", result))
      .catch((error) => console.error("Error in fetchWithPromise:", error));
  };

  const testFetchWithPromiseError = async () => {
    const result = await utils.fetchWithPromise("/api/hello", (value) => {
      console.log("Callback from fetchWithPromise:", value);
      return value;
    });
    console.log("Result from fetchWithPromise:", result);
  };

  const someCallback = async () => {
    const first = await utils.fetchWithPromise(
      "/api/hello",
      (result) => result
    );
    const second = await utils.fetchWithPromise(
      "/api/hello",
      (result) => result
    );

    console.log("First callback result:", first);
    console.log("Second callback result:", second);

    utils.doubleCallback(5, (result, result2) => {
      console.log("Double callback results:", result, result2);
    });
  };

  const createPokemon = async () => {
    try {
      const response = await fetch("/api/pokemon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pokeId: 1, name: "Bulbasaur" }),
      });
      console.log("Created Pokemon:", await response.json());
    } catch (error) {
      console.error("Error creating Pokemon:", error);
    }
  };

  const fetchPokemon = async (id: number) => {
    try {
      const response = await fetch(
        `/api/pokemon/${id}?poke=${id}&gender=male`
      );
      const data = (await response.json()) as { name?: string };
      console.log("Fetched Pokemon:", data);
      if (data.name) onPokeDataChange(data.name);
    } catch (error) {
      console.error("Error fetching Pokemon:", error);
    }
  };

  const fetchDefaultPokemon = async () => {
    const response = await fetch("/api/poke");
    const data = (await response.json()) as { name?: string };
    if (data.name) onPokeDataChange(data.name);
    console.log("Poke API data:", data);
  };

  const runHelperBot = async () => {
    const response = await fetch("/api/helperbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "make me a joke about robots" }),
    });
    const answer = (await response.json()) as string;
    onBotAnswerChange(answer);
  };

  const testLibrary = () => {
    const library = new Library("Kutupanne");
    library.catalog.add(
      new Book("Hayat Bilgisi", "Ahmet", "978-0135957059")
    );
    library.catalog.add(
      new Book("Mezat Bilgisi", "Ahmet", "978-0135957060")
    );
    library.loan.borrow("978-0135957059");
    library.loan.borrow("978-0135957060");
    library.loan.listBorrowed();
    library.return("978-0135957060");
    console.log(library.totalLibCount);
  };

  const testArray = () => {
    const squared = [1, 2, 3, 4, 5].map((number) => number * number);
    console.log("Squared numbers:", squared);
  };

  const testFetchTiming = () => {
    const pending = fetch("/api/hello").then((response) => response.json());
    console.log("Pending fetch:", pending);
  };

  return (
    <div className="generic">
      <button onClick={register}>API Register Test</button>
      <button onClick={login}>API Login Test</button>
      <button onClick={testCallbackWithPromise}>
        Callback with Promise Test
      </button>
      <button onClick={testFetchWithPromise}>Fetch with Promise Test</button>
      <button onClick={testFetchWithPromiseError}>
        Fetch with Promise Error Test
      </button>
      <button
        onClick={() =>
          utils.callbackTest(5, (result) =>
            console.log("Callback result:", result)
          )
        }
      >
        Callback Test
      </button>
      <button onClick={runHelperBot}>Helper Bot</button>
      <button onClick={onRawStream}>Stream Answer</button>

      {isAuthenticated && (
        <>
          <button className="button-auth" onClick={() => slotMachine.spin()}>
            HAPPY SLOT
          </button>
          <button className="button-auth" onClick={testLibrary}>
            Library Test
          </button>
          <button className="button-auth" onClick={testArray}>
            Array Manipulation
          </button>
          <button className="button-auth" onClick={testFetchTiming}>
            Some Sample
          </button>
          <button className="button-auth" onClick={someCallback}>
            Some Callback
          </button>
          <button className="button-auth" onClick={fetchDefaultPokemon}>
            Poke Button
          </button>
          <button className="button-auth" onClick={createPokemon}>
            Test Pokemon Service
          </button>
          <button className="button-auth" onClick={() => utils.sayHello()}>
            Say Hello
          </button>
          <button className="button-auth" onClick={() => utils.sayGoodbye()}>
            Say Goodbye
          </button>
          <button
            className="button-auth"
            onClick={() => console.log("Simple say function")}
          >
            Say Simple
          </button>
          <button
            className="button-auth"
            onClick={() => fetchPokemon(Math.floor(Math.random() * 100) + 1)}
          >
            Test Pokemon Service External
          </button>
        </>
      )}
    </div>
  );
}

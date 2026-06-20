export interface RxjsModule {
  id: number;
  title: string;
  shortDesc: string;
  concepts: string[];
  explanation: string;
  defaultCode: string;
  exercise: {
    question: string;
    hint: string;
    targetSolution: string;
  };
}

export const rxjsModules: RxjsModule[] = [
  {
    id: 1,
    title: "1. The Pillars of RxJS",
    shortDesc: "Streams, Observables, and Subscriptions from scratch",
    concepts: ["Observable (Producer)", "Observer (Consumer)", "Subscription (Lifecycle)"],
    explanation: `RxJS is all about streams of events. An **Observable** is a wrapper around a data producer that emits values over time. An **Observer** is a collection of callbacks (next, error, complete) that listens to those values. A **Subscription** represents the execution of an Observable and can be cancelled.

Every Observable has a lifecycle:
1. **next**: Emits a new value.
2. **complete**: Signals that the stream has finished.
3. **error**: Sends a error signal, terminating the stream.`,
    defaultCode: `const { Observable } = rxjs;

// Create an observable from scratch
const myObservable = new Observable((subscriber) => {
  log("Observable started running!");
  
  subscriber.next("Hello");
  subscriber.next("RxJS");

  // Emitting a value asynchronously after 1 second
  const timerId = setTimeout(() => {
    subscriber.next("Async World 🚀");
    subscriber.complete();
  }, 1000);

  // Return a cleanup function for when we unsubscribe
  return () => {
    log("Cleanup executed! Clearing timeout.");
    clearTimeout(timerId);
  };
});

log("Before subscribe");

const subscription = myObservable.subscribe({
  next: (val) => log(\`Received emission: \${val}\`),
  error: (err) => log(\`Error: \${err}\`),
  complete: () => log("Stream complete! 🎉")
});

log("After subscribe");

// We can unsubscribe manually after 500ms if we want to cancel before the async value
// setTimeout(() => {
//   log("Unsubscribing early!");
//   subscription.unsubscribe();
// }, 500);
`,
    exercise: {
      question: "Modify the code to emit the numbers 1, 2, and 3 instantly, then emit 4 after 1.5 seconds, and finally complete.",
      hint: "Add subscriber.next(1), subscriber.next(2), subscriber.next(3), and a setTimeout for 1500ms to emit 4 and call subscriber.complete().",
      targetSolution: `const { Observable } = rxjs;
const myObservable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  const id = setTimeout(() => {
    subscriber.next(4);
    subscriber.complete();
  }, 1500);
  return () => clearTimeout(id);
});
myObservable.subscribe({
  next: v => log(v),
  complete: () => log("Done")
});`
    }
  },
  {
    id: 2,
    title: "2. Creation Operators",
    shortDesc: "Generating streams from arrays, events, and timer intervals",
    concepts: ["of() & from()", "interval() & timer()", "fromEvent()"],
    explanation: `Instead of building Observables manually with \`new Observable()\`, RxJS provides **Creation Operators** to convert common structures into streams:
- \`of(a, b, c)\`: Emits values in order and completes.
- \`from([a, b, c])\`: Converts an Array, Promise, or Iterable into an Observable.
- \`interval(ms)\`: Emits incrementing numbers from 0 at the specified millisecond interval.
- \`timer(delay, ms)\`: Emits after an initial delay, then ticks at intervals.
- \`fromEvent(element, event)\`: Converts DOM events (clicks, keypresses) into streams.`,
    defaultCode: `const { of, from, interval } = rxjs;
const { take } = rxjs.operators;

log("--- of(10, 20, 30) ---");
of(10, 20, 30).subscribe({
  next: v => log(\`of: \${v}\`),
  complete: () => log("of complete!")
});

log("--- from([1, 2, 3]) ---");
from([1, 2, 3]).subscribe({
  next: v => log(\`from array: \${v}\`)
});

log("--- interval(300) (using take(4) to limit) ---");
// We use take(4) operator so the interval doesn't run forever
const intervalStream = interval(300).pipe(take(4));

intervalStream.subscribe({
  next: v => log(\`tick: \${v}\`),
  complete: () => log("Interval complete!")
});
`,
    exercise: {
      question: "Use 'from' to convert a Promise resolving to 'Promise Resolved' after 800ms, and subscribe to log the output.",
      hint: "Create a promise: new Promise(resolve => setTimeout(() => resolve('Promise Resolved'), 800)). Pass it to from().",
      targetSolution: `const { from } = rxjs;
const myPromise = new Promise(resolve => setTimeout(() => resolve('Promise Resolved'), 800));
from(myPromise).subscribe(val => log(val));`
    }
  },
  {
    id: 3,
    title: "3. Pipe & Transform Operators",
    shortDesc: "Filtering, transforming, and accumulating values",
    concepts: ["pipe() composition", "map() & filter()", "scan() & tap()"],
    explanation: `Operators are the power tools of RxJS. They let you modify streams of data. 
- \`pipe(...operators)\`: Combines multiple operators sequentially.
- \`map(fn)\`: Transforms each emitted value.
- \`filter(fn)\`: Selects values that pass a condition.
- \`tap(fn)\`: Runs side effects (e.g. logging) without altering the value.
- \`scan(acc, val)\`: Accumulates values over time, like Array.reduce.
- \`take(n)\`: Completes after emitting n values.`,
    defaultCode: `const { interval } = rxjs;
const { map, filter, scan, take, tap } = rxjs.operators;

log("Running piped stream...");

interval(300)
  .pipe(
    take(6),                          // stop after 6 values (0,1,2,3,4,5)
    tap(x => log(\`Source: \${x}\`)),     // tap for debugging
    filter(x => x % 2 !== 0),         // only keep odd numbers (1,3,5)
    map(x => x * 10),                 // multiply by 10 (10, 30, 50)
    scan((acc, val) => acc + val, 0)  // running sum: 10 -> 40 -> 90
  )
  .subscribe({
    next: val => log(\`Final Emission: \${val}\`),
    complete: () => log("All done!")
  });
`,
    exercise: {
      question: "Modify the piped stream so it takes 10 ticks, filters numbers greater than 3, squares them, and prints them.",
      hint: "Set take(10), filter(x => x > 3), and map(x => x * x).",
      targetSolution: `const { interval } = rxjs;
const { map, filter, take } = rxjs.operators;
interval(200).pipe(
  take(10),
  filter(x => x > 3),
  map(x => x * x)
).subscribe(v => log(v));`
    }
  },
  {
    id: 4,
    title: "4. Combination Operators",
    shortDesc: "Combining and joining multiple streams together",
    concepts: ["merge() vs concat()", "combineLatest()", "forkJoin()"],
    explanation: `Often you have multiple independent streams and need to join them.
- \`merge(a, b)\`: Interleaves emissions from multiple streams as they arrive concurrently.
- \`concat(a, b)\`: Subscribes to stream *b* only after stream *a* completes (sequential).
- \`combineLatest([a, b])\`: Emits an array of latest values from both sources whenever either source emits (once both have emitted at least once).
- \`forkJoin([a, b])\`: Like Promise.all. Emits once both complete, containing only the final values.`,
    defaultCode: `const { timer, merge, concat, combineLatest } = rxjs;
const { map, take } = rxjs.operators;

const streamA = timer(0, 400).pipe(take(3), map(v => \`A\${v}\`));
const streamB = timer(200, 400).pipe(take(3), map(v => \`B\${v}\`));

log("--- Testing merge (runs concurrently) ---");
merge(streamA, streamB).subscribe(val => log(\`merge: \${val}\`));

// To test concat or combineLatest, uncomment below:
/*
setTimeout(() => {
  log("\\n--- Testing concat (runs sequentially) ---");
  concat(streamA, streamB).subscribe(val => log(\`concat: \${val}\`));
}, 2000);

setTimeout(() => {
  log("\\n--- Testing combineLatest ---");
  combineLatest([streamA, streamB]).subscribe(val => log(\`combineLatest: \${val}\`));
}, 4000);
*/
`,
    exercise: {
      question: "Create two streams: A (emits 'Ping' after 300ms) and B (emits 'Pong' after 600ms). Combine them with concat so 'Ping' is logged first, then 'Pong'.",
      hint: "Use timer(300).pipe(mapTo('Ping')) or map(v => 'Ping') and similar for B, then pass both to concat().",
      targetSolution: `const { timer, concat } = rxjs;
const { map, take } = rxjs.operators;
const ping = timer(300).pipe(take(1), map(() => 'Ping'));
const pong = timer(600).pipe(take(1), map(() => 'Pong'));
concat(ping, pong).subscribe(v => log(v));`
    }
  },
  {
    id: 5,
    title: "5. Higher-Order / Flattening Operators",
    shortDesc: "Managing nested observables and HTTP request cancellations",
    concepts: ["Observable of Observables", "switchMap() (Cancel current)", "mergeMap() (Parallel requests)", "concatMap() (Queue requests)"],
    explanation: `When mapping a stream, what happens if the mapping function returns an *Observable* itself? You get a nested stream. To consume it, you must "flatten" it.

- \`switchMap(fn)\`: Maps to an inner Observable. If a new outer emission arrives, it **cancels** the active inner subscription. Perfect for search/autocomplete queries!
- \`mergeMap(fn)\`: Handles all inner subscriptions in parallel (doesn't cancel any).
- \`concatMap(fn)\`: Queues inner subscriptions and processes them sequentially.
- \`exhaustMap(fn)\`: Ignores new outer emissions while the current inner Observable is running. Great for preventing double-clicks on buttons.`,
    defaultCode: `const { interval, of } = rxjs;
const { switchMap, mergeMap, delay, take } = rxjs.operators;

// Outer stream fires every 1 second
const clicks = interval(1000).pipe(take(3));

log("Starting switchMap (outer ticks cancel previous inner simulated API request)...");
clicks.pipe(
  switchMap(id => {
    log(\`Outer value \${id} arrived. Triggering inner simulated API request...\`);
    // Simulated API request that takes 1.5s to respond
    return of(\`API Response for \${id}\`).pipe(delay(1500));
  })
).subscribe({
  next: response => log(\`Success: \${response}\`),
  complete: () => log("switchMap run complete!")
});

// Note: since outer ticks occur every 1000ms, and the inner delay is 1500ms,
// the outer tick cancels the inner request before it can emit!
// Only the very last request will succeed because no new outer tick cancels it.
`,
    exercise: {
      question: "Switch the operator from switchMap to mergeMap in the editor. Predict and run to see the difference (all API responses should complete!).",
      hint: "Import mergeMap from rxjs.operators and replace switchMap with mergeMap in the pipe.",
      targetSolution: `const { interval, of } = rxjs;
const { mergeMap, delay, take } = rxjs.operators;
interval(1000).pipe(
  take(3),
  mergeMap(id => {
    log(\`Triggering inner for \${id}...\`);
    return of(\`API Response for \${id}\`).pipe(delay(1500));
  })
).subscribe({
  next: val => log(val),
  complete: () => log("Completed!")
});`
    }
  },
  {
    id: 6,
    title: "6. Subjects & Multicasting",
    shortDesc: "Sharing stream executions and holding application state",
    concepts: ["Cold vs Hot Observables", "Subject (Event Emitter)", "BehaviorSubject (State Holder)"],
    explanation: `Normal Observables are **Cold**: code runs independently for each subscriber. 
**Subjects** are **Hot**: they can multicast to multiple subscribers. They act as both an Observable (you can subscribe to them) and an Observer (you can call \`.next(value)\` on them directly).

- \`Subject\`: Simple event emitter. Late subscribers miss old events.
- \`BehaviorSubject\`: Stores the current state. Late subscribers immediately receive the latest value upon subscribing.
- \`ReplaySubject\`: Stores a buffer of historical values and replays them to new subscribers.`,
    defaultCode: `const { BehaviorSubject, Subject } = rxjs;

log("--- BehaviorSubject Example ---");
// We initialize it with a starting state: "Initial Value"
const state$ = new BehaviorSubject("Initial Value");

log("Subscriber 1 subbing.");
state$.subscribe(v => log(\`Sub 1: \${v}\`));

log("Updating state to 'Updated State'...");
state$.next("Updated State");

log("Subscriber 2 subbing late.");
// Subscriber 2 gets the current value ('Updated State') instantly!
state$.subscribe(v => log(\`Sub 2: \${v}\`));

log("Updating state again...");
state$.next("Final State");
`,
    exercise: {
      question: "Create a regular Subject (without initial value). Subscribe to it, emit 'A', then add another subscriber and emit 'B'. Verify what each subscriber receives.",
      hint: "const s = new Subject(). subscriber 1 logs. s.next('A'). subscriber 2 logs. s.next('B').",
      targetSolution: `const { Subject } = rxjs;
const s = new Subject();
s.subscribe(v => log("Sub 1: " + v));
s.next("A");
s.subscribe(v => log("Sub 2: " + v));
s.next("B");`
    }
  },
  {
    id: 7,
    title: "7. React & Real-World Integration",
    shortDesc: "Unsubscribing, building custom hooks, and autocompletes",
    concepts: ["Memory Leak Prevention", "Custom React hooks: useObservable", "Autocomplete with switchMap"],
    explanation: `When integrating RxJS with React, there are a few rules:
1. Always unsubscribe! Clean up streams in \`useEffect\` return functions to prevent memory leaks.
2. Store values in React state when they arrive, so React knows to re-render.
3. You can wrap this logic in a custom hook (like \`useObservable\`).

Let's look at the implementation of a custom React hook:
\`\`\`typescript
function useObservable(observable$, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    const sub = observable$.subscribe(setValue);
    return () => sub.unsubscribe();
  }, [observable$]);
  return value;
}
\`\`\`

In the interactive panels below, you will see real React inputs driven entirely by RxJS streams! Try typing in the Live Autocomplete demo to see it in action.`,
    defaultCode: `const { Subject } = rxjs;
const { debounceTime, distinctUntilChanged, switchMap } = rxjs.operators;

log("Let's simulate a search input stream with debounce and cancellation!");

const search$ = new Subject();

search$.pipe(
  debounceTime(300),              // wait 300ms of silence
  distinctUntilChanged(),         // ignore if same as last value
  switchMap(query => {
    log(\`Triggering API call for query: "\${query}"...\`);
    // Return a mock fetch promise converted to observable
    return fetch(\`https://pokeapi.co/api/v2/pokemon/\${query.toLowerCase()}\`)
      .then(res => res.json())
      .then(data => (\`Found: \${data.name} (Height: \${data.height})\`))
      .catch(() => \`No pokemon found for "\${query}"\`);
  })
).subscribe(result => {
  log(\`RESULT: \${result}\`);
});

// Simulate typing "pika" rapidly, then a pause, then typing "pikachu"
log("User types 'pika'...");
search$.next("pika");

setTimeout(() => {
  log("User types 'pikac'...");
  search$.next("pikac");
}, 100);

setTimeout(() => {
  log("User types 'pikachu'...");
  search$.next("pikachu");
}, 200);
`,
    exercise: {
      question: "Review the Live Autocomplete Search demo at the bottom of the page and try searching for different Pokemon (e.g. charizard, ditto, mew) to see debouncing and cancellation visually in the timeline!",
      hint: "Type slowly, then type rapidly and delete to see debouncing intercept the inputs.",
      targetSolution: `// No code changes needed here. Play with the search bar at the bottom!`
    }
  }
];

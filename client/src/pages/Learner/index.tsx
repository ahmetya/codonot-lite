import "./index.css";

function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((100 / total) * completed);
}

function calculateRemaining(completed: number, total: number): number {
  const remaining = total - completed;

  return Math.max(0, remaining);
}

function getPracticeMessage(isPracticing: boolean): string {
  return isPracticing ? "Currently practicing" : "Taking a break";
}

function getProgressLabel(progress: number): string {
  if (progress === 0) return "Not started";
  if (progress < 26) return "Getting startted";
  if (progress < 75) return "Making Progress";
  if (progress < 100) return "Almost There";
  return "completed";
}

const courseName = "JavaScript and TypeScript";
const totalCourseLessons = 12;

function createCourseTitle(learnerName: string): string {
  return `${learnerName}'s ${courseName} course`;
}

function getLessonAvailability(lessonNumber: number): string {
  const lessonAvailable =
    lessonNumber <= totalCourseLessons && lessonNumber >= 1 ? true : false;
  return lessonAvailable ? "Lesson Available" : "Lesson is not available";
}

// type Learner = {
//   name: string;
//   topic: string;
//   completedLessons: number;
//   isPracticing: boolean;
// };

// const learner: Learner = {
//   name: "Ahmet",
//   topic: "Javascript",
//   completedLessons: 3,
//   isPracticing: true,
// };

// const topics: string[] = ["Variables", "Functions", "Objects"];

type Lesson = {
  id: number;
  title: string;
  completed: boolean;
  description?: string;
};

const lessons: Lesson[] = [
  {
    id: 1,
    title: "Variables",
    completed: true,
    description: "Learn how to store variables",
  },
  {
    id: 2,
    title: "Functions",
    completed: true,
    description: "Learn how to use functions",
  },
  {
    id: 3,
    title: "Objects and arrays",
    completed: false,
    description: "Learn how to use objects and arrays",
  },
  {
    id: 4,
    title: "Classes",
    completed: false,
    description: "Learn fake classes",
  },
  {
    id: 5,
    title: "Promises",
    completed: false,
    description: "Learn powerful promises",
  },
];

type Learner = {
  name: string;
  currentTopic: string;
  isPracticing: boolean;
};

const learner: Learner = {
  name: "Ahmet",
  currentTopic: "Objects and Arrays",
  isPracticing: true,
};

function getLessonByIndex(
  lessons: Lesson[],
  index: number
): Lesson | undefined {
  const selectedLessons = lessons.filter((lesson) => lesson.id === index);
  return selectedLessons[0];
}
export default function Learner() {
  const name: string = "Ahmet";
  const currentTopic: string = "variables";
  const completedLessons: number = 5;
  const totalLessons: number = 12;
  const isPracticing: boolean = true;
  const progress = calculateProgress(completedLessons, totalLessons);
  const remainingLessons = calculateRemaining(completedLessons, totalLessons);
  const practicingMessage = getPracticeMessage(isPracticing);
  const progressLabel = getProgressLabel(progress);

  lessons.map((lesson) => {
    console.log(lesson.completed);
    GHp;
  });

  const selectedLesson = getLessonByIndex(lessons, 2);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function calculator() {
    const targetText = "10";
    const target = Number(targetText);
    let completed = 6;
    completed += 2;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const remainingLessons = target - completed;
    const progress = Math.round((completed / target) * 100);
    const allCompleted = target === completed;
    const practiceRequired = !allCompleted;

    console.log(
      `Completed ${completed} of ${targetText}. Progress: ${progress}%. More practice: ${practiceRequired}`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function casePractice() {
    const scoreText = "82";
    const score = Number(scoreText);
    let message: string;

    const isInvalid = Number.isNaN(score) || score < 0 || score > 100;

    const passed = !isInvalid && score >= 70;
    const nextAction = passed ? "Advance" : "Repeat";

    if (isInvalid) {
      message = "Invalid score";
    } else if (score >= 90) {
      message = "Excellent";
    } else if (score >= 70) {
      message = "Good progress";
    } else {
      message = "Keep practicing";
    }

    console.log(`Score: ${score}`);
    console.log(`Result: ${message}`);
    console.log(`Next action: ${nextAction}`);
  }

  function selectiveAccumulator() {
    let total = 0;

    for (let i = 1; i <= 10; i++) {
      if (i === 8) {
        break;
      }

      if (i % 2 !== 0) {
        continue;
      }
      total += i;
      console.log(`Added ${i}, total is ${total}`);
    }

    console.log(`Final total: ${total}`);
  }

  

  return (
    <>
      <ul>
        {lessons.map((lesson) => (
          <li
            key={lesson.id}
            className={lesson.completed ? "completed" : "incomplete"}
          >
            <span>{lesson.title}</span>
            <span>{lesson.completed ? "Completed" : "Not completed"}</span>
          </li>
        ))}
      </ul>
      <p>{learner.name}</p>
      <p>{learner.currentTopic}</p>
      <p>Total lessons: {lessons.length}</p>
      <p>First lesson: {lessons[0]?.title}</p>
      <p>Selected lesson: {selectedLesson?.title ?? "Lesson not found"}</p>
      <p>{selectedLesson?.description ?? "No description available"}</p>
      <p>{createCourseTitle(name)}</p>
      <p>{getLessonAvailability(4)}</p>
      <p>{name}</p>
      <p>{currentTopic}</p>
      <p>{completedLessons}</p>
      <p>{totalLessons}</p>
      <p>{remainingLessons}</p>
      <p className={isPracticing ? "practicing" : "lazy"}>{progressLabel}</p>
      <p>{practicingMessage}</p>

      <div className="progress-bar">
        <div
          style={{ width: `${progress}%` }}
          id="progress"
          className="progress"
        >
          <p>Progress Bar</p>
        </div>
      </div>
    </>
  );
}

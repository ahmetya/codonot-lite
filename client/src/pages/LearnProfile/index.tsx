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
  return learnerName + " " + courseName;
}

function getLessonAvailability(lessonNumber: number): string {
  let lessonAvailable =
    lessonNumber < totalCourseLessons && lessonNumber > 1 ? true : false;
  return lessonAvailable ? "Lesson Available" : "Lesson is not available";
}

// console.log(lessonAvailable);

export default function LearnProfile() {
  const name: string = "Ahmet";
  const currentTopic: string = "variables";
  const completedLessons: number = 5;
  const totalLessons: number = 12;
  const isPracticing: boolean = true;
  const progress = calculateProgress(completedLessons, totalLessons);
  const remainingLessons = calculateRemaining(completedLessons, totalLessons);
  const practicingMessage = getPracticeMessage(isPracticing);
  const progressLabel = getProgressLabel(progress);

  return (
    <>
      <p>{createCourseTitle("Ahmet")}</p>
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

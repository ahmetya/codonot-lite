import { useRef, useState } from "react";

type VimMode = "NORMAL" | "INSERT";

interface VimTextareaProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface Snapshot {
  value: string;
  cursor: number;
}

const lineStart = (value: string, cursor: number) => value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;

const lineEnd = (value: string, cursor: number) => {
  const end = value.indexOf("\n", cursor);
  return end === -1 ? value.length : end;
};

const firstNonWhitespace = (value: string, cursor: number) => {
  const start = lineStart(value, cursor);
  const match = value.slice(start, lineEnd(value, cursor)).match(/^\s*/);
  return start + (match?.[0].length ?? 0);
};

const moveVertical = (value: string, cursor: number, direction: -1 | 1) => {
  const start = lineStart(value, cursor);
  const column = cursor - start;

  if (direction === -1) {
    if (start === 0) return cursor;
    const previousEnd = start - 1;
    const previousStart = lineStart(value, previousEnd);
    return Math.min(previousStart + column, previousEnd);
  }

  const end = lineEnd(value, cursor);
  if (end === value.length) return cursor;
  const nextStart = end + 1;
  return Math.min(nextStart + column, lineEnd(value, nextStart));
};

const nextWord = (value: string, cursor: number) => {
  const rest = value.slice(cursor);
  const match = rest.match(/(?:\w+|[^\w\s]+)\s+(?=\S)|\s+(?=\S)/);
  return match ? cursor + match.index! + match[0].length : value.length;
};

const previousWord = (value: string, cursor: number) => {
  const before = value.slice(0, cursor).replace(/\s+$/, "");
  const match = before.match(/(?:\w+|[^\w\s]+)$/);
  return match?.index ?? 0;
};

export default function VimTextarea({ value, onChange, className }: VimTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<VimMode>("NORMAL");
  const [pending, setPending] = useState<"g" | "d" | "y" | null>(null);
  const registerRef = useRef({ text: "", linewise: false });
  const undoRef = useRef<Snapshot[]>([]);
  const redoRef = useRef<Snapshot[]>([]);
  const insertSnapshotRef = useRef<Snapshot | null>(null);

  const select = (cursor: number) => {
    requestAnimationFrame(() => {
      textareaRef.current?.setSelectionRange(cursor, cursor);
    });
  };

  const replace = (nextValue: string, cursor: number, saveUndo = true) => {
    if (saveUndo) {
      undoRef.current.push({ value, cursor: textareaRef.current?.selectionStart ?? 0 });
      redoRef.current = [];
    }
    onChange(nextValue);
    select(Math.max(0, Math.min(cursor, nextValue.length)));
  };

  const enterInsert = (cursor: number) => {
    insertSnapshotRef.current = { value, cursor: textareaRef.current?.selectionStart ?? cursor };
    setMode("INSERT");
    setPending(null);
    select(cursor);
  };

  const deleteCurrentLine = (cursor: number) => {
    const start = lineStart(value, cursor);
    const end = lineEnd(value, cursor);
    const deleteEnd = end < value.length ? end + 1 : end;
    const deleteStart = end === value.length && start > 0 ? start - 1 : start;
    registerRef.current = { text: `${value.slice(start, end)}\n`, linewise: true };
    replace(value.slice(0, deleteStart) + value.slice(deleteEnd), Math.min(deleteStart, value.length - (deleteEnd - deleteStart)));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;
    const cursor = target.selectionStart;

    if (mode === "INSERT") {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (insertSnapshotRef.current && insertSnapshotRef.current.value !== value) {
        undoRef.current.push(insertSnapshotRef.current);
        redoRef.current = [];
      }
      insertSnapshotRef.current = null;
      setMode("NORMAL");
      select(Math.max(lineStart(value, cursor), cursor - 1));
      return;
    }

    if (event.ctrlKey && event.key === "r") {
      event.preventDefault();
      const snapshot = redoRef.current.pop();
      if (snapshot) {
        undoRef.current.push({ value, cursor });
        replace(snapshot.value, snapshot.cursor, false);
      }
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();

    if (pending === "g") {
      setPending(null);
      if (event.key === "g") select(0);
      return;
    }

    if (pending === "d") {
      setPending(null);
      if (event.key === "d") deleteCurrentLine(cursor);
      if (event.key === "w") {
        const end = nextWord(value, cursor);
        registerRef.current = { text: value.slice(cursor, end), linewise: false };
        replace(value.slice(0, cursor) + value.slice(end), cursor);
      }
      if (event.key === "$") {
        const end = lineEnd(value, cursor);
        registerRef.current = { text: value.slice(cursor, end), linewise: false };
        replace(value.slice(0, cursor) + value.slice(end), cursor);
      }
      return;
    }

    if (pending === "y") {
      setPending(null);
      if (event.key === "y") {
        const start = lineStart(value, cursor);
        const end = lineEnd(value, cursor);
        registerRef.current = {
          text: `${value.slice(start, end)}\n`,
          linewise: true,
        };
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        setPending(null);
        break;
      case "h":
      case "ArrowLeft":
        select(Math.max(lineStart(value, cursor), cursor - 1));
        break;
      case "l":
      case "ArrowRight":
        select(Math.min(Math.max(lineStart(value, cursor), lineEnd(value, cursor) - 1), cursor + 1));
        break;
      case "j":
      case "ArrowDown":
        select(moveVertical(value, cursor, 1));
        break;
      case "k":
      case "ArrowUp":
        select(moveVertical(value, cursor, -1));
        break;
      case "w":
        select(nextWord(value, cursor));
        break;
      case "b":
        select(previousWord(value, cursor));
        break;
      case "0":
        select(lineStart(value, cursor));
        break;
      case "^":
        select(firstNonWhitespace(value, cursor));
        break;
      case "$":
        select(Math.max(lineStart(value, cursor), lineEnd(value, cursor) - 1));
        break;
      case "g":
        setPending("g");
        break;
      case "G":
        select(Math.max(0, value.length - 1));
        break;
      case "i":
        enterInsert(cursor);
        break;
      case "a":
        enterInsert(Math.min(lineEnd(value, cursor), cursor + 1));
        break;
      case "I":
        enterInsert(firstNonWhitespace(value, cursor));
        break;
      case "A":
        enterInsert(lineEnd(value, cursor));
        break;
      case "o": {
        const end = lineEnd(value, cursor);
        const indent = value.slice(lineStart(value, cursor), end).match(/^\s*/)?.[0] ?? "";
        replace(value.slice(0, end) + "\n" + indent + value.slice(end), end + 1 + indent.length, false);
        enterInsert(end + 1 + indent.length);
        break;
      }
      case "O": {
        const start = lineStart(value, cursor);
        const indent = value.slice(start, lineEnd(value, cursor)).match(/^\s*/)?.[0] ?? "";
        replace(value.slice(0, start) + indent + "\n" + value.slice(start), start + indent.length, false);
        enterInsert(start + indent.length);
        break;
      }
      case "x":
        if (cursor < lineEnd(value, cursor)) {
          registerRef.current = { text: value[cursor], linewise: false };
          replace(value.slice(0, cursor) + value.slice(cursor + 1), cursor);
        }
        break;
      case "d":
        setPending("d");
        break;
      case "y":
        setPending("y");
        break;
      case "p": {
        const register = registerRef.current;
        if (!register.text) break;
        const end = lineEnd(value, cursor);
        const insertion = register.linewise ? end + (end < value.length ? 1 : 0) : cursor + 1;
        const text = register.linewise && end === value.length && !value.endsWith("\n") ? `\n${register.text}` : register.text;
        replace(value.slice(0, insertion) + text + value.slice(insertion), insertion + (text.startsWith("\n") ? 1 : 0));
        break;
      }
      case "u": {
        const snapshot = undoRef.current.pop();
        if (snapshot) {
          redoRef.current.push({ value, cursor });
          replace(snapshot.value, snapshot.cursor, false);
        }
        break;
      }
    }
  };

  return (
    <div className={`vim-editor vim-editor--${mode.toLowerCase()}`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className={className}
        spellCheck={false}
        aria-label="Code editor with Vim keybindings"
      />
      <div className="vim-status" aria-live="polite">
        <span className="vim-mode">-- {mode} --</span>
        <span className="vim-help">Esc · i/a · hjkl · w/b · dd/dw · yy/p · u/Ctrl-r · gg/G</span>
      </div>
    </div>
  );
}

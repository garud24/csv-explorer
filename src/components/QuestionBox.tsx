import { useState } from "react";

type QuestionBoxProps = {
  // onAsk is a function passed down from App.tsx.
  // QuestionBox doesn't know HOW questions are answered —
  // it just calls this callback whenever the user submits one.
  onAsk: (question: string) => void;
};

// A few example questions, shown as clickable buttons.
// These exist so a new user immediately understands what kinds
// of questions this app can answer.
const SAMPLE_QUESTIONS = [
  "Which state has the highest population?",
  "Which state has the least population?",
  "Which state has the most veterans?",
  "What is the total population?",
  "What is the average median age?",
];

export default function QuestionBox({ onAsk }: QuestionBoxProps) {
  const [question, setQuestion] = useState("");

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;   // ignore empty/whitespace-only submissions
    onAsk(trimmed);
    setQuestion("");        // clear the input after submitting
  }

  return (
    <section className="question-section">
      <div className="question-box">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question, e.g. which state has the most veterans?"
          onKeyDown={(e) => {
            // Allow pressing Enter as well as clicking the button
            if (e.key === "Enter") submit(question);
          }}
        />
        <button onClick={() => submit(question)}>Ask</button>
      </div>

      <div className="question-buttons">
        {SAMPLE_QUESTIONS.map((q) => (
          <button key={q} onClick={() => submit(q)}>
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}
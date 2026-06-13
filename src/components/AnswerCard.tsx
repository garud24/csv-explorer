// This displays the result of handleQuestion() — the question asked, a short answer, and an explanation of how the answer was computed.

// The shape of one answer. Defined here and exported so App.tsx
// can use the same type for its state.
export type DynamicAnswer = {
  question: string;
  title: string;
  answer: string;
  explanation: string;
};

type AnswerCardProps = {
  answer: DynamicAnswer | null;  // null = "nothing to show yet"
};

export default function AnswerCard({ answer }: AnswerCardProps) {
  // Guard clause: if there's no answer yet, render nothing at all.
  // Returning null from a component is valid — React simply renders nothing.
  if (!answer) return null;

  return (
    <div className="answer-card">
      <p className="answer-question">"{answer.question}"</p>
      <h3 className="answer-title">{answer.title}</h3>
      <p className="answer-text">{answer.answer}</p>
      <details className="answer-explanation">
        <summary>How was this calculated?</summary>
        <p>{answer.explanation}</p>
      </details>
    </div>
  );
}
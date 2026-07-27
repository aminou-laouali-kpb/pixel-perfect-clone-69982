import React from "react";
import { cn } from "@/lib/utils";
import type { QuizQuestionPublic } from "@/lib/quiz-data";

interface QuizQuestionProps {
  question: QuizQuestionPublic;
  onAnswer: (optionIndex: number) => void;
  selectedOption: number | null;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  onAnswer,
  selectedOption,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white leading-snug">{question.question}</h3>

      <div className="grid gap-3" role="radiogroup" aria-label={question.question}>
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onAnswer(idx)}
              className={cn(
                "w-full text-left rounded-xl border px-5 py-4 text-sm transition-all duration-200 flex justify-between items-center gap-3",
                "hover:scale-[1.01] active:scale-[0.99] motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
                isSelected
                  ? "border-gold-500 bg-gold-500/10 text-gold-300 font-semibold"
                  : "border-navy-800 bg-navy-900/40 text-navy-200 hover:border-navy-700 hover:bg-navy-900/60",
              )}
            >
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizQuestion;

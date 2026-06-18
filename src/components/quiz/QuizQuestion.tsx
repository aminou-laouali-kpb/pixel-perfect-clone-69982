import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface QuizQuestionProps {
  question: {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
  onAnswer: (optionIndex: number) => void;
  selectedOption: number | null;
  showFeedback: boolean;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  onAnswer,
  selectedOption,
  showFeedback,
}) => {
  return (
    <div className="space-y-6">
      {/* Question Title */}
      <h3 className="text-xl font-bold text-white leading-snug">
        {question.question}
      </h3>

      {/* Option List */}
      <div className="grid gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrectOption = question.correct === idx;
          
          let optionStyle = "border-navy-800 bg-navy-900/40 text-navy-200 hover:border-navy-700 hover:bg-navy-900/60";
          let icon = null;

          if (showFeedback) {
            if (isCorrectOption) {
              optionStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-medium";
              icon = <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />;
            } else if (isSelected) {
              optionStyle = "border-rose-500 bg-rose-500/10 text-rose-300 font-medium";
              icon = <XCircle className="h-5 w-5 text-rose-400 shrink-0" />;
            } else {
              optionStyle = "border-navy-850 bg-navy-950/20 text-navy-500 opacity-60";
            }
          } else if (isSelected) {
            optionStyle = "border-gold-500 bg-gold-500/10 text-gold-300 font-semibold";
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={showFeedback}
              onClick={() => onAnswer(idx)}
              className={cn(
                "w-full text-left rounded-xl border px-5 py-4 text-sm transition-all duration-200 flex justify-between items-center gap-3",
                !showFeedback && "hover:scale-[1.01] active:scale-[0.99]",
                optionStyle
              )}
            >
              <span>{option}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Explanation Panel */}
      {showFeedback && (
        <div className="p-4 rounded-xl bg-navy-900/60 border border-navy-800 flex gap-3 animate-fade-in-up">
          <AlertCircle className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">Le saviez-vous ?</h4>
            <p className="text-sm text-navy-200 leading-relaxed">
              {question.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizQuestion;

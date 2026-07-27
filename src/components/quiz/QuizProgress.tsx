import React from "react";

interface QuizProgressProps {
  current: number;
  total: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({ current, total }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-navy-400">
        <span>
          Question {current} sur {total}
        </span>
        <span>Réponses notées à la fin</span>
      </div>

      <div
        className="h-2 w-full rounded-full bg-navy-900 border border-navy-850 overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <div
          className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default QuizProgress;

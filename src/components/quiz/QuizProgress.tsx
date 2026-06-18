import React from 'react';

interface QuizProgressProps {
  current: number; // 1-indexed
  total: number;
  score: number;
}

export const QuizProgress: React.FC<QuizProgressProps> = ({ current, total, score }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-navy-400">
        <span>Question {current} sur {total}</span>
        <span>Score actuel : {score}/{total}</span>
      </div>
      
      {/* Progress track */}
      <div className="h-2 w-full rounded-full bg-navy-900 border border-navy-850 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default QuizProgress;

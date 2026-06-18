import { useRef, useState } from 'react';
import { QUIZ_DATA } from '@/lib/quiz-data';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export const useQuiz = () => {
  const { user, refetchAuth } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Selected option index per question, submitted to the server for scoring.
  const answersRef = useRef<number[]>([]);

  const currentQuestion = QUIZ_DATA[currentIndex];
  const isLastQuestion = currentIndex === QUIZ_DATA.length - 1;

  const handleSelectAnswer = (optionIdx: number) => {
    if (showFeedback) return;
    setSelectedOption(optionIdx);
    setShowFeedback(true);
    answersRef.current[currentIndex] = optionIdx;

    // Client-side score is for the live progress display only; the authoritative
    // score is computed server-side by submit_quiz_attempt.
    if (optionIdx === currentQuestion.correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = async (): Promise<number | null> => {
    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      return null;
    }

    setIsSubmitting(true);
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      // Build the ordered answers array (use -1 for any unanswered question).
      const answers = QUIZ_DATA.map((_, i) =>
        answersRef.current[i] !== undefined ? answersRef.current[i] : -1
      );

      // Server scores the attempt and updates the agent status authoritatively.
      const { data, error } = await supabase.rpc('submit_quiz_attempt', {
        p_answers: answers,
      });

      if (error) throw error;

      // Refresh the auth context so the agent status reflects the result.
      await refetchAuth();

      const serverScore = typeof data?.score === 'number' ? data.score : score;
      return serverScore;
    } catch (err) {
      console.error('Erreur lors de la soumission du quiz:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentIndex,
    currentQuestion,
    selectedOption,
    showFeedback,
    score,
    isLastQuestion,
    isSubmitting,
    handleSelectAnswer,
    handleNextQuestion,
  };
};

export default useQuiz;

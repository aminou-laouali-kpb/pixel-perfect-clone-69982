import { useRef, useState } from "react";
import { QUIZ_DATA } from "@/lib/quiz-data";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/lib/logger";

export const useQuiz = () => {
  const { user, refetchAuth } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const answersRef = useRef<number[]>([]);

  const currentQuestion = QUIZ_DATA[currentIndex];
  const isLastQuestion = currentIndex === QUIZ_DATA.length - 1;
  const hasAnswer = selectedOption !== null;

  const handleSelectAnswer = (optionIdx: number) => {
    setSelectedOption(optionIdx);
    answersRef.current[currentIndex] = optionIdx;
  };

  const handleNextQuestion = async (): Promise<number | null> => {
    if (selectedOption === null) return null;

    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(
        answersRef.current[currentIndex + 1] !== undefined
          ? answersRef.current[currentIndex + 1]!
          : null,
      );
      return null;
    }

    setIsSubmitting(true);
    try {
      if (!user) throw new Error("Utilisateur non connecté");

      const answers = QUIZ_DATA.map((_, i) =>
        answersRef.current[i] !== undefined ? answersRef.current[i]! : -1,
      );

      const { data, error } = await supabase.rpc("submit_quiz_attempt", {
        p_answers: answers,
      });

      if (error) throw error;

      await refetchAuth();

      const parsed = data as { score?: number } | null;
      return typeof parsed?.score === "number" ? parsed.score : 0;
    } catch (err) {
      logger.error("Erreur lors de la soumission du quiz", err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentIndex,
    currentQuestion,
    selectedOption,
    hasAnswer,
    isLastQuestion,
    isSubmitting,
    handleSelectAnswer,
    handleNextQuestion,
  };
};

export default useQuiz;

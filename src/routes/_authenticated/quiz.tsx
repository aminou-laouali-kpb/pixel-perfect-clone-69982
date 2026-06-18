import { createFileRoute } from "@tanstack/react-router";
import React from 'react';
import { useNavigate, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useQuiz } from '@/hooks/useQuiz';
import { QUIZ_DATA } from '@/lib/quiz-data';
import QuizProgress from '@/components/quiz/QuizProgress';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import { HelpCircle, Calendar, ArrowRight, ChevronRight, AlertTriangle } from 'lucide-react';

const QuizPage: React.FC = () => {
  const { agent, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const quiz = useQuiz();
  const [pageLoadedAt] = React.useState(() => Date.now());
  // Once the final answer is submitted, the agent status flips to 'essai', which
  // would otherwise trip the guard below and bounce to /dashboard before we can
  // navigate to /resultat. Suppress the guard from that point on.
  const [hasSubmitted, setHasSubmitted] = React.useState(false);

  // Redirect if not pending or failed (but not while submitting the final answer)
  if (!hasSubmitted && !loading && agent && agent.statut !== 'quiz_pending' && agent.statut !== 'quiz_failed') {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if locked out (failed and quiz_retry_at is in the future)
  const isLockedOut = () => {
    if (agent && agent.statut === 'quiz_failed' && agent.quiz_retry_at) {
      const retryDate = new Date(agent.quiz_retry_at);
      return retryDate.getTime() > pageLoadedAt;
    }
    return false;
  };

  const getLockoutDateString = () => {
    if (agent && agent.quiz_retry_at) {
      return new Date(agent.quiz_retry_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return '';
  };

  const handleNextClick = async () => {
    if (quiz.isLastQuestion) {
      setHasSubmitted(true);
    }
    try {
      const finalScore = await quiz.handleNextQuestion();
      if (finalScore !== null) {
        navigate({ to: `/resultat?score=${finalScore}` });
      }
    } catch {
      setHasSubmitted(false);
      showToast("Une erreur est survenue lors de la validation du quiz. Veuillez réessayer.", 'error');
    }
  };

  if (isLockedOut()) {
    return (
      <div className="flex-1 bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md bg-navy-900/40 border border-navy-800/80 rounded-3xl p-8 backdrop-blur-xl text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 mb-6 border border-rose-500/20">
            <AlertTriangle className="h-7 w-7 text-rose-400 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Test Suspendu</h2>
          <p className="text-navy-300 text-sm mb-6 leading-relaxed">
            Vous n'avez pas obtenu le score minimum requis de 4/5 lors de votre dernière tentative. Un délai de préparation est requis.
          </p>
          <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800 text-sm text-gold-400 flex items-center justify-center gap-2 mb-6">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Disponible le : {getLockoutDateString()}</span>
          </div>
          <div className="text-left p-4 rounded-xl border border-navy-800 bg-navy-900/20 text-xs text-navy-400 space-y-2 mb-6">
            <h4 className="font-bold text-navy-300">Ressources de révision conseillées :</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>Relire les guides d'acompte et visa KPB</li>
              <li>Consulter notre charte de déontologie</li>
              <li>Considérer les tarifs d'honoraires de l'agence</li>
            </ul>
          </div>
          <button
            onClick={() => navigate({ to: '/' })}
            className="w-full rounded-xl bg-navy-800 py-3 text-sm font-semibold text-white hover:bg-navy-700 transition-all border border-navy-700"
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent"></div>
      
      <div className="mx-auto w-full max-w-2xl bg-navy-900/40 border border-navy-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative z-10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="rounded-full bg-gold-500/10 p-2 border border-gold-500/20">
            <HelpCircle className="h-5 w-5 text-gold-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Quiz de Qualification</h2>
            <p className="text-xs text-navy-400">Assurez-vous de bien lire les explications après chaque réponse.</p>
          </div>
        </div>

        {/* Progress tracker */}
        <div className="mb-8">
          <QuizProgress
            current={quiz.currentIndex + 1}
            total={QUIZ_DATA.length}
            score={quiz.score}
          />
        </div>

        {/* Current Question */}
        <div className="min-h-[250px]">
          <QuizQuestion
            question={quiz.currentQuestion}
            onAnswer={quiz.handleSelectAnswer}
            selectedOption={quiz.selectedOption}
            showFeedback={quiz.showFeedback}
          />
        </div>

        {/* Next/Finish Button */}
        {quiz.showFeedback && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNextClick}
              disabled={quiz.isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-all hover:scale-105 shadow-[0_0_15px_rgba(217,161,16,0.3)] disabled:opacity-50"
            >
              {quiz.isSubmitting ? (
                "Enregistrement..."
              ) : quiz.isLastQuestion ? (
                <>
                  Terminer le test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Question suivante
                  <ChevronRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export const Route = createFileRoute("/_authenticated/quiz")({
  component: QuizPage,
});

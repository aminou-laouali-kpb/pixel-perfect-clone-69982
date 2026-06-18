import { createFileRoute } from "@tanstack/react-router";
import React from 'react';
import { useNavigate, Link, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, XCircle, ArrowRight, Sparkles, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import { QUIZ_MIN_SCORE } from '@/lib/quiz-data';

const ResultatPage: React.FC = () => {
  const navigate = useNavigate();
  const { agent, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 bg-navy-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
          <p className="text-sm text-navy-300">Chargement du résultat...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return <Navigate to="/dashboard" replace />;
  }

  if (agent.statut === 'quiz_pending') {
    return <Navigate to="/quiz" replace />;
  }

  const passed = agent.statut === 'essai' || agent.statut === 'officiel';
  const score = agent.quiz_score ?? (passed ? QUIZ_MIN_SCORE : 0);

  const getLockoutDateString = () => {
    if (agent && agent.quiz_retry_at) {
      return new Date(agent.quiz_retry_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    // fallback to +7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent"></div>
      
      <div className="mx-auto w-full max-w-xl bg-navy-900/40 border border-navy-800/80 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        {passed ? (
          // PASSED VIEW
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="h-9 w-9 text-emerald-400" />
            </div>
            
            <div className="space-y-2">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                🎉 Test Réussi
              </span>
              <h2 className="text-3xl font-extrabold text-white">Bienvenue dans l'Équipe !</h2>
            </div>

            <div className="py-4">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-200">
                {score} / 5
              </div>
              <p className="text-sm font-semibold text-gold-400 mt-2">
                Félicitations, vous êtes officiellement admis en tant qu'Agent en Essai.
              </p>
            </div>

            {/* Next steps */}
            <div className="text-left bg-navy-950/50 border border-navy-850 p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-navy-800 pb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-500" />
                Vos 4 Prochaines Étapes :
              </h4>
              <ol className="space-y-3 text-sm text-navy-200">
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-xs font-bold text-gold-400">1</span>
                  <span><strong>Accédez à votre tableau de bord</strong> pour générer votre lien de parrainage.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-xs font-bold text-gold-400">2</span>
                  <span><strong>Téléchargez le Kit Marketing</strong> (stories Instagram, scripts WhatsApp) pour attirer vos premiers prospects.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-xs font-bold text-gold-400">3</span>
                  <span><strong>Partagez votre lien de parrainage</strong> à des étudiants cherchant à étudier à l'étranger.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-xs font-bold text-gold-400">4</span>
                  <span><strong>Gagnez vos commissions</strong> : 10 % à 15 % sur chaque service réglé par vos filleuls, plus des bonus paliers (20 000 / 50 000 / 100 000 FCFA à 3 / 5 / 10 parrainages).</span>
                </li>
              </ol>
            </div>

            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-gold-500 py-3.5 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(217,161,16,0.3)]"
            >
              Accéder à mon tableau de bord
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          // FAILED VIEW
          <div className="text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
              <XCircle className="h-9 w-9 text-rose-400" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                📚 Score Insuffisant
              </span>
              <h2 className="text-2xl font-bold text-white">Score : {score} / 5</h2>
            </div>

            <p className="text-sm text-navy-300 leading-relaxed max-w-md mx-auto">
              Vous avez besoin d'au moins <strong>4 bonnes réponses</strong> pour valider votre qualification. Ne vous découragez pas, prenez le temps de bien assimiler le fonctionnement de KPB Education avant de retenter !
            </p>

            {/* Locked alert */}
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-400 flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Un délai de 7 jours est nécessaire avant votre prochain essai.</span>
            </div>

            {/* Preparation resources */}
            <div className="text-left bg-navy-950/50 border border-navy-850 p-6 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-navy-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-navy-400" />
                Ressources de Préparation :
              </h4>
              <ul className="space-y-2 text-sm text-navy-300">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
                  <span><strong>Frais d'agence</strong> : KPB ne prend des honoraires qu'après confirmation de l'admission (les frais d'école sont versés directement à l'école).</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
                  <span><strong>Garantie Refus Visa</strong> : Les acomptes versés aux écoles partenaires sont remboursés à 100% en cas de refus de visa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
                  <span><strong>Destinations KPB</strong> : Nous plaçons principalement vers la France, l'Allemagne, l'Espagne, le Maroc, la Turquie, le Canada, Dubaï et les USA.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                disabled={true}
                className="flex-1 rounded-xl bg-navy-850 border border-navy-800 text-sm font-semibold text-navy-400 py-3 cursor-not-allowed opacity-50"
                title={`Prochaine tentative disponible le ${getLockoutDateString()}`}
              >
                Réessayer le test (Débloqué le {getLockoutDateString()})
              </button>
              
              <Link
                to="/"
                className="flex-1 inline-flex items-center justify-center rounded-xl border border-navy-700 bg-navy-900/60 text-sm font-semibold text-navy-200 py-3 hover:bg-navy-900 hover:text-white transition-all"
              >
                Retourner à l'accueil
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export const Route = createFileRoute("/_authenticated/resultat")({
  component: ResultatPage,
});

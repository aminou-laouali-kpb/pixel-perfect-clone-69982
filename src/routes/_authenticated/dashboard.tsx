import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Lead, Commission } from '@/types';
import { formatCurrency, MILESTONE_BONUSES, CURRENT_PERIOD, CHALLENGE_PRIZES } from '@/lib/utils';
import { 
  Users, CheckSquare, Award, 
  Wallet, Trophy, AlertCircle, Sparkles, 
  Gift
} from 'lucide-react';
import TierBadge from '@/components/agent/TierBadge';
import ReferralLink from '@/components/agent/ReferralLink';
import FilleulCard from '@/components/agent/FilleulCard';
import MarketingKit from '@/components/agent/MarketingKit';
import StatCard from '@/components/agent/StatCard';

const DashboardPage: React.FC = () => {
  const { user, agent, loading: authLoading } = useAuth();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [agentRank, setAgentRank] = useState<number>(1);
  const [leaderboard, setLeaderboard] = useState<{ rang: number; prenom: string; placements: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // 1. Fetch leads
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .eq('agent_id', user.id)
          .order('created_at', { ascending: false });
        
        if (leadsData) setLeads(leadsData);

        // 2. Fetch commissions
        const { data: commissionsData } = await supabase
          .from('commissions')
          .select('*')
          .eq('agent_id', user.id);
        
        if (commissionsData) setCommissions(commissionsData);

        // 3. Fetch agent rank server-side (RLS hides other agents' rows, so this
        // cannot be computed client-side from the agents table).
        const { data: rankData } = await supabase.rpc('get_agent_rank');
        if (typeof rankData === 'number') {
          setAgentRank(rankData);
        }

        // 4. Fetch the period leaderboard (challenge tableau d'honneur)
        const { data: lbData } = await supabase.rpc('get_leaderboard', {
          p_start: CURRENT_PERIOD.start,
          p_end: CURRENT_PERIOD.end,
          p_limit: 10,
        });
        if (Array.isArray(lbData)) setLeaderboard(lbData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 bg-navy-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
          <p className="text-sm text-navy-300">Génération du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex-1 bg-navy-950 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-md p-8 rounded-2xl bg-navy-900 border border-navy-800">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Profil agent introuvable</h2>
          <p className="text-sm text-navy-300 mb-6">
            Votre profil agent n'a pas pu être chargé. Assurez-vous d'avoir complété votre inscription.
          </p>
          <a href="/candidater" className="inline-flex rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400">
            S'inscrire comme agent
          </a>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalLeads = leads.length;
  const acomptesPayes = leads.filter(l => l.statut === 'acompte_paye' || l.statut === 'place').length;
  const enCoursLeads = leads.filter(l => l.statut === 'nouveau' || l.statut === 'contacte' || l.statut === 'qualifie').length;

  // Toutes les commissions (placement + bonus paliers) sont en FCFA (XOF).
  const totalCommissionsPaid = commissions
    .filter(c => c.statut === 'paid')
    .reduce((sum, c) => sum + Number(c.montant), 0);

  const totalCommissionsPending = commissions
    .filter(c => c.statut === 'pending')
    .reduce((sum, c) => sum + Number(c.montant), 0);

  // Calculate next tier thresholds
  let nextTierLabel: string;
  let placementsRequired = 0;
  let tierProgress: number;

  if (agent.tier === 'bronze') {
    nextTierLabel = "Argent 🥈";
    placementsRequired = 3;
    tierProgress = Math.min((agent.placements_count / 3) * 100, 100);
  } else if (agent.tier === 'argent') {
    nextTierLabel = "Élite 🥇";
    placementsRequired = 10;
    // Progress between 3 and 10 placements
    const progressPlacements = agent.placements_count - 3;
    tierProgress = Math.min((progressPlacements / 7) * 100, 100);
  } else {
    nextTierLabel = "Tier Maximum Atteint";
    tierProgress = 100;
  }

  return (
    <div className="flex-1 bg-navy-950 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent"></div>
      
      <div className="mx-auto max-w-7xl space-y-10 relative z-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Bonjour, {agent.nom}
              <span className="text-gold-500">👋</span>
            </h1>
            <p className="text-navy-300 text-sm mt-1">
              Bienvenue sur votre espace Ambassadeur KPB. Suivez vos parrainages et vos gains.
            </p>
          </div>
          <div>
            <TierBadge tier={agent.tier} />
          </div>
        </div>

        {/* ----------------- ESSAI AGENT VIEW ----------------- */}
        {agent.statut === 'essai' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Banner info */}
            <div className="rounded-3xl border border-gold-500/20 bg-gold-500/5 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="rounded-full bg-gold-500/10 p-3 text-gold-500 shrink-0 border border-gold-500/15">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Période d'Essai Active 🎯</h3>
                  <p className="text-sm text-navy-300 mt-1">
                    Réalisez votre 1er parrainage (étudiant admis qui paie ses frais de scolarité) pour devenir <strong>Agent Certifié Officiel</strong>.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end">
                <div className="text-xs text-navy-400 font-semibold mb-1">Objectif certification : 0 / 1</div>
                <div className="h-2 w-36 rounded-full bg-navy-900 border border-navy-850 overflow-hidden">
                  <div className="h-full bg-gold-500 rounded-full" style={{ width: `${agent.placements_count > 0 ? 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Quickstart details */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Challenge Card */}
              <div className="md:col-span-2 rounded-2xl border border-navy-850 bg-navy-900/40 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold-500" />
                  Défi de démarrage
                </h3>
                <p className="text-sm text-navy-300 leading-relaxed">
                  Partagez votre lien auprès d'amis ou de proches qui envisagent de poursuivre des études supérieures à l'étranger pour la rentrée de Septembre 2026. Dès que l'un d'eux finalise son inscription avec notre accompagnement, vous passez Agent Officiel avec commissions majorées.
                </p>
                <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800 space-y-2">
                  <div className="text-xs font-bold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Gift className="h-4 w-4" />
                    Rappel : Bonus paliers
                  </div>
                  <p className="text-xs text-navy-300 leading-relaxed">
                    En plus de vos commissions, débloquez des bonus à chaque palier :{' '}
                    {MILESTONE_BONUSES.map(b => `${b.placements} → ${formatCurrency(b.montant, 'XOF')}`).join(' · ')}.
                  </p>
                </div>
              </div>

              {/* Stat card mini */}
              <div className="rounded-2xl border border-navy-850 bg-navy-900/40 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider block">Gains en attente</span>
                  <div className="text-3xl font-black text-gold-400 mt-2">
                    {formatCurrency(totalCommissionsPending, 'XOF')}
                  </div>
                  <span className="text-xs text-navy-400 block mt-2">
                    Commissions + bonus paliers à venir
                  </span>
                </div>
                <div className="text-xs text-navy-400 border-t border-navy-850 pt-4 mt-6">
                  Vos gains de placement seront débloqués à votre passage au statut officiel.
                </div>
              </div>
            </div>

            {/* Referral Link & Marketing Kit */}
            <div className="rounded-2xl border border-navy-850 bg-navy-900/40 p-6 sm:p-8">
              <ReferralLink code={agent.code_parrainage} />
            </div>

            <div className="rounded-2xl border border-navy-850 bg-navy-900/40 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Votre Kit Marketing de Démarrage</h3>
                <p className="text-xs text-navy-400 mt-1">Copiez et utilisez ces modèles pour attirer vos premiers prospects.</p>
              </div>
              <MarketingKit agentCode={agent.code_parrainage} />
            </div>
          </div>
        )}

        {/* ----------------- OFFICIEL AGENT VIEW ----------------- */}
        {agent.statut === 'officiel' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Header Tier Progress */}
            <div className="rounded-3xl border border-navy-850 bg-navy-900/40 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="rounded-full bg-gold-500/10 p-3 text-gold-500 shrink-0 border border-gold-500/15">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Ambassadeur Officiel KPB 🚀</h3>
                  <p className="text-sm text-navy-300 mt-1">
                    {agent.placements_count} placement{agent.placements_count > 1 ? 's' : ''} réussi{agent.placements_count > 1 ? 's' : ''}. 
                    {agent.tier !== 'elite' ? (
                      <> Prochain objectif : <strong className="text-gold-400">{nextTierLabel}</strong> (Requis : {placementsRequired} placements)</>
                    ) : (
                      " Vous avez atteint le niveau maximum d'Élite !"
                    )}
                  </p>
                </div>
              </div>
              {agent.tier !== 'elite' && (
                <div className="flex-shrink-0 flex flex-col items-end">
                  <div className="text-xs text-navy-400 font-semibold mb-1">Progression : {agent.placements_count} / {placementsRequired}</div>
                  <div className="h-2 w-48 rounded-full bg-navy-900 border border-navy-850 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full" style={{ width: `${tierProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                label="Filleuls parrainés"
                value={totalLeads}
                icon={<Users className="h-5 w-5" />}
                color="blue"
                description={`${enCoursLeads} en cours de traitement`}
              />
              <StatCard
                label="Frais payés confirmés"
                value={acomptesPayes}
                icon={<CheckSquare className="h-5 w-5" />}
                color="emerald"
                description={`${agent.placements_count} placements validés`}
              />
              <StatCard
                label="Gains Confirmés"
                value={formatCurrency(totalCommissionsPaid, 'XOF')}
                icon={<Wallet className="h-5 w-5" />}
                color="gold"
                description={`${formatCurrency(totalCommissionsPending, 'XOF')} en attente`}
              />
              <StatCard
                label="Classement équipe"
                value={`#${agentRank}`}
                icon={<Trophy className="h-5 w-5" />}
                color="rose"
                description="Parmi tous les ambassadeurs"
              />
            </div>

            {/* Referral Link */}
            <div className="rounded-2xl border border-navy-850 bg-navy-900/40 p-6 sm:p-8">
              <ReferralLink code={agent.code_parrainage} />
            </div>

            {/* Filleuls table */}
            <div className="rounded-2xl border border-navy-850 bg-navy-900/40 p-6 overflow-hidden">
              <h3 className="text-lg font-bold text-white mb-6">Mes Filleuls Référencés</h3>
              
              {leads.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <AlertCircle className="mx-auto h-10 w-10 text-navy-500" />
                  <p className="text-navy-400 text-sm">Aucun filleul pour l'instant — partagez votre lien !</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {leads.map(lead => (
                    <FilleulCard key={lead.id} lead={lead} />
                  ))}
                </div>
              )}
            </div>

            {/* Marketing Kit */}
            <div className="rounded-2xl border border-navy-850 bg-navy-900/40 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Kit Marketing Ambassadeur</h3>
                <p className="text-xs text-navy-400 mt-1">Servez-vous de ces éléments pour faire décoller votre volume d'étudiants.</p>
              </div>
              <MarketingKit agentCode={agent.code_parrainage} />
            </div>
          </div>
        )}

        {/* ----------------- TABLEAU D'HONNEUR (CHALLENGE) ----------------- */}
        <div className="rounded-2xl border border-navy-850 bg-navy-900/40 p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold-500" />
              Tableau d'honneur
            </h3>
            <p className="text-xs text-navy-400 mt-1">
              Challenge de la période : <span className="text-gold-400 font-semibold">{CURRENT_PERIOD.label}</span>. Les 3 meilleurs parrains gagnent un prix !
            </p>
          </div>

          {/* Podium / prix */}
          <div className="grid sm:grid-cols-3 gap-3">
            {CHALLENGE_PRIZES.map(p => {
              const winner = leaderboard.find(l => l.rang === p.rang);
              return (
                <div key={p.rang} className="rounded-xl border border-navy-800 bg-navy-950/60 p-4">
                  <div className="text-2xl">{p.emoji}</div>
                  <div className="text-sm font-bold text-white mt-1">{p.rang}ᵉ parrain</div>
                  <div className="text-xs text-gold-400">{p.prix}</div>
                  <div className="text-[11px] text-navy-400 mt-1">
                    {winner ? `${winner.prenom} — ${winner.placements} parrainage${winner.placements > 1 ? 's' : ''}` : 'À conquérir'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Classement complet */}
          {leaderboard.length > 0 ? (
            <div className="divide-y divide-navy-850 border-t border-navy-850">
              {leaderboard.map(l => (
                <div key={l.rang} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-navy-200">
                    <span className="text-navy-500 font-mono mr-2">#{l.rang}</span>
                    {l.prenom}
                  </span>
                  <span className="text-gold-400 font-semibold">
                    {l.placements} parrainage{l.placements > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy-400">
              Aucun parrainage validé sur la période pour le moment — soyez le premier à monter sur le podium !
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

import { createFileRoute } from "@tanstack/react-router";
import React, { useCallback, useEffect, useState } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Lead, LeadStatut, RrState } from '@/types';
import { STATUTS_LEAD } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { User, ClipboardList, TrendingUp, Sparkles, Loader2, Search } from 'lucide-react';
import RoundRobinIndicator from '@/components/commercial/RoundRobinIndicator';
import LeadCard from '@/components/commercial/LeadCard';

const CommercialPage: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const isAdmin = profile?.role === 'admin';

  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<{ id: string; nom: string }[]>([]);
  const [rrStates, setRrStates] = useState<RrState[]>([]);
  const [nextCommercial, setNextCommercial] = useState<string>('Josphin');
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState(false);
  const [newLeadId, setNewLeadId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (leadsData) setLeads(leadsData);

      // 2. Fetch agents (id + nom only) via security-restricted RPC
      const { data: agentsData } = await supabase.rpc('list_agents_basic');

      if (agentsData) setAgents(agentsData);

      // 3. Fetch round robin states via security-restricted RPC
      //    (no email/whatsapp PII exposure between commercials)
      const { data: rrData } = await supabase.rpc('list_rr_state_basic');

      if (rrData) {
        setRrStates(rrData);
        // Find next commercial based on the least leads_total, ordering by leads_total asc, id asc
        const sorted = [...rrData].sort((a, b) => {
          if (a.leads_total !== b.leads_total) return a.leads_total - b.leads_total;
          return a.id - b.id;
        });
        if (sorted.length > 0) {
          setNextCommercial(sorted[0].commercial);
        }
      }
    } catch (err) {
      console.error('Error fetching commercial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Set up Realtime listener on leads table
    const channel = supabase
      .channel('leads-commercial-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  if (!authLoading && profile && profile.role !== 'commercial' && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Update lead status
  const handleStatusChange = async (leadId: string, newStatus: LeadStatut) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ statut: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      // Realtime subscription or refetch will update UI
      await fetchData();
      showToast('Statut mis à jour.', 'success');
    } catch (err) {
      console.error('Error updating status:', err);
      showToast("Erreur lors de la mise à jour du statut.", 'error');
    }
  };

  // Set the real service amount paid — recomputes the placement commission server-side
  const handleSetMontant = async (leadId: string, montant: number | null) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ montant_service: montant })
        .eq('id', leadId);

      if (error) throw error;

      await fetchData();
      showToast('Montant enregistré, commission recalculée.', 'success');
    } catch (err) {
      console.error('Error setting service amount:', err);
      showToast("Erreur lors de l'enregistrement du montant.", 'error');
    }
  };

  // Save follow-up notes on a lead
  const handleNotesSave = async (leadId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ notes })
        .eq('id', leadId);

      if (error) throw error;

      await fetchData();
      showToast('Note enregistrée.', 'success');
    } catch (err) {
      console.error('Error saving notes:', err);
      showToast("Erreur lors de l'enregistrement de la note.", 'error');
    }
  };

  // Simulate a new lead creation
  const handleSimulateLead = async () => {
    if (agents.length === 0) {
      showToast("Veuillez d'abord inscrire un agent pour simuler un parrainage.", 'info');
      return;
    }

    setIsSimulating(true);
    setNewLeadId(null);

    try {
      // Pick a random agent
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      
      // Random student data
      const names = [
        "Jean Dupont", "Mariam Kone", "Ousmane Sylla", "Fatou Fall", 
        "Alassane Diallo", "Koffi Mensah", "Aminata Traore", "Michel Kamano"
      ];
      const destinations = ["France", "Canada", "Maroc", "Turquie", "USA"];
      const pays = ["Niger", "Côte d'Ivoire", "Sénégal", "Cameroun", "Mali"];
      
      const randomName = names[Math.floor(Math.random() * names.length)] + " " + Math.floor(Math.random() * 100);
      const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
      const randomPays = pays[Math.floor(Math.random() * pays.length)];
      
      const randomPhone = "+227" + Math.floor(10000000 + Math.random() * 90000000);
      const randomEmail = randomName.toLowerCase().replace(/ /g, '') + "@gmail.com";

      // 1. Insert lead with pending commercial
      const { data: leadData, error: insertErr } = await supabase
        .from('leads')
        .insert({
          agent_id: randomAgent.id,
          assigned_to: 'pending', // assigned via RPC next
          nom: randomName,
          email: randomEmail,
          whatsapp: randomPhone,
          pays: randomPays,
          destination: randomDest,
          statut: 'nouveau',
          commission_amount: 0,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // 2. Run Round Robin Assignment RPC
      const { error: rpcErr } = await supabase
        .rpc('assign_lead_round_robin', { p_lead_id: leadData.id });

      if (rpcErr) throw rpcErr;

      setNewLeadId(leadData.id);
      
      // Clear highlight after 5 seconds
      setTimeout(() => {
        setNewLeadId(null);
      }, 5000);

      await fetchData();
    } catch (err) {
      console.error('Simulation failed:', err);
      showToast("La simulation a échoué.", 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.nom || "Agent Inconnu";
  };

  const getLeadsCountsMap = () => {
    const counts: Record<string, number> = {};
    rrStates.forEach(rr => {
      counts[rr.commercial] = rr.leads_total;
    });
    return counts;
  };

  // Commercials list is derived from rr_state so admin changes reflect everywhere.
  const commercialNames = rrStates.map(rr => rr.commercial);

  // Filter leads: by commercial (admin tabs), by status, and by free-text search.
  const search = searchTerm.trim().toLowerCase();
  const filteredLeads = leads.filter(lead => {
    if (activeFilter !== 'Tous' && lead.assigned_to !== activeFilter) return false;
    if (statusFilter !== 'all' && lead.statut !== statusFilter) return false;
    if (search) {
      const haystack = `${lead.nom} ${lead.whatsapp ?? ''} ${lead.email ?? ''} ${lead.destination} ${lead.pays}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const totalLeadsCount = leads.length;
  const newLeadsCount = leads.filter(l => l.statut === 'nouveau').length;
  const acomptesCount = leads.filter(l => l.statut === 'acompte_paye' || l.statut === 'place').length;

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center text-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Chargement de l'espace commercial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Espace Commercial
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Gérez les leads envoyés par les ambassadeurs KPB Education.
            </p>
          </div>
          {/* Outil de démonstration : visible uniquement en développement. */}
          {import.meta.env.DEV && (
            <div>
              <button
                onClick={handleSimulateLead}
                disabled={isSimulating}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Simulation...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Simuler nouveau lead (dev)
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Round Robin indicator — vue d'ensemble réservée à l'admin */}
        {isAdmin && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <RoundRobinIndicator
              commerciaux={commercialNames}
              leadsCounts={getLeadsCountsMap()}
              nextCommercial={nextCommercial}
            />
          </div>
        )}

        {/* Quick statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Leads</span>
              <span className="text-2xl font-black text-slate-800 mt-1">{totalLeadsCount}</span>
            </div>
            <div className="rounded-xl bg-blue-50 text-blue-600 p-2.5 border border-blue-100">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Nouveaux</span>
              <span className="text-2xl font-black text-blue-600 mt-1">{newLeadsCount}</span>
            </div>
            <div className="rounded-xl bg-amber-50 text-amber-600 p-2.5 border border-amber-100">
              <User className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Frais payés</span>
              <span className="text-2xl font-black text-emerald-600 mt-1">{acomptesCount}</span>
            </div>
            <div className="rounded-xl bg-emerald-50 text-emerald-600 p-2.5 border border-emerald-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Leads grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">Portefeuille de Leads</h3>
            
            {/* Filter tabs — réservés à l'admin (un commercial ne voit que ses leads) */}
            {isAdmin && (
              <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1 shrink-0 self-start">
                {['Tous', ...commercialNames].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeFilter === tab
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-950"
                    }`}
                  >
                    {tab === 'Tous' ? 'Tous les commerciaux' : tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search + status filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Rechercher (nom, WhatsApp, email, destination, pays)..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              {STATUTS_LEAD.map(s => (
                <option key={s} value={s}>{s === 'acompte_paye' ? 'Frais payés' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm">Aucun lead trouvé pour ce filtre.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  agentNom={getAgentName(lead.agent_id)}
                  onStatusChange={handleStatusChange}
                  onSetMontant={handleSetMontant}
                  onNotesSave={handleNotesSave}
                  isNew={lead.id === newLeadId}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export const Route = createFileRoute("/_authenticated/commercial")({
  component: CommercialPage,
});

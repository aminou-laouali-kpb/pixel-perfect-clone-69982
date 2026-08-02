import { createFileRoute, redirect } from "@tanstack/react-router";
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Agent, Lead, LeadStatut, RrState } from "@/types";
import { STATUTS_LEAD } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/useToast";
import { User, ClipboardList, TrendingUp, Sparkles, Loader2, Search, UserPlus } from "lucide-react";
import RoundRobinIndicator from "@/components/commercial/RoundRobinIndicator";
import LeadCard from "@/components/commercial/LeadCard";
import { useServerFn } from "@tanstack/react-start";
import { inviteAgent } from "@/lib/agents.functions";
import {
  deleteManagedAgent,
  listManagedAgents,
  updateManagedAgent,
} from "@/lib/user-management.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ManagedAgentCard: React.FC<{
  agent: Agent;
  busyKey: string | null;
  onSave: (input: {
    agentId: string;
    nom: string;
    email: string;
    whatsapp: string;
    pays: string;
    niveau_etudes: string;
    motivation?: string | null;
  }) => void;
  onDelete: (agentId: string, label: string) => void;
}> = ({ agent, busyKey, onSave, onDelete }) => {
  const [nom, setNom] = useState(agent.nom);
  const [email, setEmail] = useState(agent.email);
  const [whatsapp, setWhatsapp] = useState(agent.whatsapp);
  const [pays, setPays] = useState(agent.pays);
  const [niveauEtudes, setNiveauEtudes] = useState(agent.niveau_etudes);
  const [motivation, setMotivation] = useState(agent.motivation ?? "");
  const saving = busyKey === `save-${agent.id}`;
  const deleting = busyKey === `delete-${agent.id}`;
  const dirty =
    nom !== agent.nom ||
    email !== agent.email ||
    whatsapp !== agent.whatsapp ||
    pays !== agent.pays ||
    niveauEtudes !== agent.niveau_etudes ||
    motivation !== (agent.motivation ?? "");

  return (
    <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-white">{agent.nom}</h4>
          <p className="text-xs text-navy-400">
            {agent.code_parrainage} · {agent.statut}
          </p>
        </div>
        <div className="text-xs text-navy-400">{agent.placements_count} placement(s)</div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom complet"
          className="rounded-xl border border-navy-800 bg-navy-950/60 px-3 py-2 text-sm text-navy-100"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-xl border border-navy-800 bg-navy-950/60 px-3 py-2 text-sm text-navy-100"
        />
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="WhatsApp"
          className="rounded-xl border border-navy-800 bg-navy-950/60 px-3 py-2 text-sm text-navy-100"
        />
        <input
          value={pays}
          onChange={(e) => setPays(e.target.value)}
          placeholder="Pays"
          className="rounded-xl border border-navy-800 bg-navy-950/60 px-3 py-2 text-sm text-navy-100"
        />
        <input
          value={niveauEtudes}
          onChange={(e) => setNiveauEtudes(e.target.value)}
          placeholder="Niveau d'études"
          className="rounded-xl border border-navy-800 bg-navy-950/60 px-3 py-2 text-sm text-navy-100"
        />
        <input
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          placeholder="Motivation (optionnel)"
          className="rounded-xl border border-navy-800 bg-navy-950/60 px-3 py-2 text-sm text-navy-100"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() =>
            onSave({
              agentId: agent.id,
              nom,
              email,
              whatsapp,
              pays,
              niveau_etudes: niveauEtudes,
              motivation: motivation || null,
            })
          }
          disabled={!dirty || saving}
          className="inline-flex items-center justify-center rounded-xl bg-gold-500 px-4 py-2 text-sm font-bold text-navy-950 hover:bg-gold-400 disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
        </button>
        <button
          onClick={() => onDelete(agent.id, agent.nom)}
          disabled={deleting}
          className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-40"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
        </button>
      </div>
    </div>
  );
};

const inviteSchema = z.object({
  nom: z.string().trim().min(2, "Nom trop court"),
  email: z.string().trim().email("Email invalide"),
  whatsapp: z.string().trim().min(5, "WhatsApp requis"),
  pays: z.string().trim().min(2, "Pays requis"),
  niveau_etudes: z.string().trim().min(1, "Niveau d'études requis"),
});
type InviteFormValues = z.infer<typeof inviteSchema>;

async function fetchCommercialData() {
  const [leadsRes, agentsRes, rrRes] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.rpc("list_agents_basic"),
    supabase.from("rr_state").select("*").order("id", { ascending: true }),
  ]);
  const rrData = (rrRes.data as RrState[] | null) ?? [];
  const sorted = [...rrData].sort((a, b) => {
    if (a.leads_total !== b.leads_total) return a.leads_total - b.leads_total;
    return a.id - b.id;
  });
  return {
    leads: (leadsRes.data as Lead[] | null) ?? [],
    agents: (agentsRes.data as { id: string; nom: string }[] | null) ?? [],
    rrStates: rrData,
    nextCommercial: sorted[0]?.commercial ?? "Josphin",
  };
}

const CommercialPage: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = profile?.role === "admin";
  const listManagedAgentsFn = useServerFn(listManagedAgents);
  const updateManagedAgentFn = useServerFn(updateManagedAgent);
  const deleteManagedAgentFn = useServerFn(deleteManagedAgent);

  const { data, isLoading } = useQuery({
    queryKey: ["commercial-data"],
    queryFn: fetchCommercialData,
    refetchInterval: 20_000,
    enabled: !authLoading && (profile?.role === "commercial" || profile?.role === "admin"),
  });

  const {
    data: managedAgents = [],
    isLoading: managedAgentsLoading,
    error: managedAgentsError,
  } = useQuery({
    queryKey: ["managed-agents", profile?.id],
    queryFn: () => listManagedAgentsFn(),
    enabled: !authLoading && (profile?.role === "commercial" || profile?.role === "admin"),
    retry: 1,
  });

  const leads = data?.leads ?? [];
  const agents = data?.agents ?? [];
  const rrStates = data?.rrStates ?? [];
  const nextCommercial = data?.nextCommercial ?? "Josphin";

  const [activeFilter, setActiveFilter] = useState<string>("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSimulating, setIsSimulating] = useState(false);
  const [newLeadId, setNewLeadId] = useState<string | null>(null);
  const [busyManagedAgent, setBusyManagedAgent] = useState<string | null>(null);

  const inviteAgentFn = useServerFn(inviteAgent);
  const [addAgentOpen, setAddAgentOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { nom: "", email: "", whatsapp: "", pays: "", niveau_etudes: "" },
  });

  const refetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ["commercial-data"] });
    await queryClient.invalidateQueries({ queryKey: ["managed-agents", profile?.id] });
  };

  const handleInviteAgent = inviteForm.handleSubmit(async (values) => {
    setIsInviting(true);
    try {
      const res = await inviteAgentFn({
        data: {
          ...values,
          redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
        },
      });
      showToast(`Invitation envoyée à ${res.email} (code ${res.code_parrainage}).`, "success");
      inviteForm.reset();
      setAddAgentOpen(false);
      await refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'invitation.";
      showToast(msg, "error");
    } finally {
      setIsInviting(false);
    }
  });

  const handleSaveManagedAgent = async (input: {
    agentId: string;
    nom: string;
    email: string;
    whatsapp: string;
    pays: string;
    niveau_etudes: string;
    motivation?: string | null;
  }) => {
    setBusyManagedAgent(`save-${input.agentId}`);
    try {
      await updateManagedAgentFn({ data: input });
      await refetch();
      showToast("Agent mis à jour.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'agent.";
      showToast(msg, "error");
    } finally {
      setBusyManagedAgent(null);
    }
  };

  const handleDeleteManagedAgent = async (agentId: string, label: string) => {
    if (
      !window.confirm(
        `Supprimer l'agent ${label} ? Son compte, ses leads et ses commissions seront supprimés.`,
      )
    ) {
      return;
    }

    setBusyManagedAgent(`delete-${agentId}`);
    try {
      await deleteManagedAgentFn({ data: { agentId } });
      await refetch();
      showToast("Agent supprimé.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la suppression de l'agent.";
      showToast(msg, "error");
    } finally {
      setBusyManagedAgent(null);
    }
  };

  // Update lead status
  const handleStatusChange = async (leadId: string, newStatus: LeadStatut) => {
    try {
      const { error } = await supabase.from("leads").update({ statut: newStatus }).eq("id", leadId);

      if (error) throw error;

      // Realtime subscription or refetch will update UI
      await refetch();
      showToast("Statut mis à jour.", "success");
    } catch (err) {
      logger.error("Error updating status", err);
      showToast("Erreur lors de la mise à jour du statut.", "error");
    }
  };

  // Set the real service amount paid — recomputes the placement commission server-side
  const handleSetMontant = async (leadId: string, montant: number | null) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ montant_service: montant })
        .eq("id", leadId);

      if (error) throw error;

      await refetch();
      showToast("Montant enregistré, commission recalculée.", "success");
    } catch (err) {
      logger.error("Error setting service amount", err);
      showToast("Erreur lors de l'enregistrement du montant.", "error");
    }
  };

  // Save follow-up notes on a lead
  const handleNotesSave = async (leadId: string, notes: string) => {
    try {
      const { error } = await supabase.from("leads").update({ notes }).eq("id", leadId);

      if (error) throw error;

      await refetch();
      showToast("Note enregistrée.", "success");
    } catch (err) {
      logger.error("Error saving notes", err);
      showToast("Erreur lors de l'enregistrement de la note.", "error");
    }
  };

  const handleValidatePlacement = async (args: {
    leadId: string;
    montant: number;
    justificatif: string;
    campusId: string | null;
    commissionAttendue: number | null;
  }) => {
    try {
      const { error } = await supabase.rpc("validate_placement", {
        p_lead_id: args.leadId,
        p_montant_service: args.montant,
        p_justificatif_path: args.justificatif,
        p_ecole_campus_id: args.campusId ?? undefined,
        p_ecole_commission_attendue: args.commissionAttendue ?? undefined,
        p_ecole_commission_devise: "XOF",
      });
      if (error) throw error;
      await refetch();
      showToast("Placement validé — commissions service + apport école créées.", "success");
    } catch (err) {
      logger.error("Error validating placement", err);
      showToast(
        err instanceof Error ? err.message : "Erreur lors de la validation du placement.",
        "error",
      );
      throw err;
    }
  };

  const handleMarkScolariteSoldee = async (leadId: string, justificatif: string) => {
    try {
      const { error } = await supabase.rpc("mark_scolarite_soldee", {
        p_lead_id: leadId,
        p_justificatif_path: justificatif,
      });
      if (error) throw error;
      await refetch();
      showToast("Scolarité soldée — prime créée si campus éligible.", "success");
    } catch (err) {
      logger.error("Error marking scolarite", err);
      showToast(
        err instanceof Error ? err.message : "Erreur lors de l'enregistrement scolarité.",
        "error",
      );
      throw err;
    }
  };

  // Simulate a new lead creation
  const handleSimulateLead = async () => {
    if (agents.length === 0) {
      showToast("Veuillez d'abord inscrire un agent pour simuler un parrainage.", "info");
      return;
    }

    setIsSimulating(true);
    setNewLeadId(null);

    try {
      // Pick a random agent
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];

      // Random student data
      const names = [
        "Jean Dupont",
        "Mariam Kone",
        "Ousmane Sylla",
        "Fatou Fall",
        "Alassane Diallo",
        "Koffi Mensah",
        "Aminata Traore",
        "Michel Kamano",
      ];
      const destinations = ["France", "Canada", "Maroc", "Turquie", "USA"];
      const pays = ["Niger", "Côte d'Ivoire", "Sénégal", "Cameroun", "Mali"];

      const randomName =
        names[Math.floor(Math.random() * names.length)] + " " + Math.floor(Math.random() * 100);
      const randomDest = destinations[Math.floor(Math.random() * destinations.length)];
      const randomPays = pays[Math.floor(Math.random() * pays.length)];

      const randomPhone = "+227" + Math.floor(10000000 + Math.random() * 90000000);
      const randomEmail = randomName.toLowerCase().replace(/ /g, "") + "@gmail.com";

      // 1. Insert lead with pending commercial
      const { data: leadData, error: insertErr } = await supabase
        .from("leads")
        .insert({
          agent_id: randomAgent.id,
          assigned_to: "pending", // assigned via RPC next
          nom: randomName,
          email: randomEmail,
          whatsapp: randomPhone,
          pays: randomPays,
          destination: randomDest,
          statut: "nouveau",
          commission_amount: 0,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      // 2. Run Round Robin Assignment RPC
      const { error: rpcErr } = await supabase.rpc("assign_lead_round_robin", {
        p_lead_id: leadData.id,
      });

      if (rpcErr) throw rpcErr;

      setNewLeadId(leadData.id);

      // Clear highlight after 5 seconds
      setTimeout(() => {
        setNewLeadId(null);
      }, 5000);

      await refetch();
    } catch (err) {
      logger.error("Simulation failed", err);
      showToast("La simulation a échoué.", "error");
    } finally {
      setIsSimulating(false);
    }
  };

  const getAgentName = (agentId: string) => {
    return agents.find((a) => a.id === agentId)?.nom || "Agent Inconnu";
  };

  const getLeadsCountsMap = () => {
    const counts: Record<string, number> = {};
    rrStates.forEach((rr) => {
      counts[rr.commercial] = rr.leads_total;
    });
    return counts;
  };

  // Commercials list is derived from rr_state so admin changes reflect everywhere.
  const commercialNames = rrStates.map((rr) => rr.commercial);
  // For commercials, RLS on rr_state only returns the row matching their profile email.
  // Always re-filter by assignment: a promoted commercial may still have an agents row,
  // and without this filter agent-scoped SELECT policies can leak unrelated leads.
  const myCommercialName = !isAdmin ? (rrStates[0]?.commercial ?? null) : null;
  const visibleLeads = isAdmin
    ? leads
    : myCommercialName
      ? leads.filter((lead) => lead.assigned_to === myCommercialName)
      : [];
  const missingRoundRobinLink = !isAdmin && !myCommercialName;

  // Filter leads: by commercial (admin tabs), by status, and by free-text search.
  const search = searchTerm.trim().toLowerCase();
  const filteredLeads = visibleLeads.filter((lead) => {
    if (activeFilter !== "Tous" && lead.assigned_to !== activeFilter) return false;
    if (statusFilter !== "all" && lead.statut !== statusFilter) return false;
    if (search) {
      const haystack =
        `${lead.nom} ${lead.whatsapp ?? ""} ${lead.email ?? ""} ${lead.destination} ${lead.pays}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const totalLeadsCount = visibleLeads.length;
  const newLeadsCount = visibleLeads.filter((l) => l.statut === "nouveau").length;
  const acomptesCount = visibleLeads.filter(
    (l) => l.statut === "acompte_paye" || l.statut === "place",
  ).length;

  if (authLoading || isLoading || managedAgentsLoading) {
    return (
      <div className="flex-1 bg-navy-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-navy-300">Chargement de l'espace commercial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-navy-950 py-10 px-4 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-navy-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Espace Commercial</h1>
            <p className="text-navy-300 text-sm mt-1">
              Gérez les leads envoyés par les ambassadeurs KPB Education.
            </p>
          </div>
          {/* Outil de démonstration : visible uniquement en développement. */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setAddAgentOpen(true)}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Ajouter un agent
            </button>
            {import.meta.env.DEV && isAdmin && (
              <button
                onClick={handleSimulateLead}
                disabled={isSimulating}
                className="inline-flex items-center justify-center rounded-xl bg-gold-600 px-5 py-3 text-sm font-bold text-navy-950 hover:bg-gold-500 transition-all shadow-md shadow-gold-500/10 disabled:opacity-50"
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
            )}
          </div>
        </div>

        {/* Round Robin indicator — vue d'ensemble réservée à l'admin */}
        {isAdmin && (
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-800 shadow-none">
            <RoundRobinIndicator
              commerciaux={commercialNames}
              leadsCounts={getLeadsCountsMap()}
              nextCommercial={nextCommercial}
            />
          </div>
        )}

        {missingRoundRobinLink && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Votre compte commercial n&apos;est pas lié au round-robin (email profil ≠ email dans
            rr_state). Demandez à un admin d&apos;aligner l&apos;email dans{" "}
            <span className="font-semibold">Admin → Commerciaux</span> pour afficher votre
            portefeuille de leads.
          </div>
        )}

        {/* Quick statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-navy-900/60 p-5 rounded-2xl border border-navy-800 shadow-none flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider block">
                Total Leads
              </span>
              <span className="text-2xl font-black text-navy-100 mt-1">{totalLeadsCount}</span>
            </div>
            <div className="rounded-xl bg-gold-500/10 text-gold-400 p-2.5 border border-gold-500/20">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-navy-900/60 p-5 rounded-2xl border border-navy-800 shadow-none flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider block">
                Nouveaux
              </span>
              <span className="text-2xl font-black text-gold-400 mt-1">{newLeadsCount}</span>
            </div>
            <div className="rounded-xl bg-amber-50 text-amber-600 p-2.5 border border-amber-100">
              <User className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-navy-900/60 p-5 rounded-2xl border border-navy-800 shadow-none flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider block">
                Frais payés
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1">{acomptesCount}</span>
            </div>
            <div className="rounded-xl bg-emerald-50 text-emerald-600 p-2.5 border border-emerald-100">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-navy-800 bg-navy-900/60 p-6 space-y-5">
          <div className="flex items-center justify-between gap-3 border-b border-navy-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white">
                {isAdmin ? "Agents invités" : "Mes agents invités"}
              </h3>
              <p className="text-xs text-navy-400 mt-0.5">
                {isAdmin
                  ? "Vue globale des agents créés depuis l'espace commercial."
                  : "Vous pouvez modifier ou supprimer les agents que vous avez invités."}
              </p>
            </div>
            <div className="text-xs text-navy-400">{managedAgents.length} agent(s)</div>
          </div>

          {managedAgentsError ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Impossible de charger les agents invités.{" "}
              {managedAgentsError instanceof Error
                ? managedAgentsError.message
                : "Réessayez dans un instant."}
            </div>
          ) : managedAgents.length === 0 ? (
            <p className="text-sm text-navy-400">Aucun agent invité pour le moment.</p>
          ) : (
            <div className="grid xl:grid-cols-2 gap-4">
              {managedAgents.map((agent) => (
                <ManagedAgentCard
                  key={agent.id}
                  agent={agent as Agent}
                  busyKey={busyManagedAgent}
                  onSave={handleSaveManagedAgent}
                  onDelete={handleDeleteManagedAgent}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add-agent dialog */}
        <Dialog open={addAgentOpen} onOpenChange={setAddAgentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un agent</DialogTitle>
              <DialogDescription>
                Un email d'invitation sera envoyé à l'agent pour qu'il définisse son mot de passe et
                se connecte.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteAgent} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="agent-nom">Nom complet</Label>
                <Input
                  id="agent-nom"
                  aria-invalid={Boolean(inviteForm.formState.errors.nom)}
                  {...inviteForm.register("nom")}
                />
                {inviteForm.formState.errors.nom && (
                  <p role="alert" className="text-xs text-rose-400">
                    {inviteForm.formState.errors.nom.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agent-email">Email</Label>
                <Input
                  id="agent-email"
                  type="email"
                  aria-invalid={Boolean(inviteForm.formState.errors.email)}
                  {...inviteForm.register("email")}
                />
                {inviteForm.formState.errors.email && (
                  <p role="alert" className="text-xs text-rose-400">
                    {inviteForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agent-whatsapp">WhatsApp</Label>
                <Input
                  id="agent-whatsapp"
                  placeholder="+227 ..."
                  aria-invalid={Boolean(inviteForm.formState.errors.whatsapp)}
                  {...inviteForm.register("whatsapp")}
                />
                {inviteForm.formState.errors.whatsapp && (
                  <p role="alert" className="text-xs text-rose-400">
                    {inviteForm.formState.errors.whatsapp.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="agent-pays">Pays</Label>
                  <Input
                    id="agent-pays"
                    aria-invalid={Boolean(inviteForm.formState.errors.pays)}
                    {...inviteForm.register("pays")}
                  />
                  {inviteForm.formState.errors.pays && (
                    <p role="alert" className="text-xs text-rose-400">
                      {inviteForm.formState.errors.pays.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="agent-niveau">Niveau d'études</Label>
                  <Input
                    id="agent-niveau"
                    placeholder="Bac, Licence..."
                    aria-invalid={Boolean(inviteForm.formState.errors.niveau_etudes)}
                    {...inviteForm.register("niveau_etudes")}
                  />
                  {inviteForm.formState.errors.niveau_etudes && (
                    <p role="alert" className="text-xs text-rose-400">
                      {inviteForm.formState.errors.niveau_etudes.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setAddAgentOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl bg-navy-800 px-4 py-2 text-sm font-semibold text-navy-200 hover:bg-navy-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Envoi...
                    </>
                  ) : (
                    "Envoyer l'invitation"
                  )}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Leads grid */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Portefeuille de Leads</h3>

            {/* Filter tabs — réservés à l'admin (un commercial ne voit que ses leads) */}
            {isAdmin && (
              <div className="flex bg-navy-900/80 p-1 rounded-xl gap-1 shrink-0 self-start">
                {["Tous", ...commercialNames].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeFilter === tab
                        ? "bg-navy-900/60 text-white shadow-none"
                        : "text-navy-300 hover:text-slate-950"
                    }`}
                  >
                    {tab === "Tous" ? "Tous les commerciaux" : tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search + status filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-navy-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher (nom, WhatsApp, email, destination, pays)..."
                className="w-full rounded-xl border border-navy-800 bg-navy-900/60 pl-10 pr-4 py-2.5 text-sm text-navy-200 placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-navy-800 bg-navy-900/60 px-4 py-2.5 text-sm font-semibold text-navy-200 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              {STATUTS_LEAD.map((s) => (
                <option key={s} value={s}>
                  {s === "acompte_paye" ? "Frais payés" : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="bg-navy-900/60 rounded-2xl border border-navy-800 p-12 text-center text-navy-400">
              <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm">Aucun lead trouvé pour ce filtre.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  agentNom={getAgentName(lead.agent_id)}
                  onStatusChange={handleStatusChange}
                  onSetMontant={handleSetMontant}
                  onNotesSave={handleNotesSave}
                  onValidatePlacement={handleValidatePlacement}
                  onMarkScolariteSoldee={handleMarkScolariteSoldee}
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
  beforeLoad: ({ context }) => {
    const role = context.profile?.role;
    if (role !== "commercial" && role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: CommercialPage,
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import React, { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";
import { Agent, Commission, Lead, RrState } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { deletePlatformUser, updatePlatformUser } from "@/lib/user-management.functions";
import {
  Users,
  FileCheck,
  CheckCircle2,
  Wallet,
  Users2,
  Check,
  Loader2,
  UserPlus,
  Trash2,
  Save,
  Shield,
} from "lucide-react";
import TierBadge from "@/components/agent/TierBadge";

type AdminUserRow = {
  id: string;
  email: string;
  nom: string | null;
  role: "agent" | "commercial" | "admin";
  created_at: string;
};

const inputCls =
  "w-full rounded-lg border border-navy-800 px-3 py-2 text-sm text-navy-200 placeholder-navy-500 focus:outline-none focus:ring-1 focus:ring-gold-500";

const UserRowEditor: React.FC<{
  row: AdminUserRow;
  agent?: Agent;
  isSelf: boolean;
  busyKey: string | null;
  onSave: (input: {
    userId: string;
    nom: string;
    email: string;
    role: AdminUserRow["role"];
  }) => void;
  onDelete: (userId: string, label: string) => void;
}> = ({ row, agent, isSelf, busyKey, onSave, onDelete }) => {
  const [nom, setNom] = useState(row.nom ?? "");
  const [email, setEmail] = useState(row.email);
  const [role, setRole] = useState<AdminUserRow["role"]>(row.role);
  const dirty = nom.trim() !== (row.nom ?? "") || email.trim() !== row.email || role !== row.role;
  const saving = busyKey === `save-${row.id}`;
  const deleting = busyKey === `delete-${row.id}`;

  return (
    <tr key={row.id} className="hover:bg-navy-950 transition-colors align-top">
      <td className="py-3 pr-2">
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full rounded-lg border border-navy-800 px-2 py-1.5 text-sm text-navy-100 bg-navy-900/60"
        />
        {agent && (
          <div className="mt-1 text-[11px] text-navy-400">
            Agent · {agent.pays} · {agent.whatsapp}
          </div>
        )}
        {isSelf && <div className="mt-1 text-[10px] uppercase text-navy-400">(vous)</div>}
      </td>
      <td className="py-3 pr-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-navy-800 px-2 py-1.5 text-sm text-navy-200 bg-navy-900/60"
        />
      </td>
      <td className="py-3 pr-2">
        <select
          value={role}
          disabled={isSelf}
          onChange={(e) => setRole(e.target.value as AdminUserRow["role"])}
          className="rounded-lg border border-navy-800 px-2 py-1.5 text-xs text-navy-200 bg-navy-900/60 focus:outline-none focus:ring-1 focus:ring-gold-500 disabled:opacity-40"
        >
          <option value="agent">agent</option>
          <option value="commercial">commercial</option>
          <option value="admin">admin</option>
        </select>
      </td>
      <td className="py-3 text-right">
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => onSave({ userId: row.id, nom, email, role })}
            disabled={!dirty || saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold px-3 py-2 transition-colors disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="animate-spin h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={() => onDelete(row.id, row.nom || row.email)}
            disabled={isSelf || deleting}
            className="inline-flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 px-3 py-2 transition-colors disabled:opacity-40"
            title="Supprimer cet utilisateur"
          >
            {deleting ? (
              <Loader2 className="animate-spin h-3.5 w-3.5" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

const CommercialRow: React.FC<{
  row: RrState;
  busy: string | null;
  onUpdate: (id: number, email: string, whatsapp: string) => void;
  onDelete: (id: number, commercial: string) => void;
}> = ({ row, busy, onUpdate, onDelete }) => {
  const [email, setEmail] = useState(row.email);
  const [whatsapp, setWhatsapp] = useState(row.whatsapp);
  const dirty = email.trim() !== row.email || whatsapp.trim() !== row.whatsapp;
  const updating = busy === `update-${row.id}`;
  const deleting = busy === `delete-${row.id}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-navy-800 bg-navy-950/50">
      <div className="sm:w-32 shrink-0">
        <div className="font-bold text-navy-100">{row.commercial}</div>
        <div className="text-[11px] text-navy-400">
          {row.leads_total} lead{row.leads_total > 1 ? "s" : ""}
        </div>
      </div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@kpb..."
        className={inputCls}
      />
      <input
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        placeholder="+227..."
        className={`${inputCls} sm:max-w-[170px]`}
      />
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => onUpdate(row.id, email, whatsapp)}
          disabled={!dirty || updating}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold px-3 py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {updating ? (
            <Loader2 className="animate-spin h-3.5 w-3.5" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={() => onDelete(row.id, row.commercial)}
          disabled={deleting}
          className="inline-flex items-center justify-center rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 px-3 py-2 transition-colors disabled:opacity-40"
          title="Retirer ce commercial"
          aria-label={`Retirer ${row.commercial}`}
        >
          {deleting ? (
            <Loader2 className="animate-spin h-3.5 w-3.5" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

async function fetchAdminData() {
  const [agentsRes, leadsRes, commissionsRes, rrRes, usersRes] = await Promise.all([
    supabase.from("agents").select("*").order("created_at", { ascending: false }),
    supabase.from("leads").select("*"),
    supabase.from("commissions").select("*").order("created_at", { ascending: false }),
    supabase.from("rr_state").select("*").order("id", { ascending: true }),
    supabase.rpc("list_users_for_admin"),
  ]);
  if (usersRes.error) logger.error("Error fetching users", usersRes.error);
  return {
    agents: (agentsRes.data as Agent[] | null) ?? [],
    leads: (leadsRes.data as Lead[] | null) ?? [],
    commissions: (commissionsRes.data as Commission[] | null) ?? [],
    rrStates: (rrRes.data as RrState[] | null) ?? [],
    users: (usersRes.data as AdminUserRow[] | null) ?? [],
  };
}

const AdminPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const updatePlatformUserFn = useServerFn(updatePlatformUser);
  const deletePlatformUserFn = useServerFn(deletePlatformUser);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-data"],
    queryFn: fetchAdminData,
    enabled: !authLoading && profile?.role === "admin",
  });

  const agents = data?.agents ?? [];
  const leads = data?.leads ?? [];
  const commissions = data?.commissions ?? [];
  const rrStates = data?.rrStates ?? [];
  const users = data?.users ?? [];

  const [busyUserAction, setBusyUserAction] = useState<string | null>(null);
  const [updatingCommId, setUpdatingCommId] = useState<string | null>(null);
  const [busyCommercial, setBusyCommercial] = useState<string | null>(null);
  const [newCommercial, setNewCommercial] = useState({ commercial: "", email: "", whatsapp: "" });

  const fetchData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-data"] });
  }, [queryClient]);

  const handleMarkAsPaid = async (commId: string) => {
    setUpdatingCommId(commId);
    try {
      const { error } = await supabase
        .from("commissions")
        .update({ statut: "paid" })
        .eq("id", commId);

      if (error) throw error;
      await fetchData();
      showToast("Commission marquée comme payée.", "success");
    } catch (err) {
      logger.error("Error updating commission status", err);
      showToast("Erreur lors de la validation du paiement.", "error");
    } finally {
      setUpdatingCommId(null);
    }
  };

  const handleSaveUser = async (input: {
    userId: string;
    nom: string;
    email: string;
    role: AdminUserRow["role"];
  }) => {
    setBusyUserAction(`save-${input.userId}`);
    try {
      await updatePlatformUserFn({ data: input });
      await fetchData();
      showToast("Utilisateur mis à jour.", "success");
    } catch (err) {
      logger.error("Error updating user:", err);
      const msg =
        err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'utilisateur.";
      showToast(msg, "error");
    } finally {
      setBusyUserAction(null);
    }
  };

  const handleDeleteUser = async (userId: string, label: string) => {
    if (
      !window.confirm(
        `Supprimer ${label} ? Cette action supprimera aussi son compte d'authentification.`,
      )
    ) {
      return;
    }

    setBusyUserAction(`delete-${userId}`);
    try {
      await deletePlatformUserFn({ data: { userId } });
      await fetchData();
      showToast("Utilisateur supprimé.", "success");
    } catch (err) {
      logger.error("Error deleting user:", err);
      const msg =
        err instanceof Error ? err.message : "Erreur lors de la suppression de l'utilisateur.";
      showToast(msg, "error");
    } finally {
      setBusyUserAction(null);
    }
  };

  // Update a commercial's contact details
  const handleUpdateCommercial = async (id: number, email: string, whatsapp: string) => {
    setBusyCommercial(`update-${id}`);
    try {
      const { error } = await supabase
        .from("rr_state")
        .update({ email: email.trim(), whatsapp: whatsapp.trim() })
        .eq("id", id);
      if (error) throw error;
      await fetchData();
      showToast("Commercial mis à jour.", "success");
    } catch (err) {
      logger.error("Error updating commercial:", err);
      showToast("Erreur lors de la mise à jour du commercial.", "error");
    } finally {
      setBusyCommercial(null);
    }
  };

  // Add a new commercial to the round-robin
  const handleAddCommercial = async () => {
    const commercial = newCommercial.commercial.trim();
    const email = newCommercial.email.trim();
    const whatsapp = newCommercial.whatsapp.trim();
    if (!commercial || !email || !whatsapp) {
      showToast("Nom, email et WhatsApp sont requis.", "info");
      return;
    }
    setBusyCommercial("add");
    try {
      const { error } = await supabase.from("rr_state").insert({ commercial, email, whatsapp });
      if (error) throw error;
      setNewCommercial({ commercial: "", email: "", whatsapp: "" });
      await fetchData();
      showToast("Commercial ajouté.", "success");
    } catch (err) {
      logger.error("Error adding commercial:", err);
      const msg =
        err instanceof Error && err.message.includes("duplicate")
          ? "Un commercial portant ce nom existe déjà."
          : "Erreur lors de l'ajout du commercial.";
      showToast(msg, "error");
    } finally {
      setBusyCommercial(null);
    }
  };

  // Remove a commercial from the round-robin
  const handleDeleteCommercial = async (id: number, commercial: string) => {
    if (
      !window.confirm(
        `Retirer ${commercial} du round-robin ? Les leads déjà assignés ne seront pas réattribués.`,
      )
    ) {
      return;
    }
    setBusyCommercial(`delete-${id}`);
    try {
      const { error } = await supabase.from("rr_state").delete().eq("id", id);
      if (error) throw error;
      await fetchData();
      showToast("Commercial retiré.", "success");
    } catch (err) {
      logger.error("Error deleting commercial:", err);
      showToast("Erreur lors de la suppression du commercial.", "error");
    } finally {
      setBusyCommercial(null);
    }
  };

  // Calculations
  const totalAgentsCount = agents.length;
  const officialAgentsCount = agents.filter((a) => a.statut === "officiel").length;
  const totalLeadsCount = leads.length;

  // Toutes les commissions (placement + bonus paliers) sont en FCFA (XOF).
  const totalPaid = commissions
    .filter((c) => c.statut === "paid")
    .reduce((sum, c) => sum + Number(c.montant), 0);

  const totalPending = commissions
    .filter((c) => c.statut === "pending" || c.statut === "payable")
    .filter((c) => c.type !== "apport_ecole" || c.statut === "payable")
    .reduce((sum, c) => sum + Number(c.montant), 0);

  const pendingPayouts = commissions.filter(
    (c) =>
      c.statut === "payable" ||
      (c.statut === "pending" && c.condition_paiement !== "encaissement_ecole"),
  );

  const getAgentName = (agentId: string) => {
    return agents.find((a) => a.id === agentId)?.nom || "Agent Inconnu";
  };

  const getLeadName = (leadId: string) => {
    return leads.find((l) => l.id === leadId)?.nom || "Prospect";
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 bg-navy-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-transparent"></div>
          <p className="text-sm font-medium text-navy-300">Chargement de l'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-navy-950 py-10 px-4 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border-b border-navy-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Administration</h1>
          <p className="text-navy-300 text-sm mt-1">
            Supervisez le réseau d'ambassadeurs et validez les versements de commissions.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-navy-900/60 p-6 rounded-2xl border border-navy-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider block">
                Total Agents
              </span>
              <span className="text-2xl font-black text-navy-100 mt-1">{totalAgentsCount}</span>
            </div>
            <div className="rounded-xl bg-slate-100 text-navy-300 p-2.5">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-navy-900/60 p-6 rounded-2xl border border-navy-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider block">
                Agents Officiels
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1">
                {officialAgentsCount}
              </span>
            </div>
            <div className="rounded-xl bg-emerald-50 text-emerald-600 p-2.5">
              <Users2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-navy-900/60 p-6 rounded-2xl border border-navy-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider block">
                Total Filleuls
              </span>
              <span className="text-2xl font-black text-navy-100 mt-1">{totalLeadsCount}</span>
            </div>
            <div className="rounded-xl bg-blue-50 text-blue-600 p-2.5">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-navy-900/60 p-6 rounded-2xl border border-navy-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider block">
                Comms Versées
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1">
                {formatCurrency(totalPaid, "XOF")}
              </span>
            </div>
            <div className="rounded-xl bg-amber-50 text-amber-600 p-2.5">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left / Middle: Agents list */}
          <div className="lg:col-span-2 bg-navy-900/60 rounded-2xl border border-navy-800 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-navy-800 pb-3">
              Liste des Ambassadeurs
            </h3>

            {agents.length === 0 ? (
              <div className="text-center py-10 text-navy-400">
                <Users className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <p>Aucun agent enregistré pour le moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs font-bold text-navy-400 uppercase tracking-wider border-b border-navy-800">
                      <th className="pb-3">Nom / Contact</th>
                      <th className="pb-3">Statut</th>
                      <th className="pb-3">Niveau / Placements</th>
                      <th className="pb-3">Code Parrainage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-navy-950 transition-colors">
                        <td className="py-3.5 pr-2">
                          <div className="font-semibold text-navy-100">{agent.nom}</div>
                          <div className="text-xs text-navy-400 mt-0.5">{agent.email}</div>
                          <div className="text-xs text-navy-400">{agent.whatsapp}</div>
                        </td>
                        <td className="py-3.5 pr-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider border ${
                              agent.statut === "officiel"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : agent.statut === "essai"
                                  ? "bg-blue-50 text-blue-700 border-blue-100"
                                  : agent.statut === "quiz_failed"
                                    ? "bg-rose-50 text-rose-700 border-rose-100"
                                    : "bg-navy-950 text-navy-300 border-navy-800"
                            }`}
                          >
                            {agent.statut === "officiel"
                              ? "Officiel"
                              : agent.statut === "essai"
                                ? "Essai"
                                : agent.statut === "quiz_failed"
                                  ? "Quiz Échoué"
                                  : "Quiz Attente"}
                          </span>
                        </td>
                        <td className="py-3.5 pr-2">
                          <div className="flex flex-col gap-1 items-start">
                            <TierBadge tier={agent.tier} />
                            <span className="text-xs text-navy-300 font-semibold">
                              {agent.placements_count} placement
                              {agent.placements_count > 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 font-mono text-xs text-navy-300 font-semibold">
                          {agent.code_parrainage}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Pending payouts */}
          <div className="bg-navy-900/60 rounded-2xl border border-navy-800 p-6 shadow-sm space-y-6">
            <div className="border-b border-navy-800 pb-3">
              <h3 className="text-lg font-bold text-white">Paiements en Attente</h3>
              <p className="text-xs text-navy-400 mt-0.5">
                Total à verser :{" "}
                <strong className="text-navy-200">{formatCurrency(totalPending, "XOF")}</strong>
              </p>
            </div>

            {pendingPayouts.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-navy-400">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                <p className="text-xs">Tous les paiements sont à jour !</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {pendingPayouts.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-4 rounded-xl border border-navy-800 bg-navy-950/50 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">
                          {comm.type === "placement" ? "Commission Placement" : "Bonus Palier"}
                        </span>
                        <span className="text-xs font-semibold text-navy-200 mt-0.5 block">
                          Agent : {getAgentName(comm.agent_id)}
                        </span>
                        <span className="text-[11px] text-navy-400 block">
                          {comm.type === "placement" && comm.lead_id
                            ? `Filleul : ${getLeadName(comm.lead_id)}`
                            : "Récompense de palier"}
                        </span>
                      </div>
                      <div className="text-right">
                        {/* Display currency properly */}
                        <span className="font-bold text-white text-sm block">
                          {formatCurrency(comm.montant, "XOF")}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarkAsPaid(comm.id)}
                      disabled={updatingCommId === comm.id}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white py-2 transition-colors disabled:opacity-50"
                    >
                      {updatingCommId === comm.id ? (
                        <>
                          <Loader2 className="animate-spin h-3.5 w-3.5" />
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Marquer comme payé
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Commercials management (round-robin) */}
        <div className="bg-navy-900/60 rounded-2xl border border-navy-800 p-6 shadow-sm space-y-5">
          <div className="border-b border-navy-800 pb-3">
            <h3 className="text-lg font-bold text-white">Commerciaux (Round-Robin)</h3>
            <p className="text-xs text-navy-400 mt-0.5">
              Gérez l'équipe qui reçoit les leads. Le compte de connexion d'un commercial doit
              utiliser le <strong>même email</strong> que celui renseigné ici.
            </p>
          </div>

          <div className="space-y-3">
            {rrStates.length === 0 ? (
              <p className="text-sm text-navy-400">Aucun commercial configuré.</p>
            ) : (
              rrStates.map((row) => (
                <CommercialRow
                  key={row.id}
                  row={row}
                  busy={busyCommercial}
                  onUpdate={handleUpdateCommercial}
                  onDelete={handleDeleteCommercial}
                />
              ))
            )}
          </div>

          {/* Add commercial */}
          <div className="border-t border-navy-800 pt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-3">
              Ajouter un commercial
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={newCommercial.commercial}
                onChange={(e) => setNewCommercial((c) => ({ ...c, commercial: e.target.value }))}
                placeholder="Nom"
                className={`${inputCls} sm:max-w-[160px]`}
              />
              <input
                value={newCommercial.email}
                onChange={(e) => setNewCommercial((c) => ({ ...c, email: e.target.value }))}
                placeholder="email@kpb..."
                className={inputCls}
              />
              <input
                value={newCommercial.whatsapp}
                onChange={(e) => setNewCommercial((c) => ({ ...c, whatsapp: e.target.value }))}
                placeholder="+227..."
                className={`${inputCls} sm:max-w-[170px]`}
              />
              <button
                onClick={handleAddCommercial}
                disabled={busyCommercial === "add"}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 transition-colors disabled:opacity-50 shrink-0"
              >
                {busyCommercial === "add" ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Users & Roles management */}
        <div className="bg-navy-900/60 rounded-2xl border border-navy-800 p-6 shadow-sm space-y-5">
          <div className="border-b border-navy-800 pb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-navy-300" />
            <div>
              <h3 className="text-lg font-bold text-white">Utilisateurs & Rôles</h3>
              <p className="text-xs text-navy-400 mt-0.5">
                Promouvez un utilisateur en commercial ou admin. Pour qu'un commercial reçoive des
                leads, ajoutez-le aussi dans la section Round-Robin avec le{" "}
                <strong>même email</strong>.
              </p>
            </div>
          </div>

          {users.length === 0 ? (
            <p className="text-sm text-navy-400">Aucun utilisateur.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold text-navy-400 uppercase tracking-wider border-b border-navy-800">
                    <th className="pb-3">Nom</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Rôle actuel</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSelf = user?.id === u.id;
                    const agent = agents.find((a) => a.id === u.id);
                    return (
                      <UserRowEditor
                        key={u.id}
                        row={u}
                        agent={agent}
                        isSelf={isSelf}
                        busyKey={busyUserAction}
                        onSave={handleSaveUser}
                        onDelete={handleDeleteUser}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: ({ context }) => {
    if (context.profile?.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminPage,
});

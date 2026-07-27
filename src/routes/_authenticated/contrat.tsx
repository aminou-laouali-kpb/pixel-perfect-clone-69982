import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { FileSignature, Loader2, CheckCircle2, Download } from "lucide-react";

type PrepareResult = {
  contract_id: string;
  version: string;
  sha256: string;
  status: string;
  pdf_path: string;
  body?: string;
};

const SignedContractPanel: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [meta, setMeta] = useState<{
    version?: string;
    sha256?: string;
    signed_at?: string;
    pdf_path?: string;
  } | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("get_my_contract_download");
      if (cancelled) return;
      if (error) {
        showToast(error.message, "error");
        setLoadingMeta(false);
        return;
      }
      const row = data as unknown as {
        ok?: boolean;
        version?: string;
        sha256?: string;
        signed_at?: string;
        pdf_path?: string;
      };
      setMeta(row?.ok ? row : null);
      setLoadingMeta(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  return (
    <div className="flex-1 bg-navy-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <h1 className="text-2xl font-bold text-white">Contrat signé</h1>
        {loadingMeta ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold-500" />
        ) : meta ? (
          <div className="rounded-2xl border border-navy-800 bg-navy-900/50 p-5 text-left text-sm text-navy-200 space-y-2">
            <p>
              Version <strong className="text-white">{meta.version}</strong>
            </p>
            {meta.signed_at && <p>Signé le {new Date(meta.signed_at).toLocaleString("fr-FR")}</p>}
            <p className="font-mono text-[11px] break-all text-navy-400">SHA-256 : {meta.sha256}</p>
            <p className="text-xs text-navy-400">Fichier : {meta.pdf_path}</p>
            <button
              type="button"
              onClick={() =>
                showToast(
                  "Après déploiement Storage : créer une URL signée 60 s depuis ce chemin.",
                  "info",
                )
              }
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold-500 py-2.5 text-sm font-bold text-navy-950"
            >
              <Download className="h-4 w-4" />
              Télécharger mon contrat
            </button>
          </div>
        ) : (
          <p className="text-sm text-navy-300">Aucun contrat signé trouvé.</p>
        )}
        <button
          type="button"
          onClick={() => navigate({ to: "/dashboard" })}
          className="text-sm text-gold-400 hover:underline"
        >
          Retour au dashboard
        </button>
      </div>
    </div>
  );
};

const ContratPage: React.FC = () => {
  const { agent, loading, refetchAuth } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [prep, setPrep] = useState<PrepareResult | null>(null);
  const [loadingPrep, setLoadingPrep] = useState(true);
  const [scrolledEnd, setScrolledEnd] = useState(false);
  const [fullName, setFullName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [acceptedImage, setAcceptedImage] = useState(false);
  const [signing, setSigning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    if (!agent || agent.statut === "quiz_pending" || agent.statut === "quiz_failed") return;
    if (agent.contrat_signe_at) return;

    let cancelled = false;
    (async () => {
      setLoadingPrep(true);
      const { data, error } = await supabase.rpc("prepare_contract");
      if (cancelled) return;
      if (error) {
        showToast(error.message, "error");
        setLoadingPrep(false);
        return;
      }
      setPrep(data as unknown as PrepareResult);
      setLoadingPrep(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [agent, showToast]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#f0c220";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, [prep]);

  if (loading) {
    return (
      <div className="flex-1 bg-navy-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!agent) {
    return <Navigate to="/candidater" replace />;
  }

  if (agent.statut === "quiz_pending" || agent.statut === "quiz_failed") {
    return <Navigate to="/quiz" replace />;
  }

  if (agent.contrat_signe_at) {
    return <SignedContractPanel />;
  }

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const onPointerUp = () => {
    drawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const canvasHasInk = () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < data.length; i += 4) {
      // non-navy pixels
      if (data[i] > 20 || data[i + 1] > 30 || data[i + 2] > 50) return true;
    }
    return false;
  };

  const canSign =
    scrolledEnd &&
    acceptedTerms &&
    acceptedAge &&
    fullName.trim().length >= 3 &&
    canvasHasInk() &&
    Boolean(prep?.contract_id);

  const handleSign = async () => {
    if (!prep || !canSign || !canvasRef.current) return;
    setSigning(true);
    try {
      const signatureB64 = canvasRef.current.toDataURL("image/png");
      const { data, error } = await supabase.rpc("sign_contract", {
        p_contract_id: prep.contract_id,
        p_full_name: fullName.trim(),
        p_signature_b64: signatureB64,
        p_accepted_terms: acceptedTerms,
        p_accepted_age_18: acceptedAge,
        p_accepted_image: acceptedImage,
        p_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
      if (error) throw new Error(error.message);
      await refetchAuth();
      showToast("Contrat signé — votre lien de parrainage est débloqué.", "success");
      navigate({ to: "/dashboard", replace: true });
      return data;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Signature impossible", "error");
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="flex-1 bg-navy-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gold-500/10 p-2.5 border border-gold-500/20">
            <FileSignature className="h-6 w-6 text-gold-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Signer mon contrat ambassadeur</h1>
            <p className="text-sm text-navy-300">
              Obligatoire avant de partager votre lien de parrainage (barème 15–30 %).
            </p>
          </div>
        </div>

        {loadingPrep ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
          </div>
        ) : (
          <>
            <div
              className="h-80 overflow-y-auto rounded-2xl border border-navy-800 bg-navy-900/50 p-5 text-sm text-navy-200 whitespace-pre-wrap font-mono"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
                  setScrolledEnd(true);
                }
              }}
            >
              {prep?.body ??
                "Contrat Ambassadeur KPB Global L.L.C. — document de référence v3.1. Faites défiler jusqu'en bas."}
              {"\n\n"}
              Version {prep?.version} · Empreinte SHA-256 : {prep?.sha256}
              {"\n\n"}
              {/* Force scroll length */}
              {Array.from({ length: 8 })
                .map(
                  (_, i) =>
                    `\n§${i + 1}. L'Ambassadeur reconnaît avoir lu l'intégralité du Contrat_Ambassadeur_KPB_v3.1 et de ses annexes (barème, prime scolarité, délais de sécurité, paiement).`,
                )
                .join("")}
              {"\n\n— Fin du document —"}
            </div>
            {!scrolledEnd && (
              <p className="text-xs text-gold-400">
                Faites défiler le contrat jusqu'en bas pour continuer.
              </p>
            )}

            <div className="space-y-3 text-sm text-navy-200">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                />
                <span>J'accepte le contrat et ses annexes.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedAge}
                  onChange={(e) => setAcceptedAge(e.target.checked)}
                  className="mt-1"
                />
                <span>Je confirme avoir 18 ans révolus.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedImage}
                  onChange={(e) => setAcceptedImage(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  J'autorise l'utilisation de mon image dans le kit ambassadeur (optionnel).
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
                Nom complet (saisie manuelle)
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="off"
                placeholder="Retapez votre nom exact"
                className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2.5 text-white text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-navy-300 uppercase tracking-wider">
                  Signature
                </label>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-navy-400 hover:text-white"
                >
                  Effacer
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={600}
                height={180}
                className="w-full touch-none rounded-xl border border-navy-700 bg-navy-900 cursor-crosshair"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              />
            </div>

            <button
              type="button"
              disabled={!canSign || signing}
              onClick={handleSign}
              className="w-full inline-flex items-center justify-center rounded-xl bg-gold-500 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {signing ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Signature en cours…
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Signer et activer mon lien
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute("/_authenticated/contrat")({
  component: ContratPage,
});

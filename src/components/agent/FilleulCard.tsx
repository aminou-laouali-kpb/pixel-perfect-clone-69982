import React from 'react';
import { Lead } from '@/types';
import { cn, formatCurrency, whatsappLink } from '@/lib/utils';
import { Calendar, Compass, MessageCircle, Wallet } from 'lucide-react';

interface FilleulCardProps {
  lead: Lead;
}

export const FilleulCard: React.FC<FilleulCardProps> = ({ lead }) => {
  const getStatusStyle = (status: Lead['statut']) => {
    switch (status) {
      case 'nouveau':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'contacte':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'qualifie':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'acompte_paye':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'place':
        return 'bg-gold-500/10 text-gold-400 border-gold-500/25';
      default:
        return 'bg-navy-800 text-navy-400 border-navy-700';
    }
  };

  const getStatusLabel = (status: Lead['statut']) => {
    switch (status) {
      case 'nouveau': return 'Nouveau';
      case 'contacte': return 'Contacté';
      case 'qualifie': return 'Qualifié';
      case 'acompte_paye': return 'Frais payés';
      case 'place': return 'Placé ✅';
      default: return status;
    }
  };

  const formattedDate = new Date(lead.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="rounded-2xl border border-navy-850 bg-navy-900/30 p-5 space-y-4 hover:border-navy-800 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-white text-base">{lead.nom}</h4>
          <span className="text-xs text-navy-400 flex items-center gap-1 mt-1">
            <Calendar className="h-3 w-3" />
            Parrainé le {formattedDate}
          </span>
        </div>
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider", getStatusStyle(lead.statut))}>
          {getStatusLabel(lead.statut)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-navy-850 text-xs text-navy-300">
        <div className="space-y-1">
          <span className="text-navy-500 block">Origine / Destination</span>
          <span className="font-medium text-navy-200 flex items-center gap-1">
            <Compass className="h-3 w-3 text-gold-500 shrink-0" />
            {lead.pays} → {lead.destination}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-navy-500 block">WhatsApp</span>
          {whatsappLink(lead.whatsapp) ? (
            <a
              href={whatsappLink(lead.whatsapp)!}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
              title="Ouvrir la conversation WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              {lead.whatsapp}
            </a>
          ) : (
            <span className="font-medium text-navy-200 flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              Non renseigné
            </span>
          )}
        </div>
      </div>

      {/* Commissions summary */}
      <div className="flex justify-between items-center pt-3 border-t border-navy-850">
        <span className="text-xs text-navy-400 flex items-center gap-1">
          <Wallet className="h-3.5 w-3.5 text-gold-500" />
          Commissions accumulées :
        </span>
        <div className="text-right">
          {/* Placement commission once the deposit is paid / placed */}
          {lead.commission_amount > 0 ? (
            <div className="text-sm font-bold text-gold-400">
              +{formatCurrency(lead.commission_amount, 'XOF')}
            </div>
          ) : (
            <span className="text-xs text-navy-500 font-medium">Aucun gain validé</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilleulCard;

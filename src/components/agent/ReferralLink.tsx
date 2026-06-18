import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';

interface ReferralLinkProps {
  code: string;
}

export const ReferralLink: React.FC<ReferralLinkProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/rejoindre?ref=${encodeURIComponent(code)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Devenez Ambassadeur KPB Education',
          text: `Inscris-toi sur KPB Education via mon lien d'ambassadeur pour tes études à l'étranger !`,
          url: link,
        });
      } catch {
        // Native share can be cancelled by the user; no UI error is needed.
      }
    } else {
      // Fallback
      handleCopy();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-navy-400 uppercase tracking-wider">
        Votre Lien de Parrainage Personnel
      </label>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            readOnly
            value={link}
            className="w-full rounded-xl bg-navy-950/60 border border-navy-800 py-3 pl-4 pr-12 text-sm text-navy-200 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white p-1 rounded-md hover:bg-navy-900 transition-colors"
            title="Copier le lien"
          >
            {copied ? (
              <Check className="h-4.5 w-4.5 text-emerald-400" />
            ) : (
              <Copy className="h-4.5 w-4.5" />
            )}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-none justify-center px-4 py-3 bg-navy-900/60 hover:bg-navy-800 text-sm font-semibold border border-navy-800 hover:border-navy-700 rounded-xl flex items-center gap-2 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-navy-400" />
                <span>Copier</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 sm:flex-none justify-center px-4 py-3 bg-gold-500 hover:bg-gold-400 text-sm font-bold text-navy-950 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-gold-500/10"
          >
            <Share2 className="h-4 w-4" />
            <span>Partager</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralLink;

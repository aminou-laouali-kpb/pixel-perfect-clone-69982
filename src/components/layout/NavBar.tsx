import React, { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Menu, X, User as UserIcon } from "lucide-react";
import { cn, TIERS } from "@/lib/utils";

export const NavBar: React.FC = () => {
  const { profile, agent, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isOpen, setIsOpen] = useState(false);

  const isAgentSpace = !profile || profile.role === "agent";
  const navBg = isAgentSpace ? "bg-navy-950/80 border-navy-800" : "bg-white border-slate-200";
  const textColor = isAgentSpace ? "text-white" : "text-slate-900";
  const linkColor = isAgentSpace ? "text-navy-300 hover:text-gold-400" : "text-slate-600 hover:text-blue-600";
  const activeLinkColor = isAgentSpace ? "text-gold-400 font-semibold" : "text-blue-600 font-semibold";

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const isCurrent = (path: string) => pathname === path;

  return (
    <nav className={cn("sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-300", navBg)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className={cn("text-xl font-bold tracking-tight", isAgentSpace ? "text-white" : "text-slate-900")}>
                KPB <span className="text-gold-500">Education</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            {profile && (
              <>
                {profile.role === "agent" && agent && agent.statut !== "quiz_pending" && agent.statut !== "quiz_failed" && (
                  <Link to="/dashboard" className={cn("text-sm transition-colors", isCurrent("/dashboard") ? activeLinkColor : linkColor)}>
                    Tableau de bord
                  </Link>
                )}
                {profile.role === "commercial" && (
                  <Link to="/commercial" className={cn("text-sm transition-colors", isCurrent("/commercial") ? activeLinkColor : linkColor)}>
                    Espace Commercial
                  </Link>
                )}
                {profile.role === "admin" && (
                  <Link to="/admin" className={cn("text-sm transition-colors", isCurrent("/admin") ? activeLinkColor : linkColor)}>
                    Administration
                  </Link>
                )}
              </>
            )}

            {profile ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {profile.role === "agent" && agent && (
                    <span className="inline-flex items-center rounded-full bg-gold-500/10 px-2.5 py-0.5 text-xs font-semibold text-gold-400">
                      {TIERS[agent.tier]?.label || "Bronze 🥉"}
                    </span>
                  )}
                  {profile.role === "commercial" && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">Commercial</span>
                  )}
                  {profile.role === "admin" && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Admin</span>
                  )}
                  <span className={cn("text-sm font-medium", isAgentSpace ? "text-navy-200" : "text-slate-700")}>{profile.nom}</span>
                </div>
                <button onClick={handleSignOut} className={cn(
                  "flex items-center space-x-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors border",
                  isAgentSpace
                    ? "border-navy-800 text-navy-300 hover:bg-navy-900 hover:text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}>
                  <LogOut className="h-4 w-4" />
                  <span>Quitter</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className={cn("text-sm font-medium transition-colors hover:text-gold-400", isAgentSpace ? "text-navy-300" : "text-slate-600")}>
                  Connexion
                </Link>
                <Link to="/candidater" className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400 shadow-[0_0_15px_rgba(217,161,16,0.3)] hover:scale-[1.02]">
                  Devenir Agent
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={cn("inline-flex items-center justify-center rounded-md p-2 focus:outline-none", textColor)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className={cn("border-b md:hidden", isAgentSpace ? "bg-navy-950 border-navy-800" : "bg-white border-slate-200")}>
          <div className="space-y-1 px-2 pb-3 pt-2">
            {profile && (
              <>
                {profile.role === "agent" && agent && agent.statut !== "quiz_pending" && agent.statut !== "quiz_failed" && (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className={cn("block rounded-md px-3 py-2 text-base font-medium", isCurrent("/dashboard") ? activeLinkColor : linkColor)}>Tableau de bord</Link>
                )}
                {profile.role === "commercial" && (
                  <Link to="/commercial" onClick={() => setIsOpen(false)} className={cn("block rounded-md px-3 py-2 text-base font-medium", isCurrent("/commercial") ? activeLinkColor : linkColor)}>Espace Commercial</Link>
                )}
                {profile.role === "admin" && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className={cn("block rounded-md px-3 py-2 text-base font-medium", isCurrent("/admin") ? activeLinkColor : linkColor)}>Administration</Link>
                )}
              </>
            )}

            {profile ? (
              <div className="border-t border-slate-700/20 pt-4 mt-4 px-3">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="rounded-full bg-gold-500/20 p-1">
                    <UserIcon className={cn("h-5 w-5", isAgentSpace ? "text-gold-400" : "text-blue-600")} />
                  </div>
                  <div>
                    <div className={cn("text-base font-medium", textColor)}>{profile.nom}</div>
                    <div className="text-xs text-navy-400 font-semibold uppercase">{profile.role}</div>
                  </div>
                </div>
                <button onClick={handleSignOut} className="flex w-full items-center justify-center space-x-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500">
                  <LogOut className="h-4 w-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 border-t border-slate-700/20 pt-4 mt-4 px-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className={cn("block text-center text-sm font-medium py-2 rounded-md", isAgentSpace ? "text-navy-300 hover:text-white" : "text-slate-600 hover:text-black")}>Connexion</Link>
                <Link to="/candidater" onClick={() => setIsOpen(false)} className="block text-center rounded-md bg-gold-500 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400">Devenir Agent</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
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

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const isCurrent = (path: string) => pathname === path;
  const linkColor = "text-navy-300 hover:text-gold-400";
  const activeLinkColor = "text-gold-400 font-semibold";

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-navy-800 bg-navy-950/80 backdrop-blur-md">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-gold-500 focus:px-3 focus:py-2 focus:text-navy-950"
      >
        Aller au contenu
      </a>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-display text-xl font-bold tracking-tight text-white">
                KPB <span className="text-gold-500">Education</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            {profile && (
              <>
                {profile.role === "agent" &&
                  agent &&
                  agent.statut !== "quiz_pending" &&
                  agent.statut !== "quiz_failed" && (
                    <Link
                      to="/dashboard"
                      className={cn(
                        "text-sm transition-colors",
                        isCurrent("/dashboard") ? activeLinkColor : linkColor,
                      )}
                    >
                      Tableau de bord
                    </Link>
                  )}
                {(profile.role === "commercial" || profile.role === "admin") && (
                  <Link
                    to="/commercial"
                    className={cn(
                      "text-sm transition-colors",
                      isCurrent("/commercial") ? activeLinkColor : linkColor,
                    )}
                  >
                    Espace Commercial
                  </Link>
                )}
                {profile.role === "admin" && (
                  <Link
                    to="/admin"
                    className={cn(
                      "text-sm transition-colors",
                      isCurrent("/admin") ? activeLinkColor : linkColor,
                    )}
                  >
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
                      {TIERS[agent.tier]?.label || "Bronze"}
                    </span>
                  )}
                  {profile.role === "commercial" && (
                    <span className="inline-flex items-center rounded-full bg-gold-500/10 px-2.5 py-0.5 text-xs font-semibold text-gold-400">
                      Commercial
                    </span>
                  )}
                  {profile.role === "admin" && (
                    <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-300">
                      Admin
                    </span>
                  )}
                  <span className="text-sm font-medium text-navy-200">{profile.nom}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  aria-label="Se déconnecter"
                  className="flex items-center space-x-1 rounded-md border border-navy-800 px-3 py-1.5 text-sm font-medium text-navy-300 transition-colors hover:bg-navy-900 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Quitter</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-navy-300 transition-colors hover:text-gold-400"
                >
                  Connexion
                </Link>
                <Link
                  to="/candidater"
                  className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-all hover:bg-gold-400 hover:scale-[1.02] motion-reduce:hover:scale-100"
                >
                  Devenir Agent
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="inline-flex items-center justify-center rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-nav" className="border-b border-navy-800 bg-navy-950 md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {profile && (
              <>
                {profile.role === "agent" &&
                  agent &&
                  agent.statut !== "quiz_pending" &&
                  agent.statut !== "quiz_failed" && (
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-2 text-base font-medium",
                        isCurrent("/dashboard") ? activeLinkColor : linkColor,
                      )}
                    >
                      Tableau de bord
                    </Link>
                  )}
                {(profile.role === "commercial" || profile.role === "admin") && (
                  <Link
                    to="/commercial"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2 text-base font-medium",
                      isCurrent("/commercial") ? activeLinkColor : linkColor,
                    )}
                  >
                    Espace Commercial
                  </Link>
                )}
                {profile.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2 text-base font-medium",
                      isCurrent("/admin") ? activeLinkColor : linkColor,
                    )}
                  >
                    Administration
                  </Link>
                )}
              </>
            )}

            {profile ? (
              <div className="mt-4 border-t border-navy-800 px-3 pt-4">
                <div className="mb-3 flex items-center space-x-3">
                  <div className="rounded-full bg-gold-500/20 p-1">
                    <UserIcon className="h-5 w-5 text-gold-400" />
                  </div>
                  <div>
                    <div className="text-base font-medium text-white">{profile.nom}</div>
                    <div className="text-xs font-semibold uppercase text-navy-400">
                      {profile.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center space-x-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-2 border-t border-navy-800 px-3 pt-4">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md py-2 text-center text-sm font-medium text-navy-300 hover:text-white"
                >
                  Connexion
                </Link>
                <Link
                  to="/candidater"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md bg-gold-500 py-2 text-center text-sm font-semibold text-navy-950 hover:bg-gold-400"
                >
                  Devenir Agent
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getPublicBackendConfig } from "@/lib/config.functions";
import { setRuntimeSupabaseConfig, type PublicBackendConfig } from "@/lib/supabase-config";
import { AuthProvider } from "@/hooks/useAuth";
import NavBar from "@/components/layout/NavBar";
import ConfigBanner from "@/components/layout/ConfigBanner";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-gold-400">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-white">Page introuvable</h2>
        <p className="mt-2 text-sm text-navy-300">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-gold-500 px-4 py-2 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-400"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Cette page n&apos;a pas pu charger
        </h1>
        <p className="mt-2 text-sm text-navy-300">
          Une erreur est survenue. Vous pouvez réessayer ou revenir à l&apos;accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-gold-500 px-4 py-2 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-400"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-navy-700 bg-navy-900 px-4 py-2 text-sm font-medium text-navy-100 transition-colors hover:bg-navy-800"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Resolved on the server, serialized into the SSR payload, then replayed on the
  // client so the browser keeps working even when the bundle was built without
  // VITE_SUPABASE_*.
  loader: async (): Promise<{ publicConfig: PublicBackendConfig | null }> => {
    try {
      const publicConfig = await getPublicBackendConfig();
      setRuntimeSupabaseConfig(publicConfig);
      return { publicConfig };
    } catch {
      return { publicConfig: null };
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KPB Education — Programme Ambassadeur" },
      {
        name: "description",
        content:
          "Devenez ambassadeur KPB Education, présentez vos proches à nos conseillers et gagnez des commissions sur chaque inscription.",
      },
      { property: "og:title", content: "KPB Education — Programme Ambassadeur" },
      {
        property: "og:description",
        content:
          "Devenez ambassadeur KPB Education, présentez vos proches à nos conseillers et gagnez des commissions sur chaque inscription.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "KPB Education — Programme Ambassadeur" },
      {
        name: "twitter:description",
        content:
          "Devenez ambassadeur KPB Education, présentez vos proches à nos conseillers et gagnez des commissions sur chaque inscription.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1a71ab4e-9554-459c-ace2-93cd6b5736fc/id-preview-840d15f7--fe1f5bd3-4b87-4749-acac-476fa8c555f4.lovable.app-1781871012501.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1a71ab4e-9554-459c-ace2-93cd6b5736fc/id-preview-840d15f7--fe1f5bd3-4b87-4749-acac-476fa8c555f4.lovable.app-1781871012501.png",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { publicConfig } = Route.useLoaderData();

  // Applied during render (not in an effect) so descendants that touch the
  // Supabase client on their first render already see the credentials.
  setRuntimeSupabaseConfig(publicConfig);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-navy-950 text-white">
          <ConfigBanner />
          <NavBar />
          <main id="main-content" className="flex-1 flex flex-col">
            <Outlet />
          </main>
          <Toaster richColors position="top-right" />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Cette page n'a pas pu charger</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 "DM Sans", system-ui, sans-serif; background: #070a13; color: #f4f6fa; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #a1b8d3; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #d9a110; color: #070a13; }
      .secondary { background: #111827; color: #f4f6fa; border-color: #1e2e4a; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Cette page n'a pas pu charger</h1>
      <p>Une erreur est survenue. Vous pouvez rafraîchir ou revenir à l'accueil.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Réessayer</button>
        <a class="secondary" href="/">Accueil</a>
      </div>
    </div>
  </body>
</html>`;
}

export function renderEditPage({ id, name, message, error }) {
  const safeId = Number(id);
  return `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Redigera meddelande #${safeId}</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; max-width: 720px; margin: 0 auto; }
    form { display: grid; gap: 12px; padding: 16px; border: 1px solid #ddd; border-radius: 12px; }
    label { display: grid; gap: 6px; }
    input, textarea { font: inherit; padding: 10px; border: 1px solid #ccc; border-radius: 10px; }
    button { font: inherit; padding: 10px 14px; border: 0; border-radius: 10px; cursor: pointer; }
    .save { background: #111; color: #fff; }
    .cancel { background: #eee; color: #111; text-decoration: none; display: inline-block; text-align: center; }
    .error { color: #c00; padding: 10px; border: 1px solid #c00; border-radius: 8px; }
    .hint { color: #555; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Redigera meddelande <span style="color:#888">#${safeId}</span></h1>
  ${error ? `<p class="error">${error}</p>` : ''}
  <form method="POST" action="/messages/${safeId}/update">
    <label>
      Namn
      <input name="name" value="${name}" maxlength="50" required />
    </label>
    <label>
      Meddelande
      <textarea name="message" rows="5" maxlength="500" required>${message}</textarea>
    </label>
    <div style="display:flex;gap:8px">
      <button type="submit" class="save">Spara ändringar</button>
      <a href="/messages" class="cancel button">Avbryt</a>
    </div>
  </form>
</body>
</html>`;
}

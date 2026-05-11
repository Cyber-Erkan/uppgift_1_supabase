import { supabase } from '../lib/supabase.js';
import { clampString } from '../utils/sanitize.js';
import { escapeHtml } from '../utils/html.js';

import { renderFormPage } from '../views/form.view.js';
import { renderReceivedPage } from '../views/received.view.js';
import { renderMessagesPage } from '../views/messages.view.js';
import { renderEditPage } from '../views/edit.view.js';

export async function showForm(req, res) {
  res.type('html').send(renderFormPage());
}

export async function sendMessage(req, res) {
  const nameRaw = clampString(req.body?.name, 50);
  const messageRaw = clampString(req.body?.message, 500);

  if (!nameRaw || !messageRaw) {
    return res.status(400).type('html').send('<p>Fel: saknar namn eller meddelande.</p><p><a href="/">Tillbaka</a></p>');
  }

  const userAgent = clampString(req.get('user-agent'), 200);
  const ip = clampString(req.ip, 60);

  const { error } = await supabase
    .from('request_messages')
    .insert([{ name: nameRaw, message: messageRaw, user_agent: userAgent, ip }]);

  if (error) {
    console.error('[supabase] insert error:', error);
    return res.status(500).type('html').send('<p>Serverfel när vi skulle spara i databasen.</p><p><a href="/">Tillbaka</a></p>');
  }

  const safeName = escapeHtml(nameRaw);
  const safeMessage = escapeHtml(messageRaw).replaceAll('\n', '<br/>');

  res.type('html').send(
    renderReceivedPage({ name: safeName, message: safeMessage })
  );
}

export async function listMessages(req, res) {
  const { data, error } = await supabase
    .from('request_messages')
    .select('id, created_at, name, message')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[supabase] select error:', error);
    return res.status(500).type('html').send('<p>Serverfel när vi skulle läsa från databasen.</p><p><a href="/">Tillbaka</a></p>');
  }

  const itemsHtml = (data || []).map((row) => {
    const when = escapeHtml(new Date(row.created_at).toLocaleString('sv-SE'));
    const n = escapeHtml(row.name);
    const m = escapeHtml(row.message).replaceAll('\n', '<br/>');
    return `<li>
      <div><strong>#${row.id}</strong> · ${when}</div>
      <div><strong>${n}</strong></div>
      <div>${m}</div>
      <div style="margin-top:8px;display:flex;gap:12px">
        <a href="/messages/${row.id}/edit">✏️ Redigera</a>
        <form method="POST" action="/messages/${row.id}/delete" style="margin:0" onsubmit="return confirm('Ta bort meddelande #${row.id}?')">
          <button type="submit" style="background:none;border:none;padding:0;cursor:pointer;font:inherit;color:#c00">🗑️ Ta bort</button>
        </form>
      </div>
    </li>`;
  }).join('');

  res.type('html').send(renderMessagesPage({ itemsHtml }));
}

export async function deleteMessage(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).type('html').send('<p>Ogiltigt ID.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  const { error } = await supabase
    .from('request_messages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[supabase] delete error:', error);
    return res.status(500).type('html').send('<p>Serverfel vid borttagning.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  res.redirect('/messages');
}

export async function showEdit(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).type('html').send('<p>Ogiltigt ID.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  const { data, error } = await supabase
    .from('request_messages')
    .select('id, name, message')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).type('html').send('<p>Meddelandet hittades inte.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  res.type('html').send(renderEditPage({
    id: data.id,
    name: escapeHtml(data.name),
    message: escapeHtml(data.message),
  }));
}

export async function updateMessage(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).type('html').send('<p>Ogiltigt ID.</p><p><a href="/messages">Tillbaka</a></p>');
  }

  const nameRaw = clampString(req.body?.name, 50);
  const messageRaw = clampString(req.body?.message, 500);

  if (!nameRaw || !messageRaw) {
    return res.status(400).type('html').send(
      renderEditPage({
        id,
        name: escapeHtml(nameRaw),
        message: escapeHtml(messageRaw),
        error: 'Namn och meddelande får inte vara tomma.',
      })
    );
  }

  const { error } = await supabase
    .from('request_messages')
    .update({ name: nameRaw, message: messageRaw })
    .eq('id', id);

  if (error) {
    console.error('[supabase] update error:', error);
    return res.status(500).type('html').send(
      renderEditPage({
        id,
        name: escapeHtml(nameRaw),
        message: escapeHtml(messageRaw),
        error: 'Serverfel vid uppdatering. Försök igen.',
      })
    );
  }

  res.redirect('/messages');
}

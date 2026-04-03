import nodemailer from 'nodemailer';
import type { TikTokScript } from '../types.js';

function buildTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   ?? 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });
}

const ANGLE_EMOJI:  Record<string, string> = { education: '📚', coulisses: '🎭', opinion: '💬' };
const FORMAT_EMOJI: Record<string, string> = { texte_anime: '✨', screen_recording: '🖥️', voix_off: '🎙️' };

function buildHtml(scripts: TikTokScript[], date: string): string {
  const rows = scripts.map((s, i) => {
    const ae   = ANGLE_EMOJI[s.angle]   ?? '📌';
    const fe   = FORMAT_EMOJI[s.format] ?? '🎬';
    const tags = s.hashtags
      .map(h => `<span style="background:#0a2040;color:#1a82d4;padding:2px 8px;border-radius:3px;font-size:11px;">${h}</span>`)
      .join(' ');

    return `
    <tr>
      <td style="padding:16px 20px;border-bottom:1px solid #1a3a5c;">
        <p style="margin:0 0 6px;color:#1a82d4;font-size:17px;font-weight:bold;">#${i + 1} — ${s.hook}</p>
        <p style="margin:0 0 10px;color:#888;font-size:13px;">${ae} ${s.angle} &nbsp;|&nbsp; ${fe} ${s.format} &nbsp;|&nbsp; ⏱ ${s.duree_secondes}s</p>
        <p style="margin:0 0 10px;color:#ccc;font-size:13px;background:#061020;padding:10px 14px;border-left:3px solid #1a82d4;border-radius:0 4px 4px 0;font-style:italic;">"${s.cta}"</p>
        <p style="margin:0;">${tags}</p>
      </td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#0d1b2a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;">
    <tr>
      <td style="background:#0d1b2a;border:1px solid #1a82d4;border-radius:8px;overflow:hidden;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:22px 20px;background:#061020;border-bottom:2px solid #1a82d4;">
              <h1 style="margin:0;color:#1a82d4;font-size:20px;">🎬 3 scripts TikTok générés</h1>
              <p style="margin:4px 0 0;color:#666;font-size:13px;">${date}</p>
            </td>
          </tr>
          ${rows}
          <tr>
            <td style="padding:14px 20px;text-align:center;border-top:1px solid #1a3a5c;">
              <p style="margin:0;color:#444;font-size:11px;">DMSW — Agent TikTok Automatisé · Rendus vidéo en cours</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Envoie le récapitulatif HTML des scripts à l'adresse GMAIL_TO.
 */
export async function sendEmailSummary(scripts: TikTokScript[]): Promise<string> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return JSON.stringify({ error: 'SMTP_USER ou SMTP_PASS manquant' });
  }

  const date = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  try {
    const transport = buildTransport();
    const info = await transport.sendMail({
      from:    `"DMSW Agent TikTok" <${process.env.SMTP_USER}>`,
      to:      process.env.GMAIL_TO ?? process.env.SMTP_USER,
      subject: `🎬 3 scripts TikTok prêts — ${date}`,
      html:    buildHtml(scripts, date),
    });

    return JSON.stringify({ success: true, messageId: info.messageId, date });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ success: false, error: msg });
  }
}

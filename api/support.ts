import type { IncomingMessage, ServerResponse } from 'node:http';
import { z } from 'zod';

const requestSchema = z.object({
  category: z.enum(['modpacks', 'launchers', 'website', 'community', 'other']),
  email: z.string().email().max(254),
  subject: z.string().trim().min(4).max(120),
  message: z.string().trim().min(20).max(4000),
  website: z.string().max(200).default(''), // honeypot
  turnstileToken: z.string().min(1).max(3000),
});

function reply(res: ServerResponse, code: number, error: string) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ error }));
}

export default async function support(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== 'POST') return reply(res, 405, 'method_not_allowed');
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host || origin !== `https://${host}`) return reply(res, 403, 'origin_rejected');
  if (!process.env.RESEND_API_KEY || !process.env.SUPPORT_FROM_EMAIL || !process.env.TURNSTILE_SECRET_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return reply(res, 503, 'contact_unavailable');
  let body: unknown = req.body;
  if (body === undefined) {
    let raw = '';
    for await (const chunk of req) { raw += chunk.toString(); if (raw.length > 16000) return reply(res, 413, 'too_large'); }
    try { body = JSON.parse(raw); } catch { return reply(res, 400, 'invalid_request'); }
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return reply(res, 400, 'invalid_request');
  if (parsed.data.website) return reply(res, 200, 'received');
  const ip = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim();
  if (!ip) return reply(res, 400, 'invalid_request');
  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: parsed.data.turnstileToken, remoteip: ip }) });
    const verified = verification.ok ? await verification.json() as { success: boolean; hostname?: string } : null;
    if (!verified?.success || verified.hostname !== host) return reply(res, 400, 'verification_failed');
    const crypto = await import('node:crypto');
    const fingerprint = crypto.createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!).update(ip).digest('hex');
    const limited = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/consume_support_quota`, {
      method: 'POST', headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint }),
    });
    if (!limited.ok) return reply(res, 503, 'contact_unavailable');
    if (await limited.json() !== true) return reply(res, 429, 'rate_limited');
    const { category, subject, message, email } = parsed.data;
    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.SUPPORT_FROM_EMAIL, to: ['AlahPandah@gmail.com'], reply_to: email, subject: `[AlahPanda ${category}] ${subject.replace(/[\r\n]/g, ' ')}`, text: `Category: ${category}\nReply-to: ${email}\n\n${message}` }),
    });
    if (!sent.ok) return reply(res, 502, 'delivery_failed');
    res.statusCode = 200; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify({ status: 'sent' }));
  } catch { return reply(res, 503, 'contact_unavailable'); }
}

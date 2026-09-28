import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IncomingMessage, ServerResponse } from 'node:http';
import support from '../../api/support';

const saved = { ...process.env };
afterEach(() => { process.env = { ...saved }; vi.unstubAllGlobals(); });
function request(body: unknown, origin = 'https://preview.example') {
  const req = { method: 'POST', headers: { origin, host: 'preview.example', 'x-forwarded-for': '192.0.2.1' }, body } as unknown as IncomingMessage & { body: unknown };
  const response: { statusCode: number; value?: unknown; headers: Record<string,string> } = { statusCode: 200, headers: {} };
  const res = { setHeader: (name: string, value: string) => { response.headers[name] = value; }, end: (value: string) => { response.value = JSON.parse(value); }, get statusCode() { return response.statusCode; }, set statusCode(value: number) { response.statusCode = value; } } as unknown as ServerResponse;
  return { req, res, response };
}
const payload = { category: 'modpacks', subject: 'An installation issue', email: 'reader@example.org', message: 'A reproducible issue with a clean instance and a log.', website: '', turnstileToken: 'token' };
describe('support endpoint privacy and spam controls', () => {
  it('rejects a foreign or missing origin without calling providers', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    for (const origin of ['https://foreign.example', '']) { const { req, res, response } = request(payload, origin); await support(req, res); expect(response.statusCode).toBe(403); }
    expect(fetch).not.toHaveBeenCalled();
  });
  it('fails closed without server configuration', async () => {
    for (const name of ['RESEND_API_KEY','SUPPORT_FROM_EMAIL','TURNSTILE_SECRET_KEY','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY']) delete process.env[name];
    const { req, res, response } = request(payload); await support(req, res); expect(response.statusCode).toBe(503);
  });
  it('verifies challenge, persistent quota and sends through Resend without exposing credentials', async () => {
    Object.assign(process.env, { RESEND_API_KEY:'secret', SUPPORT_FROM_EMAIL:'Support <support@verified.example>', TURNSTILE_SECRET_KEY:'challenge', SUPABASE_URL:'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY:'private' });
    const fetch = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({success:true,hostname:'preview.example'}), {status:200})).mockResolvedValueOnce(new Response('true', {status:200})).mockResolvedValueOnce(new Response('{}', {status:200}));
    vi.stubGlobal('fetch', fetch);
    const { req, res, response } = request(payload); await support(req, res);
    expect(response).toMatchObject({statusCode:200,value:{status:'sent'}});
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[1][0]).toContain('/rpc/consume_support_quota');
    const mail = JSON.parse(fetch.mock.calls[2][1].body);
    expect(mail.to).toEqual(['AlahPandah@gmail.com']);
    expect(mail.reply_to).toBe('reader@example.org');
    expect(mail.text).not.toContain('secret');
  });
  it('never sends mail for a challenge issued to a different host', async () => {
    Object.assign(process.env, { RESEND_API_KEY:'secret', SUPPORT_FROM_EMAIL:'support@verified.example', TURNSTILE_SECRET_KEY:'challenge', SUPABASE_URL:'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY:'private' });
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, hostname: 'another.example' }), { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    const { req, res, response } = request(payload); await support(req, res);
    expect(response.statusCode).toBe(400); expect(fetch).toHaveBeenCalledTimes(1);
  });
});

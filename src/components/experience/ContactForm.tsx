import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useI18n } from '@/lib/i18n';

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
type Turnstile = { render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void }) => string; reset: (id: string) => void };
declare global { interface Window { turnstile?: Turnstile } }

const copy = {
  en: { title: 'Contact support', intro: 'Share a reproducible issue. Please do not send passwords, private keys or world files.', category: 'Topic', email: 'Your email', subject: 'Subject', message: 'What happened? Include launcher, version and steps if relevant.', send: 'Send message', sent: 'Message sent. We will reply by email when possible.', unavailable: 'The private contact form is not configured yet. Email us directly instead.', failed: 'The message could not be delivered. Try email instead.', privacy: 'Your message and email are used to reply. The anti-spam check processes technical data. See Privacy.', topics: ['Modpacks', 'Launchers', 'Website', 'Community', 'Other'] },
  'pt-PT': { title: 'Contactar o apoio', intro: 'Descreve um problema reproduzível. Não envies passwords, chaves privadas nem ficheiros de mundos.', category: 'Assunto', email: 'O teu email', subject: 'Título', message: 'O que aconteceu? Inclui launcher, versão e passos quando relevante.', send: 'Enviar mensagem', sent: 'Mensagem enviada. Responderemos por email quando possível.', unavailable: 'O formulário privado ainda não está configurado. Contacta-nos por email.', failed: 'Não foi possível entregar a mensagem. Usa o email.', privacy: 'Usamos a mensagem e o email para responder. A verificação antispam processa dados técnicos. Consulta Privacidade.', topics: ['Modpacks', 'Launchers', 'Website', 'Comunidade', 'Outro'] },
  'pt-BR': { title: 'Falar com o suporte', intro: 'Descreva um problema reproduzível. Não envie senhas, chaves privadas ou arquivos dos mundos.', category: 'Assunto', email: 'Seu email', subject: 'Título', message: 'O que aconteceu? Informe launcher, versão e passos quando relevante.', send: 'Enviar mensagem', sent: 'Mensagem enviada. Responderemos por email quando possível.', unavailable: 'O formulário privado ainda não está configurado. Entre em contato por email.', failed: 'Não foi possível entregar a mensagem. Use o email.', privacy: 'Usamos sua mensagem e email para responder. A verificação antispam processa dados técnicos. Veja Privacidade.', topics: ['Modpacks', 'Launchers', 'Website', 'Comunidade', 'Outro'] },
  es: { title: 'Contactar con soporte', intro: 'Describe un problema reproducible. No envíes contraseñas, claves privadas ni archivos de mundos.', category: 'Tema', email: 'Tu correo', subject: 'Asunto', message: '¿Qué ocurrió? Incluye launcher, versión y pasos si corresponde.', send: 'Enviar mensaje', sent: 'Mensaje enviado. Responderemos por correo cuando sea posible.', unavailable: 'El formulario privado aún no está configurado. Escríbenos directamente.', failed: 'No se pudo entregar el mensaje. Utiliza el correo.', privacy: 'Usamos tu mensaje y correo para responder. La verificación antispam procesa datos técnicos. Consulta Privacidad.', topics: ['Modpacks', 'Launchers', 'Sitio web', 'Comunidad', 'Otro'] },
};
const topics = ['modpacks', 'launchers', 'website', 'community', 'other'];

export default function ContactForm() {
  const { locale } = useI18n(); const c = copy[locale as keyof typeof copy] || copy.en;
  const target = useRef<HTMLDivElement>(null); const widget = useRef<string>();
  const [token, setToken] = useState(''); const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  useEffect(() => {
    if (!siteKey || !target.current) return;
    let cancelled = false;
    const render = () => { if (!cancelled && target.current && window.turnstile && !widget.current) widget.current = window.turnstile.render(target.current, { sitekey: siteKey, callback: setToken, 'expired-callback': () => setToken('') }); };
    const script = document.createElement('script'); script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true; script.onload = render; document.head.appendChild(script); render();
    return () => { cancelled = true; script.remove(); };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return;
    const form = event.currentTarget; const data = Object.fromEntries(new FormData(form));
    setStatus('sending');
    try {
      const response = await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, turnstileToken: token }) });
      if (!response.ok) throw new Error('delivery');
      setStatus('sent'); form.reset();
    } catch { setStatus('failed'); window.turnstile?.reset(widget.current || ''); setToken(''); }
  }
  return <section className="experience-content-panel experience-contact"><h2>{c.title}</h2><p>{c.intro}</p>
    {siteKey && <form onSubmit={submit}>
      <label>{c.category}<select name="category" required>{topics.map((value, index) => <option key={value} value={value}>{c.topics[index]}</option>)}</select></label>
      <label>{c.email}<input name="email" type="email" maxLength={254} required autoComplete="email"/></label>
      <label>{c.subject}<input name="subject" minLength={4} maxLength={120} required/></label>
      <label>{c.message}<textarea name="message" minLength={20} maxLength={4000} required rows={6}/></label>
      <label className="experience-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
      <div ref={target}/><button className="experience-button experience-button-primary" disabled={!token || status === 'sending'}>{c.send}</button>
    </form>}
    <p role="status">{status === 'sent' ? c.sent : status === 'failed' ? c.failed : !siteKey ? c.unavailable : ''}</p>
    <p><a href="mailto:AlahPandah@gmail.com">AlahPandah@gmail.com</a> · {c.privacy} <a href="/legal?kind=privacy">Privacy</a></p>
  </section>;
}

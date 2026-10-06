import { Navigate, useSearchParams } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { PageHero } from '@/components/experience/Shared';
import { useI18n } from '@/lib/i18n';
import { publicContactEmail } from '@/content/publicResolver';

type Kind = 'privacy' | 'terms';
const contact = 'AlahPandah@gmail.com';

function Privacy() {
  const configured = publicContactEmail() || contact;
  return <>
    <section><h2>Operator and contact</h2><p>AlahPanda Labs operates this website. For questions about personal data or a request concerning your information, write to <a href={`mailto:${configured}`}>{configured}</a>. This Preview policy describes the implementation currently in the repository; available third party services may differ between Preview and Production.</p></section>
    <section><h2>Data we handle</h2><p>Hosting and security providers may receive IP address, request time, device and browser details and error logs to deliver and protect the site. The optional language and theme preferences are stored in the browser. Modrinth public project data is requested for release details and public downloads/followers; opening external destinations connects your browser to their services.</p><p>The owner CMS uses a server side password, a limited session and private drafts. Public visitors do not need a CMS account. We do not knowingly collect special categories of information through the public site.</p></section>
    <section><h2>Support messages</h2><p>When the support form is enabled, the category, subject, message and your reply email are sent to the operator through an email provider. A Cloudflare Turnstile challenge checks for abuse and processes associated technical data. A keyed fingerprint of your IP is used for a short hourly rate limit; the raw IP is not stored in that table. Please avoid sending passwords or sensitive information. Direct mailto messages are processed by your email provider and ours.</p><p>Messages may be retained as needed to resolve the request or meet applicable obligations. Ask us to remove a message using the contact address, subject to any legitimate need to retain it.</p></section>
    <section><h2>Cookies, analytics and advertising</h2><p>There are currently no Google Analytics or AdSense scripts in the website entry point. Advertising is disabled while the owner configures and verifies a Google certified consent management platform. A simple privacy notice is not a substitute for granular consent. If advertising is introduced, this notice and the consent controls must be updated before dependent scripts load. Essential delivery and security technologies may still operate.</p><p>For visitors in the EEA, UK and Switzerland, any future Google ads must follow Google's current certified CMP and TCF requirements, with choices to accept, reject or manage purposes. The owner must confirm the configuration and documented vendor list before activation. You can also clear browser preferences through browser settings.</p></section>
    <section><h2>Services and transfers</h2><p>Vercel hosts the public frontend; GitHub stores published versioned content; Supabase hosts the protected CMS API and drafts. The support form, if enabled, uses Resend to deliver mail and Cloudflare Turnstile to verify requests. Opening Modrinth, launcher publisher sites, Discord or Ko-fi takes you to independent operators with their own privacy notices. Their processing locations and retention may vary. We do not claim that a particular international transfer mechanism applies without checking the provider configuration.</p></section>
    <section><h2>Your choices and rights</h2><p>Depending on your location and applicable law, you may request access, correction, deletion, restriction, portability or objection and withdraw consent where relevant. Contact us at the address above. EEA, UK and Swiss visitors may also raise a concern with their relevant supervisory authority. We will review requests in their legal context; no absolute compliance claim is made here.</p></section>
    <section><h2>Changes</h2><p>This information was updated on 28 September 2026 for the Preview branch. Material activation of support or advertising requires a further operational and legal review.</p></section>
  </>;
}

function Terms() {
  return <>
    <section><h2>Website and projects</h2><p>AlahPanda Labs presents projects, guides, launchers and editorial updates. Availability, compatibility and releases may change. Use the publisher's official destination for current downloads and check the published version, loader and platform. Back up your worlds and settings before changes.</p></section>
    <section><h2>Accounts and licensing</h2><p>Minecraft: Java Edition and third party services have their own account, license and usage terms. This site does not grant a game license, operate an authentication bypass or represent Mojang Studios or Microsoft. Minecraft names and marks belong to their respective owners. Launcher names, screenshots and logos remain with their respective publishers.</p></section>
    <section><h2>Content and links</h2><p>Original site writing and artwork remain subject to their respective rights. Open source components and linked projects have their own licenses. Links to Modrinth, launcher publishers, Discord, Ko-fi and other sites are provided for convenience; these services control their own downloads, data and terms. Verify a destination before supplying credentials.</p></section>
    <section><h2>Support and contributions</h2><p>Support requests should describe reproducible issues without passwords or sensitive data. Ko-fi contributions are voluntary and handled under Ko-fi's payment terms; they do not purchase a guaranteed feature or response time. Published beta products and internal prototypes have different availability; a development teaser is not a release promise.</p></section>
    <section><h2>Availability and responsibility</h2><p>The site and its information are supplied as available. Information may be incomplete or outdated and does not replace publisher release notes. We cannot promise uninterrupted access or suitability for a particular device. Nothing here excludes rights or remedies that applicable law does not permit us to exclude.</p></section>
    <section><h2>Contact and updates</h2><p>Questions about these terms can be sent to <a href={`mailto:${contact}`}>{contact}</a>. This Preview text was updated on 28 September 2026; legal jurisdiction and operator details require owner review before production publication.</p></section>
  </>;
}

export default function Legal({ kind }: { kind?: Kind }) {
  const { t } = useI18n(); const [params] = useSearchParams();
  const resolved = kind ?? (params.get('kind') === 'terms' ? 'terms' : 'privacy');
  if (!kind) return <Navigate to={'/legal/' + resolved} replace />;
  return <SiteLayout><Seo url={'/legal/' + resolved} title={`${resolved === 'privacy' ? 'Privacy' : 'Terms'} — AlahPanda Labs`} description="Website privacy and terms information"/>
    <PageHero tone="quiet" eyebrow={t('footer.legal')} title={resolved === 'privacy' ? t('footer.privacy') : t('footer.terms')} description={t('ui.legalInformation')}/>
    <article lang="en" className="container experience-detail-body experience-legal experience-reading"><div className="experience-content-panel">{resolved === 'privacy' ? <Privacy/> : <Terms/>}</div></article>
  </SiteLayout>;
}

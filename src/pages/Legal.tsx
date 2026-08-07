import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { site } from '@/content';
import { useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';

type LegalKind = 'privacy' | 'terms';

interface Props {
  kind?: LegalKind;
}

function LegalParagraph({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-zinc-400">{children}</p>;
}

function LegalList({ children }: { children: ReactNode }) {
  return <ul className="mt-3 list-disc space-y-2 pl-6 text-zinc-400">{children}</ul>;
}

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function PrivacyContent({ contactEmail }: { contactEmail: string | null }) {
  return (
    <>
      <LegalSection title="1. Controller Identification">
        <LegalParagraph>
          This website, available at <strong>alahpanda-labs.vercel.app</strong>, is operated by <strong>AlahPanda Labs</strong>
           (“AlahPanda Labs”, “we”, “us”). For data protection purposes, AlahPanda Labs acts as the data controller
          regarding the processing of personal data described in this policy.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Contact</strong>: {contactEmail ? (
            <a className="text-signal hover:underline" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          ) : (
            <strong>placeholder</strong>
          )}
          {contactEmail ? null : (
            <> (a contact environment variable has not been configured; please use the contact channels provided on the website).</>
          )}
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Scope and Legal Framework (Portugal/European Union — GDPR)">
        <LegalParagraph>
          This Privacy Policy applies to the use of the website and describes how we process personal data. Data
          processing is carried out in compliance with <strong>Regulation (EU) 2016/679 (GDPR)</strong> and other applicable legislation in
          <strong> Portugal</strong> and the <strong>European Union</strong>.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="3. Data Collected">
        <LegalParagraph>Depending on your interaction with the website, we may process the following categories of data:</LegalParagraph>
        <LegalList>
          <li><strong>Technical and usage data</strong>: IP address (in certain cases), device/browser identifiers, pages visited, events, and performance metrics.</li>
          <li><strong>Online identifiers</strong>: cookies and advertising identifiers, where applicable (for example, associated with advertising platforms).</li>
        </LegalList>
        <LegalParagraph>
          We do not intend to collect special categories of data. If this occurs via third parties, the provisions of their respective policies shall apply.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. Purposes of Processing">
        <LegalParagraph>We use personal data, in particular, for:</LegalParagraph>
        <LegalList>
          <li><strong>Provision and security</strong> of the website (abuse prevention, maintenance, fault detection).</li>
          <li><strong>Technical operation</strong> and improvement of the user experience.</li>
          <li><strong>Monetization and advertising</strong>, when active, through <strong>Google AdSense</strong>.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="5. Cookies and Web Beacons">
        <LegalParagraph>
          We use <strong>cookies</strong> and similar technologies (including <strong>web beacons/pixels</strong>) to ensure the proper operation of the
          website and, where applicable, for measurement and advertising purposes.
        </LegalParagraph>
        <LegalParagraph>
          Some cookies may be strictly necessary; others depend on your consent when required by applicable law.
          You can manage cookies in your browser settings and/or through the website's consent management options, where available.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="6. Google AdSense and Third Parties (Transparency — AdSense/Third-party)">
        <LegalParagraph>
          The website may be monetized through <strong>Google AdSense</strong>. When AdSense is active, Google and its partners may
          collect and process data (including cookies/identifiers) for ad <strong>display, personalization</strong>, and <strong>measurement</strong>.
        </LegalParagraph>
        <LegalParagraph>
          In particular, Google may use the <strong>DART cookie</strong> to enable serving ads based on your visit to this
          website and/or other websites on the Internet. The use of the DART cookie and other advertising technologies is managed by third parties
          under their respective policies.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Third-party</strong>: AlahPanda Labs does not directly control the processing activities carried out by these third parties. It is recommended to review
          Google's privacy and advertising policies to understand the purposes, data categories, and configuration/opt-out options.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="7. Infrastructure and Third-Party Technologies (Vercel and GitHub API)">
        <LegalParagraph>
          The website is developed with <strong>React</strong> and <strong>Vite</strong> and may rely on third-party services for hosting and delivery
          (for example, <strong>Vercel</strong>). There may also be technical integrations with the <strong>GitHub API</strong> for retrieving information
          and metadata.
        </LegalParagraph>
        <LegalParagraph>
          These providers may act as data processors and handle technical data necessary for service delivery (for example, logs and
          telemetry). Where applicable, international data transfers may occur, under appropriate compliance mechanisms.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="8. Retention">
        <LegalParagraph>
          We retain personal data only for the period necessary for the purposes described, or for the duration required by legal obligations
          and/or for the defense of rights in case of litigation.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="9. Rights of Data Subjects (GDPR)">
        <LegalParagraph>
          Under the GDPR, you may exercise, where applicable, the rights of <strong>access</strong>, <strong>rectification</strong>, <strong>erasure</strong>,
          <strong> restriction</strong>, <strong>objection</strong>, and <strong>data portability</strong>, as well as withdraw consent where processing is based on it.
        </LegalParagraph>
        <LegalParagraph>
          You also have the right to lodge a complaint with the competent supervisory authority under applicable law.
        </LegalParagraph>
      </LegalSection>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <LegalSection title="1. Acceptance of Terms">
        <LegalParagraph>
          By accessing and using the website <strong>alahpanda-labs.vercel.app</strong>, operated by <strong>AlahPanda Labs</strong>, you confirm that you have read,
          understood, and agree to these Terms of Service. If you do not agree, you must discontinue use.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Intellectual Property (Modpacks and Content)">
        <LegalParagraph>
          Unless otherwise stated, website content (including text, design, trademarks, and graphical elements) is protected by
          intellectual property laws. Unauthorized use may constitute a violation of applicable law.
        </LegalParagraph>
        <LegalParagraph>
          In the case of modpacks and technical content, specific third-party licenses may apply (for example, licenses for mods and dependencies).
          Providing links, lists, or compilations does not grant rights beyond those specified in the applicable licenses.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title='3. Disclaimer ("as is")'>
        <LegalParagraph>
          The website is provided on an <strong>“as is”</strong> and <strong>“as available”</strong> basis, without warranties of any kind, express or implied,
          including, without limitation, warranties of continuous availability, absence of errors, or fitness for a particular purpose.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. Limitation of Liability">
        <LegalParagraph>
          To the maximum extent permitted by law, AlahPanda Labs shall not be liable for any indirect, incidental, special, consequential,
          or punitive damages resulting from access to, use of, or inability to use the website, even if advised of the possibility of such damages.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="5. Jurisdiction and Governing Law (Portugal)">
        <LegalParagraph>
          These terms are governed by the laws of <strong>Portugal</strong> and applicable legislation of the <strong>European Union</strong>. For the resolution of disputes,
          jurisdiction belongs to the <strong>court of the residence/headquarters in Portugal</strong>, without prejudice to mandatory consumer rules where applicable.
        </LegalParagraph>
      </LegalSection>
    </>
  );
}

export default function Legal({ kind }: Props) {
  const [searchParams] = useSearchParams();
  const kindFromQuery = searchParams.get('kind');
  const resolvedKind: LegalKind =
    kind ?? (kindFromQuery === 'privacy' || kindFromQuery === 'terms' ? kindFromQuery : 'privacy');

  const isPrivacy = resolvedKind === 'privacy';
  const contactEmail =
    (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ||
    (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined) ||
    site.contactEmail ||
    null;
  return (
    <SiteLayout>
      <Seo
        title={`${isPrivacy ? 'Privacy Policy' : 'Terms of Service'} — AlahPanda Labs`}
        description={
          isPrivacy
            ? 'Privacy Policy (GDPR) and transparency on cookies and third parties (Google AdSense).'
            : 'Terms of Service applicable to the use of the AlahPanda Labs website.'
        }
      />
      <section className="container max-w-3xl py-16">
        <div className="label-mono">07 — Legal</div>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
          {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
        </h1>
        <p className="mt-6 text-muted-foreground">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <article className="mt-10 text-foreground/85">
          {isPrivacy ? <PrivacyContent contactEmail={contactEmail} /> : <TermsContent />}
        </article>
      </section>
    </SiteLayout>
  );
}

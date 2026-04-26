import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';

interface Props { kind: 'privacy' | 'terms' }

export default function Legal({ kind }: Props) {
  const isPrivacy = kind === 'privacy';
  return (
    <SiteLayout>
      <Seo
        title={`${isPrivacy ? 'Privacy' : 'Terms'} — AlahPanda Labs`}
        description={isPrivacy ? 'How we handle your data.' : 'Terms of use for AlahPanda Labs services.'}
      />
      <section className="container max-w-3xl py-16">
        <div className="label-mono">07 — Legal</div>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
          {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
        </h1>
        <p className="mt-6 text-muted-foreground">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <div className="mt-10 space-y-6 text-foreground/85">
          {isPrivacy ? (
            <>
              <p>We do not sell your data. Analytics are anonymized. Email captures are stored only for newsletter delivery.</p>
              <p>Cookies: we use minimal first-party cookies for theme and language preferences. AdSense, when enabled, may set additional cookies — see Google's policy.</p>
              <p>Right to erasure: contact us and we'll remove your data within 30 days.</p>
            </>
          ) : (
            <>
              <p>Modpacks are distributed under their respective mod licenses. Our compositions are free to use; redistribution requires written permission.</p>
              <p>No warranty: software is provided as-is. We're not liable for world corruption — back up your saves.</p>
              <p>Streaming and content creation are explicitly encouraged.</p>
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

import { Link } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { publicGuides } from '@/content/publicResolver';

export default function Guides() {
  const guides = publicGuides();
  return <SiteLayout>
    <Seo title="Guides — AlahPanda Labs" description="Guides from AlahPanda Labs." />
    <section className="container max-w-3xl py-16">
      <div className="label-mono">Guides</div>
      <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">Guides</h1>
      {guides.length ? <div className="mt-12 grid gap-5">{guides.map((guide) => <Link key={guide.slug} to={`/guides/${guide.slug}`} className="glass-card rounded-lg p-5 block hover:border-signal/40"><h2 className="text-xl font-semibold">{guide.name}</h2>{guide.summary && <p className="mt-2 text-sm text-muted-foreground">{guide.summary}</p>}</Link>)}</div> : <p className="mt-10 text-muted-foreground">No guides published yet.</p>}
    </section>
  </SiteLayout>;
}

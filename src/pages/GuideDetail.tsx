import { Link, useParams } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import RichMarkdown from '@/components/RichMarkdown';
import { publicGuide } from '@/content/publicResolver';

export default function GuideDetail() {
  const { slug } = useParams();
  const guide = slug ? publicGuide(slug) : undefined;
  if (!guide) return <SiteLayout><Seo title="Guide not found — AlahPanda Labs" /><section className="container max-w-3xl py-32"><h1 className="text-3xl font-semibold">Guide not found</h1><Link className="mt-6 inline-block text-signal" to="/guides">← Guides</Link></section></SiteLayout>;
  return <SiteLayout><Seo title={`${guide.seo?.title || guide.name} — AlahPanda Labs`} description={guide.seo?.description || guide.summary} image={guide.seo?.image} type="article" />
    <article className="container max-w-3xl py-16"><Link to="/guides" className="text-sm text-signal">← Guides</Link><h1 className="mt-8 text-4xl md:text-5xl font-semibold tracking-tight">{guide.name}</h1>{guide.summary && <p className="mt-4 text-xl text-muted-foreground">{guide.summary}</p>}<div className="mt-10"><RichMarkdown markdown={guide.body || ''} /></div>{guide.steps?.map((step, index) => <section className="mt-8" key={`${index}-${step.title}`}><h2 className="text-xl font-semibold">{step.title}</h2><RichMarkdown markdown={step.body} /></section>)}</article>
  </SiteLayout>;
}

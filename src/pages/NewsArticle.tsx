import { useParams, Link } from 'react-router-dom';
import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import RichMarkdown from '@/components/RichMarkdown';
import SmartImage from '@/components/SmartImage';
import { getArticle } from '@/content';
import { ArrowLeft } from 'lucide-react';

export default function NewsArticle() {
  const { slug } = useParams();
  const article = slug ? getArticle(slug) : undefined;

  if (!article) {
    return (
      <SiteLayout>
        <div className="container py-32 text-center">
          <div className="label-mono">404</div>
          <h1 className="mt-3 text-3xl font-semibold">Article not found</h1>
          <Link to="/news" className="mt-6 inline-flex items-center gap-2 text-signal">
            <ArrowLeft className="h-4 w-4" /> Back to news
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Seo
        title={`${article.title} — AlahPanda Labs`}
        description={article.excerpt}
        image={article.image}
        type="article"
      />
      <article className="container max-w-3xl py-16">
        <Link to="/news" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-signal mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> All entries
        </Link>
        <div className="flex items-center gap-3 label-mono reveal">
          <span>{article.category}</span>
          <span className="hairline border-t flex-1" />
          <time className="tabular">{article.publishedAt}</time>
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight reveal">{article.title}</h1>
        <p className="mt-4 text-xl text-muted-foreground reveal">{article.excerpt}</p>

        {article.image && (
          <div className="mt-8 reveal">
            <SmartImage src={article.image} alt={article.title} aspect="aspect-video" rounded="rounded-lg" />
          </div>
        )}

        <div className="mt-10 reveal">
          <RichMarkdown markdown={article.body} />
        </div>

        <div className="mt-12 pt-6 border-t border-hairline flex items-center justify-between text-sm text-muted-foreground">
          <span>By {article.author}</span>
          <span className="font-mono tabular">{article.readMinutes} min read</span>
        </div>
      </article>
    </SiteLayout>
  );
}

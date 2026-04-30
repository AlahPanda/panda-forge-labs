import Seo from '@/components/Seo';
import NewsCard from '@/components/NewsCard';
import AdSlot from '@/components/AdSlot';
import { publishedArticles } from '@/content';
import { useI18n } from '@/lib/i18n';
import { Fragment } from 'react';

export default function News() {
  const { t } = useI18n();
  const items = publishedArticles();
  return (
    <>
      <Seo title="News — AlahPanda Labs" description="Release notes, engineering posts and announcements." />
      <section className="container py-16">
        <div className="label-mono reveal">04 — Notebook</div>
        <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight reveal">{t('nav.news')}</h1>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((a, idx) => (
            <Fragment key={a.slug}>
              <NewsCard article={a} index={idx} />
              {/* In-feed ad after every 3rd article */}
              {(idx + 1) % 3 === 0 && idx < items.length - 1 && (
                <div className="md:col-span-2 lg:col-span-3">
                  <AdSlot format="in-feed" label="Sponsored" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </section>
    </>
  );
}

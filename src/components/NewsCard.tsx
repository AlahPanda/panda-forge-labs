import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { type Article } from '@/content';
import SmartImage from './SmartImage';

interface Props {
  article: Article;
  index?: number;
}

export default function NewsCard({ article, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0)' }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.08, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ scale: 1.015 }}
    >
      <Link
        to={`/news/${article.slug}`}
        className="group glass-card rounded-lg overflow-hidden block transition-shadow duration-300
                   hover:shadow-[0_0_0_1px_hsl(var(--signal)/0.4),0_24px_48px_-16px_hsl(var(--signal)/0.3)]
                   hover:border-signal/40"
      >
        {/* 16:9 cover */}
        <SmartImage
          src={article.image ?? ''}
          alt={article.title}
          aspect="aspect-video"
          rounded="rounded-none"
        />

        <div className="p-5">
          <div className="flex items-center gap-3 label-mono">
            <span>{article.category}</span>
            <span className="hairline border-t flex-1" />
            <time dateTime={article.publishedAt} className="tabular">
              {article.publishedAt}
            </time>
          </div>
          <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-signal transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{article.author}</span>
            <span className="font-mono tabular shrink-0">{article.readMinutes} min read</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LauncherBackLink({ className }: { className?: string }) {
  return (
    <Link
      to="/launchers"
      className={cn(
        'group/back inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-signal transition-colors',
        className
      )}
    >
      <motion.span
        className="inline-flex"
        initial={false}
        whileHover={{ x: -3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover/back:-translate-x-1" aria-hidden />
      </motion.span>
      <span>Back to launchers</span>
    </Link>
  );
}

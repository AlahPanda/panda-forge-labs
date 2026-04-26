import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const KEY = 'apl.cookie-consent.v1';

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {}
  }, []);

  const decide = (value: 'accept' | 'reject') => {
    try { localStorage.setItem(KEY, value); } catch {}
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 80, opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0)' }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="glass-card rounded-lg p-5 shadow-[0_24px_64px_-24px_hsl(222_47%_4%/0.6)]">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-md bg-signal/15 text-signal inline-flex items-center justify-center shrink-0">
                <Cookie className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="label-mono">Privacy</div>
                <p className="mt-1.5 text-sm text-foreground/85">
                  We use minimal cookies for analytics and to keep ads non-intrusive.
                  Read our <a href="/legal/privacy" className="text-signal underline underline-offset-2">policy</a>.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => decide('accept')}
                    className="inline-flex items-center px-3 h-9 rounded-md bg-signal text-primary-foreground text-sm font-medium hover:bg-signal/90 transition-colors active:scale-[0.97]"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => decide('reject')}
                    className="inline-flex items-center px-3 h-9 rounded-md border border-hairline text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors active:scale-[0.97]"
                  >
                    Reject non-essential
                  </button>
                </div>
              </div>
              <button
                onClick={() => decide('reject')}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

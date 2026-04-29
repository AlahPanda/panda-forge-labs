import { useState } from 'react';
import { Download, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Props {
  downloads: ReadonlyArray<{ label: string; url: string }>;
  buttonLabel?: string;
}

export default function AstralDownloadDialog({
  downloads,
  buttonLabel = 'Download',
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-signal text-primary-foreground font-medium hover:bg-signal/90 transition-colors active:scale-[0.98]"
        >
          <Download className="h-4 w-4 shrink-0" />
          {buttonLabel}
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download AstralRinth</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Choose your platform. Each link opens a new tab (hosted via ouo.io).
        </p>
        <div className="mt-4 space-y-2">
          {downloads.map((d) => (
            <a
              key={d.url}
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="w-full inline-flex items-center justify-between gap-3 px-4 py-3 rounded-md border border-hairline hover:border-signal hover:bg-secondary/40 transition-colors text-left active:scale-[0.99]"
            >
              <span className="font-medium">{d.label}</span>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

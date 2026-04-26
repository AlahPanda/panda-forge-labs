import * as Lucide from 'lucide-react';
import { Sparkles } from 'lucide-react';

export interface Feature {
  title: string;
  description: string;
  icon?: string;
}

export default function FeatureShowcase({ features }: { features: Feature[] }) {
  if (!features.length) {
    return (
      <div className="border border-hairline rounded-lg p-8 bg-elev text-sm text-muted-foreground">
        No feature highlights configured yet.
      </div>
    );
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((f, i) => {
        const Icon = (f.icon && (Lucide as any)[f.icon]) || Sparkles;
        return (
          <div
            key={i}
            className="border border-hairline rounded-lg p-5 bg-elev reveal hover:border-signal/60 transition-colors"
          >
            <div className="flex items-center gap-2 text-signal">
              <Icon className="h-4 w-4" />
              <span className="label-mono">Feature · {String(i + 1).padStart(2, '0')}</span>
            </div>
            <h4 className="mt-3 text-base font-semibold tracking-tight">{f.title}</h4>
            <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
          </div>
        );
      })}
    </div>
  );
}

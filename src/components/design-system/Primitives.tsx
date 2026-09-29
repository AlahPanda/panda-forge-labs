import type { HTMLAttributes, ReactNode } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('container', className)} {...props} />;
}

export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn('border-0 border-t border-hairline', className)} {...props} />;
}

export function SectionHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-4">
    <div>{eyebrow && <p className="label-mono">{eyebrow}</p>}<h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2></div>
    {children}
  </div>;
}

export function EmptyState({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return <div className="rounded-card border border-hairline bg-card px-6 py-12 text-center shadow-card">
    <h2 className="text-lg font-semibold">{title}</h2>
    {description && <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>}
    {children && <div className="mt-5">{children}</div>}
  </div>;
}

export function IconButton({ 'aria-label': label, ...props }: ButtonProps & { 'aria-label': string }) {
  return <Button size="icon" variant="ghost" aria-label={label} {...props} />;
}

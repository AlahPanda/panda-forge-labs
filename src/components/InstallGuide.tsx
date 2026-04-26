import RichMarkdown from './RichMarkdown';

/** Backwards-compatible install guide component, now powered by RichMarkdown. */
export default function InstallGuide({ markdown }: { markdown: string }) {
  if (!markdown?.trim()) {
    return (
      <div className="border border-hairline rounded-lg p-8 bg-elev text-sm text-muted-foreground">
        No installation guide written yet.
      </div>
    );
  }
  return (
    <div className="border border-hairline rounded-lg p-6 md:p-8 bg-elev">
      <RichMarkdown markdown={markdown} />
    </div>
  );
}

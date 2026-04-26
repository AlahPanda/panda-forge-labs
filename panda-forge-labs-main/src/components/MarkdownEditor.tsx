import { useState } from 'react';
import RichMarkdown from './RichMarkdown';
import { Eye, Pencil, Columns2, Info } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  label?: string;
  hint?: string;
}

type Mode = 'write' | 'split' | 'preview';

export default function MarkdownEditor({ value, onChange, rows = 12, label, hint }: Props) {
  const [mode, setMode] = useState<Mode>('split');

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="label-mono">{label}</span>
          <div className="border border-hairline rounded-md p-0.5 bg-elev inline-flex">
            <ModeBtn active={mode === 'write'} onClick={() => setMode('write')} icon={<Pencil className="h-3 w-3" />}>Write</ModeBtn>
            <ModeBtn active={mode === 'split'} onClick={() => setMode('split')} icon={<Columns2 className="h-3 w-3" />}>Split</ModeBtn>
            <ModeBtn active={mode === 'preview'} onClick={() => setMode('preview')} icon={<Eye className="h-3 w-3" />}>Preview</ModeBtn>
          </div>
        </div>
      )}

      <div className={mode === 'split' ? 'grid lg:grid-cols-2 gap-3' : ''}>
        {(mode === 'write' || mode === 'split') && (
          <textarea
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            placeholder="# Heading&#10;&#10;Paragraph with **bold** and `code`.&#10;&#10;> [!INFO] Helpful tip&#10;&#10;[badge:Version:1.20.1]"
            className="w-full px-3 py-2 rounded-md border border-hairline bg-background focus:outline-none focus:border-signal transition-colors text-sm font-mono leading-relaxed"
          />
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div className="rounded-md border border-hairline bg-background p-4 overflow-y-auto" style={{ maxHeight: rows * 24 + 32 }}>
            {value.trim()
              ? <RichMarkdown markdown={value} />
              : <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Preview</div>}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <Info className="h-3 w-3 mt-px shrink-0" />
        <span>
          {hint ?? '## H2  ·  **bold**  ·  `code`  ·  ```fences```  ·  [badge:Label:Value]  ·  > [!INFO] callout  ·  ::: grid 2 ... :::  ·  paste a YouTube URL on its own line.'}
        </span>
      </div>
    </div>
  );
}

function ModeBtn({ active, onClick, icon, children }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 h-7 rounded text-[11px] font-medium uppercase tracking-wider transition-colors ${
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon} {children}
    </button>
  );
}

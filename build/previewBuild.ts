import type { Plugin } from 'vite';

/** Public build identifier: contains no credentials or private drafts. */
export function previewBuildPlugin(): Plugin {
  return {
    name: 'preview-build-identity',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'preview-build.json', source: JSON.stringify({
        branch: process.env.VERCEL_GIT_COMMIT_REF || null,
        sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      }) });
    },
  };
}

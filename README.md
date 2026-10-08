# AlahPanda Labs

A React/Vite hub for Minecraft experiences, modpacks, launchers, news and guides. Public content is Git-first Content V2; private owner drafts and authenticated publication use the existing Supabase Edge Function.

## Development

```sh
npm ci
npm run dev
npm test
npx tsc -p tsconfig.app.json --noEmit
npx tsc -p tsconfig.node.json --noEmit
npx tsc -p tsconfig.edge.json --noEmit
npx tsc -p tsconfig.news.json --noEmit
npm run lint
npm run build
```

The build generates discovery files; do not maintain a second static sitemap/RSS. Vite's local preview serves static assets only: Vercel article function behavior is covered by HTTP integration tests and must also be verified on the deployment before merge.

## Operation

- [Architecture](docs/ARCHITECTURE.md)
- [Owner CMS access and credential rotation](docs/OWNER_CMS_ACCESS.md)
- [Isolated Preview infrastructure](docs/V2_PREVIEW_INFRASTRUCTURE.md)
- [Modrinth automation](docs/V2_MODRINTH_AUTOMATION_AND_LAUNCH.md)
- [Support activation](docs/SUPPORT_OPERATIONS.md)
- [Security procedures](docs/SECURITY_OPERATIONS.md)
- [Monetization gate](docs/MONETIZATION_PREVIEW_GATE.md)
- [Current design system](docs/DESIGN_SYSTEM.md)
- [Repository/news cleanup and HTTP policy](docs/REPOSITORY_NEWS_CLEANUP.md)

Secrets are never committed. Publication, deployment and Production promotion are separate operations; consult the runbooks before changing environments.

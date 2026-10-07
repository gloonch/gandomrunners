# Gandom Runners

The gandomrunners.com landing page: a coach-led running community in Tehran. Built with Next.js from the Claude Design canvas in `design/`.

```bash
npm install
npm run dev
```

## Layout

- `app/` — the page, the root layout (Archivo + Vazirmatn through `next/font`) and the page styles
- `components/landing/` — the page sections: Nav, Hero, About, Coach, Schedule, FinalCta
- `components/ds/` — the design system components the page uses: `RouteWordMap`, `Button`, `Icon`, `Eyebrow`
- `lib/route.ts` — the RouteWordMap engine: route alphabet, GPS wobble, route layout, abstract city
- `lib/content.ts` — the copy and the class list
- `styles/` — design system tokens and component styles, copied from `design/ds/gandomrunners/`
- `design/` — the source canvas (`Main.dc.html`), the design system bundle and the original images, kept as reference

## Deploy

The site runs on `root@37.152.182.49` (ArvanCloud, Ubuntu 26.04): nginx on port 80 in front of the Next.js server on `127.0.0.1:3000`, run by the `gandomrunners` systemd service from `/srv/gandomrunners/app`. The server can't reach npm, so the site is built here as a self-contained `.next/standalone` and copied over.

```bash
deploy/deploy.sh
```

`deploy/setup-server.sh` is the one-time setup (apt via the ArvanCloud mirror, Node.js, nginx, the service). It needs your SSH key on the server.

## Still to fill in

- The Instagram DM link: every "Message" CTA points at `MESSAGE_HREF` in `lib/content.ts`, which is `#contact` for now.
- Real class days and times: the schedule shows "To be announced".

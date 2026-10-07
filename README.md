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

## Still to fill in

- The Instagram DM link: every "Message" CTA points at `MESSAGE_HREF` in `lib/content.ts`, which is `#contact` for now.
- Real class days and times: the schedule shows "To be announced".

# pratyush.dev

Personal portfolio of Pratyush Rastogi. Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, Motion.

## Run it

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env` and fill it in. `GITHUB_TOKEN` powers the contribution graph (the section hides without it); the `ADMIN_*` and `SUPABASE_*` values power `/admin` and the design gallery.

## Where things live

- `src/config/*.ts`: all page content (hero, projects, experience, stack, socials, section order and flags in `site.ts`).
- `src/lib/site.ts`: name, links, email, resume and calendar URLs.
- `src/app/(site)`: public pages. `src/app/admin`: the design gallery admin panel.
- `src/proxy.ts`: admin session gate and API rate limiting.

## Credits

Layout and components are adapted from [AdityaKodez/adityaojha](https://github.com/AdityaKodez/adityaojha), used under the MIT License (see `LICENSE-akoder`).

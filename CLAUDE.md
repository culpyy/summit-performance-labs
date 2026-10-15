# summit-performance-lab

Site for Summit Performance Lab, tactical strength and conditioning for law enforcement,
fire/EMS and military.

**The brand is singular: "Lab", not "Labs".** The repo and the GitHub remote are named
`summit-performance-labs`, which is wrong and stuck. Never let the plural reach visible copy.

## Audience is tactical only

LE, fire/EMS and military. Not general fitness, not gen-pop gym members, not athletes. Copy,
imagery and program framing should all read to someone who wears a duty belt or turnout gear.

## It deploys to two places at once

- **Vercel** at https://summitperformancelab.vercel.app (live, the one that matters)
- **GitHub Pages** at https://culpyy.github.io/summit-performance-labs/, legacy build from
  `main` at `/`

Both publish from `main`, so one push updates both and they can drift apart if either is
reconfigured. There is no CI, no staging, and no build step.

## Supabase is NOT wired up

`js/supabase-client.js` still holds `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_KEY`
placeholders. The code guards on this (`SUPABASE_CONFIGURED`), so the site runs on static
fallback content and the admin panel is inert.

`supabase/schema.sql` defines `coaches`, `programs`, `workshops`, and
`team_training_inquiries`, with RLS policies. Nothing is live until a real project is created
and those two constants are filled in.

## Stack

Hand-written static HTML, CSS and vanilla JS. No framework, no bundler, no package.json.

- Pages: `index`, `programs`, `coaches`, `team-training`, `contact`, `admin/index.html`
- `js/` has one file per page plus `js/admin/` for the dashboard
- `css/styles.css` public, `css/admin.css` admin
- `assets/img/` holds the photography (firefighter hero, warehouse, ropes, corridor)

## Rules

**No em dashes** in site copy.

**This site keeps its own look.** Not a recolor of any other client site. Check the site look
registry before any redesign.

**Design bar: real imagery and editorial layout.** The existing photos are the strongest thing
here. No icon-and-card grids, no cutesy badges.

# HomeLedger — Household Budget Site

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/brisk-lynx-39/best-household-budget-site/rank.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/brisk-lynx-39/best-household-budget-site/reward.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)

HomeLedger is a household budget site that runs entirely offline from static
files. It follows a fictional household — Maya and Daniel Rivera, with two
kids in Maplewood — through three months of real books: income, spending,
category budgets, a 50/30/20 plan and savings goals.

## What it does

- **Dashboard** — income, spending, savings and money left for the month, a
  spending-by-category donut, budgets to watch, recent transactions, savings
  goals, and a quick-add expense form.
- **Transactions** — the full books for the month: search, filter by
  category, add, edit, delete, and export the month as CSV.
- **Budget** — a monthly limit per category with progress bars; limits are
  editable in place and can be reset to the suggested amounts.
- **50/30/20 Planner** — sliders for needs, wants and savings against monthly
  income, compared with what the household actually spent, and one click
  applies the plan to the category budgets.
- **Goals** — savings goals with progress bars; add money to a goal, remove
  one, or start a new one.
- **Reports** — a three-month spending trend, the month's category breakdown,
  the biggest single expenses, and insights computed from the books.

Month navigation works across September, October and November 2026. All data
is seeded in `app/data.js` and edits are saved in the browser's localStorage —
nothing is sent over the network, and the site makes zero network requests.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

or open `app/index.html` directly. No build step, no dependencies.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored `vendor/makefun-frontend.ts` library.

## License

MIT — see [LICENSE](LICENSE).

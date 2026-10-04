# Khurak (ਖੁਰਾਕ) – food tracker

A simple phone app (PWA) to log what you eat — Punjabi food first, plus other cuisines — and see calories, protein, carbs, fat, fiber and 10 vitamins & minerals for the day.

## How portions work
Every dish is a recipe made of raw ingredients (per 100 g values in `foods.js`). When you log a food you pick:
- **Home-made / Dhaba** – one-tap presets
- **Size** – small / medium / large (or katori, glass, plate…)
- **Ghee / oil / butter / sugar** – the part that changes the most between kitchens
- **Fine-tune %** – make it match your real portion
- **Save as my food** – e.g. "Mom's aloo paratha", so next time it's one tap

## Put it on your phone
1. Create a new GitHub repo and upload all these files (keep the `icons` folder).
2. Repo **Settings → Pages → Deploy from branch → main / root → Save**.
3. Open `https://<your-username>.github.io/<repo-name>/` on your phone.
4. Android Chrome: menu → **Add to Home screen / Install app**. iPhone Safari: Share → **Add to Home Screen**.

## Your data
Everything is saved on your phone only (browser storage). Use **Settings → Export backup** regularly, especially on iPhone.

## Adding or fixing foods
- New ingredient: add a line to `INGREDIENTS` in `foods.js` (15 numbers per 100 g, order is written at the top of the file).
- New dish: add an entry to `DISHES` with its raw ingredient grams for one serving.
- After any change, bump `CACHE = "khurak-v1"` → `"khurak-v2"` in `sw.js` so phones get the update.

Values are approximate (USDA FoodData Central + typical IFCT 2017 figures). Treat them as a guide.

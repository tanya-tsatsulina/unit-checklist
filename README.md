# Unit checklist 🏠

A tiny single-page app to check an apartment's inventory when tenants change.
Tap an item when it's in place and undamaged — it fades out. Tap again (or "Undo") to bring it back.
"Check" shows what's still missing. RU by default, EN on the toggle.

No build step, no dependencies: plain HTML + CSS + JS (~15 KB in total).

## Files

| File | What |
|---|---|
| `index.html` | page markup |
| `styles.css` | styles (mobile first, dark mode, safe areas for notches) |
| `app.js` | logic: toggling, undo, progress, language, result dialog |
| `inventory.js` | **the data** — apartments and their items |

## Editing the inventory

Open `inventory.js` and add items or apartments. Each apartment has an `id`; open it with
`…/#<id>` (e.g. `#apt-1`) — useful for a QR code per apartment. With 2+ apartments a
selector appears in the header.

Progress is saved in the browser (`localStorage`) per apartment, so a reload doesn't lose marks.
"New tenant" clears them.

## Pictures

Items use emoji for now. To use a photo, put it in `img/` and add `img: "img/kettle.webp"` to the item.
Keep pictures small for mobile networks — square, 256–384 px, WebP, ~10–25 KB each:

```sh
# macOS: brew install webp
cwebp -q 70 -resize 384 384 kettle.jpg -o img/kettle.webp
```

Pictures are lazy-loaded.

## Run locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

(Opening `index.html` directly from disk also works.)

## Publish on GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → `main` / root. The site will be at
`https://<user>.github.io/<repo>/`.

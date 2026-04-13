# Pinyin Gobang

Prototype for a printable and playable pinyin gobang website.

## Scope

- Landing page with feature overview
- Generator form for custom board configuration
- Live SVG board preview in a printable poster layout

## Run

Open `public/index.html` directly in a browser, or serve the `public/` directory with any static server.

Example:

```bash
cd /Users/hanwang/Desktop/wanghan/Workspace/pinyin-gobang
python3 -m http.server 4173 -d public
```

## Cloudflare Pages

This project is configured for the Cloudflare Pages project `pinyin-gobang`.

Local preview with Wrangler:

```bash
cd /Users/hanwang/Desktop/wanghan/Workspace/pinyin-gobang
npm install
npm run cf:dev
```

Deploy:

```bash
cd /Users/hanwang/Desktop/wanghan/Workspace/pinyin-gobang
npm install
npm run deploy
```

Suggested Pages settings:

- Framework preset: `None`
- Build command: empty
- Build output directory: `public`

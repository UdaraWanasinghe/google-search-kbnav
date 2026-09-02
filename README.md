# Google Search Keyboard Navigator

A small Chrome extension (Manifest V3) that lets you navigate and open Google
search results entirely from the keyboard.

## Shortcuts

| Key            | Action                        |
|----------------|--------------------------------|
| `j` / `s` / `↓` | Move to next result           |
| `k` / `a` / `↑` | Move to previous result       |
| `Enter`        | Open the selected result       |
| `o`            | Open the selected result in a new tab |
| `1`–`9`        | Jump straight to result N      |
| `/`            | Focus the Google search box    |
| `Esc`          | Clear the current selection    |
| `?`            | Toggle a small help panel      |

Shortcuts are automatically disabled while you're typing in a text field
(e.g. the search box) so they never interfere with normal typing — press
`Esc` to leave the search box if a shortcut key is needed while focused there.

## Install (load unpacked)

1. Install [Bun](https://bun.com/) and run `bun install`.
2. Run `bun run build`.
3. Open Chrome and go to `chrome://extensions`.
4. Turn on **Developer mode** (top-right toggle).
5. Click **Load unpacked** and select the generated `dist` folder.
6. Run a search on Google — the extension activates automatically on
   `google.com/search` (and several other Google country domains listed in
   `manifest.json`).

## Development and release

- `bun run typecheck` checks the TypeScript source.
- `bun run build` compiles `src/content.ts` with `tsc`, removes only comments,
  whitespace, and newlines with Terser (without compression or name mangling), then
  assembles a loadable extension in `dist`.
- `bun run package` builds the extension and creates a versioned Chrome Web
  Store upload at `release/google-search-kbnav-v<version>.zip`.

## Notes / customization

- If you search on a Google domain that isn't already listed in
  `manifest.json`, add a line like
  `"*://www.google.<tld>/search*"` to the `matches` array and reload the
  extension.
- Google occasionally changes the internal CSS class names of its result
  blocks. `src/content.ts` checks a handful of known selectors
  (`.MjjYud`, `.g`, `.tF2Cxc`, etc.) and validates each candidate by
  confirming it wraps a title and a link, which makes it fairly resilient —
  but if results ever stop highlighting, that selector list (near the top of
  `src/content.ts`) is the first place to look.
- No permissions beyond running on Google search pages are requested — the
  extension doesn't read or send any of your data anywhere.

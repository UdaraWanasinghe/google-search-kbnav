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

1. Unzip this folder somewhere on your computer.
2. Open Chrome and go to `chrome://extensions`.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the unzipped `google-search-kbnav` folder.
5. Run a search on Google — the extension activates automatically on
   `google.com/search` (and several other Google country domains listed in
   `manifest.json`).

## Notes / customization

- If you search on a Google domain that isn't already listed in
  `manifest.json`, add a line like
  `"*://www.google.<tld>/search*"` to the `matches` array and reload the
  extension.
- Google occasionally changes the internal CSS class names of its result
  blocks. `content.js` checks a handful of known selectors
  (`.MjjYud`, `.g`, `.tF2Cxc`, etc.) and validates each candidate by
  confirming it wraps a title and a link, which makes it fairly resilient —
  but if results ever stop highlighting, that selector list (near the top of
  `content.js`) is the first place to look.
- No permissions beyond running on Google search pages are requested — the
  extension doesn't read or send any of your data anywhere.

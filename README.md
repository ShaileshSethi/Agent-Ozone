# Agent Ozone

Shailesh Sethi's personal animation portfolio. A static website with a 19-film library, character and environment galleries, a responsive cinema player, animated Codex illustration and warm studio lighting toggle. Instagram links point to @shaileshtunes and @agent_ozy.

The background combines drifting colour glows, a local canvas star field, occasional shooting stars and a pointer glow. The canvas pauses when the tab is hidden and becomes static for reduced-motion preferences.

## Preview locally

Run from this folder with Python installed.

```powershell
python -m http.server 4318 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4318 in your browser.

The site needs no package installation or API keys. Videos load only when selected. Filters and search work in the browser. Dialogs support Escape and return focus to the control that opened them. Motion follows the system reduced-motion preference.

## Content

- `dist/library.json` lists films, titles, categories, durations and media paths.
- `dist/media/videos/` holds the finished MP4s.
- `dist/media/posters/` holds video thumbnails.
- `dist/media/art/` holds selected character and room art.
- `dist/index.html`, `styles.css` and `app.js` are the editable website.

The media collection includes every unique root-level finished video plus the two original pilots. Byte-identical copies share one listing. Earlier cuts appear under Experiments. The room and character sheets include generated visual-development concepts, while the films use the original rendered scenes.

`prepare-media.py` refreshes media from the parent animation workspace. It requires the project’s imageio-ffmpeg Python dependency. `verify-site.py` checks the library, asset references, complete root-video coverage and deployment file types.

Sites identity is recorded in `.openai/hosting.json`. Repository upload credentials are supplied through the publishing helper's hidden stdin and are never saved in this project.

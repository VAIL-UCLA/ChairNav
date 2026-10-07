# ChairNav reference implementation

Reference snapshot: 2026-10-07, after the meeting redesign and autoplay review.

## Accepted structure

- Fullscreen navigation montage (1 → 4 → 9), overlaid title and linked authors.
- Hardware tour with component diagram and short selected-component description.
- The hardware tour plays once, then returns to its first frame and pauses with the platform overview selected. Re-entering the panel or pressing Play starts it again.
- Paper overview with three clickable stages; methods open in a dialog.
- Long-horizon navigation with an alternate montage tab and optional comparisons/challenging cases.
- Citation placeholder pending a real arXiv identifier.

Ordinary scrolling does not traverse method detail. It remains continuous, with gentle native proximity snapping to center viewport-sized panels, an optional next-panel button and collapsible navigation. Oversized panels align at the top and remain freely scrollable. Training-mask and deployment-reprojection canvas animations autoplay when visible, restart on mode changes, and pause when hidden; manual pause and scrubbing are respected.

## Files in the combined delivery

The skill is at `skills/research-demo-showcase/`; the static website is a sibling `site/` directory two levels above the skill folder.

- `site/index.html`: full standalone document, metadata, lab/author links and dialog shells.
- `site/story.js`: stage content, overview hotspots, playback groups, comparisons and navigation.
- `site/story.css`: narrative layout, media-first opening, dialogs and responsive behavior.
- `site/showcase.js`: hardware diagram, component timing and projection controls.
- `site/projection-view.js`: calibrated projection animation rendering.
- `site/data.json`: public media manifest.
- `site/showcase-pairs.json`: comparison timing offsets and control-state intervals.
- `site/assets/`: silent MP4s, posters, figures, geometry and licensed fonts.

See the [opening](hero-reference.png), [method overview](method-reference.jpg), and [method detail](method-detail-reference.png). These screenshots are reference views, not editable substitutes for the site. The design-token CSS is a small reusable starting asset. Do not clone private source paths or dataset notes into a new project.

## Reuse boundaries

Typography/layout evolved from the Nerfies template; the delivered site retains its CC BY-SA 4.0 credit. Keep applicable notices if reusing implementation. The skill’s existence does not grant rights to wheelchair footage, paper figures, lab branding, faces, or third-party assets. Use the next project’s authorized content.

The website and skill are packaged together in the repository; only `site/` is published by the bundled Pages workflow. This is a normal reusable Codex skill, not a registered artifact-template gallery item.

# Visual system

The accepted ChairNav direction combines a large video opening with a quiet research-page structure. “Waymo-like” describes the perceived clarity and emphasis on real-world operation; do not copy Waymo’s logos, brand assets, or imply affiliation.

## Hierarchy and spacing

- One dominant demonstration per view. Keep text outside the region needed to judge behavior.
- Project title around 48–82 px on desktop, responsive to available space; section titles roughly 27–36 px. These are starting ranges.
- Body descriptions around 15–18 px. Secondary controls and credits around 12–14 px; do not use tiny text to fit a paragraph into a card.
- Desktop content width around 1180 px with 24–40 px side gutters. Use 18–24 px gutters on mobile.
- Let sections grow beyond the viewport when needed. Screen-centered composition must not clip content.
- Use modest 12–16 px corner radii for media/cards and thin neutral dividers. Shadows are useful for the title overlay or modal only; avoid making every panel float.

## ChairNav palette

These colors are reference choices, not arbitrary labels for other papers.

| Role | Foreground | Pale surface |
|---|---|---|
| Neutral | #24292E | #FFFFFF |
| Secondary text | #505C65 | #F7F8FA |
| Pre-training label | #396B99 | #EFF5FB |
| Mid-training label | #466F42 | #F0F6F0 |
| Post-training label | #925831 | #FBF3EC |
| Autonomous state | #176D45 | — |
| Human intervention | #AD343C | — |

Use only two neutral page surfaces: white and the same light gray for hardware/results. Keep detail dialogs white. Use stage colors for selected tabs, compact labels, outlines and diagrams rather than full-screen colored washes; the videos already carry their own stage backgrounds. Regular text remains dark. State words/icons accompany red and green so color is not the only signal.

## Key compositions

**Opening.** A demonstration fills the screen. Introduce the title after the viewer has a moment to recognize the task; the existing opening uses a roughly two-second visual lead. A white/translucent card separates title and linked authors from changing footage. Lab logo occupies a small corner. Retain a subtle pause control. On portrait screens preserve the complete 16:9 result montage; a blurred poster can fill unused background area without cropping the evidence.

**Hardware.** On wide screens use video, an interactive connection diagram, then one selected component explanation. Highlight the same component in diagram and text. Stack these on mobile. The source video remains a real recording; diagram signal animation is explanatory.

**Method.** Show one intact overview. Overlay proportional hotspots on the actual stage boundaries rather than drawing a disconnected second diagram. On hover/focus, dim/soften the base figure and retain a sharp crop for the selected area. A short “Click for more” cue is sufficient; no paragraphs are required here.

**Results.** Let viewers switch between one sustained route and more settings. Put policy comparisons and difficult examples behind explicit links. Keep any metric or limitation necessary to interpret a result with that result; hide procedural detail rather than scientific context.

## Motion

Use short focus transitions (roughly 200–300 ms) and a slower first title entrance (roughly 600–900 ms). Respect reduced-motion preferences by removing decorative movement. Avoid forced camera motion, scroll locking, endless pulsing, or animated text that competes with driving evidence.

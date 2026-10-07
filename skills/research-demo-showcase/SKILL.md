---
name: research-demo-showcase
description: Build or refine a video-first research project website with a cinematic results opening, sparse narrative panels, interactive method overviews, and optional technical details. Use when reproducing the ChairNav showcase style or creating a similarly focused research demo; not for paper editing or generic application dashboards.
---

# Research Demo Showcase

Make the research understandable through observed behavior before explaining its machinery. Distill the ChairNav site’s visual and interaction system, rather than copying its claims or media. This is an original research-site pattern, not a Waymo template or affiliation.

## Start from the evidence

Read the current project description, approved claims, and available media. Identify one primary result and the minimum context needed to interpret it. Preserve distinctions between human control, autonomous execution, predictions, simulations, and illustrations. Do not invent metrics, synchronization, trajectories, or authorship to improve the presentation.

Keep the main scrolling story short. A useful starting sequence is:

1. Results-led opening: a full-bleed demonstration, then project title and authors.
2. The system or platform, if seeing the physical setup helps the audience.
3. One method overview that serves as an index into optional details.
4. Sustained results, with comparison and challenging cases available on demand.
5. Paper links and citation.

This is a configurable narrative, not a mandatory five-section template. Prefer the user’s accepted order. Avoid turning a research page into either a long paper transcript or a grid of equal-weight cards.

## Visual decisions

Read [the visual system](references/visual-system.md) when designing layouts. The bundled [design tokens](assets/design-tokens.css) provide a small starting palette, not a complete stylesheet.

Give each screen one dominant visual and one short heading. Use whitespace and scale to establish hierarchy. Use white and a consistent neutral light gray for page surfaces. Keep stage-specific tints to labels, selected controls and outlines; retain dark, readable text. Keep paper identity, authors, and lab affiliation visible and linked without competing with the experiment.

Show the result first. A 1 → 4 → 9 montage can communicate variety when nine real examples exist; it is optional. Do not fabricate diversity, crop away important behavior, or obscure evidence with the title. A translucent white title card is one solution for moving backgrounds. Keep the full montage visible on narrow screens.

Use motion to explain focus or continuity: a brief title entrance, a highlighted method stage, or a transition between related views. Keep scrolling continuous unless the user requests snapping. Never require repeated wheel gestures to unlock content.

## Interaction decisions

Read [the playback and disclosure contract](references/interaction-contract.md) before implementing video or detail panels.

Keep technical stages out of the default scroll path. Let the overview reveal them through accessible hotspots: highlight the hovered/focused region, soften inactive regions, and open details with an explicit back/close path. Touch and keyboard interaction must work without hover.

Start muted inline videos when their content becomes visible, including when a tab or disclosure opens. Pause offscreen videos and hidden tabs. Synchronized comparisons form one playback group; independent visible examples may play together. Preserve manual pause while the current view stays unchanged. Provide a small Play fallback if the browser blocks autoplay, rather than hiding all controls.

## Delivery and verification

Preserve the project’s framework and chosen host. An independent static project site can be linked from a lab’s Jekyll page without adopting the lab’s layout or replacing its workflow. Use relative asset paths so GitHub project subpaths work. Confirm a real public URL before adding canonical/share URLs.

Check the actual rendered site, not just source attributes: opening, every stage/tab, nested disclosures, paired playback, modal close, offscreen pause, and a narrow viewport. Verify visible videos progress, inactive videos pause, and trajectories/labels remain legible. Document browser coverage and any untested environments rather than guaranteeing autoplay on every device.

Package only the intended site and reusable skill. Exclude private machine paths, credentials, internal review notes, and raw logs from the public site. Preserve template/font licenses and required attribution; reuse of the design does not license research media or lab branding.

For the concrete ChairNav reference and file map, read [implementation notes](references/chairnav-reference.md). A later project should bring its own footage, figures, links, and claims.

# Playback and disclosure contract

## Visibility-controlled media

A video’s HTML `autoplay` attribute is neither the requirement nor proof of success. The requirement is actual playback when its view becomes visible.

- Set `muted` and `playsinline` before playback. Load the active view, not every hidden video.
- Determine visibility inside the current scroll container or open dialog. Exclude `hidden` sections and closed `details`. An example threshold is 45% of the visible video height.
- Re-evaluate on scroll, resize, tab changes, disclosure toggles, modal open/close, image layout changes, and document visibility changes.
- Include videos inside nested disclosures in the registry. They remain paused until the disclosure is open and the video is actually visible.
- Visible side-by-side independent examples may play concurrently. Their `play` listeners must not immediately pause one another.
- Matched comparison clips use one controller and recorded offsets. Preserve the common reference, actual playback speeds, and independent control-state labels. Do not align by guessed equal timestamps.
- Cancel stale asynchronous load/seek/play requests with a generation token. A video whose modal has closed must not begin playing later when loading finishes.
- Keep the active group stable while visibility is unchanged, so scrolling slightly does not cancel a deliberate manual pause.
- Pause all media on backgrounding the document. Resume the visible group on return, according to the chosen user-pause policy.
- Keep Play, Replay, and Full screen small but accessible. Browser autoplay restrictions can still require a click. Test the fallback.
- A separate full-film media link can use the browser’s native player. Do not claim its autoplay behavior was verified merely because inline playback works.

The interactive projection canvas is a separate explanatory animation, not a video. Wire its visibility lifecycle separately when autoplay is requested; a video registry will not start it. ChairNav autoplays the canvas on visible entry and mode switches, pauses on hide/close, and keeps manual pause or scrubbing until the viewer resumes or selects a new mode. Guard pending loads against late playback after the dialog closes.

## Method and evidence dialogs

Use native dialog semantics or an equivalent accessible implementation. Opening a stage pauses the page video and starts the selected visible stage. Closing restores the scroll position and trigger focus; background video may resume. Escape and visible back/close controls work. Hidden stages neither play nor accept focus.

All overview hotspots must be buttons, accessible to touch and keyboard. Match normalized coordinates to the figure’s true aspect ratio. Include a visible hint and full-figure link. Never make a floating hover cue the only way to discover detail.

## Verification checklist

Record actual `paused`, `currentTime`, `readyState`, and muted state through browser inspection while operating the UI. Check time progresses, not just that a Play promise resolved.

Cover every embedded video, including collapsed comparison recordings. Check inactive players after changing views. For synchronized pairs inspect the common-clock offset. Check a narrow layout for lost controls or offscreen videos. Keep a screenshot and concise evidence report with the deliverable; note which browser/device coverage was actually exercised.

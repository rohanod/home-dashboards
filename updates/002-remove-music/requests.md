# Requests

## Initial prompt
- "Actually, no music": drop the Sonos now-playing feature added in `001-initial-implementation` (follow-ups 10–12): the now-playing bar, blurred artwork backdrop, speaker controls, and the Sonos proxy.
- Context when this came in: the user had just asked for transport controls (play/pause, back/forward, scrubbing) on the speaker; that request is dropped too.
- This also supersedes the earlier read-only-display exception discussed for those controls; the display is read-only again.

## Follow-up 1
- Do all testing locally; the user is away from home and the Pi cannot be reached.
- Make sure the actual dashboard is in this folder and on GitHub (see `003-github-repo`).

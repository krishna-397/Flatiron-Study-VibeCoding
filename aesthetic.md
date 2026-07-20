# Aesthetic Definition — "Pen & Ink Plate"

*The Flatiron: An Exploding History — Krishna, Columbia GSAPP MSCDP, Methods as Practices, 2026*

## The aesthetic

The site imitates a dense pen-and-ink architectural illustration — the kind of hand-hatched Flatiron drawing found in monographs and print portfolios — mounted as a single plate on warm paper. The style reference is [Mohak Katvi's ink illustration of the Flatiron](https://www.behance.net/gallery/107560133/Detailed-illustration-of-Flatiron-building-Newyork): dark, heavily hatched facades; light window slits; a blunted prow; a heavy crown; slender tower proportions. On the [Aesthetics Wiki](https://aesthetics.fandom.com/wiki/Aesthetics_Wiki) spectrum this sits closest to vintage print/illustration aesthetics rather than anything screen-native: the screen pretends to be a scanned page.

## Color

Strictly monochrome — two tokens and their tints:

| Token | Hex | Role |
|---|---|---|
| paper | `#f7f5ef` | background, window slits, hatching highlights |
| ink | `#14110d` | all linework, text, and the pennant |

The three facade tones (`#2b2620`, `#231f19`, `#1a1613`) are tints of ink faking a light source from the right; window glass (`#ddd6c6`) and cut top surfaces (`#efece3`) are tints of paper. No accent color anywhere: hierarchy must come from contrast, weight, and spacing alone.

## Texture

The hand-drawn quality is procedural: a seeded random generator jitters window positions, varies stroke opacity, and lays ~26 semi-transparent vertical pen strokes over every dark face (the hatching). The seed is fixed, so the "hand wobble" is identical on every load — a drawing, not a dice roll.

## Typography

One font for everything: the system monospace stack (`ui-monospace, Cascadia Mono, Consolas, Menlo`), used from the title block down to the history cards — annotation lettering on a plate. Hierarchy through size and letter-spacing only.

## Composition & information design

- The page opens blank: only the title, centered on paper. Scrolling fades the title away and the drawing in — then the disassembly begins. One continuous scroll performs the whole sequence.
- The drawing is pinned center-page, drawn at true tower proportions (plan ~44 units wide against ~514 tall); scroll disassembles it roof-first.
- Components slide out to **the edges of the page**, four per side, and each component's **history card** fades in inboard beside it once the piece has cleared the text zone — association by proximity and alignment, no connector lines. Cards on the left are right-aligned so text always faces its piece.
- As the pieces depart, a **ghost of the assembled building** fades in at the center: stroke-only, with a heavy silhouette line and light internal linework (floors, prow edges, component seams) — the memory of the whole holding the page together while its parts are read.
- Information is metered by scroll: eight short stories (the wedge site, "23 skidoo," the cowcatcher, "Burnham's Folly," the 6.5-foot prow, the terracotta skin, Stieglitz & Steichen, the 1905 penthouse) appear one at a time, so the building's history is literally read out of its parts.
- Minimal chrome: a title block, a scroll hint, a colophon. No boxes, borders, or shadows beyond 1px ink rules.

## Interaction design

Scroll drives the main sequence — ten screens of scroll height perform: title on blank paper, fade-in of the drawing, a smoothstep-eased explosion with staggered starts (top piece first, the way an exploded axon reads), a held fully-exploded state, then **reassembly** — the building is put back together before the colophon.

During the held exploded state the page becomes an exhibit:

- **Hover focus** — hovering a component or its text brings it to full ink and drops everything else to near-ghost weight.
- **Click deep-dive** — clicking a component opens a side panel with an extended history and, for three components, period photographs (Steichen 1904, Stieglitz 1903, and a 1901–02 construction photograph; all public domain via Wikimedia Commons / Library of Congress, displayed in grayscale to stay in the ink family).
- A **self-drawing "285 FT" dimension line** completes beside the ghost as the explosion finishes — plate annotation as animation.
- **Wind lines** curl continuously around the prow of the base once it lands: the "23 skidoo" story drawn, not just told.
- An **elevator progress rail** at the screen edge replaces the scroll bar conceptually: a small car descends from FL 22 to G as you travel down the page — a nod to the building's famous Otis hydraulic elevators.

## Texture, extended

Linework is kept crisp and straight-edged — a drafted plate rather than a freehand sketch. The "scanned paper" illusion comes from a fixed-position **paper-grain overlay** (procedural fractal noise, 5% opacity) over the whole page, and from the seeded jitter in the solid pieces' window placement. The ghost carries the full window grid of the building as hairline outlines, so the disassembled center still reads as the complete facade.

## Construction

No images, no libraries. `script.js` generates the entire drawing at load: a four-point plan (triangle with a blunted prow, so three faces are visible — prow plus two sides, matching the classic view) is projected into axonometric coordinates and extruded into eight prisms with parametric windows, floor lines, dentils, and a flagpole. History cards are HTML embedded in the SVG via `foreignObject` so text wraps naturally.

## AI use disclosure

Built through AI-assisted coding ("vibe coding") with Claude, per the CDW AI Assisted Coding tutorial: aesthetic direction (including the ink-drawing reference image), component breakdown, and iterative visual feedback by me; code generation and debugging by the AI in response to my prompts and screenshots. See the repo's commit history for the iteration record.

---
name: CareerAI
description: AI-powered job application assistant — resume to offer in one place
colors:
  catalyst: "#0EA5A0"
  catalyst-deep: "#0c9490"
  catalyst-mist: "#E1F5EE"
  launch-white: "#F8F7F4"
  surface: "#FFFFFF"
  surface-secondary: "#F1F0ED"
  ink: "#1a1a1a"
  ink-secondary: "#6b6b6b"
  ink-tertiary: "#9b9b9b"
  border-default: "rgba(0,0,0,0.08)"
  border-hover: "rgba(0,0,0,0.15)"
  success-surface: "#E1F5EE"
  success-ink: "#0F6E56"
  risk-surface: "#FCEBEB"
  risk-ink: "#A32D2D"
  caution-surface: "#FAEEDA"
  caution-ink: "#854F0B"
typography:
  display:
    fontFamily: "DM Serif Display, Georgia, serif"
    fontSize: "44px"
    fontWeight: 400
    lineHeight: 1.15
  headline:
    fontFamily: "DM Serif Display, Georgia, serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.3
  title:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "8px"
  md: "12px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "28px"
  lg: "56px"
components:
  button-primary:
    backgroundColor: "{colors.catalyst}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "11px 20px"
  button-primary-hover:
    backgroundColor: "{colors.catalyst-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "11px 20px"
  button-primary-disabled:
    backgroundColor: "#9ca3af"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "11px 20px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
  input-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

# Design System: CareerAI

## Overview

**Creative North Star: "The Career Launchpad"**

CareerAI's design is built around forward momentum. Where most productivity tools are passive and neutral, CareerAI is propulsive — every screen is a preparation phase, and the interface knows it. The visual language is confident without being aggressive: warm surfaces keep it human, sharp detail keeps it precise, and the Catalyst accent marks every point where progress happens.

The typography pairing is the spine of this system. DM Serif Display carries authority — it appears on brand marks, hero moments, and the fit score readout where a user meets their competitive reality. DM Sans carries everything else with efficient clarity. Together they create the feeling of a highly capable system that still respects the emotional weight of a job search.

Depth is structural, not decorative. Cards use light diffuse shadows to establish foreground hierarchy. The only color-based depth signal is the Catalyst glow on selected states — a precise, momentary burst of energy that confirms the user has activated a step in the sequence.

**Key Characteristics:**
- Propulsive: the design moves the user forward through a defined sequence
- Warm precision: warm off-white foundation offsets any clinical feel from tight layout and exact type
- Catalyst restraint: the accent color appears only where action or progress occurs — its rarity is its signal value
- Serif authority / sans clarity: the two fonts never compete; each owns its layer
- Data-forward: semantic color surfaces (success/risk/caution) appear only for real feedback data

## Colors

A single accent, warm neutrals, and three semantic surface pairs. The palette earns trust through restraint.

### Primary
- **Catalyst** (`#0EA5A0`): The defining accent. Used on primary CTAs, selected feature tabs, active file upload zones, the "AI" mark in the logo, and the leading digit of the fit score. Nothing decorative. If an element is Catalyst, it means something is happening.
- **Catalyst Deep** (`#0c9490`): Catalyst's hover/pressed state. Same meaning, lower lightness.
- **Catalyst Mist** (`#E1F5EE`): The light fill for selected and approved states — matched keywords, approved diff lines, selected tabs in light mode.

### Neutral
- **Launch White** (`#F8F7F4`): Page background. Warm off-white rather than sterile white — reduces eye fatigue during long job prep sessions.
- **Surface** (`#FFFFFF`): Card and panel background. Sits one step above Launch White, establishing foreground hierarchy before shadows do.
- **Surface Secondary** (`#F1F0ED`): Used for input fields, disabled states, and secondary panel backgrounds. Slightly cooler than Launch White.
- **Ink** (`#1a1a1a`): Primary text. Near-black, not pure black — softer on warm backgrounds.
- **Ink Secondary** (`#6b6b6b`): Section labels, help text, secondary descriptions.
- **Ink Tertiary** (`#9b9b9b`): Placeholders, hints, divider labels.
- **Border Default** (`rgba(0,0,0,0.08)`): All resting borders. Kept at 8% opacity so they recede — structure without noise.
- **Border Hover** (`rgba(0,0,0,0.15)`): Borders on hover or focus-adjacent states.

### Semantic Surfaces
These three pairs appear only when CareerAI is communicating data feedback. Never use them for decoration or information hierarchy.

- **Success Surface / Success Ink** (`#E1F5EE` / `#0F6E56`): Matched keywords, approved diff lines, high fit score (70+). The success surface is identical to Catalyst Mist — intentional: approval and match are the same Catalyst energy.
- **Risk Surface / Risk Ink** (`#FCEBEB` / `#A32D2D`): Missing keywords, rejected diff lines, low fit score (<50).
- **Caution Surface / Caution Ink** (`#FAEEDA` / `#854F0B`): Partial matches, medium fit score (50–69).

**The Catalyst Rule.** The Catalyst accent (`#0EA5A0`) is reserved for interactive elements and active data states. It never appears as decoration, background wash, or purely informational text. Three Catalyst marks on one screen is approaching the limit.

**The One Palette Rule.** Dark mode uses the same semantic hue roles at adjusted lightness. No new colors are introduced in dark mode — the system shifts values, not vocabulary.

## Typography

**Display Font:** DM Serif Display (Georgia, serif fallback)
**Body Font:** DM Sans (system-ui, sans-serif fallback)

**Character:** The combination reads as ambitious and precise — the serif brings warmth and authority for moments of consequence; the sans brings efficiency and legibility for everything functional. They occupy separate layers and never compete at the same size.

### Hierarchy
- **Display** (400 weight, 44px, 1.15 line-height): Hero heading only. "Land your next job with CareerAI." One instance per page.
- **Headline** (400 weight, 22px, 1.3 line-height): Section titles and the fit score readout label. Also the brand mark in the navigation (22px, DM Serif Display).
- **Title** (500 weight, 15px, 1.4 line-height): Feature card labels, button text, subheadings within feature panels.
- **Body** (400 weight, 14px, 1.6 line-height): All instructional copy, descriptions, and prose output. Max line length approximately 72ch in the 860px panel.
- **Label** (500 weight, 13px, 1.4 line-height, 0.01em tracking): Input labels, column headers, tag text, metadata. Always in Ink Secondary to subordinate to body content.

### Signature: Score Readout
The fit score integer (0–100) renders in DM Serif Display at 64px — the single largest type on screen. Its color is pulled from the semantic system (success-ink, caution-ink, or risk-ink). This is the only numeric value styled at display scale.

**The Launch-then-Land Rule.** Serif type launches a section — hero, brand mark, fit score. Sans lands it — instructions, labels, actions, output. Never use DM Serif Display for body text, and never place both fonts at the same visual weight within a single component.

## Layout

The layout is narrow and centered, optimized for focused single-task use. Maximum content width is 860px, horizontally centered with 32px padding on each side. The sticky navigation bar sits outside this constraint at full viewport width (16px horizontal padding, white card surface with a bottom border).

The hero section opens with a 4-column feature tab grid. Each tab is a card with 28–32px internal padding. On viewport widths below 1024px the grid collapses to 2 columns, then to a single column on mobile. Below the hero, feature panels are full-width within the 860px container — no sidebar, no split view.

Vertical rhythm uses a base of 8px. Common intervals: 8px (xs, tight internal spacing), 16px (sm, between label and input), 28px (md, internal card padding), 56px (lg, section top padding). The spacing is generous by productivity-tool standards — each feature panel breathes, which signals deliberateness over density.

## Elevation & Depth

Depth is minimal and structural. Cards carry a light diffuse shadow (`0 2px 8px rgba(0,0,0,0.08)`) that lifts them above the page background — this is the only resting elevation in the system. There is no ambient shadow on buttons, inputs, or navigation.

Color-based depth cues (surface → card → secondary surface) do most of the hierarchy work. Shadows confirm foreground/background boundaries; they do not grade importance or establish z-axis drama.

### Shadow Vocabulary
- **Lift** (`0 2px 8px rgba(0,0,0,0.08)`): Default card and panel shadow. Establishes that the surface floats above the page. Used at rest.
- **Lift Strong** (`0 4px 16px rgba(0,0,0,0.12)`): Card hover state where hover elevation is meaningful (e.g., the feature tab grid).
- **Catalyst Glow** (`0 0 0 3px rgba(14,165,160,0.1)`): Applied alongside a 2px Catalyst border on selected or focused states. This is the system's only color-tinted shadow — the Catalyst accent radiating outward from the active element.

**The Flat-at-Rest Rule.** Every surface except the card container is flat at rest. Shadows appear to establish foreground hierarchy (Lift) or to confirm an active state (Catalyst Glow). Neither is decorative.

## Shapes

The system uses two radius values. Cards, panels, and modals use 12px (rounded.md) — gently curved, not pill-shaped. Buttons, inputs, chips, and tags use 8px (rounded.sm) — visibly rounded without feeling soft. The distinction is intentional: containers feel settled while interactive elements feel approachable.

There are no sharp corners anywhere in the light-mode implementation. No pill shapes (border-radius > 50%). No clipping or irregular masks.

The file upload zone uses a dashed border at rest — the only dashed line in the system. When a file is selected, it transitions to a solid 2px Catalyst border with Catalyst Mist fill. The dashed-to-solid transition is a micro-signal that the zone has become active.

Selected feature tabs carry a 2px solid Catalyst border (all four sides) plus the Catalyst Glow shadow. This is the only instance where a full perimeter border appears — everywhere else, borders are used as separators, not outlines.

## Components

### Buttons
Tactile and direct. Buttons are labeled with action verbs ("Analyze fit", "Rewrite Resume", "Start interview") and never ambiguous nouns. One primary CTA per panel at a time.

- **Shape:** 8px radius (rounded.sm)
- **Primary:** Catalyst background (`#0EA5A0`), white text, 500 weight, 14px, 11px/20px padding
- **Hover:** Catalyst Deep background (`#0c9490`), 0.15s ease transition
- **Focus visible:** Catalyst 2px outline, 2px offset, Catalyst Glow shadow
- **Disabled:** `#9ca3af` background, white text, `not-allowed` cursor. The teal never appears on a disabled state.
- **Ghost / text buttons:** Not a distinct variant — secondary actions appear as plain text links in Ink Secondary.

### Feature Tabs (Signature Component)
The four feature tabs in the hero are the primary navigation device. They are card-shaped (12px radius, white surface, Lift shadow, 28px padding) arranged in a 4-column grid. In their resting state they carry a 1px border at `rgba(0,0,0,0.08)`. When selected, they gain a 2px solid Catalyst border on all sides, Catalyst Mist background fill, and the Catalyst Glow shadow. The transition is instant on click.

### Cards / Containers
- **Corner Style:** 12px radius (rounded.md)
- **Background:** Surface (`#FFFFFF`)
- **Shadow:** Lift at rest (`0 2px 8px rgba(0,0,0,0.08)`)
- **Border:** `1px solid rgba(0,0,0,0.08)` at rest
- **Internal Padding:** 28–32px (spacing.md)

Feature panels within a tab share the same card container styling. The card is the atomic layout unit.

### Inputs and Textareas
- **Style:** 1px solid border at `rgba(0,0,0,0.08)`, Surface background, 8px radius, DM Sans 14px
- **Focus:** Border shifts to Catalyst (`#0EA5A0`), Catalyst Glow shadow applied
- **Placeholder:** Ink Tertiary (`#9b9b9b`), task-specific (never "Enter text here")
- **Disabled:** Surface Secondary background (`#F1F0ED`), pointer disabled
- **Textarea:** Same treatment. Minimum height of approximately 120px; no horizontal resize.

### Navigation
Sticky bar at full viewport width, 16px horizontal padding, 60px height. Surface background with a 1px bottom border at `rgba(0,0,0,0.08)`. Brand mark left-aligned: "Career" in Ink, "AI" in Catalyst, DM Serif Display 22px. Dark mode toggle right-aligned — icon-only, no label.

### Fit Score Display (Signature Component)
The score integer renders in DM Serif Display at 64px. Its color is drawn from the semantic ink tokens: `success-ink` (#0F6E56) at 70+, `caution-ink` (#854F0B) at 50–69, `risk-ink` (#A32D2D) below 50. A label "/ 100" renders in Ink Tertiary at 24px beside it. Below the number, a short descriptor line in body type names the tier ("Strong match", "Needs work", "Significant gaps"). This is the highest-visibility moment in the product — the design gives it maximum real estate and lets the semantic color do the emotional work.

### File Upload Zone
Dashed 2px border at `rgba(0,0,0,0.2)`, Surface background, 12px radius, centered icon + instruction copy, 24px internal padding. On active drag or file selected: border becomes solid 2px Catalyst, background becomes Catalyst Mist. On hover: border opacity increases. Transition: `border-color 0.15s ease, background 0.15s ease`.

### Diff Review (Signature Component)
The Resume Rewriter presents changes line-by-line. Each line is a card row with:
- **Approved:** Catalyst border-left (4px), Catalyst Mist background, success-ink text for the new content
- **Rejected:** Surface Secondary background, 1px dashed border-left, Ink Tertiary text (struck through)
- **Pending:** Surface background, border-left at `rgba(0,0,0,0.12)`, two buttons (approve / reject) in-line

## Do's and Don'ts

### Do:
- **Do** use DM Serif Display exclusively for the hero heading, brand mark, section titles, and the fit score readout. These are the only contexts where it appears.
- **Do** apply the Catalyst accent (`#0EA5A0`) only to primary CTAs, selected states, active zones, and score indicators. Three or fewer Catalyst marks per screen is the guideline.
- **Do** signal selected or active state with the combination of a 2px solid Catalyst border and the Catalyst Glow shadow (`0 0 0 3px rgba(14,165,160,0.1)`). Use both together; neither alone is sufficient.
- **Do** use the semantic surface pairs (success / risk / caution) exclusively for data feedback — keyword match results, fit scores, and diff approval states.
- **Do** write all button labels and CTAs as action verbs with direct objects ("Analyze fit", "Generate prep guide", "Start interview").
- **Do** keep all feature panel content within a max width of 860px, centered.

### Don't:
- **Don't** use DM Serif Display below 18px or in instructional body copy — the weight and spacing break at small sizes and compete with DM Sans.
- **Don't** apply the Catalyst color to decorative elements, background washes, or non-interactive text. If it glows Catalyst, it must mean the user can act on it or that an action just occurred.
- **Don't** introduce a third typeface, a second accent color, or additional radius values. The system's restraint is its identity.
- **Don't** use the success/risk/caution surface colors for informational hierarchy, section differentiation, or marketing purposes — they belong to data feedback only.
- **Don't** exceed the 860px content max-width inside any feature panel, even on wide viewports.
- **Don't** use generic placeholder text. Every input field in CareerAI has a specific task context — the placeholder should reflect it.

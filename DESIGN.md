---
name: Civic Excellence
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#525657'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b6e70'
  on-tertiary-container: '#eff1f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  margin-mobile: 16px
  gutter-mobile: 12px
  touch-target-min: 48px
  stack-gap: 16px
  section-gap: 32px
---

## Brand & Style
The design system focuses on "Civic Excellence," a design philosophy built on reliability, transparency, and public service. It targets active community members and local government officials who require a high-utility tool for reporting and tracking local issues. 

The aesthetic is **Modern Corporate**, drawing heavily from the structured clarity of Material Design 3 while maintaining a distinct civic identity. It prioritizes legibility and efficiency over decorative elements. The emotional response should be one of "calm authority"—users should feel that their contributions are being handled with professional rigor. 

Key visual principles include:
- **Clarity over cleverness:** Every UI element has a functional purpose.
- **Institutional Trust:** Use of structured grids and standard UI patterns to feel familiar and safe.
- **Operational Efficiency:** Large touch targets and high-contrast status indicators to facilitate quick interactions on the go.

## Colors
The palette is rooted in "Civic Blue" and "Service Teal," colors associated with stability and growth. 

### Light Mode
The primary background uses a very light grey (#F8FAFC) to reduce eye strain compared to pure white, while keeping the interface feeling open and airy. Primary actions use the deep blue, while secondary navigation and supportive icons utilize the teal.

### Dark Mode
In dark mode, the system shifts to a deep navy background (#0F172A). Surface elements use a lighter slate (#1E293B) to maintain depth. Accent colors are slightly desaturated to maintain accessibility standards against dark backgrounds.

### Status Indicators
Status colors are non-negotiable for quick scanning:
- **Amber (#F59E0B):** Used for "Pending" or "New" reports.
- **Blue (#3B82F6):** Used for "In-Progress" or "Assigned" tasks.
- **Green (#10B981):** Used for "Resolved" or "Completed" items.

## Typography
This design system utilizes **Inter** for all roles. Its systematic design and high x-height make it ideal for mobile screens where data density and legibility are paramount.

- **Headlines:** Use a tighter letter-spacing and heavier weights to create a strong visual anchor for page titles and report headers.
- **Body:** Standardized at 16px for primary reading to ensure accessibility for all age groups in the community.
- **Labels:** Used for metadata (timestamps, categories, status tags). These use medium to semi-bold weights to remain legible at smaller sizes.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for one-handed mobile use. 

### Spacing Rhythm
A 4px baseline grid governs all spacing.
- **Touch Targets:** No interactive element (buttons, links, chips) should be smaller than 48x48px.
- **Safe Areas:** Maintain a 16px margin on the left and right of the screen.
- **Thumb Zone:** Primary actions (like "Report an Issue") must be placed in the bottom third of the screen to accommodate one-handed operation.

### Breakpoints
- **Mobile:** 0 - 599px (4-column grid).
- **Tablet:** 600px - 1023px (8-column grid).
- **Desktop:** 1024px+ (12-column grid, max content width 1200px).

## Elevation & Depth
The design system uses **Tonal Layers** supplemented by subtle ambient shadows to define hierarchy.

- **Level 0 (Background):** #F8FAFC (Light) / #0F172A (Dark).
- **Level 1 (Cards/Surfaces):** White (Light) / #1E293B (Dark). These feature a 1px border (#E2E8F0) and a soft shadow (0px 2px 4px rgba(0,0,0,0.05)).
- **Level 2 (Active/Floating):** Used for FABs (Floating Action Buttons) and Modals. These use a more pronounced shadow (0px 8px 16px rgba(0,0,0,0.1)) to indicate they are closer to the user.

## Shapes
The shape language is "Rounded Professional." This means significant corner radii are used to make the app feel modern and approachable, but not so extreme that it feels like a toy.

- **Container Radius:** 16px (rounded-lg) for main content cards and modals.
- **Small Element Radius:** 8px (standard) for buttons and input fields.
- **Utility Radius:** 4px (rounded-sm) for small status tags or badges.

## Components

### Buttons
- **Primary:** Filled with #2563EB, white text, 8px border radius. 56px height for mobile.
- **Secondary:** Outlined with #2563EB, 1px border.
- **FAB:** Circular button, 56px diameter, #2563EB background with a white icon.

### Cards
- **Report Card:** 16px radius, Level 1 elevation. Contains a title, a status chip, and a timestamp. 16px internal padding.

### Chips (Status)
- **Structure:** Pill-shaped, semi-bold text.
- **Styling:** Use a 10% opacity background of the status color with 100% opacity text of the same color (e.g., Pending: Amber background at 10%, Amber text).

### Input Fields
- **Style:** Outlined (Material 3 style) with a 1px border. Labels are always visible or float above the field on focus. High contrast borders (#94A3B8) ensure visibility.

### Lists
- **Density:** Generous 12px vertical spacing between list items. Each list item should have a minimum height of 64px to ensure easy selection.

### Progress Tracking
- **Stepper:** A vertical or horizontal line connecting status nodes to show the journey of a civic request from "Submitted" to "Resolved."

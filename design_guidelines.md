# QR Code Generator Design Guidelines

## Design Approach: Utility-Focused Design System

**Selected Framework:** Material Design principles with modern customizations
**Justification:** This is a productivity tool requiring efficiency, clear visual hierarchy, and intuitive controls for technical users.

## Core Design Elements

### Color Palette

**Light Mode:**

- Primary: 236 72% 79% (Modern purple-blue)
- Surface: 0 0% 98% (Near white backgrounds)
- Surface Variant: 240 5% 96% (Control panels)
- Text Primary: 220 9% 15% (Dark charcoal)
- Border: 220 13% 91% (Subtle borders)

**Dark Mode:**

- Primary: 236 72% 79% (Same vibrant accent)
- Surface: 220 13% 9% (Rich dark background)
- Surface Variant: 220 9% 15% (Elevated panels)
- Text Primary: 220 9% 96% (Light text)
- Border: 220 13% 23% (Visible borders)

### Typography

- **Primary Font:** Inter (Google Fonts) - Clean, technical readability
- **Hierarchy:** text-sm for labels, text-base for inputs, text-lg for section headers
- **Weight Distribution:** font-medium for labels, font-semibold for headers

### Layout System

**Spacing Units:** Consistent use of Tailwind units 2, 4, 6, and 8

- Tight spacing (p-2, m-2) for form controls
- Medium spacing (p-4, gap-4) for component groups
- Generous spacing (p-6, p-8) for section separation

### Component Library

**Two-Column Layout:**

- Left panel (w-1/3): Fixed-width control panel with subtle background elevation
- Right panel (w-2/3): Preview area with centered QR code display
- Responsive: Stack vertically on mobile with controls above preview

**Form Controls:**

- Clean input fields with subtle borders and focused accent states
- Color pickers with preview swatches
- Radio buttons styled as modern toggle cards
- File upload with drag-and-drop visual feedback

**QR Code Preview:**

- Large centered display with subtle shadow
- Download button positioned below with multiple format options
- Real-time updates with smooth transitions

**Navigation Sections:**

- Tabbed interface for content types (URL, WiFi, vCard, Email)
- Collapsible sections for advanced styling options
- Clear visual separation between functional groups

### Visual Hierarchy

- **Primary Focus:** QR code preview dominates right side
- **Secondary Focus:** Content input fields prominently placed at top of controls
- **Tertiary Elements:** Styling options organized in logical, collapsible groups
- **Consistent Elevation:** Use subtle shadows (shadow-sm, shadow-md) to create depth

### Interaction Design

- **Immediate Feedback:** Real-time QR code generation on any input change
- **Progressive Disclosure:** Advanced options revealed through expand/collapse
- **Clear CTAs:** Prominent download button with format selection dropdown
- **Form Validation:** Inline error states with helpful messaging

This design prioritizes functionality and clarity while maintaining a modern, professional appearance suitable for both casual and business users.

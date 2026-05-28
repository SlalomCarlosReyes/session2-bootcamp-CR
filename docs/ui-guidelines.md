# UI Guidelines - TODO App

## 1. Design System

- The application shall use Material Design components consistently across all screens.
- The UI must use Material-style buttons, text inputs, cards, and dialogs for all equivalent actions and content blocks.
- The application shall avoid mixing multiple visual component styles for the same interaction pattern.

## 2. Color Palette

- The UI must use the following core palette:
  - Primary color: `#1976D2` (Blue 700)
  - Secondary color: `#7B1FA2` (Purple 700)
  - Background color: `#F5F7FA` (Light gray)
  - Success color: `#2E7D32` (Green 800)
  - Warning color: `#ED6C02` (Orange 800)
  - Error color: `#D32F2F` (Red 700)
- The application shall use semantic colors only for their intended states (success, warning, error).
- The UI must ensure text remains legible against all background and state colors.

## 3. Typography

- The application shall use `Roboto`, `Helvetica`, `Arial`, sans-serif as the font stack.
- The UI must use the following base type scale:
  - H1: 32px, weight 700
  - H2: 24px, weight 600
  - H3: 20px, weight 600
  - Body: 16px, weight 400
  - Caption/Meta: 14px, weight 400
- The UI must use emphasis styles consistently:
  - Bold for key labels and totals
  - Medium weight for section headers
  - Italic only for helper or contextual text

## 4. Buttons

- The UI must define button states and usage as follows:
  - Primary button: Filled style using primary color; used for the main action in a view (e.g., "Add Task", "Save").
  - Secondary button: Outlined or tonal style; used for alternative actions (e.g., "Cancel", "Clear Filter").
  - Disabled button: Reduced contrast and no hover effect; used when action preconditions are not met.
- The application shall provide clear visual feedback on hover, focus, and press states for all enabled buttons.

## 5. Layout and Spacing

- The UI must use a consistent spacing scale based on 8px increments (e.g., 8, 16, 24, 32).
- The application shall align content to a consistent grid and keep vertical rhythm between elements.
- The UI must use card-based grouping for task lists and related controls.
- The application shall prevent overcrowding by preserving minimum spacing between interactive elements.

## 6. Task UI

- The application shall display each task in a card or row with these fields visible:
  - Title
  - Due date (if set)
  - Priority
  - Completion status
- The UI must clearly distinguish completed tasks (e.g., checkbox checked, muted text, optional strikethrough).
- The UI must visually highlight overdue tasks using warning/error styling and an explicit overdue label.
- The application shall keep edit and delete actions visible and easy to access for each task.

## 7. Interactions

- The UI must provide intuitive hover states for clickable elements.
- The application shall provide click/tap feedback (e.g., ripple, opacity, or elevation change) for interactive controls.
- The UI must use short, consistent transitions (150ms-250ms) for state changes and dialogs.
- The application shall avoid distracting animations that reduce usability.

## 8. Accessibility

- The UI must meet basic accessibility standards for color contrast (minimum WCAG AA for text and controls).
- The application shall support full keyboard navigation for all primary interactions.
- The UI must include visible focus indicators for keyboard users.
- The application shall provide accessible names/labels for form fields, buttons, and icons.
- The UI must support screen readers by using semantic structure and descriptive control text.

## 9. Responsiveness

- The UI must adapt to both desktop and mobile screen sizes without loss of functionality.
- The application shall use responsive breakpoints to adjust layout density, spacing, and control placement.
- On mobile, the UI must prioritize single-column task flow and touch-friendly target sizes.
- On desktop, the UI shall use available space for improved scanning, filtering, and task management efficiency.

# Nielsen's 10 Usability Heuristics -- Full Reference

Based on [NN/g's 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).

---

## H1. Visibility of System Status

The design should always keep users informed about what is going on through appropriate feedback within a reasonable amount of time.

**What to check:**

- Loading states: spinners, skeletons, progress bars for async operations
- Success confirmation: toasts, inline messages after save/create/delete
- Error states: clear visual indicators when something fails
- State indicators: active tab, selected item, current page, sort direction
- Real-time feedback: character counts, validation as you type, preview

**Implementation patterns:**

- Toast notifications for transient success/error messages
- Inline validation on form fields (not just on submit)
- Skeleton loaders for content that takes time to load
- Disabled states with visual feedback on buttons during submission
- Progress indicators for multi-step flows

---

## H2. Match Between the System and the Real World

The interface should speak the users' language, using words, phrases, icons, and concepts familiar to them rather than internal jargon.

**What to check:**

- Labels use domain language, not developer terms (e.g., "Instructor" not "instructorId")
- Icons match real-world metaphors (trash can for delete, pencil for edit)
- Information hierarchy follows natural reading order
- Date/time formats match user expectations (locale-appropriate)
- Terminology is consistent with industry standards

**Implementation patterns:**

- Use human-readable labels derived from the domain model
- Format dates, currencies, and numbers for the target locale
- Order form fields in a logical sequence matching real-world workflows
- Use familiar UI metaphors (drag to reorder, swipe to delete)

---

## H3. User Control and Freedom

Users often act by mistake, so they need clearly marked "emergency exits" to leave unwanted states without going through long flows.

**What to check:**

- Every modal/dialog has a close button and supports Escape key
- Every multi-step flow has a back button or breadcrumb navigation
- Destructive actions can be undone or require confirmation
- Forms have a cancel button that returns to the previous state
- Navigation doesn't trap users (browser back always works)

**Implementation patterns:**

- Cancel buttons on all forms and dialogs
- Undo capability for delete operations (soft delete + undo toast)
- Confirmation dialogs for irreversible actions
- Escape key closes modals, popovers, and dropdown menus
- Browser history integration (back button works as expected)

---

## H4. Consistency and Standards

Users should not have to wonder whether different words, actions, or situations mean the same thing. Follow platform and industry conventions.

**What to check:**

- Same action, same word everywhere (don't mix "Delete" / "Remove" / "Trash")
- Button styles consistent (primary action always same color/position)
- Layout patterns reused (list pages all look similar, form pages all look similar)
- Follows platform conventions (OS-native patterns, web standards)
- Internal consistency (spacing, typography, color usage follow a system)

**Implementation patterns:**

- Design tokens / theme for consistent colors, spacing, typography
- Shared components for common patterns (DataTable, PageHeader, forms)
- Consistent icon usage (same icon always means same action)
- Primary action always on the right in button groups
- Consistent empty states, loading states, error states

---

## H5. Error Prevention

Good design prevents problems before they happen by eliminating error-prone conditions or checking for them.

**What to check:**

- Required fields are clearly marked and validated before submission
- Destructive actions require confirmation (delete, publish, bulk operations)
- Sensible defaults reduce chances of misconfiguration
- Constraints prevent invalid input (max length, number ranges, date ranges)
- Dangerous operations are visually distinct (red styling for destructive actions)

**Implementation patterns:**

- Client-side form validation with Zod schemas
- Confirmation dialogs for delete, publish, and bulk actions
- Input constraints (type="number" min/max, maxLength, date pickers)
- Disabled submit button until form is valid
- Auto-save or warn before navigating away from unsaved changes

---

## H6. Recognition Rather Than Recall

Minimize memory load by making elements, actions, and options visible rather than requiring users to remember.

**What to check:**

- Options are visible in menus, not hidden behind memorizable shortcuts only
- Search fields have placeholder text suggesting what to search
- Form fields have labels (not just placeholders that disappear)
- Recently used items or suggestions are shown
- Related information is co-located (don't make users flip between pages)

**Implementation patterns:**

- Persistent labels on all form fields (not placeholder-only)
- Combobox/search for fields with many options instead of plain dropdowns
- Breadcrumbs or page titles showing current location
- Tooltips for icon-only buttons
- Inline help text for non-obvious fields

---

## H7. Flexibility and Efficiency of Use

Cater to both novice and expert users. Provide shortcuts that speed up frequent actions.

**What to check:**

- Keyboard shortcuts for common actions (Cmd+S to save, Escape to close)
- Bulk operations available (select all, bulk delete, bulk publish)
- Search and filter for large lists
- Sortable columns in tables
- Customizable views (grid/list toggle, column visibility)

**Implementation patterns:**

- Grid/list view toggle on collection pages
- Column sorting with visual indicators
- Search with debounce on large data sets
- Keyboard navigation in dropdowns and menus
- Pagination with configurable page sizes

---

## H8. Aesthetic and Minimalist Design

Every extra element competes with what matters. Focus on essentials that support primary user goals.

**What to check:**

- No unnecessary decorative elements that distract from content
- Information density appropriate for the context (not too sparse, not too cluttered)
- Visual hierarchy guides the eye to what matters most
- White space used effectively to group related elements
- Secondary actions are visually subordinate to primary ones

**Implementation patterns:**

- Progressive disclosure (show details on demand, not all at once)
- Ghost/outline variants for secondary actions, solid for primary
- Collapsible sections for advanced options
- Clean empty states (helpful but not overwhelming)
- Consistent use of muted colors for secondary information

---

## H9. Help Users Recognize, Diagnose, and Recover from Errors

Error messages should be plain language, clearly indicate what went wrong, and suggest how to fix it.

**What to check:**

- Error messages are in plain language (no error codes, stack traces, or technical jargon)
- Errors indicate specifically what went wrong ("Email is invalid" not "Validation error")
- Errors suggest how to fix the problem ("Enter a valid email address like name@example.com")
- Form errors appear next to the relevant field, not just at the top
- Network/server errors have retry options

**Implementation patterns:**

- Inline field-level error messages below each invalid field
- Toast notifications for operation failures with retry button
- Specific Zod error messages in schemas
- Fallback UI for component-level errors (error boundaries)
- Graceful degradation when external services fail

---

## H10. Help and Documentation

Help should be easy to search, task-focused, concise, and shown in context.

**What to check:**

- Empty states include helpful guidance ("No sessions yet. Create your first session.")
- Complex fields have help text or tooltips explaining what's expected
- Onboarding flow for first-time users
- Contextual help near where users need it (not buried in a separate docs page)
- Labels and descriptions are self-explanatory

**Implementation patterns:**

- Helper text below form fields for non-obvious inputs
- Empty state components with description + call-to-action button
- Tooltip on icon-only buttons explaining the action
- Description text on page headers explaining the page's purpose
- Placeholder text in search fields suggesting usage

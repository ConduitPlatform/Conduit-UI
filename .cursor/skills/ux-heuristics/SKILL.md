---
name: ux-heuristics
description: Apply Nielsen's 10 usability heuristics when building or reviewing UI. Use when creating components, pages, forms, modals, tables, navigation, error states, or when the user asks for UX review, usability audit, or heuristic evaluation.
metadata:
  author: Quintessential
  version: '3.0.0'
  short-description: Nielsen's 10 usability heuristics for interface review
---

# Nielsen's 10 Usability Heuristics

Apply these heuristics when building or reviewing any user interface. Treat them as a checklist -- not every heuristic applies to every change, but scan all 10 before considering work complete.

For the full reference with examples and edge cases, see [reference.md](reference.md).

## Quick Checklist

When building or reviewing UI, verify:

- [ ] **H1 System status** -- Does the UI show what's happening? (loading, saving, success, error)
- [ ] **H2 Real-world match** -- Does it use the user's language, not dev jargon? Are icons/metaphors intuitive?
- [ ] **H3 User control** -- Can users undo, cancel, go back, or escape from any state?
- [ ] **H4 Consistency** -- Does it follow existing patterns in the app and platform conventions?
- [ ] **H5 Error prevention** -- Are destructive actions guarded? Are constraints in place before errors happen?
- [ ] **H6 Recognition over recall** -- Are options visible? Can users see rather than remember what to do?
- [ ] **H7 Flexibility** -- Are there shortcuts for experts? Does it scale for power users?
- [ ] **H8 Minimalist design** -- Is every element earning its place? Is the signal-to-noise ratio high?
- [ ] **H9 Error recovery** -- Are error messages plain language, specific, and actionable?
- [ ] **H10 Help** -- Is contextual help available where users might need it?

## How to Apply

### When building new UI

1. Before implementation, scan the checklist to anticipate issues
2. Prioritize H1 (status), H3 (control), H5 (error prevention) -- these prevent the most user frustration
3. After implementation, do a final pass against all 10

### When reviewing existing UI

1. Walk through each user flow as if seeing it for the first time
2. Flag violations with severity:
   - **Critical** -- blocks the user or causes data loss (H3, H5, H9)
   - **Major** -- causes significant confusion or inefficiency (H1, H2, H4)
   - **Minor** -- polish and optimization (H6, H7, H8, H10)

## Common Violations in CMS/Admin UIs

| Pattern                                        | Heuristic violated | Fix                                             |
| ---------------------------------------------- | ------------------ | ----------------------------------------------- |
| No feedback after save/delete                  | H1                 | Add toast notification or inline confirmation   |
| Form submits with no validation                | H5                 | Add client-side validation before submit        |
| No way to cancel mid-flow                      | H3                 | Add cancel button, support Escape key           |
| Inconsistent button placement                  | H4                 | Standardize primary action position (right)     |
| Raw error codes shown to user                  | H9                 | Translate to plain language with recovery steps |
| Empty states with no guidance                  | H10                | Add helpful empty state with call-to-action     |
| Truncated text with no way to see full content | H6                 | Add tooltip or expandable row                   |
| Delete without confirmation                    | H5                 | Add confirmation dialog for destructive actions |
| No loading indicator on async operations       | H1                 | Add spinner, skeleton, or progress bar          |
| Jargon in labels (e.g. "instructorId")         | H2                 | Use human-readable labels ("Instructor")        |

# Future Features

This document tracks future or proposed features for the Foisit library. Use it to capture ideas, planned enhancements, and known gaps so the roadmap stays visible and centralized.

## How to use

- Add a short, clear title for each feature.
- Describe the user problem and expected behavior.
- Note any technical considerations or dependencies.
- If there is a target release or priority, list it.

## Template

- Feature:
  - Problem:
  - Proposed behavior:
  - Dependencies:
  - Priority/target:
  - Notes:

## Ideas

- Feature:

  - Problem:
  - Proposed behavior:
  - Dependencies:
  - Priority/target:
  - Notes:

- Feature: Dependent, context-aware multi-step flows (subscriptions)
  - Problem:
    - Real workflows often require sequential, dependent choices (package -> billing cycle -> products -> units).
    - Current forms collect all missing required params at once and option loaders do not receive prior selections.
    - There is no built-in typeahead search for large lists (e.g., unit serial search).
  - Proposed behavior:
    - Allow a single command to guide users through a multi-step flow with dependent options.
    - Provide a stepper-like experience where the next field is resolved after the prior one is selected.
    - Support interactive search for large option sets (type to search, async results).
  - Dependencies:
    - Context-aware option loaders: getOptions should receive current field values and context (commandId, params).
    - Incremental form flow: new flag to prompt for one field at a time (or a new response type, e.g., 'step').
    - Searchable select UI component (async typeahead, debounced API calls).
    - AI param extraction should accept arrays for multi-select when defined as such.
  - Priority/target:
    - Target: vNext (post current wrapper releases)
  - Notes:
    - Example flow: user says "subscribe customer to package" -> assistant shows packages -> then billing cycles -> then products -> then unit search -> final confirmation.
    - Needs clear API contract for storing partial params and moving between steps without losing context.

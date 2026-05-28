# Coding Guidelines — TODO App

## 1) Purpose and Philosophy

This document defines how code should be written across the TODO app so the codebase stays consistent, readable, and maintainable over time. Every contribution should optimize for readability first, because clear code reduces defects and makes reviews faster. Teams must apply DRY and KISS intentionally: avoid duplication when it adds maintenance cost, and prefer the simplest design that solves the problem well. Separation of concerns must guide architecture decisions, so UI, domain logic, and infrastructure concerns remain distinct. Functions and components should stay small and focused, with one clear responsibility each.

## 2) General Formatting Rules

Formatting must be consistent throughout the repository. Code should use a single indentation style per language and avoid mixed indentation in the same file. Line length should remain within 100 to 120 characters to preserve readability in reviews and split-screen workflows. Trailing commas should be used where the language and tooling support them, because they improve diffs and reduce merge noise. Every source file must end with a newline.

Naming should be explicit and descriptive. Developers should avoid abbreviations unless they are widely understood in context. File naming must follow established conventions: use kebab-case for general files and PascalCase for React component files. The same naming pattern should be applied consistently inside each folder.

## 3) Import Organization

Imports must follow a predictable order in every file. External libraries should appear first, internal modules second, and relative imports last. These groups should be separated by blank lines to make dependencies easy to scan. Import style should remain consistent across the codebase, and deep relative paths should be avoided when aliases are available through project configuration.

## 4) TypeScript / JavaScript Best Practices

TypeScript types and interfaces should be used where they improve clarity and safety. The any type must be avoided unless there is a clear, documented reason. When uncertainty exists, prefer unknown and narrow types explicitly at boundaries. Code should favor immutability and avoid mutating shared state, especially across component boundaries and service layers.

Control flow should remain simple and explicit. Use early returns to reduce nesting and improve readability. Error handling must be deliberate; failures should never be ignored silently. Exceptions and error responses should be captured, logged appropriately, and surfaced in a predictable way for callers.

## 5) React (Frontend) Conventions

Frontend code should use functional components and hooks as the default approach. Components should remain small, composable, and reusable. UI logic must not absorb business logic; domain behavior should be extracted into helpers, hooks, or service modules when complexity grows. Forms should use controlled components to keep state predictable and validation explicit.

State naming should be consistent and intention-revealing. Data flow should be predictable and easy to trace from source to UI output. Side effects must be isolated and managed carefully so components remain testable and behavior remains stable.

## 6) Backend / API Conventions

API route handlers should stay thin and focused on transport concerns such as request parsing, validation, and response mapping. Business rules must live in services or dedicated modules. All inputs must be validated before processing. APIs must return consistent error shapes so clients can handle failures reliably.

Responses should expose only what clients need and must not leak internal implementation details, storage structure, or sensitive metadata. Backend modules should remain cohesive, with explicit boundaries between routing, domain logic, and persistence concerns.

## 7) Linting, Formatting, and Tooling

ESLint must be enabled and enforced in CI. Prettier should be used for automated formatting, and developers should not manually fight formatter output. Contributors should run formatting and lint checks before committing to keep feedback loops short. Production code should contain no unused imports, no unused variables, and no ad-hoc console logs; operational logging should use the project logger and follow structured logging patterns.

## 8) Code Quality and Review Checklist

Before opening or approving a change, reviewers and authors should confirm that the code is clear, names are meaningful, and duplication is minimized. They should verify that tests were added or updated where behavior changed, dead code was removed, and edge cases were handled explicitly. UI changes should be reviewed for accessibility impact, including semantics, keyboard behavior, and readable contrast. A change should be considered complete only when it is understandable, testable, and maintainable by someone who did not author it.

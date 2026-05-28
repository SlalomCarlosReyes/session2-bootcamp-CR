# Test Review and Execution Guidelines — TODO App

## 1) Test Review Guidelines

Developers must review all tests generated or modified by Copilot before merging. Tests must verify meaningful behavior, be easy to maintain, and fail when the implementation is wrong. A passing test suite is not enough by itself; each test should prove real correctness.

When reviewing AI-generated tests, developers should actively look for these common issues:

- **False Positive Tests**: Tests that pass regardless of real behavior because assertions are too weak or setup hides failures.
- **Phantom Assertions**: Assertions that validate behavior that is incorrect, outdated, or not implemented at all.
- **Mock Hallucinations**: Mocks that do not match real API contracts, real data shapes, or real runtime behavior.
- **Coverage Illusions**: High coverage numbers that still miss critical branches, errors, and edge cases.

Use the following sanity checks during review:

- Can the code be broken and still pass the test?
- Are tests isolated or interdependent?
- Is test data realistic?
- Do integration tests use real API behavior (not over-mocked)?
- Do E2E tests validate full user journeys?
- Is backend state verified, not only UI?

Developers should reject or rewrite tests that do not clearly validate expected behavior.

## 2) Running Unit Tests

Unit tests run in isolation and must validate individual modules, functions, and components without relying on external systems.

Run unit tests with:

```bash
npm run test:frontend
npm run test:backend
npm test
```

Unit test locations:

- Frontend: `packages/frontend/src/__tests__/`
- Backend: `packages/backend/__tests__/`

Developers should run relevant unit tests after every change and before committing.

## 3) Running Integration Tests

Integration tests must validate real backend API behavior through HTTP requests. Integration tests should use Jest + Supertest and avoid excessive mocking of server behavior.

Start backend first:

```bash
npm run start:backend
```

Then run integration tests:

```bash
npm run test:integration
```

Integration tests must verify status codes, payload structure, validation errors, and persistence behavior.

## 4) Running End-to-End (E2E) Tests

E2E tests must validate complete user workflows from UI interaction through backend effects. Both frontend and backend must be running.

Start both services:

```bash
npm run start
```

Run E2E tests:

```bash
npm run test:e2e
```

If code changes are made while services are running, developers should restart services to ensure tests use updated code.

Optional debugging mode:

```bash
npx playwright test --ui
```

E2E tests should verify critical journeys end to end, not only isolated UI rendering.

## 5) Running All Tests

To execute all test layers together, run:

```bash
npm run test:all
```

Developers must ensure required dependencies and services are available. Backend and frontend should be running when test workflows require live application behavior.

## 6) Troubleshooting and Improving Tests

Developers should use focused prompts to improve failing or weak tests. Effective prompt examples:

- **Fix failing tests (identify root cause + minimal fix)**
  - "Identify why this test fails and apply the smallest safe fix without changing intended behavior."
- **Strengthen weak assertions**
  - "Replace weak assertions with behavior-focused checks that fail when logic is broken."
- **Improve coverage (missing branches)**
  - "Add tests for missing branches and edge cases, especially validation and error paths."
- **Fix setup/teardown issues (beforeEach/afterEach)**
  - "Stabilize test setup and teardown to remove shared-state leakage between tests."
- **Fix selector issues (Playwright locators)**
  - "Update Playwright locators to be unique, accessible, and resilient to UI changes."
- **Fix timing issues (waitFor, async handling)**
  - "Resolve async flakiness using proper waits and deterministic assertions."

Tests must remain deterministic, isolated, and understandable after any AI-assisted update.

## 7) Coverage Validation

Generate coverage with:

```bash
npm test -- --coverage
```

Coverage must be reviewed critically, not blindly accepted. Developers should treat coverage as a signal, not a guarantee. A high percentage does not replace strong assertions, realistic test data, and thorough scenario selection.

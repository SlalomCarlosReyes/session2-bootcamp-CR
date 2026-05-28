# Testing Guidelines - TODO App

## 1) Overview

- The project shall follow a testing pyramid approach with unit tests, integration tests, and end-to-end (E2E) tests.
- The application shall prioritize broad unit test coverage, targeted integration tests, and critical-path E2E tests.
- All new features must include appropriate tests at one or more pyramid levels based on feature impact.

## 2) Unit Tests (Frontend + Backend)

### Principles

- The project shall use Jest as the required framework for unit testing.
- Unit tests must validate individual functions, modules, and React components in isolation.
- Unit tests must avoid real network calls and external side effects unless explicitly mocked.

### Naming Convention

- Unit test files must use the extensions *.test.js or *.test.ts.
- Unit test file names shall match the unit under test whenever practical (for example: app.test.js tests app.js).

### Placement

- Backend unit tests must be placed in packages/backend/__tests__/.
- Frontend unit tests must be placed in packages/frontend/src/__tests__/.

## 3) Integration Tests (Backend API)

### Principles

- The project shall use Jest and Supertest for backend API integration testing.
- Integration tests must validate backend API behavior through real HTTP requests.
- Integration tests must verify status codes, response payloads, validation behavior, and error handling paths.

### Naming Convention

- Integration test files must use the extensions *.test.js or *.test.ts.
- Integration test files shall use clear names based on the API surface being tested (for example: todos-api.test.js).

### Placement

- Backend integration tests must be placed in packages/backend/__tests__/integration/.

## 4) End-to-End (E2E) Tests

### Principles

- The project shall use Playwright as the required framework for E2E testing.
- E2E tests must validate complete user workflows through browser automation.
- E2E tests must focus on critical journeys such as creating, editing, completing, filtering, and deleting TODO items.

### Naming Convention

- E2E test files must use the extensions *.spec.js or *.spec.ts.
- E2E test files shall be named by user journey (for example: todo-workflow.spec.js).

### Placement

- E2E tests must be placed in tests/e2e/.

### Constraints

- Playwright tests must use one browser only.

## 5) CI-Friendly Requirements

- All test suites must be executable in headless, non-interactive environments.
- Tests must be deterministic and must not depend on local machine state, wall-clock timing assumptions, or manual setup.
- Test execution must return non-zero exit codes on failure so CI pipelines can fail fast.
- Flaky tests must be fixed or quarantined immediately; unstable tests must not block reliable CI signal.
- The repository shall support running test layers independently (unit, integration, E2E) to optimize CI runtime and troubleshooting.
- Pull requests shall include only relevant passing tests for changed behavior, and no known failing tests may be merged into the default branch.

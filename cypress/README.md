# End-to-End Testing for FujiPay Web App

This directory contains end-to-end tests for the FujiPay Web application using Cypress.

## Test Structure

- **authentication.cy.ts**: Tests the full authentication flow including login, OTP verification, password setting, and 2FA setup and verification.
- **accessibility.cy.ts**: Tests for accessibility compliance on all authentication pages.
- **error-handling.cy.ts**: Tests various error scenarios in the authentication flow.

## Authentication Flow

The tests cover the following authentication flow:

1. **Login** → Enter username and password
2. **OTP Verification** → Enter the one-time password sent to email/phone
3. **Set New Password** → Set a new secure password (for first-time users)
4. **Scan 2FA Code** → Set up two-factor authentication
5. **2FA Verification** → Enter 2FA code to complete authentication

## How to Run Tests

### Opening Cypress Test Runner

```bash
npm run cypress:open
```

### Running Tests in Headless Mode

```bash
npm run test:e2e
```

## Custom Commands

The test suite includes custom Cypress commands:

- `cy.fillOtp(value)`: Fills in OTP input fields with a 6-digit code
- `cy.login(username, password)`: Performs a login with the given credentials

## Accessibility Testing

We use `cypress-axe` for accessibility testing. Each page in the authentication flow is tested for accessibility compliance.

## Mock Data

Tests use mock API responses to simulate the authentication flow without requiring a running backend. These mocks are defined in the test files and simulate the expected responses from the API.

## Test Fixtures

User test data is stored in `cypress/fixtures/user.json` and includes:

- Username/password
- OTP codes
- 2FA codes
- New password information

## Best Practices

1. Each test focuses on a specific aspect of the authentication flow
2. Error cases are handled with proper assertions
3. Accessibility testing ensures the app is usable by everyone
4. Tests are isolated and don't depend on each other

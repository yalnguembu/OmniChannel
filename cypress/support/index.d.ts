declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to fill OTP inputs with a 6-digit code
     * @example cy.fillOtp('123456')
     */
    fillOtp(value: string): Chainable<Element>

    /**
     * Custom command to log in with username and password
     * @example cy.login('testuser', 'password123')
     */
    login(username: string, password: string): Chainable<void>

    /**
     * Custom command to inject axe-core library for accessibility testing
     * @example cy.injectAxe()
     */
    injectAxe(): Chainable<void>

    /**
     * Custom command to test the page for accessibility issues
     * @example cy.checkA11y()
     */
    checkA11y(context?: string | Node | null, options?: any, violationCallback?: (violations: any) => void, skipFailures?: boolean): Chainable<void>
  }
}

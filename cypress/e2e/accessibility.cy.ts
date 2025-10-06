describe("Accessibility Tests", () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it("should have no accessibility violations on login page", () => {
    cy.visit("/auth/login")
    cy.injectAxe()
    cy.checkA11y()
  })

  it("should have no accessibility violations on OTP verification page", () => {
    // Mock the login request to navigate to OTP page
    cy.intercept("POST", "/api/v1/auth/authenticate/login", {
      statusCode: 200,
      body: {
        message: "Login successful, OTP required",
        data: {
          user: {
            id: "123",
            uuid: "test-uuid",
            username: "testuser",
            step: 1,
          },
          custom: {
            verificationObject: {
              uuid: "test-uuid",
              guid: "test-guid",
              minBeforeExpire: 5,
              role: "ADMIN",
              expiresAt: new Date(Date.now() + 300000).toISOString(),
              createdAt: new Date().toISOString(),
              phoneNumber: "+123456789",
              email: "test@example.com",
            },
            verificationType: "EMAIL",
            trials: 0,
            maxTrials: 3,
          },
        },
        timestamp: new Date().toISOString(),
        status: 200,
        isSuccess: true,
      },
    }).as("loginRequest")

    cy.fixture("user.json").then((user) => {
      cy.visit("/auth/login")
      cy.get('input[name="username"]').type(user.username)
      cy.get('input[name="password"]').type(user.password)
      cy.get('button[type="submit"]').click()
      cy.wait("@loginRequest")
      cy.url().should("include", "/auth/otp")
      cy.injectAxe()
      cy.checkA11y()
    })
  })

  it("should have no accessibility violations on set password page", () => {
    // Similar to previous test, but mock the flow to get to the set password page
    cy.intercept("POST", "/api/v1/auth/authenticate/login", {
      statusCode: 200,
      body: {
        message: "Login successful",
        data: {
          user: {
            step: 2, // Set step to 2 to go directly to set password
            uuid: "test-uuid",
          },
          custom: {
            verificationObject: {
              uuid: "test-uuid",
              guid: "test-guid",
              minBeforeExpire: 5,
              role: "ADMIN",
              expiresAt: new Date(Date.now() + 300000).toISOString(),
              createdAt: new Date().toISOString(),
              phoneNumber: "+123456789",
              email: "test@example.com",
            },
            verificationType: "EMAIL",
            trials: 0,
            maxTrials: 3,
          },
        },
        timestamp: new Date().toISOString(),
        status: 200,
        isSuccess: true,
      },
    }).as("loginRequest")

    cy.fixture("user.json").then((user) => {
      cy.visit("/auth/login")
      cy.get('input[name="username"]').type(user.username)
      cy.get('input[name="password"]').type(user.password)
      cy.get('button[type="submit"]').click()
      cy.wait("@loginRequest")
      cy.url().should("include", "/auth/set-password")
      cy.injectAxe()
      cy.checkA11y()
    })
  })

  it("should have no accessibility violations on 2FA pages", () => {
    // Similar to previous tests, but mock the flow to get to the 2FA pages
    cy.intercept("POST", "/api/v1/auth/authenticate/login", {
      statusCode: 200,
      body: {
        message: "Login successful",
        data: {
          user: {
            step: 4, // Set step to 4 for 2FA authentication
            uuid: "test-uuid",
          },
          custom: {
            verificationObject: {
              uuid: "test-uuid",
              guid: "test-guid",
              minBeforeExpire: 5,
              role: "ADMIN",
              expiresAt: new Date(Date.now() + 300000).toISOString(),
              createdAt: new Date().toISOString(),
              phoneNumber: "+123456789",
              email: "test@example.com",
            },
            verificationType: "EMAIL",
            trials: 0,
            maxTrials: 3,
          },
        },
        timestamp: new Date().toISOString(),
        status: 200,
        isSuccess: true,
      },
    }).as("loginRequest")

    cy.fixture("user.json").then((user) => {
      cy.visit("/auth/login")
      cy.get('input[name="username"]').type(user.username)
      cy.get('input[name="password"]').type(user.password)
      cy.get('button[type="submit"]').click()
      cy.wait("@loginRequest")
      cy.url().should("include", "/auth/2fa")
      cy.injectAxe()
      cy.checkA11y()
    })
  })
})

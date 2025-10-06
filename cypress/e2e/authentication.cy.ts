describe("Authentication Flow", () => {
  beforeEach(() => {
    // Reset the application state before each test
    cy.clearLocalStorage()
    cy.clearCookies()

    // Intercept network requests for better handling and stubbing
    cy.intercept("POST", "/api/v1/auth/authenticate/login", {
      statusCode: 200,
      body: {
        message: "Login successful, OTP required",
        data: {
          user: {
            id: "123",
            uuid: "test-uuid",
            username: "testuser",
            firstname: "Test",
            lastname: "User",
            status: "ACTIVE",
            userType: "ADMIN",
            phone: "+123456789",
            email: "test@example.com",
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

    cy.intercept("POST", "/api/v1/auth/authenticate/verifyOtp/**", {
      statusCode: 200,
      body: {
        message: "OTP verified successfully",
        data: {
          user: {
            id: "123",
            uuid: "test-uuid",
            username: "testuser",
            firstname: "Test",
            lastname: "User",
            status: "ACTIVE",
            userType: "ADMIN",
            phone: "+123456789",
            email: "test@example.com",
            step: 2,
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
            trials: 1,
            maxTrials: 3,
          },
        },
        timestamp: new Date().toISOString(),
        status: 200,
        isSuccess: true,
      },
    }).as("verifyOtpRequest")

    cy.intercept("POST", "/api/v1/auth/authenticate/set-password/**", {
      statusCode: 200,
      body: {
        message: "Password set successfully",
        data: {
          user: {
            id: "123",
            uuid: "test-uuid",
            username: "testuser",
            firstname: "Test",
            lastname: "User",
            status: "ACTIVE",
            userType: "ADMIN",
            phone: "+123456789",
            email: "test@example.com",
            step: 3,
          },
        },
        timestamp: new Date().toISOString(),
        status: 200,
        isSuccess: true,
      },
    }).as("setPasswordRequest")

    // Mock the QR code request for 2FA setup
    cy.intercept("GET", "/api/v1/auth/authenticate/qrcode/**", {
      statusCode: 200,
      // Return a fake image as a blob
      response: Cypress.Buffer.from("fake-qr-code-image"),
    }).as("qrCodeRequest")

    cy.intercept("POST", "/api/v1/auth/authenticate/verify-qrcode/**", {
      statusCode: 200,
      body: {
        message: "QR Code verified successfully",
        data: {
          user: {
            id: "123",
            uuid: "test-uuid",
            username: "testuser",
            firstname: "Test",
            lastname: "User",
            status: "ACTIVE",
            userType: "ADMIN",
            phone: "+123456789",
            email: "test@example.com",
            step: 4,
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
            trials: 1,
            maxTrials: 3,
          },
        },
        timestamp: new Date().toISOString(),
        status: 200,
        isSuccess: true,
      },
    }).as("verifyQrCodeRequest")

    cy.intercept("POST", "/api/v1/auth/authenticate/double-auth/**", {
      statusCode: 200,
      body: {
        message: "Authentication successful",
        data: {
          user: {
            id: "123",
            uuid: "test-uuid",
            username: "testuser",
            firstname: "Test",
            lastname: "User",
            status: "ACTIVE",
            userType: "ADMIN",
            phone: "+123456789",
            email: "test@example.com",
            step: 4,
          },
          token: "fake-jwt-token",
        },
        timestamp: new Date().toISOString(),
        status: 200,
        isSuccess: true,
      },
    }).as("doubleAuthRequest")
  })

  it("should complete the full authentication flow", () => {
    cy.fixture("user.json").then((user) => {
      // Step 1: Login
      cy.visit("/auth/login")
      cy.get('input[name="username"]').type(user.username)
      cy.get('input[name="password"]').type(user.password)
      cy.get('button[type="submit"]').click()
      cy.wait("@loginRequest")

      // Verify we're on the OTP verification page
      cy.url().should("include", "/auth/otp")

      // Step 2: OTP Verification
      cy.fillOtp(user.otpCode)
      cy.get('button[type="submit"]').click()
      cy.wait("@verifyOtpRequest")

      // Verify we're on the Set Password page
      cy.url().should("include", "/auth/set-password")

      // Step 3: Set New Password
      cy.get('input[name="newPassword"]').type(user.newPassword)
      cy.get('input[name="confirmPassword"]').type(user.confirmPassword)
      cy.get('button[type="submit"]').click()
      cy.wait("@setPasswordRequest")

      // Verify we're redirected to scan 2FA page
      cy.url().should("include", "/auth/scan-2fa")

      // Step 4: Scan 2FA and set up
      cy.wait("@qrCodeRequest")
      cy.get('img[alt="QR Code"]').should("exist")

      // Verify entering the 2FA code
      cy.fillOtp(user.otpCode)
      cy.get('button[type="submit"]').click()
      cy.wait("@verifyQrCodeRequest")

      // Step 5: Enter 2FA code for final authentication
      cy.url().should("include", "/auth/2fa")
      cy.fillOtp(user.twofaCode)
      cy.get('button[type="submit"]').click()
      cy.wait("@doubleAuthRequest")

      // Verify successful authentication and redirection to dashboard
      cy.url().should("include", "/")
    })
  })

  it("should handle OTP verification error", () => {
    cy.fixture("user.json").then((user) => {
      // Override the OTP verification to simulate an error
      cy.intercept("POST", "/api/v1/auth/authenticate/verifyOtp/**", {
        statusCode: 400,
        body: {
          message: "Invalid OTP",
          timestamp: new Date().toISOString(),
          status: 400,
          isSuccess: false,
        },
      }).as("invalidOtpRequest")

      // Login
      cy.visit("/auth/login")
      cy.get('input[name="username"]').type(user.username)
      cy.get('input[name="password"]').type(user.password)
      cy.get('button[type="submit"]').click()
      cy.wait("@loginRequest")

      // Verify we're on the OTP verification page
      cy.url().should("include", "/auth/otp")

      // Enter an invalid OTP
      cy.fillOtp("111111")
      cy.get('button[type="submit"]').click()
      cy.wait("@invalidOtpRequest")

      // Verify error message is displayed
      cy.contains("Invalid OTP").should("be.visible")

      // We should still be on the OTP page
      cy.url().should("include", "/auth/otp")
    })
  })

  it("should handle password mismatch during password setup", () => {
    cy.fixture("user.json").then((user) => {
      // Login and get to the set password page
      cy.visit("/auth/login")
      cy.get('input[name="username"]').type(user.username)
      cy.get('input[name="password"]').type(user.password)
      cy.get('button[type="submit"]').click()
      cy.wait("@loginRequest")

      // OTP verification
      cy.url().should("include", "/auth/otp")
      cy.fillOtp(user.otpCode)
      cy.get('button[type="submit"]').click()
      cy.wait("@verifyOtpRequest")

      // Set Password with mismatching passwords
      cy.url().should("include", "/auth/set-password")
      cy.get('input[name="newPassword"]').type(user.newPassword)
      cy.get('input[name="confirmPassword"]').type("DifferentPassword123")
      cy.get('button[type="submit"]').click()

      // Verify error message is displayed
      cy.contains("Passwords must match").should("be.visible")

      // We should still be on the set password page
      cy.url().should("include", "/auth/set-password")
    })
  })
})

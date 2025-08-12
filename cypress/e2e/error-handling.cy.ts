describe('Authentication Error Handling', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should handle invalid credentials during login', () => {
    // Mock failed login
    cy.intercept('POST', '/api/v1/auth/authenticate/login', {
      statusCode: 401,
      body: {
        message: 'Invalid username or password',
        timestamp: new Date().toISOString(),
        status: 401,
        isSuccess: false
      }
    }).as('failedLoginRequest');

    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('invaliduser');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.wait('@failedLoginRequest');
    
    // Verify error message is displayed
    cy.contains('Invalid username or password').should('be.visible');
    
    // We should still be on the login page
    cy.url().should('include', '/auth/login');
  });

  it('should handle server errors gracefully', () => {
    // Mock server error
    cy.intercept('POST', '/api/v1/auth/authenticate/login', {
      statusCode: 500,
      body: {
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        status: 500,
        isSuccess: false
      }
    }).as('serverErrorRequest');

    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait('@serverErrorRequest');
    
    // Verify error message is displayed
    cy.contains('Internal server error').should('be.visible');
    
    // We should still be on the login page
    cy.url().should('include', '/auth/login');
  });

  it('should handle session expiration during flow', () => {
    // First login successfully
    cy.intercept('POST', '/api/v1/auth/authenticate/login', {
      statusCode: 200,
      body: {
        message: 'Login successful, OTP required',
        data: {
          user: {
            id: '123',
            uuid: 'test-uuid',
            username: 'testuser',
            step: 1,
          },
          custom: {
            verificationObject: {
              uuid: 'test-uuid',
              guid: 'test-guid',
              minBeforeExpire: 5,
              role: 'ADMIN',
              expiresAt: new Date(Date.now() + 300000).toISOString(),
              createdAt: new Date().toISOString(),
              phoneNumber: '+123456789',
              email: 'test@example.com'
            },
            verificationType: 'EMAIL',
            trials: 0,
            maxTrials: 3
          }
        },
        timestamp: new Date().toISOString(),
        status: 200,
        isSuccess: true
      }
    }).as('loginRequest');

    // Then handle session expired during OTP verification
    cy.intercept('POST', '/api/v1/auth/authenticate/verifyOtp/**', {
      statusCode: 401,
      body: {
        message: 'Session expired',
        timestamp: new Date().toISOString(),
        status: 401,
        isSuccess: false
      }
    }).as('sessionExpiredRequest');

    cy.fixture('user.json').then((user) => {
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type(user.username);
      cy.get('input[name="password"]').type(user.password);
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');
      
      // Verify we're on the OTP verification page
      cy.url().should('include', '/auth/otp');
      
      // Enter OTP
      cy.fillOtp(user.otpCode);
      cy.get('button[type="submit"]').click();
      cy.wait('@sessionExpiredRequest');
      
      // Verify we're redirected back to login
      cy.url().should('include', '/auth/login');
    });
  });

  it('should handle max OTP trials exceeded', () => {
    // First login successfully
    cy.intercept('POST', '/api/v1/auth/authenticate/login', {
      statusCode: 200,
      body: {
        message: 'Login successful, OTP required',
        data: {
          user: {
            id: '123',
            uuid: 'test-uuid',
            username: 'testuser',
            step: 1,
          },
          custom: {
            verificationObject: {
              uuid: 'test-uuid',
              guid: 'test-guid',
              minBeforeExpire: 5,
              role: 'ADMIN',
              expiresAt: new Date(Date.now() + 300000).toISOString(),
              createdAt: new Date().toISOString(),
              phoneNumber: '+123456789',
              email: 'test@example.com'
            },
            verificationType: 'EMAIL',
            trials: 3, // Set trials to max already
            maxTrials: 3
          }
        },
        timestamp: new Date().toISOString(),
        status: 200,
        isSuccess: true
      }
    }).as('loginRequest');

    // Then handle max trials exceeded
    cy.intercept('POST', '/api/v1/auth/authenticate/verifyOtp/**', {
      statusCode: 429,
      body: {
        message: 'Max OTP trials exceeded',
        timestamp: new Date().toISOString(),
        status: 429,
        isSuccess: false
      }
    }).as('maxTrialsRequest');

    cy.fixture('user.json').then((user) => {
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type(user.username);
      cy.get('input[name="password"]').type(user.password);
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');
      
      // Verify we're on the OTP verification page
      cy.url().should('include', '/auth/otp');
      
      // Enter OTP
      cy.fillOtp(user.otpCode);
      cy.get('button[type="submit"]').click();
      cy.wait('@maxTrialsRequest');
      
      // Verify error message is displayed
      cy.contains('Max OTP trials exceeded').should('be.visible');
    });
  });

  it('should resend OTP when requested', () => {
    // Mock successful login
    cy.intercept('POST', '/api/v1/auth/authenticate/login', {
      statusCode: 200,
      body: {
        message: 'Login successful, OTP required',
        data: {
          user: {
            id: '123',
            uuid: 'test-uuid',
            username: 'testuser',
            step: 1,
          },
          custom: {
            verificationObject: {
              uuid: 'test-uuid',
              guid: 'test-guid',
              minBeforeExpire: 5,
              role: 'ADMIN',
              expiresAt: new Date(Date.now() + 300000).toISOString(),
              createdAt: new Date().toISOString(),
              phoneNumber: '+123456789',
              email: 'test@example.com'
            },
            verificationType: 'EMAIL',
            trials: 0,
            maxTrials: 3
          }
        },
        timestamp: new Date().toISOString(),
        status: 200,
        isSuccess: true
      }
    }).as('loginRequest');

    // Mock resend OTP request
    cy.intercept('GET', '/api/v1/auth/authenticate/resend-otp/**', {
      statusCode: 200,
      body: {
        message: 'OTP resent successfully',
        timestamp: new Date().toISOString(),
        status: 200,
        isSuccess: true
      }
    }).as('resendOtpRequest');

    cy.fixture('user.json').then((user) => {
      cy.visit('/auth/login');
      cy.get('input[name="username"]').type(user.username);
      cy.get('input[name="password"]').type(user.password);
      cy.get('button[type="submit"]').click();
      cy.wait('@loginRequest');
      
      // Verify we're on the OTP verification page
      cy.url().should('include', '/auth/otp');
      
      // Click resend OTP button
      cy.contains('Resend code').click();
      cy.wait('@resendOtpRequest');
      
      // Verify success message is displayed
      cy.contains('OTP resent successfully').should('be.visible');
    });
  });
});

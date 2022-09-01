import {
  STG02_AUTH_URL,
  MFA_STG02_ACCOUNT_ID,
  MFA_STG02_USER_EMAIL,
  MFA_STG02_USER_PASSWORD,
} from '../utils';

describe('login v1', () => {
  beforeEach(() => {
    cy.visit(STG02_AUTH_URL);
  });

  afterEach(() => {
    Cypress.session.clearAllSavedSessions();
  });

  it('should display account id is required', () => {
    cy.get('[data-cy=account-id]').type('abcde');
    cy.get('[data-cy=email]').type(MFA_STG02_USER_EMAIL);
    cy.get('[data-cy=password]').type(MFA_STG02_USER_PASSWORD);
    cy.get('[data-cy=login-button]').click();
    cy.contains('Account ID is required field');
  });

  it('should display invalid account id', () => {
    cy.get('[data-cy=account-id]').type('12345678901234567890');
    cy.get('[data-cy=email]').type(MFA_STG02_USER_EMAIL);
    cy.get('[data-cy=password]').type(MFA_STG02_USER_PASSWORD);
    cy.get('[data-cy=login-button]').click();

    cy.contains('Account ID is invalid. Please try again');
  });
});

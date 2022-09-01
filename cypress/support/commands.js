// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import {
  STG02_OKTA_LOGIN_URL,
  IDV2_FEDERATED_USERNAME,
  IDV2_FEDERATED_PASSWORD,
} from '../utils';

Cypress.Commands.add('getSessionStorage', (key) => {
  cy.window().then((window) => window.sessionStorage.getItem(key));
});

Cypress.Commands.add('setSessionStorage', (key, value) => {
  cy.window().then((window) => {
    window.sessionStorage.setItem(key, value);
  });
});

Cypress.Commands.add('oktalogin', () => {
  cy.intercept({
    method: 'GET',
    url: 'https://api.identity-stg.fabric.zone/ums/v2/users/self',
  }).as('getUser');
  const inputUsername = (username) =>
    cy
      .get('input[name="username"]')
      .type(username)
      .then(() => {
        cy.get('input[type="submit"').should('have.value', 'Next').click();
        return undefined;
      });
  const inputPassword = (password) =>
    cy.get('input[name="password"]').should('be.visible').type(password);
  const clickSignIn = () =>
    cy.get('input[type="submit"]').should('have.value', 'Sign In').click();
  cy.visit(STG02_OKTA_LOGIN_URL);
  inputUsername(IDV2_FEDERATED_USERNAME).should('be.disabled');
  inputPassword(IDV2_FEDERATED_PASSWORD);
  clickSignIn();
  cy.wait('@getUser');
  cy.url().should('include', '/admin');
});

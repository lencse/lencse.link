/// <reference types="cypress" />

import { token } from '../fixtures/token.json'

export const login = () => {
    cy.setCookie('token', token)
    cy.visit('/')
}

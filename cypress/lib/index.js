/// <reference types="cypress" />

import { token } from '../fixtures/token.json'
import seed from '../fixtures/seed'

export const login = () => {
    cy.setCookie('token', token)
    cy.visit('/')
}

export const admin = seed.users.pop()

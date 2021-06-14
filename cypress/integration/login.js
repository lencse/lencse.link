/// <reference types="cypress" />

import seed from '../fixtures/seed'
import { admin } from '../lib'

context('Login process', () => {

    beforeEach(() => {
        cy.visit('/')
    })

    it('Successful login and logout process', () => {
        cy.get('[data-cy=login_email]').should('be.visible')
        cy.getCookie('token').should('not.exist')
        cy.get('[data-cy=login_email]').type(admin.email)
        cy.get('[data-cy=login_password]').type(admin.password)
        cy.get('[data-cy=login_submit]').click()
        cy.get('[data-cy=user_username]').should('contain', 'admin')
        cy.getCookie('token').should('exist')
        cy.get('[data-cy=user_logout]').click()
        cy.get('[data-cy=login_email]').should('be.visible')
        cy.getCookie('token').should('not.exist')
    })

    it('Wrong credentials', () => {
        cy.get('[data-cy=login_email]').type(admin.email)
        cy.get('[data-cy=login_password]').type('WRONG PASSWORD')
        cy.get('[data-cy=login_submit]').click()
        cy.get('[data-cy=login_error]').should('be.visible')
        cy.getCookie('token').should('not.exist')
    })

})

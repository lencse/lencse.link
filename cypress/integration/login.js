/// <reference types="cypress" />

import seed from '../fixtures/seed'

context('Login process', () => {

    const admin = seed.users.pop()

    beforeEach(() => {
        cy.visit('/')
    })

    it('Not logged in at first open', () => {
        cy.get('[data-cy=login_email]').should('be.visible')
        cy.getCookie('token').should('not.exist')
    })

    it('Successful login', () => {

        cy.get('[data-cy=login_email]').type(admin.email)
        cy.get('[data-cy=login_password]').type(admin.password)
        cy.get('[data-cy=login_submit]').click()
        cy.get('[data-cy=user_username]').should('contain', 'admin')
        cy.getCookie('token').should('exist')
    })

    it('Wrong credentials', () => {
        cy.get('[data-cy=login_email]').type(admin.email)
        cy.get('[data-cy=login_password]').type('WRONG PASSWORD')
        cy.get('[data-cy=login_submit]').click()
        cy.get('[data-cy=login_error]').should('be.visible')
        cy.getCookie('token').should('not.exist')
    })

})

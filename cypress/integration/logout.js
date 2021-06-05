/// <reference types="cypress" />

import seed from '../fixtures/seed'

context('Logout process', () => {

    const admin = seed.users.pop()

    beforeEach(() => {
        cy.visit('/')
        cy.get('[data-cy=login_email]').type(admin.email)
        cy.get('[data-cy=login_password]').type(admin.password)
        cy.get('[data-cy=login_submit]').click()
    })

    it('Logout', () => {
        cy.get('[data-cy=user_logout]').click()
        cy.get('[data-cy=login_email]').should('be.visible')
        cy.getCookie('token').should('not.exist')
    })

})

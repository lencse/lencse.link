/// <reference types="cypress" />

import { login } from '../lib'

context.skip('Logout process', () => {

    beforeEach(() => {
        login()
    })

    it('Logout', () => {
        cy.get('[data-cy=user_logout]').click()
        cy.get('[data-cy=login_email]').should('be.visible')
        cy.getCookie('token').should('not.exist')
    })

})

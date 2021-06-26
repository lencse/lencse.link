/// <reference types="cypress" />

import { admin } from '../lib'

context('Login process', () => {

    beforeEach(() => {
        cy.visit('/')
    })

    it('Successful login and logout process', () => {
        cy.get('#login-form [name=email]').should('be.visible')
        cy.getCookie('token').should('not.exist')
        cy.get('#login-form [name=email]').type(admin.email)
        cy.get('#login-form [name=password]').type(admin.password)
        cy.get('#login-form [name=submit]').click()
        cy.get('[data-cy=user_username]').should('contain', 'admin')
        cy.getCookie('token').should('exist')
        cy.get('[data-cy=user_logout]').click()
        cy.get('#login-form [name=email]').should('be.visible')
        cy.getCookie('token').should('not.exist')
    })

    it('Wrong credentials', () => {
        cy.get('#login-form [name=email]').type(admin.email)
        cy.get('#login-form [name=password]').type('WRONG PASSWORD')
        cy.get('#login-form [name=submit]').click()
        cy.get('[data-cy=login_error]').should('be.visible')
        cy.getCookie('token').should('not.exist')
    })

})

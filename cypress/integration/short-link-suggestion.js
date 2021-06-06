/// <reference types="cypress" />

import { login } from '../lib'

context('Logout process', () => {

    beforeEach(() => {
        login()
    })

    it('Suggets new when clicking the button', () => {
        cy.get('[data-cy=add_suggest_button]').click()
        cy.get('[data-cy=add_suggest_input]').should(input => {
            const val = input.val()
            expect(val).to.match(/.+/)
        })
    })

    it('Suggets new for every click', () => {
        cy.get('[data-cy=add_suggest_button]').click()
        cy.get('[data-cy=add_suggest_input]').should(input1 => {
            const first = input1.val()
            expect(first).to.match(/.+/)
        }).then(input1 => {
            const first = input1.val()
            expect(first).to.match(/.+/)
            cy.get('[data-cy=add_suggest_button]').click()
            cy.get('[data-cy=add_suggest_input]').should(input2 => {
                const curr = input2.val()
                expect(curr).to.match(/.+/)
                expect(first).not.to.eq(curr)
            })
        })
    })

})

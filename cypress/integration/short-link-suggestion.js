/// <reference types="cypress" />

import { login } from '../lib'

context('Short link suggestion', () => {

    beforeEach(() => {
        login()
    })

    it('Suggest new for every click on the button', () => {
        cy.get('[data-cy=add_suggest_button]').click()
        cy.get('[data-cy=add_short_link]').should(input1 => {
            const first = input1.val()
            expect(first).to.match(/.+/)
        }).then(input1 => {
            const first = input1.val()
            expect(first).to.match(/.+/)
            cy.get('[data-cy=add_suggest_button]').click()
            cy.get('[data-cy=add_short_link]').should(input2 => {
                const curr = input2.val()
                expect(curr).to.match(/.+/)
                expect(first).not.to.eq(curr)
            })
        })
    })

    it('Suggest new when typing into the full URL input', () => {
        cy.get('[data-cy=add_redirect_to]').type('htts://github.com')
        cy.get('[data-cy=add_short_link]').should(input => {
            const val = input.val()
            expect(val).to.match(/.+/)
        })
    })

    it('Don\'t change after typing more', () => {
        cy.window().then(window => {
            window['pina'] = 'pina'
        })
        cy.get('[data-cy=add_redirect_to]').type('htts://github.com')
        cy.get('[data-cy=add_short_link]').should(input => {
            const val = input.val()
            expect(val).to.match(/.+/)
        }).then(input1 => {
            const first = input1.val()
            expect(first).to.match(/.+/)
            cy.get('[data-cy=add_redirect_to]').type('/lencse')
            cy.get('[data-cy=add_short_link]').should(input2 => {
                const curr = input2.val()
                expect(curr).to.match(/.+/)
                expect(first).to.eq(curr)
            })
        })
    })



})

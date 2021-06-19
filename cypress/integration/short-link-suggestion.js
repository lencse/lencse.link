/// <reference types="cypress" />

import { login } from '../lib'

context('Short link suggestion', () => {

    beforeEach(() => {
        login()
    })

    it('Suggest new for every click on the button', () => {
        cy.get('[data-cy=add_redirect_to]').type('https://github.com')
        cy.get('[data-cy=add_short_link]').should($afterTyping => {
            const valueAfterTyping = $afterTyping.val()
            expect(valueAfterTyping).to.match(/.+/)
        }).then($afterTyping => {
            const valueAfterTyping = $afterTyping.val()
            cy.get('[data-cy=add_suggest_button]').click()
            cy.get('[data-cy=add_short_link]').should($afterFirstClick => {
                const valueAfterFirstClick = $afterFirstClick.val()
                expect(valueAfterFirstClick).to.match(/.+/)
                expect(valueAfterFirstClick).not.to.eq(valueAfterTyping)
            }).then($afterFirstClick => {
                const valueAfterFirstClick = $afterFirstClick.val()
                cy.get('[data-cy=add_suggest_button]').click()
                cy.get('[data-cy=add_short_link]').should($afterSecondClick => {
                    const valueAfterSecondClick = $afterSecondClick.val()
                    expect(valueAfterSecondClick).to.match(/.+/)
                    expect(valueAfterFirstClick).not.to.eq(valueAfterSecondClick)
                }).then($afterSecondClick => {
                    const valueAfterSecondClick = $afterSecondClick.val()
                    cy.get('[data-cy=add_redirect_to]').type('/lencse')
                    cy.get('[data-cy=add_short_link]').should($afterMoreTyping => {
                        const valueAfterMoreTyping = $afterMoreTyping.val()
                        expect(valueAfterMoreTyping).to.eq(valueAfterSecondClick)
                    })
                })
            })
        })
    })

})

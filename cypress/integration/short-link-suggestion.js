/// <reference types="cypress" />

import { login } from '../lib'

context('Short link suggestion', () => {

    beforeEach(() => {
        login()
    })

    it('Suggest new for every click on the button', () => {
        cy.get('#add-link [name=redirectTo]').type('https://github.com')
        cy.get('#add-link [name=shortLink]').should($afterTyping => {
            const valueAfterTyping = $afterTyping.val()
            expect(valueAfterTyping).to.match(/.+/)
        }).then($afterTyping => {
            const valueAfterTyping = $afterTyping.val()
            cy.get('#add-link [name=suggest]').click()
            cy.get('#add-link [name=shortLink]').should($afterFirstClick => {
                const valueAfterFirstClick = $afterFirstClick.val()
                expect(valueAfterFirstClick).to.match(/.+/)
                expect(valueAfterFirstClick).not.to.eq(valueAfterTyping)
            }).then($afterFirstClick => {
                const valueAfterFirstClick = $afterFirstClick.val()
                cy.get('#add-link [name=suggest]').click()
                cy.get('#add-link [name=shortLink]').should($afterSecondClick => {
                    const valueAfterSecondClick = $afterSecondClick.val()
                    expect(valueAfterSecondClick).to.match(/.+/)
                    expect(valueAfterFirstClick).not.to.eq(valueAfterSecondClick)
                }).then($afterSecondClick => {
                    const valueAfterSecondClick = $afterSecondClick.val()
                    cy.get('#add-link [name=redirectTo]').type('/lencse')
                    cy.get('#add-link [name=shortLink]').should($afterMoreTyping => {
                        const valueAfterMoreTyping = $afterMoreTyping.val()
                        expect(valueAfterMoreTyping).to.eq(valueAfterSecondClick)
                    })
                })
            })
        })
    })

})

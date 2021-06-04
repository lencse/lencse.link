import { loginHandler } from "../../pages/api/login"
import type { NextApiRequest, NextApiResponse } from 'next'
import { ClientRequest, IncomingMessage, ServerResponse } from "http"
import { createMocks } from 'node-mocks-http'
import { apiResolver } from "next/dist/next-server/server/api-utils"
import argon2 from "argon2"
import { parse as cookieParse } from "cookie"
import jwt from 'jsonwebtoken'
import { logoutHandler } from "../../pages/api/logout"
import { resolveHandler } from "./api-connect"

describe('Logout API', () => {

    it('Successful logout', async () => {
        const { req, res } = createMocks({
            method: 'POST'
        })
        await resolveHandler(req, res, logoutHandler)

        expect(res.statusCode).toBe(307)
        const headers = res.getHeaders()
        const cookie = cookieParse(headers['set-cookie'])
        const token = cookie.token
        expect(headers.location).toBe('/')
        expect(cookie.Path).toBe('/')
        expect(cookie.SameSite).toBe('Strict')
        expect(cookie.Expires).toBe('Thu, 01 Jan 1970 00:00:00 GMT')
        expect(token).toBe('null')
    })

    it('Wrong HTTP method', async () => {
        const { req, res } = createMocks({
            method: 'GET'
        })
        await resolveHandler(req, res, logoutHandler)

        expect(res.statusCode).toBe(405)
        const headers = res.getHeaders()
        expect(headers.allow).toBe('POST')
    })

})

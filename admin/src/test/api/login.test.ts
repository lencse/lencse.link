import { loginHandler } from "../../pages/api/login"
import type { NextApiRequest, NextApiResponse } from 'next'
import { ClientRequest, IncomingMessage, ServerResponse } from "http"
import { createMocks } from 'node-mocks-http'
import { apiResolver } from "next/dist/next-server/server/api-utils"
import argon2 from "argon2"
import { parse as cookieParse } from "cookie"
import jwt from 'jsonwebtoken'
import { resolveHandler } from "./api-connect"

const createHandler = () => loginHandler({
    async getByEmail(email) {
        if ('test@test.hu' === email) {
            return [{
                email,
                hashedPassword: await argon2.hash('password', {}),
                id: 'TEST-ID',
                username: 'test'
            }]
        }
        return []
    }
}, 'SECRET')

describe('Login API', () => {

    it('Successful login', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                email: 'test@test.hu',
                password: 'password',
            }
        })
        await resolveHandler(req, res, createHandler())

        expect(res.statusCode).toBe(307)
        const headers = res.getHeaders()
        const cookie = cookieParse(headers['set-cookie'])
        const token = cookie.token
        expect(headers.location).toBe('/')
        expect(cookie.Path).toBe('/')
        expect(cookie.SameSite).toBe('Strict')
        const data: any = jwt.verify(token, 'SECRET')
        expect(data.userId).toBe('TEST-ID')
    })

    it('Wrong credentials', async () => {
        const { req, res } = createMocks({

            method: 'POST',
            headers: {
                host: 'test-host'
            },
            body: {
                email: 'test@test.hu',
                password: 'wrong password',
            }
        })
        await resolveHandler(req, res, createHandler())

        expect(res.statusCode).toBe(307)
        const headers = res.getHeaders()
        const cookie = cookieParse(headers['set-cookie'])
        const token = cookie.token
        expect(headers.location).toBe('/?err=Invalid+credentials.')
        expect(cookie.Path).toBe('/')
        expect(cookie.SameSite).toBe('Strict')
        expect(cookie.Expires).toBe('Thu, 01 Jan 1970 00:00:00 GMT')
        expect(token).toBe('null')
    })

    it('Wrong HTTP method', async () => {
        const { req, res } = createMocks({
            method: 'GET'
        })
        await resolveHandler(req, res, createHandler())

        expect(res.statusCode).toBe(405)
        const headers = res.getHeaders()
        expect(headers.allow).toBe('POST')
    })

    it('POST without password', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                email: 'test@test.hu',
            }
        })
        await resolveHandler(req, res, createHandler())

        expect(res.statusCode).toBe(400)
    })

})

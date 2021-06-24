import { loginHandler } from "../../pages/api/login"
import type { NextApiRequest, NextApiResponse } from 'next'
import { ClientRequest, IncomingMessage, ServerResponse } from "http"
import { createMocks, MockResponse, RequestMethod } from 'node-mocks-http'
import { apiResolver } from "next/dist/next-server/server/api-utils"
import argon2 from "argon2"
import { parse as cookieParse } from "cookie"
import jwt from 'jsonwebtoken'
import { resolveHandler } from "./api-connect"
import { linksHandler } from "../../pages/api/links"
import { Link, LinkData, LinkToSave } from "../../link/types"
import { LinkDb, LinkRepository, QueryParams, QueryResult, ShortLinkExisting } from "../../link/repository"
import { UserById } from "../../user/repository"
import { createToken } from "../../user"
import { validate } from "uuid"
import { now } from "lodash"
import { link } from "fs"
import { shortLinkAvailabilityHandler } from "../../pages/api/short-link-availability"
import { axiosHeadStatuscode } from "../../link/availability"
import { shortLinkSuggestionHandler } from "../../pages/api/short-link-suggestion"
import { urlAvailabilityHandler } from "../../pages/api/url-availability"

const testUser = {
    email: 'test@test.hu',
    id: 'TEST-ID',
    username: 'test'
}

class UserTesRepository implements UserById {
    async getById(id: string) {
        if (testUser.id === id) {
            return [testUser]
        }
        return []
    }
}

const createHandler = (userRepo: UserTesRepository) =>
    urlAvailabilityHandler(
        userRepo,
        'SECRET',
        async url => {
            if ('https://not-existing-url.com' === url) {
                throw Error('Test error')
            }
        }
    )

const call = async (method = 'GET'): Promise<MockResponse<any>> => {
    const userRepo = new UserTesRepository()
    const { req, res } = createMocks({
        method: method as RequestMethod,
        url: 'http://localhost/api/url-availability?url=http%3A%2F%2Flocalhost',
        query: {
            url: 'http://localhost'
        },
        headers: {
            cookie: `token=${createToken('SECRET')(testUser)}`
        }
    })
    await resolveHandler(req, res, createHandler(userRepo, ))
    return res
}

describe('URL availability API', () => {

    it('Suggest short link', async () => {
        const res = await call()
        expect(res.statusCode).toBe(200)
    })

    // it('Suggest new short link for every call', async () => {
    //     const result1 = (await call())._getJSONData().shortLinkSuggestion
    //     const result2 = (await call())._getJSONData().shortLinkSuggestion
    //     expect(result1).not.toEqual(result2)
    // })

    // it('Wrong HTTP method', async () => {
    //     const res = await call('POST')
    //     expect(res.statusCode).toBe(405)
    //     const headers = res.getHeaders()
    //     expect(headers.allow).toBe('GET')
    // })


})



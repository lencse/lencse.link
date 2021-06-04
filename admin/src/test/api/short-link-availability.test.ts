import { loginHandler } from "../../pages/api/login"
import type { NextApiRequest, NextApiResponse } from 'next'
import { ClientRequest, IncomingMessage, ServerResponse } from "http"
import { createMocks } from 'node-mocks-http'
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

class LinkTestRepository implements ShortLinkExisting {

    async isShortLinkExisting(shortLink: string) {
        return 'test1' === shortLink
    }

}

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

const createHandler = (userRepo: UserTesRepository, linkRepo: LinkTestRepository) =>
    shortLinkAvailabilityHandler(
        userRepo,
        'SECRET',
        linkRepo,
        'http://test',
        async url => 'http://test/onlyOnWeb?nolog=' === url ? 200 : 404
    )

describe('Short link availability API', () => {

    it('Existing short link in DB', async () => {
        const userRepo = new UserTesRepository()
        const linkRepo = new LinkTestRepository()
        const { req, res } = createMocks({
            method: 'GET',
            url: 'http://localhost/api/short-link-availability?shortLink=test1',
            headers: {
                cookie: `token=${createToken('SECRET')(testUser)}`
            }
        })
        await resolveHandler(req, res, createHandler(userRepo, linkRepo))

        expect(res.statusCode).toBe(200)
    })

    it('Existing short link on web request', async () => {
        const userRepo = new UserTesRepository()
        const linkRepo = new LinkTestRepository()
        const { req, res } = createMocks({
            method: 'GET',
            url: 'http://localhost/api/short-link-availability?shortLink=onlyOnWeb',
            headers: {
                cookie: `token=${createToken('SECRET')(testUser)}`
            }
        })
        await resolveHandler(req, res, createHandler(userRepo, linkRepo))

        expect(res.statusCode).toBe(200)
    })

    it('Non-existing short link', async () => {
        const userRepo = new UserTesRepository()
        const linkRepo = new LinkTestRepository()
        const { req, res } = createMocks({
            method: 'GET',
            url: 'http://localhost/api/short-link-availability?shortLink=new',
            headers: {
                cookie: `token=${createToken('SECRET')(testUser)}`
            }
        })
        await resolveHandler(req, res, createHandler(userRepo, linkRepo))

        expect(res.statusCode).toBe(404)
    })

    it('Wrong HTTP method', async () => {
        const userRepo = new UserTesRepository()
        const linkRepo = new LinkTestRepository()
        const { req, res } = createMocks({
            method: 'POST',
            headers: {
                cookie: `token=${createToken('SECRET')(testUser)}`
            }
        })
        await resolveHandler(req, res, createHandler(userRepo, linkRepo))

        expect(res.statusCode).toBe(405)
        const headers = res.getHeaders()
        expect(headers.allow).toBe('GET')
    })


})



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
import { LinkDb, LinkRepository, QueryParams, QueryResult } from "../../link/repository"
import { UserById } from "../../user/repository"
import { createToken } from "../../user"
import { validate } from "uuid"
import { now } from "lodash"
import { link } from "fs"

const timer = {
    now: new Date()
}

class LinkTestRepository implements LinkRepository {
    links: LinkData[] = []

    async addLink(data: LinkToSave): Promise<Link> {
        this.links.push({
            id: data.id,
            shortLink: data.shortLink,
            redirectTo: data.redirectTo,
            creationDate: timer.now,
            hitCount: 0,
            user: {
                email: 'test@test.hu',
                id: data.userId,
                isActive: true,
                username: 'test'
            }
        })
        return data
    }

    async removeLink(id: string): Promise<void> {
        this.links = this.links.filter(l => id !== l.id)
    }

    async getLinks(params: QueryParams): Promise<QueryResult> {
        return {
            links: this.links,
            info: {
                count: 0,
                page: 0,
                pageCount: 0,
                pageSize: 0
            }
        }
    }

    async findOneByShortLink(shortLink: string): Promise<LinkData | null> {
        return this.links.find(link => shortLink === link.shortLink) ?? null
    }

    async isShortLinkExisting(shortLink: string): Promise<boolean> {
        return this.links.some(link => shortLink === link.shortLink)
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

describe('Links API', () => {

    it('Create link', async () => {
        const userRepo = new UserTesRepository()
        const linkRepo = new LinkTestRepository()
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                shortLink: 'test',
                redirectTo: 'https://example.com',
            },
            headers: {
                cookie: `token=${createToken('SECRET')(testUser)}`
            }
        })
        timer.now = new Date('2000-01-01T00:00:00Z')
        await resolveHandler(req, res, linksHandler(userRepo, 'SECRET', linkRepo))

        expect(res.statusCode).toBe(201)
        const result = res._getJSONData().link
        expect(validate(result.id)).toBeTruthy()
        expect(result.shortLink).toBe('test')
        expect(result.redirectTo).toBe('https://example.com')
        const { userId, ...rest} = result
        expect([{
            ...linkRepo.links[0],
            creationDate: new Date(linkRepo.links[0].creationDate),
        }]).toEqual([{
            ...rest,
            hitCount: 0,
            creationDate: timer.now,
            user: {
                ...testUser,
                isActive: true,
            }
        }])
    })

})

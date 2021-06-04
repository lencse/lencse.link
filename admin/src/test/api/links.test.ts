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

        const { id, ...withoutId } = result
        expect(withoutId).toEqual({
            shortLink: 'test',
            redirectTo: 'https://example.com',
            userId: testUser.id
        })
        expect(validate(result.id)).toBeTruthy()

        const { userId, ...withoutUserId } = result
        expect([{
            ...linkRepo.links[0],
            creationDate: new Date(linkRepo.links[0].creationDate),
        }]).toEqual([{
            ...withoutUserId,
            hitCount: 0,
            creationDate: timer.now,
            user: {
                ...testUser,
                isActive: true,
            }
        }])
    })

    it('Missing data from link creation', async () => {
        const userRepo = new UserTesRepository()
        const linkRepo = new LinkTestRepository()
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                shortLink: 'test',
            },
            headers: {
                cookie: `token=${createToken('SECRET')(testUser)}`
            }
        })
        await resolveHandler(req, res, linksHandler(userRepo, 'SECRET', linkRepo))

        expect(res.statusCode).toBe(400)
    })

    it('Get links', async () => {
        const userRepo = new UserTesRepository()
        const linkRepo = new LinkTestRepository()
        timer.now = new Date('2000-01-01T00:00:00Z')
        linkRepo.addLink({
            id: 'ID1',
            shortLink: 'test1',
            redirectTo: 'http://example.com',
            userId: testUser.id
        })
        timer.now = new Date('2000-01-01T00:01:00Z')
        linkRepo.addLink({
            id: 'ID2',
            shortLink: 'test1',
            redirectTo: 'http://example.com/test',
            userId: testUser.id
        })
        const { req, res } = createMocks({
            method: 'GET',
            headers: {
                cookie: `token=${createToken('SECRET')(testUser)}`
            }
        })
        await resolveHandler(req, res, linksHandler(userRepo, 'SECRET', linkRepo))

        expect(res.statusCode).toBe(200)
        const result = res._getJSONData().links
        expect(result).toEqual([
            {
                id: 'ID1',
                shortLink: 'test1',
                redirectTo: 'http://example.com',
                creationDate: '2000-01-01T00:00:00.000Z',
                hitCount: 0,
                user: {
                    email: 'test@test.hu',
                    id: 'TEST-ID',
                    isActive: true,
                    username: 'test'
                }
            },
            {
                id: 'ID2',
                shortLink: 'test1',
                redirectTo: 'http://example.com/test',
                creationDate: '2000-01-01T00:01:00.000Z',
                hitCount: 0,
                user: {
                    email: 'test@test.hu',
                    id: 'TEST-ID',
                    isActive: true,
                    username: 'test'
                }
            }
        ])
    })

    it('Wrong HTTP method', async () => {
        const userRepo = new UserTesRepository()
        const linkRepo = new LinkTestRepository()
        const { req, res } = createMocks({
            method: 'DELETE',
            headers: {
                cookie: `token=${createToken('SECRET')(testUser)}`
            }
        })
        await resolveHandler(req, res, linksHandler(userRepo, 'SECRET', linkRepo))

        expect(res.statusCode).toBe(405)
        const headers = res.getHeaders()
        expect(headers.allow).toBe('GET, POST')
    })

})

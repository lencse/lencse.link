import { validateToken, TokenValidationError } from '../../user'
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { LinkDb, LinkRepository, ShortLinkDuplicationError } from '../../link/repository'
import { connection } from '../../db'
import { v4 as uuid, validate } from 'uuid'
import { User } from '../../user/types'
import config from '../../config/config'
import { Context, ContextAfterAuth, headHttpMethodMiddleware, userMiddleware, HandlerAfterAuthentication } from '../../api'
import { UserByEmail, UserById, UserDb } from '../../user/repository'

const mainHandler = (db: LinkRepository): HandlerAfterAuthentication =>
    async (ctx) => {
        const { req, res, user } = ctx
        if ('GET' === req.method) {
            if (req.query.hasOwnProperty('shortLink')) {
                const shortLink = String(req.query.shortLink)
                const link = await db.findOneByShortLink(shortLink)
                if (null === link) {
                    res.status(404)
                    res.send('Not found.')
                    return
                }
                res.status(200)
                res.json({
                    link
                })
                return
            }
            const page = Number(req.query.page ?? 0)
            const orderString = String(req.query.order ?? 'creationDate(desc)')
            const matches: any = /^(shortLink|redirectTo|createdBy|creationDate|hitCount)\((asc|desc)\)$/.exec(orderString)
            if (!matches) {
                res.status(400)
                res.send('Bad request.')
                return
            }

            const result = await db.getLinks({
                pagination: { page, pageSize: config.dashboard.pageSize },
                orderBy: { field: matches[1], order: matches[2] },
            })
            res.status(200)
            res.json(result)
            return

        }
        if ('POST' === req.method) {
            if (!req.body.hasOwnProperty('shortLink') || !req.body.hasOwnProperty('redirectTo')) {
                res.status(400)
                res.send('Bad request.')
                return
            }
            const shortLink = String(req.body.shortLink).trim().slice(0, 1024)
            const redirectTo = String(req.body.redirectTo).trim().slice(0, 4096)
            if (0 === shortLink.length || 0 === redirectTo.length) {
                res.status(400)
                res.send('Bad request.')
                return
            }
            try {
                const link = await db.addLink({
                    id: uuid(),
                    shortLink: shortLink,
                    redirectTo: redirectTo,
                    userId: user.id
                })
                res.status(201)
                res.json({ link })
                return
            } catch (e) {
                if (e instanceof ShortLinkDuplicationError) {
                    res.status(409)
                    res.json({
                        error: {
                            msg: `Duplicate short link: ${shortLink}`
                        }
                    })
                    return
                }
                throw e
            }
        }
        res.status(405)
        res.setHeader('Allow', 'GET, POST')
        res.send('Method not allowed.')
    }

export const linksHandler = (userDb: UserById, jwtSecret: string, linkDb: LinkRepository) =>
    async (ctx: Context) => {
        await headHttpMethodMiddleware(ctx)
        await userMiddleware(userDb, jwtSecret)(ctx, mainHandler(linkDb))
    }


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await linksHandler(
        new UserDb(await connection()),
        config.jwt.secret,
        new LinkDb(await connection())
    )({ req, res })
}

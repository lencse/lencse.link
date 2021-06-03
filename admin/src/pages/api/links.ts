import { validateTokenAndGetUser, TokenValidationError } from '../../user'
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { LinkDb, ShortLinkDuplicationError } from '../../link/repository'
import { connection } from '../../db'
import { v4 as uuid, validate } from 'uuid'
import { User } from '../../user/types'
import config from '../../config/config'
// import Router from 'koa-router'

async function handleTokenAndGetUser(req: NextApiRequest, res: NextApiResponse): Promise<User | false> {
    const { token } = req.cookies
    try {
        return await validateTokenAndGetUser(token)
    } catch (err) {
        if (err instanceof TokenValidationError) {
            res.status(401).send('Unauthorized.')
            return false
        }
        throw err
    }
}

async function headHttMethod(req: NextApiRequest, res: NextApiResponse) {
    if ('HEAD' === req.method) {
        req.method = 'GET'
        req.headers['original-method'] = 'HEAD'
    }
    // TODO: somehow empty the res stream
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await headHttMethod(req, res)
    // const router = new Router()
    // router.get('/api/links', async () => console.log(666))
    // const x = router.match(req.url, req.method)
    // console.log(x.path[0].stack[0](req, res))
    const user = await handleTokenAndGetUser(req, res)
    if (false === user) {
        return
    }
    if ('GET' === req.method) {
        const db = new LinkDb(await connection())
        if (req.query.hasOwnProperty('shortLink')) {
            const shortLink = String(req.query.shortLink)
            const link = await db.findOneByShortLink(shortLink)
            if (null === link) {
                res.status(404).json({
                    'msg': 'Not found.'
                })
                return
            }
            res.status(200).json({
                link
            })
            return
        }
        const page = Number(req.query.page ?? 0)
        const orderString = String(req.query.order ?? 'creationDate(desc)')
        const matches: any = /^(shortLink|redirectTo|createdBy|creationDate|hitCount)\((asc|desc)\)$/.exec(orderString)
        if (!matches) {
            res.status(400).send('Bad request.')
            return
        }

        const result = await db.getLinks({
            pagination: { page, pageSize: config.dashboard.pageSize },
            orderBy: { field: matches[1], order: matches[2] },
        })
        res.status(200).json(result)
        return
    }
    if ('POST' === req.method) {
        if (!req.body.hasOwnProperty('shortLink') || !req.body.hasOwnProperty('redirectTo')) {
            res.status(400).send('Bad request.')
            return
        }
        const shortLink = String(req.body.shortLink).trim().slice(0, 1024)
        const redirectTo = String(req.body.redirectTo).trim().slice(0, 4096)
        if (0 === shortLink.length || 0 === redirectTo.length) {
            res.status(400).send('Bad request.')
            return
        }
        const db = new LinkDb(await connection())
        try {
            const link = await db.addLink({
                id: uuid(),
                shortLink: shortLink,
                redirectTo: redirectTo,
                userId: user.id
            })
            res.status(201).json({ link })
            return
        } catch (e) {
            if (e instanceof ShortLinkDuplicationError) {
                res.status(409).json({
                    error: {
                        msg: `Duplicate short link: ${shortLink}`
                    }
                })
                return
            }
            throw e
        }
    }
    res.status(405).setHeader('Allow', 'GET, POST').send('Method not allowed.')
}

import { validateTokenAndGetUser, TokenValidationError } from '../../user'
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { LinkDb, ShortLinkDuplicationError } from '../../link/repository'
import { connection } from '../../db'
import { v4 as uuid, validate } from 'uuid'
import { User } from '../../user/types'

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
    const user = await handleTokenAndGetUser(req, res)
    if (false === user) {
        return
    }
    if ('GET' === req.method) {
        const db = new LinkDb(await connection())
        let shortLink = uuid()
        while (await db.isShortLinkExisting(shortLink)) {
            shortLink = uuid()
        }
        res.status(200).json({
            'shortLinkSuggestion': shortLink
        })
        return
    }
    res.status(405).setHeader('Allow', 'GET').send('Method not allowed.')
}

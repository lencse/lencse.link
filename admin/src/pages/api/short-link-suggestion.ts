import { validateTokenAndGetUser, TokenValidationError } from '../../user'
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { LinkDb, ShortLinkDuplicationError, ShortLinkExisting } from '../../link/repository'
import { connection } from '../../db'
import { v4 as uuid, validate } from 'uuid'
import { User } from '../../user/types'
import { UserById, UserDb } from '../../user/repository'
import { Context, headHttpMethodMiddleware, userMiddleware } from '../../api'
import config from '../../config/config'


export const shortLinkSuggestionHandler = (
    userDb: UserById,
    jwtSecret: string,
    linkDb: ShortLinkExisting,
) =>
    async (ctx: Context) => {
        await headHttpMethodMiddleware(ctx)
        await userMiddleware(userDb, jwtSecret)(ctx, async (ctx) => {
            const { req, res } = ctx
            if ('GET' === req.method) {
                let shortLink = uuid()
                while (await linkDb.isShortLinkExisting(shortLink)) {
                    shortLink = uuid()
                }
                res.status(200)
                res.json({
                    'shortLinkSuggestion': shortLink
                })
                return
            }
            res.status(405)
            res.setHeader('Allow', 'GET')
            res.send('Method not allowed.')
        })
    }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await shortLinkSuggestionHandler(
        new UserDb(await connection()),
        config.jwt.secret,
        new LinkDb(await connection()),
    )({req, res})
}

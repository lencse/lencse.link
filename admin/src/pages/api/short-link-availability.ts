import { validateTokenAndGetUser, TokenValidationError } from '../../user'
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { LinkDb, LinkRepository, ShortLinkDuplicationError, ShortLinkExisting } from '../../link/repository'
import { connection } from '../../db'
import { v4 as uuid, validate } from 'uuid'
import { User } from '../../user/types'
import axios from 'axios'
import config from '../../config/config'
import { axiosHeadStatuscode, checkAvailability, HeadHttpRequestStatuscode } from '../../link/availability'
import { setTimeout } from 'timers/promises'
import { Context, headHttpMethodMiddleware, userMiddleware } from '../../api'
import { UserById, UserDb } from '../../user/repository'

export const shortLinkAvailabilityHandler = (
    userDb: UserById,
    jwtSecret: string,
    linkDb: ShortLinkExisting,
    mainServiceUrl: string,
    headStatusCode: HeadHttpRequestStatuscode
) =>
    async (ctx: Context) => {
        await headHttpMethodMiddleware(ctx)
        await userMiddleware(userDb, jwtSecret)(ctx, async (ctx) => {
            const { req, res } = ctx
            if ('GET' === req.method) {
                const shortLink = (() => {
                    if (req.query.hasOwnProperty('shortLink')) {
                        return String(req.query.shortLink)
                    }
                    const url = new URL(req.url)
                    const query = url.searchParams
                    if (query.has('shortLink')) {
                        return String(query.get('shortLink'))
                    }
                    return ''
                })()
                if ('' === shortLink) {
                    res.status(400).send('Bad request.')
                    return
                }
                const isAvailable = await checkAvailability(
                    linkDb,
                    mainServiceUrl,
                    headStatusCode,
                )(shortLink)
                res.status(isAvailable ? 404 : 200).end()

                return
            }
            res.status(405).setHeader('Allow', 'GET').send('Method not allowed.')

        })
    }


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await shortLinkAvailabilityHandler(
        new UserDb(await connection()),
        config.jwt.secret,
        new LinkDb(await connection()),
        config.urls.mainServiceInternal,
        axiosHeadStatuscode,
    )({ req, res })
}

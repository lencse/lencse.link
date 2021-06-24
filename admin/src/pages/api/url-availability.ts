import { validateTokenAndGetUser, TokenValidationError } from '../../user'
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { LinkDb, ShortLinkDuplicationError } from '../../link/repository'
import { connection } from '../../db'
import { v4 as uuid, validate } from 'uuid'
import { User } from '../../user/types'
import axios from 'axios'
import { setTimeout } from 'timers/promises'
import { Context, headHttpMethodMiddleware, userMiddleware } from '../../api'
import { UserById, UserDb } from '../../user/repository'
import config from '../../config/config'

export type HeadHttpRequest = (url: string) => Promise<void>

export const axiosHeadRequest: HeadHttpRequest = async (url: string) => {
    await axios.head(url, {
        timeout: 5000
    })
}

export const urlAvailabilityHandler = (
    userDb: UserById,
    jwtSecret: string,
    headRequest: HeadHttpRequest
) =>
    async (ctx: Context) => {
        await headHttpMethodMiddleware(ctx)
        await userMiddleware(userDb, jwtSecret)(ctx, async (ctx) => {
            const { req, res } = ctx
            if ('GET' === req.method) {
                const url = (() => {
                    if (req.query.hasOwnProperty('url')) {
                        return String(req.query.url)
                    }
                    const url = new URL(req.url)
                    const query = url.searchParams
                    if (query.has('url')) {
                        return String(query.get('url'))
                    }
                    return ''
                })()
                if ('' === url) {
                    res.status(400)
                    res.send('Bad request.')
                    return
                }
                try {
                    await headRequest(url)
                    res.status(200)
                    res.end()
                } catch (e) {
                    res.status(404)
                    res.end()
                } finally {
                    return
                }
            }
            console.log(req.method)
            res.status(405)
            res.setHeader('Allow', 'GET')
            res.send('Method not allowed.')
        })
    }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await urlAvailabilityHandler(
        new UserDb(await connection()),
        config.jwt.secret,
        axiosHeadRequest
    )({ req, res })
}

import { validateToken, TokenValidationError } from '../user'
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { User } from '../user/types'
import config from '../config/config'
import { UserByEmail, UserById, UserDb } from '../user/repository'

export type Context = {
    req: NextApiRequest
    res: NextApiResponse
}

export type ContextAfterAuth = Context & {
    user: User
}

export type HandlerAfterAuthentication = (ctx: ContextAfterAuth) => Promise<void>

export async function headHttpMethodMiddleware(ctx: Context) {
    if ('HEAD' === ctx.req.method) {
        ctx.req.method = 'GET'
        ctx.req.headers['original-method'] = 'HEAD'
    }
}

export const userMiddleware = (db: UserById, secret: string) =>
    async (ctx: Context, next: HandlerAfterAuthentication): Promise<void> => {
        const { req, res } = ctx
        const { token } = req.cookies
        try {
            const user = await validateToken(db, secret)(token)
            return next({
                ...ctx,
                user
            })
        } catch (err) {
            if ('TokenValidationError' === err.name) {
                res.status(401)
                res.send('Unauthorized.')
                return
            }
            throw err
        }
    }


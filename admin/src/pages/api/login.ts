import { AuthenticationError, validateAndGetUser, createToken } from '../../user'
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { connection } from '../../db'
import config from '../../config/config'
import { UserByEmail, UserDb } from '../../user/repository'
import { Context } from '../../api'

export const loginHandler = (db: UserByEmail, secret: string) =>
    async (ctx: Context) => {
        const { req, res } = ctx
        if ('POST' !== req.method) {
            res.status(405)
            res.setHeader('Allow', 'POST')
            res.send('Method not allowed.')
            return
        }
        const { email, password } = req.body
        if (undefined === email || undefined === password) {
            res.status(400)
            res.send('Bad request.')
            return
        }
        try {
            const user = await validateAndGetUser(db)({ email, password })
            const token = createToken(secret)(user)
            res.setHeader('Set-Cookie', serialize('token', token, {
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'strict',

            }))
            res.redirect('/')
        } catch (err) {
            if ('AuthenticationError' !== err.name) {
                throw err
            }
            const redirectTo = new URL('/', `https://${req.headers.host}`)
            redirectTo.searchParams.set('err', err.message)
            res.setHeader('Set-Cookie', serialize('token', null, {
                expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT'),
                path: '/',
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            }))
            res.redirect(redirectTo.toString().split(req.headers.host).pop())
        }
    }



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await loginHandler(
        new UserDb(await connection()),
        config.jwt.secret
    )({ req, res })
}

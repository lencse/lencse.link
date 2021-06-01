import { AuthenticationError, validateAndGetUser, createToken } from '../../user'
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if ('POST' !== req.method) {
        res.status(405).setHeader('Allow', 'POST').send('Method not allowed.')
        return
    }
    const { email, password } = req.body
    if (undefined === email || undefined === password) {
        res.status(400).setHeader('Allow', 'POST').send('Bad request.')
        return
    }
    try {
        const user = await validateAndGetUser(email, password)
        const token = createToken(user)
        res.setHeader('Set-Cookie', serialize('token', token, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'strict',

        }))
        res.redirect('/')
    } catch (err) {
        if (!(err instanceof AuthenticationError)) {
            throw err
        }
        const redirectTo = new URL('/', `https://${req.headers.host}`)
        redirectTo.searchParams.set('err', err.message)
        res.redirect(redirectTo.toString().split(req.headers.host).pop())
        return
    }
}

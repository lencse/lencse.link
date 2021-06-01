import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if ('POST' !== req.method) {
        res.status(405).setHeader('Allow', 'POST').send('Method not allowed.')
        return
    }
    res.setHeader('Set-Cookie', serialize('token', null, {
        expires: new Date('Thu, 01 Jan 1970 00:00:00 GMT'),
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    }))
    res.redirect('/')
}

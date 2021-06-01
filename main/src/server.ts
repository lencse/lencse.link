import Koa from 'koa'
import morgan from 'koa-morgan'
import env from './config/env'
import koaStatic from 'koa-static'
import Router from 'koa-router'
import { resolve } from 'path'
import createHandler from './redirect/handler'
import { connection } from './db'

export async function main() {
    const koa = new Koa()
    const { port } = env.server

    koa.use(morgan('common'))
    koa.use(koaStatic(resolve(__dirname, '../public')))

    const db = await connection()

    const router = new Router()
    const redirectHandler = createHandler(db)

    router.get('/:shortLink', redirectHandler)

    koa.use(router.routes())
    koa.use(router.allowedMethods())

    koa.listen(port)
    console.info(`Main server listening on port ${port}`)
}

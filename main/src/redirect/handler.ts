import Koa from 'koa'
import { DbQuery } from '../db'

const createHandler = (db: DbQuery) => async (ctx: Koa.ParameterizedContext) => {
    const { shortLink } = ctx.params
    const result = await db.query(
        `SELECT id, redirect_to FROM active_links_v WHERE short_link = $1`,
        [shortLink]
    )
    if (0 === result.length) {
        ctx.status = 404
        ctx.body = 'Not found.'
        return
    }
    ctx.redirect(result[0].redirect_to)
    // ctx.body = ''
    if ('string' === typeof ctx.request.query.nolog) {
        return
    }
    db.query(
        `INSERT INTO hits (link_id, hit_date) VALUES ($1, NOW())`,
        [result[0].id]
    )
}

export default createHandler

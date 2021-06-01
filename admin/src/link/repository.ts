import { extend, filter } from 'lodash'
import { DbQuery } from '../db'
import { Link, LinkToSave, LinkData } from './types'

export type Pagination = {
    pageSize: number
    page: number
}

export type Order = {
    field: 'shortLink' | 'redirectTo' | 'creationDate' | 'hitCount' | 'createdBy'
    order: 'asc' | 'desc'
}

export type QueryParams = {
    pagination: Pagination
    orderBy: Order
}

export type QueryResult = {
    links: LinkData[],
    info: {
        page: number
        pageSize: number
        pageCount: number
        count: number
    }
}

export interface LinkRepository {

    addLink(data: LinkToSave): Promise<Link>

    removeLink(id: string): Promise<any>

    getLinks(params: QueryParams): Promise<QueryResult>

    findOneByShortLink(shortLink: string): Promise<LinkData | null>

    isShortLinkExisting(shortLink: string): Promise<boolean>

}

export class ShortLinkDuplicationError extends Error { }

export class LinkDb implements LinkRepository {

    constructor(private db: DbQuery) { }

    public async addLink(data: LinkToSave): Promise<Link> {
        try {
            const rows: any = await this.db.query(`
                    INSERT INTO links (
                        id,
                        short_link,
                        redirect_to,
                        created_by,
                        creation_date
                    ) VALUES (
                        $1,
                        $2,
                        $3,
                        $4,
                        NOW()
                    )
                    RETURNING
                        id,
                        short_link,
                        redirect_to,
                        created_by
                    `,
                [
                    data.id,
                    data.shortLink,
                    data.redirectTo,
                    data.userId
                ]
            )
            return {
                id: rows[0].id,
                shortLink: rows[0].short_link,
                redirectTo: rows[0].redirect_to
            }
        } catch (e) {
            if ('23505' === e.code && 'links' === e.table && e.detail.match(/\(short_link\)=\(.*\)/)) {
                throw new ShortLinkDuplicationError()
            }
            throw e
        }
    }

    public async removeLink(id: string): Promise<any> {
        await this.db.query(`
                UPDATE links SET deactivation_date = NOW() WHERE id = $1
                `,
            [
                id,
            ]
        )
    }

    public async getLinks(params: QueryParams): Promise<QueryResult> {
        const orderMap = {
            field: {
                shortLink: 'short_link',
                redirectTo: 'redirect_to',
                creationDate: 'creation_date',
                hitCount: 'hit_count',
                createdBy: 'username',
            },
            order: {
                asc: 'ASC',
                desc: 'DESC'
            },
        }
        const orderingSql = `ORDER BY ${orderMap.field[params.orderBy.field]} ${orderMap.order[params.orderBy.order]}, link_id ASC`
        const filterSql = ``
        const sql = `
            SELECT
                link_id,
                short_link,
                redirect_to,
                creation_date,
                user_id,
                user_email,
                username,
                user_active,
                hit_count
            FROM links_v
            WHERE 1=1
            ${filterSql}
        `
        const linksResult: any = await this.db.query(`
            ${sql}
            ${orderingSql}
            LIMIT ${params.pagination.pageSize}
            OFFSET ${params.pagination.page * params.pagination.pageSize}
        `, [])
        const links = linksResult.map((row): LinkData => ({
            id: row.link_id,
            shortLink: row.short_link,
            redirectTo: row.redirect_to,
            creationDate: row.creation_date,
            user: {
                id: row.user_id,
                email: row.user_email,
                username: row.username,
                isActive: row.user_active
            },
            hitCount: Number(row.hit_count),
        }))
        const countResult = await this.db.query(`SELECT COUNT(1) as cnt FROM(${sql}) s`, [])
        const count = Number(countResult[0].cnt)
        return {
            links,
            info: {
                page: params.pagination.page,
                pageSize: params.pagination.pageSize,
                pageCount: Math.ceil(count / params.pagination.pageSize),
                count,
            }
        }
    }

    public async findOneByShortLink(shortLink: string): Promise<LinkData | null> {
        const sql = `
            SELECT
                link_id,
                short_link,
                redirect_to,
                creation_date,
                user_id,
                user_email,
                username,
                user_active,
                hit_count
            FROM links_v
            WHERE 1=1
                AND short_link = $1
        `
        const result = await this.db.query(sql, [shortLink])
        if (0 === result.length) {
            return null
        }
        const row = result[0]
        return {
            id: row.link_id,
            shortLink: row.short_link,
            redirectTo: row.redirect_to,
            creationDate: row.creation_date,
            user: {
                id: row.user_id,
                email: row.user_email,
                username: row.username,
                isActive: row.user_active
            },
            hitCount: row.hitCount,
        }
    }

    public async isShortLinkExisting(shortLink: string): Promise<boolean> {
        const result = await this.db.query(`
            SELECT EXISTS (SELECT 1 FROM links WHERE short_link = $1)
        `, [shortLink])
        return result[0].exists
    }

}

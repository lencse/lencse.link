// import env from '../../config/env.js'
import pg from 'pg'
import env from '../config/env'

let pool: pg.Pool | null = null
let client: { query: (arg0: string, arg1: any[]) => any; release: () => void } | null = null

export async function connection(): Promise<DbConnection> {
    if (null === pool) {
        pool = pool || new pg.Pool({ connectionString: env.db.connectionUrl })

        pool.on('error', (err: any) => {
            console.error('[DB error]', err)
            process.exit(-1)
        })
    }

    if (null === client) {
        client = await pool.connect()
    }

    return {
        query: async (sql, params) => {
            // process.stdout.write(sql)
            // console.log({params})
            const result: any = await client?.query(sql, params)
            return result.rows
        },
        close: () => client?.release()
    }
}

export interface DbQuery {
    query(sql: string, params: any[]): Promise<any[]>

}
export interface DbClose {
    close(): void
}

export interface DbConnection extends DbQuery, DbClose { }

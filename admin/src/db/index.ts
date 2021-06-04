// import env from '../../config/env.js'
import pg from 'pg'
import { setImmediate } from 'timers/promises'
import config from '../config/config'

let pool = null
let client = null
let semaphore = false
let c = 0

export async function connection(): Promise<DbConnection> {
    if (null === pool) {
        pool = pool || new pg.Pool({ connectionString: config.db.connectionUrl })
        pool.on('error', err => {
            console.error('[DB error]', err)
            process.exit(-1)
        })

    }

    const getClient = async (): Promise<any> => {
        console.log('DB CONN')
        if (null === client) {
            console.log('- NULL')
            if (semaphore) {
                console.log('- SEMAPHORE')
                while (await setImmediate(true)) {
                    console.log('- LOOP')
                    if (null !== client) {
                        console.log('- RETURN LOOP')
                        return client
                    }
                }
            }
            console.log('- CREATE')
            semaphore = true
            client = await pool.connect()
            if (c++ > 0) {
                throw new Error('Singleton failed :(')
            }
            console.log('- CREATED')
            process.on('exit', () => client?.release())
        }
        console.log('- RETURN')
        return client
    }

    const cl = await getClient()



    return {
        query: async (sql, params) => {
            // process.stdout.write(sql)
            // console.log({params})
            const result: any = await cl.query(sql, params)
            return result.rows
        },
        close: () => cl.release()
    }
}

export interface DbQuery {
    query(sql: string, params: any[]): Promise<any[]>

}
export interface DbClose {
    close(): void
}

export interface DbConnection extends DbQuery, DbClose { }

import { connection } from '../db/index.js'
import { UserDb } from '../user/repository'
import { LinkDb } from '../link/repository'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { SeedData } from './types.js'

export async function main() {
    if ('production' === process.env.NODE_ENV) {
        // TODO
    }

    const conn = await connection()
    const userDb = new UserDb(conn)
    const linkDb = new LinkDb(conn)

    try {
        const data: SeedData = JSON.parse(await readFile(resolve(__dirname, '../../.seed.json'), 'utf-8'))

        await Promise.all(data.users.map(async user => {
            await userDb.addUser(user)
            if (user.deactivated) {
                await userDb.deactivateUser(user.id)
            }
        }))

        await Promise.all(data.links.map(async link => {
            await linkDb.addLink(link)
            if (link.deleted) {
                await linkDb.removeLink(link.id)
            }
        }))

        console.log(`Seed completed: ${data.users.length} users and ${data.links.length} links saved.`)

    } finally {
        conn.close()
    }

    process.exit(0)
}

import argon2 from 'argon2'
import { connection } from '../db/index.js'
import { UserDb } from '../user/repository'
import { LinkDb } from '../link/repository'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { SeedData } from './types.js'
import dayjs from 'dayjs'

export async function main() {
    if ('production' === process.env.NODE_ENV) {
        if ('--force' === process.argv[2]) {
            console.warn('[WARNING] Saving seed data in production mode')
        } else {
            console.error('[ERROR] Won\'t save seed data in production mode. Use --force flag to continue.')
            process.exit(-1)
        }
    }

    const conn = await connection()

    const seedConfig = await(conn.query(`SELECT config_value FROM app_config WHERE config_name = $1`, ['seed']))
    if (0 < seedConfig.length) {
        console.info('[INFO] Already seeded.')
        process.exit(0)
    }


    const userDb = new UserDb(conn)
    const linkDb = new LinkDb(conn)

    const data: SeedData = JSON.parse(await readFile(resolve(__dirname, '../../.seed.json'), 'utf-8'))


    await Promise.all(data.users.map(async user => {
        await userDb.addUser({
            ...user,
            hashedPassword: await argon2.hash(user.password, {}),

        })
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

    await(conn.query(`INSERT INTO app_config (config_name, config_value) VALUES ($1, $2)`, ['seed', dayjs().format('D MMM YYYY, HH:mm')]))

    // {dayjs(link.creationDate).format('D MMM YYYY, HH:mm')}
    process.exit(0)
}

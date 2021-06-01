import argon2 from 'argon2'
import { v4 as uuid } from 'uuid'
import { connection } from '../db/index.js'
import { UserDb } from '../user/repository'
import { LinkDb } from '../link/repository'
import data from './seed.json'
import { internet, lorem, random, datatype } from 'faker'
import { range } from 'lodash'

const ADD_USER = 20
const ADD_LINK = 1_000

export async function main() {
    const conn = await connection()
    const userDb = new UserDb(conn)
    const linkDb = new LinkDb(conn)

    try {
        const userSaveResult = await Promise.all(range(0, ADD_USER).map(async i => {
            while (true) {
                try {
                    if (i < data.users.length) {
                        return await userDb.addUser({
                            id: uuid(),
                            email: data.users[i].email,
                            username: data.users[i].username,
                            hashedPassword: await argon2.hash(data.users[i].password, {})
                        })
                    }
                    return await userDb.addUser({
                        id: uuid(),
                        email: `${random.alphaNumeric(4)}-${internet.email()}`,
                        username: `${random.alphaNumeric(4)}-${internet.userName()}`,
                        hashedPassword: await argon2.hash(internet.password(), {})
                    })
                } catch (err) {
                    if ('23505' === err.code) {
                        console.log({collision: i})
                        continue
                    }
                    console.error(err)
                    process.exit(1)
                }
            }
        }))
        const userIds = userSaveResult.map(res => res.id)
        console.info(`${userIds.length} users added`)

        const saveLink = async () => {
            while (true) {
                try {

                    return await linkDb.addLink({
                        id: uuid(),
                        redirectTo: internet.url() + (datatype.number(3) < 1 ? `/${lorem.slug()}` : ''),
                        shortLink: random.alphaNumeric(3 + datatype.number(20)),
                        userId: random.arrayElement(userIds)
                    })

                } catch (err) {
                    if ('23505' === err.code) {
                        continue
                    }
                }
            }
        }

        let added = 0
        let removed = 0
        for (let i = 0; i < ADD_LINK; ++i) {
            const res = await saveLink()
            ++added
            if (datatype.number(20) < 1) {
                await linkDb.removeLink(res.id)
                ++removed
            }
        }
        console.info(`${added} link added`)
        console.info(`${removed} link removed`)
        const deactivated = (await Promise.all(random.arrayElements(userIds.slice(data.users.length), Math.floor(ADD_USER / 10)).map((async userId => {
            await userDb.deactivateUser(userId)
        })))).length
        console.info(`${deactivated} users deactivated`)
    } finally {
        conn.close()
    }

    process.exit(0)
}

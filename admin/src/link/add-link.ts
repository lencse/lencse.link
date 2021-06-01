import { strict as assert } from 'assert'
import argon2 from 'argon2'
import { v4 as uuid, validate } from 'uuid'
import { connection } from '../db/index.js'
import { LinkDb } from './repository.js'

const shortLink = process.argv[2]
const redirectTo = process.argv[3]
const userId = process.argv[4]
assert(shortLink.length >= 3)
assert(redirectTo.length > 3)
assert(validate(userId))

export async function main() {
    const conn = await connection()
    const db = new LinkDb(conn)
    try {
        const result = await db.addLink({
            id: uuid(),
            shortLink,
            redirectTo,
            userId
        })
        console.info(`Link with id ${result.id} added`)
    } finally {
        conn.close()
    }

    process.exit(0)
}

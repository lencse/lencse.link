import { strict as assert } from 'assert'
import argon2 from 'argon2'
import { v4 as uuid } from 'uuid'
import { connection } from '../db/index.js'
import { UserDb } from './repository.js'

const email = process.argv[2]
const username = process.argv[3]
const password = process.argv[4]
assert(email.length > 3)
assert(password.length > 3)
assert(username.length > 3)

export async function main() {
    const conn = await connection()
    const db = new UserDb(conn)

    try {
        const result = await db.addUser({
            id: uuid(),
            email,
            username,
            hashedPassword: await argon2.hash(password, {})
        })
        console.info(`User with id ${result.id} added`)
    } finally {
        conn.close()
    }

    process.exit(0)
}

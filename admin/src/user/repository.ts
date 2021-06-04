import { connection, DbQuery } from '../db'
import { User, UserWithHashedPassword } from './types'

export interface UserRepository {

    getByEmail(email: string): Promise<UserWithHashedPassword[]>

    getById(id: string): Promise<User[]>

    addUser(user: UserWithHashedPassword): Promise<User>

    deactivateUser(id: string): Promise<void>

}

export interface UserByEmail {

    getByEmail(email: string): Promise<UserWithHashedPassword[]>

}

export interface UserById {

    getById(id: string): Promise<User[]>

}

export class UserDb implements UserRepository {

    constructor(private db: DbQuery) { }

    public async getByEmail(email: string): Promise<UserWithHashedPassword[]> {
        const rows = await this.db.query(`
            SELECT
                id,
                email,
                username,
                password
            FROM users
            WHERE email = $1 AND deactivation_date IS NULL
        `,
            [email]
        )

        return rows.map(row => ({
            id: row.id,
            email: row.email,
            username: row.username,
            hashedPassword: row.password
        }))
    }

    public async getById(id: string): Promise<User[]> {
        const rows = await this.db.query(`
            SELECT
                id,
                email,
                username
            FROM users
            WHERE id = $1 AND deactivation_date IS NULL
            `,
            [id]
        )

        return rows.map(row => ({
            id: row.id,
            email: row.email,
            username: row.username,
        }))
    }

    public async addUser(user: UserWithHashedPassword): Promise<User> {
        const rows: any = await this.db.query(`
                INSERT INTO users (
                    id,
                    email,
                    username,
                    password,
                    creation_date
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    NOW()
                )
                RETURNING id, email, username
                `,
            [
                user.id,
                user.email,
                user.username,
                user.hashedPassword
            ]
        )

        return {
            id: rows[0].id,
            username: rows[0].username,
            email: rows[0].email,
        }

    }

    public async deactivateUser(id: string): Promise<any> {
        await this.db.query(`
                UPDATE users SET deactivation_date = NOW() WHERE id = $1
                `,
            [
                id,
            ]
        )
    }
}

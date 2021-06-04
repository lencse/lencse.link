import jwt from 'jsonwebtoken'
import argon2 from 'argon2'
import config from '../config/config'
import { User } from './types'
import { UserByEmail, UserById, UserDb } from './repository'
import { connection } from '../db'

export class AuthenticationError extends Error {
    constructor(...args) {
        super(...args)
        this.name = 'AuthenticationError'
    }
}

export class TokenValidationError extends Error {
    constructor(...args) {
        super(...args)
        this.name = 'TokenValidationError'
    }
}

export type LoginInfo = {
    email: string
    password: string
}

export const validateAndGetUser = (db: UserByEmail) =>
    async (loginInfo: LoginInfo): Promise<User> => {
        const { email, password } = loginInfo
        const rows = await db.getByEmail(email)

        if (0 === rows.length) {
            throw new AuthenticationError('Invalid credentials.')
        }

        if (email !== rows[0].email) {
            throw new AuthenticationError('Invalid credentials.')
        }
        if (!(await argon2.verify(rows[0].hashedPassword, password))) {
            throw new AuthenticationError('Invalid credentials.')
        }

        return {
            id: rows[0].id,
            username: rows[0].username,
            email: rows[0].email,
        }
    }

export const createToken = (secret: string) =>
    (user: User): string => {
        return jwt.sign({ userId: user.id }, secret)
    }

export const validateToken = (db: UserById, secret: string) =>
    async (token: string): Promise<User> => {
        try {
            const data: any = jwt.verify(token, secret)
            const rows = await db.getById(data.userId)

            if (0 === rows.length) {
                throw new TokenValidationError()
            }

            if (data.userId !== rows[0].id) {
                throw new TokenValidationError()
            }

            return rows[0]
        } catch (err) {
            throw new TokenValidationError()
        }
    }

export async function validateTokenAndGetUser(token: string): Promise<User> {
    try {
        const data: any = jwt.verify(token, config.jwt.secret)
        const db = new UserDb(await connection())
        const rows = await db.getById(data.userId)

        if (0 === rows.length) {
            throw new TokenValidationError()
        }

        if (data.userId !== rows[0].id) {
            throw new TokenValidationError()
        }

        return rows[0]
    } catch (err) {
        throw new TokenValidationError()
    }
}

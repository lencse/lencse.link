import { strict as assert } from 'assert'

const env = {
    db: {
        connectionUrl: String(process.env.DATABASE_URL)
    },
    server: {
        port: Number(process.env.PORT ?? 3000)
    },
}

assert('' !== env.db.connectionUrl, 'DATABASE_URL env value is not set.')

export default env

import { strict as assert } from 'assert'

const env = {
    db: {
        connectionUrl: String(process.env.DATABASE_URL ?? '')
    },
    jwt: {
        secret: String(process.env.JWT_SECRET ?? '')
    },
    urls: {
        mainService: String(process.env.MAIN_URL),
        mainServiceInternal: String(process.env.MAIN_INTERNAL_URL),
    },
    dashboard: {
        pageSize: Number(process.env.DASHBOARD_PAGE_SIZE)
    }
}

assert('' !== env.db.connectionUrl, 'DATABASE_URL env value is not set.')
assert('' !== env.jwt.secret, 'JWT_SECRET env value is not set.')
assert('' !== env.urls.mainService, 'MAIN_URL env value is not set.')
assert('' !== env.urls.mainServiceInternal, 'MAIN_INTERNAL_URL env value is not set.')
assert(1 <= env.dashboard.pageSize && env.dashboard.pageSize <= 1000, 'Invalid DASHBOARD_PAGE_SIZE env value.')

export default env

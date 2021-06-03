import { strict as assert } from 'assert'

const config = {
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
        pageSize: Number(process.env.DASHBOARD_PAGE_SIZE || 100)
    }
}

if ('true' !== process.env.NEXT_BUILDING) {
    assert('' !== config.db.connectionUrl, 'DATABASE_URL env value is not set.')
    assert('' !== config.jwt.secret, 'JWT_SECRET env value is not set.')
    assert('' !== config.urls.mainService, 'MAIN_URL env value is not set.')
    assert('' !== config.urls.mainServiceInternal, 'MAIN_INTERNAL_URL env value is not set.')
    assert(1 <= config.dashboard.pageSize && config.dashboard.pageSize <= 1000, 'Invalid DASHBOARD_PAGE_SIZE env value.')
}

export default config

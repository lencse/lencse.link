// import dotenv from 'dotenv'
// import dotenvExpand from 'dotenv-expand'

// dotenvExpand(dotenv.config())

const env = {
    db: {
        connectionUrl: String(process.env.DATABASE_URL)
    },
    jwt: {
        secret: String(process.env.JWT_SECRET)
    },
    urls: {
        mainService: String(process.env.MAIN_URL),
        mainServiceInternal: String(process.env.MAIN_INTERNAL_URL),
    }
}

export default env

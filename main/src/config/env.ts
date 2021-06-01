// import dotenv from 'dotenv'
// import dotenvExpand from 'dotenv-expand'

// dotenvExpand(dotenv.config())

const env = {
    db: {
        connectionUrl: String(process.env.DATABASE_URL)
    },
    server: {
        port: Number(process.env.PORT || 3000)
    },
}

export default env

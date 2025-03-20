import { EOL } from 'os'
import { urls } from '~/data/data'

export const main = async () => {
    const maxUrlLength = Math.max(...urls.map((url) => url.shortUrl.length))
    const redirects =
        urls.map((url) => `/${url.shortUrl.padEnd(maxUrlLength)}    ${url.link}`).join(EOL) + EOL
    process.stdout.write(redirects)
}

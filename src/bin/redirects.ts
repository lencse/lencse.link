import { EOL } from 'os'
import { urls } from '~/data/data'

export const main = async () => {
    const redirects = urls.map((url) => `/${url.shortUrl}    ${url.link}`).join(EOL) + EOL
    process.stdout.write(redirects)
}

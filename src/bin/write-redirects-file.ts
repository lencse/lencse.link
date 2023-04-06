import { readFileSync } from 'fs'
import { config } from '~/config/config'
import { Url } from '~/types/types'
import { EOL } from 'os'

export const main = async () => {
    const urls = JSON.parse(readFileSync(config.urlDataFile, 'utf8')) as Url[]
    const redirects = urls.map((url) => `/${url.shortUrl}    ${url.link}`).join(EOL) + EOL
    process.stdout.write(redirects)
}

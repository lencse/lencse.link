import { readFileSync, writeFileSync } from 'fs'
import { config } from '~/config/config'
import { Url } from '~/types/types'
import { EOL } from 'os'

export const writeRedirectsFile = async () => {
    const urls = JSON.parse(readFileSync(config.urlDataFile, 'utf8')) as Url[]
    const redirects = urls.map((url) => `/${url.shortUrl} ${url.link}`).join(EOL) + EOL
    writeFileSync(config.redirectsFile, redirects)
}

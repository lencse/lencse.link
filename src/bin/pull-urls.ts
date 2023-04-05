import { getUrls } from '../google/sheets'
import { writeFileSync } from 'fs'
import { config } from '~/config/config'

export const pullUrls = async () => {
    const urls = await getUrls()
    writeFileSync(config.urlDataFile, JSON.stringify(urls))
    console.table(urls)
}

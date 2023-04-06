import { getUrls } from '../google/sheets'
import { writeFileSync } from 'fs'
import { config } from '~/config/config'

export const main = async () => {
    const urls = await getUrls()
    const fileContent = JSON.stringify(urls)
    writeFileSync(config.urlDataFile, fileContent)
    console.table(urls)
}

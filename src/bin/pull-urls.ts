import { getDataFromSheet } from '../google/sheets'
import { writeFileSync } from 'fs'

export const pullUrls = async () => {
    const rows = await getDataFromSheet()
    const urls = rows.slice(1).map((row) => ({
        shortUrl: row[0],
        link: row[1],
        public: row[2] === 'Y',
    }))
    writeFileSync('data/urls.json', JSON.stringify(urls))
    console.info(urls)
}

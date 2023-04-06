import { getUrls } from '../google/sheets'
import { EOL } from 'os'
import { Console } from 'node:console'

export const main = async () => {
    const urls = await getUrls()
    const fileContent = JSON.stringify(urls) + EOL
    const console = new Console(process.stderr)
    console.table(urls)
    process.stdout.write(fileContent)
}

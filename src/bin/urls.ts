import { getUrls } from '~/google/sheets'
import { EOL } from 'os'
import { Console } from 'node:console'

export const main = async () => {
    const urls = await getUrls()
    const fileContent = JSON.stringify(urls) + EOL
    const console = new Console(process.stderr)
    process.stdout.write(fileContent)
    console.table(urls)
}

import { urls } from '~/data/data'
import { toFile } from 'qrcode'
import { config } from '~/config/config'
import { EOL } from 'os'
import { existsSync, mkdirSync } from 'fs'

export const main = async () => {
    const dir = 'public/img/qr'
    if (!existsSync(dir)) {
        mkdirSync(dir)
    }
    await Promise.all(
        urls.map(async (url) => {
            const filePath = `${dir}/${url.shortUrl}.png`
            await toFile(filePath, `${config.siteUrl}/${url.shortUrl}`, {
                width: config.qrCodeSizeInPixels,
                margin: config.qrCodeMargin,
            })
            process.stderr.write(`✓ ${filePath}${EOL}`)
        })
    )
}

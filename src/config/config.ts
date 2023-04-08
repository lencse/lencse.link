import { getenv } from '~/config/getenv'

export const config = {
    siteUrl: getenv('SITE_URL'),
    qrCodeSizeInPixels: 1600,
    qrCodeMargin: 2,
}

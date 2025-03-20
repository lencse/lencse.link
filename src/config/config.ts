import { strict as assert } from 'assert'

assert(
    typeof process.env['NEXT_PUBLIC_SITE_URL'] === 'string',
    `NEXT_PUBLIC_SITE_URL env var not set`
)

export const config = {
    siteUrl: process.env['NEXT_PUBLIC_SITE_URL'],
    // siteUrl: getenv('NEXT_PUBLIC_SITE_URL'),
    qrCodeSizeInPixels: 1600,
    qrCodeMargin: 2,
}

import { resolve } from 'path'
import { tmpdir } from 'os'
import { v4 as uuid } from 'uuid'
import { unlinkSync, writeFileSync } from 'fs'
import { google } from 'googleapis'
import { strict as assert } from 'assert'
import { Url } from '~/types/types'
import { getenv } from '~/config/getenv'

export type Row = [string, string, string]

export const googleDataFetcher = {
    getDataFromSheet: async (): Promise<Row[]> => {
        if (getenv('USE_FAKE_DATA', 'false') === 'true') {
            return [
                ['Short URL', 'Link', 'Public'],
                ['url', 'https://web.site', 'Y'],
                ['link', 'https://website.to', 'Y'],
                ['short', 'https://long.url/something', 'N'],
                [
                    'long-url-is-long',
                    [
                        'https://long.url/something?id=',
                        '95bdedab-618d-4ca1-81bf-3b96e4eba1f8-',
                        '8a7050cf-c1ed-4832-a591-ec194a7915fe-',
                        '15d48ba0-a072-4934-8af7-10c704750601',
                    ].join(''),
                    'Y',
                ],
                ['url', 'https://web.site', 'Y'],
                ['link', 'https://website.to', 'Y'],
                ['short', 'https://long.url/something', 'N'],
                [
                    'long-url-is-long',
                    [
                        'https://long.url/something?id=',
                        '95bdedab-618d-4ca1-81bf-3b96e4eba1f8-',
                        '8a7050cf-c1ed-4832-a591-ec194a7915fe-',
                        '15d48ba0-a072-4934-8af7-10c704750601',
                    ].join(''),
                    'Y',
                ],
                ['url', 'https://web.site', 'Y'],
                ['link', 'https://website.to', 'Y'],
                ['short', 'https://long.url/something', 'N'],
                [
                    'long-url-is-long',
                    [
                        'https://long.url/something?id=',
                        '95bdedab-618d-4ca1-81bf-3b96e4eba1f8-',
                        '8a7050cf-c1ed-4832-a591-ec194a7915fe-',
                        '15d48ba0-a072-4934-8af7-10c704750601',
                    ].join(''),
                    'Y',
                ],
                ['url', 'https://web.site', 'Y'],
                ['link', 'https://website.to', 'Y'],
                ['short', 'https://long.url/something', 'N'],
                [
                    'long-url-is-long',
                    [
                        'https://long.url/something?id=',
                        '95bdedab-618d-4ca1-81bf-3b96e4eba1f8-',
                        '8a7050cf-c1ed-4832-a591-ec194a7915fe-',
                        '15d48ba0-a072-4934-8af7-10c704750601',
                    ].join(''),
                    'Y',
                ],
                ['url', 'https://web.site', 'Y'],
                ['link', 'https://website.to', 'Y'],
                ['short', 'https://long.url/something', 'N'],
                [
                    'long-url-is-long',
                    [
                        'https://long.url/something?id=',
                        '95bdedab-618d-4ca1-81bf-3b96e4eba1f8-',
                        '8a7050cf-c1ed-4832-a591-ec194a7915fe-',
                        '15d48ba0-a072-4934-8af7-10c704750601',
                    ].join(''),
                    'Y',
                ],
            ]
        }
        const serviceAccount = getenv('GOOGLE_SERVICE_ACCOUNT')
        const serviceAccountJson = Buffer.from(serviceAccount, 'base64').toString('utf8')
        const serviceAccountFile = resolve(tmpdir(), `${uuid()}.json`)
        writeFileSync(serviceAccountFile, serviceAccountJson)
        const auth = new google.auth.GoogleAuth({
            keyFile: serviceAccountFile,
            scopes: 'https://www.googleapis.com/auth/spreadsheets',
        })
        const authClient = await auth.getClient()
        unlinkSync(serviceAccountFile)
        const sheets = google.sheets({ version: 'v4', auth: authClient })
        const { data } = await sheets.spreadsheets.values.get({
            auth,
            spreadsheetId: getenv('GOOGLE_SHEET_ID'),
            range: 'urls!A:C',
        })
        assert(data.majorDimension === 'ROWS')
        assert(typeof data.values === 'object')
        const values = data.values as Row[]
        values.forEach((row) => {
            assert(typeof row[0] === 'string')
            assert(typeof row[1] === 'string')
            assert(typeof row[2] === 'string')
        })
        return values
    },
}

export const getUrls = async (): Promise<Url[]> => {
    const rows = await googleDataFetcher.getDataFromSheet()
    return rows.slice(1).map((row) => ({
        shortUrl: row[0],
        link: row[1],
        public: row[2] === 'Y',
    }))
}

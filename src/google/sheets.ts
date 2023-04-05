import { resolve } from 'path'
import { tmpdir } from 'os'
import { v4 as uuid } from 'uuid'
import { unlinkSync, writeFileSync } from 'fs'
import { google } from 'googleapis'
import { getenv } from '@/config/getenv'
import { strict as assert } from 'assert'

export type Row = [string, string, string]

export const getDataFromSheet = async (): Promise<Row[]> => {
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
}

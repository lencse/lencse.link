import { getenv } from '~/config/getenv'

export const config = {
    useFakeData: getenv('USE_FAKE_DATA', 'false'),
    googleServiceAccount: getenv('GOOGLE_SERVICE_ACCOUNT'),
    googleSheetId: getenv('GOOGLE_SHEET_ID'),
}

import { getenv } from './getenv'

export const config = {
    urlDataFile: getenv('URL_DATA_FILE'),
}

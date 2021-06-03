import axios from "axios"
import config from "../config/config"
import { connection } from "../db"
import { LinkDb } from "./repository"

export async function checkAvailability(shortLink: string): Promise<boolean> {
    const db = new LinkDb(await connection())
    if (await db.isShortLinkExisting(shortLink)) {
        return false
    }
    const url = new URL(`${config.urls.mainServiceInternal}/${shortLink}`)
    url.searchParams.append('nolog', '')
    const result = await axios.head(url.toString(), {
        validateStatus: () => true,
        maxRedirects: 0,
    })
    return 404 === result.status
}

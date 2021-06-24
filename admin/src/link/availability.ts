import axios from "axios"
import config from "../config/config"
import { connection } from "../db"
import { LinkDb, LinkRepository, ShortLinkExisting } from "./repository"

export type HeadHttpRequestStatuscode = (url: string) => Promise<number>

export const axiosHeadStatuscode: HeadHttpRequestStatuscode = async (url: string) => {
    const { status } = await axios.head(url, {
        validateStatus: () => true,
        maxRedirects: 0,
        timeout: 5000
    })
    return status
}

export const checkAvailability = (
    db: ShortLinkExisting,
    mainServiceUrl: string,
    headStatusCode: HeadHttpRequestStatuscode
) =>
    async (shortLink: string): Promise<boolean> => {
        if (await db.isShortLinkExisting(shortLink)) {
            return false
        }
        const url = new URL(`${mainServiceUrl}/${shortLink}`)
        url.searchParams.append('nolog', '')
        return 404 === await headStatusCode(url.toString())
    }

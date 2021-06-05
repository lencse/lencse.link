import { v4 as uuid } from 'uuid'
import { connection } from '../db/index.js'
import { UserDb } from '../user/repository'
import { LinkDb } from '../link/repository'
import seed from './seed.json'
import { internet, lorem, random, datatype } from 'faker'
import { range } from 'lodash'
import { User, UserData, UserWithHashedPassword } from '../user/types.js'
import { LinkToSave } from '../link/types.js'
import { link } from 'fs'
import { writeFile} from 'fs/promises'
import { resolve } from 'path'

const USER_COUNT = Number(process.argv[2] ?? 20)
const LINK_COUNT = Number(process.argv[3] ?? 1000)

type UserToSave = User & {
    password: string
    deactivated: boolean
}

export async function main() {
    const userSampleData: UserToSave[] = []
    const usernames = new Set<string>()
    const emails = new Set<string>()
    for (let i = 0; i < USER_COUNT; ++i) {
        let username = internet.userName()
        while (usernames.has(username)) {
            username = internet.userName()
        }
        usernames.add(username)
        let email = internet.exampleEmail()
        while (emails.has(email)) {
            email = internet.email()
        }
        emails.add(email)
        userSampleData.push({
            id: uuid(),
            username,
            email,
            password: internet.password(),
            deactivated: datatype.number(5) < 1,
        })
    }
    const users = userSampleData.concat(await Promise.all(seed.users.map(async user => ({
        id: uuid(),
        username: user.username,
        email: user.email,
        password: user.password,
        deactivated: false,
    }))))
    const userIds = users.map(user => user.id)

    const linkSampleData: (LinkToSave & { deleted: boolean })[] = []
    const shortLinks = new Set<string>(seed.links.map(link => link.shortLink))
    for (let i = 0; i < LINK_COUNT; ++i) {
        let shortLink = random.alphaNumeric(3 + datatype.number(20))
        while (shortLinks.has(shortLink)) {
            shortLink = random.alphaNumeric(3 + datatype.number(20))
        }
        shortLinks.add(shortLink)
        linkSampleData.push({
            id: uuid(),
            shortLink,
            redirectTo: internet.url() + (datatype.number(4) < 1 ? `/${lorem.slug(3 + datatype.number(12))}` : ''),
            userId: random.arrayElement(userIds),
            deleted: datatype.number(20) < 1,
        })
    }
    const links = linkSampleData.concat(seed.links.map(link => ({
        id: uuid(),
        shortLink: link.shortLink,
        redirectTo: link.redirectTo,
        userId: userIds.slice(-1).pop(),
        deleted: false,
    })))

    writeFile(resolve(__dirname, '../../.seed.json'), JSON.stringify({
        users,
        links,
    }))

}

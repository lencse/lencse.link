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
import { readFile, writeFile} from 'fs/promises'
import { resolve } from 'path'
import { createToken } from '../user/index.js'
import config from '../config/config.js'
import { SeedData } from './types.js'
import { EOL } from 'os'

export async function main() {
    const data: SeedData = JSON.parse(await readFile(resolve(__dirname, '../../.seed.json'), 'utf-8'))

    process.stdout.write(JSON.stringify({
        token: createToken(config.jwt.secret)(data.users.pop())
    }))
    process.stdout.write(EOL)
}

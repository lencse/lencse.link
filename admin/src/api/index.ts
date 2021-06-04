import { NextApiRequest, NextApiResponse } from "next"
import { User } from "../user/types"

export type Context = {
    req: NextApiRequest
    res: NextApiResponse
}

export type ContextAfterAuth = Context & {
    user: User
}

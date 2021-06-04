import { apiResolver } from "next/dist/next-server/server/api-utils";

export const resolveHandler = (req, res, handler) => apiResolver(req, res, {},
    (req, res) => handler({req, res}), {
    previewModeId: 'TEST',
    previewModeEncryptionKey: 'TEST',
    previewModeSigningKey: 'TEST',
}, true)

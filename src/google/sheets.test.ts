import { describe, it, expect } from '@jest/globals'
import { getUrls, googleDataFetcher } from '~/google/sheets'
import { replace } from 'sinon'

describe('sheets', () => {
    describe('getUrls', () => {
        it('returns url data', async () => {
            replace(googleDataFetcher, 'getDataFromSheet', async () => [
                ['Short URL', 'Link', 'Public'],
                ['url1', 'https://example1.com', 'Y'],
                ['url2', 'https://example2.com', 'N'],
            ])
            const result = await getUrls()
            expect(result).toStrictEqual([
                { shortUrl: 'url1', link: 'https://example1.com', public: true },
                { shortUrl: 'url2', link: 'https://example2.com', public: false },
            ])
        })
    })
})

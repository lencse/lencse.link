import { describe, it, expect } from '@jest/globals'
import { getenv } from '~/config/getenv'

describe('getenv', () => {
    it('retrieves the correct env variable', () => {
        process.env['TEST'] = 'test'
        const result = getenv('TEST')
        expect(result).toEqual('test')
    })

    it('throws exception on missing env variable', () => {
        expect(() => getenv('UNDEFINED')).toThrow('UNDEFINED env var not set')
    })

    it('retrieves default value if environment variable is not set', () => {
        const result = getenv('UNDEFINED', 'default')
        expect(result).toEqual('default')
    })

    it('ignores default value if environment variable is set', () => {
        process.env['TEST'] = 'test'
        const result = getenv('TEST', 'default')
        expect(result).toEqual('test')
    })
})

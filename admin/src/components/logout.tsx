import React from 'react'
import dayjs from 'dayjs'
import { LinkData } from '../link/types'
import UrlChecker from './url-checker'
import Head from 'next/head'
import { GetServerSideProps } from 'next'
import { TokenValidationError, validateTokenAndGetUser } from '../user'
import { User } from '../user/types'
import useSWR, { SWRConfiguration, RevalidatorOptions, Revalidator } from 'swr'
import { QueryResult } from '../link/repository'
import axios from 'axios'
import AddLink from './add-link'
import EventEmitter from 'events'
import c from 'classnames'

export default class Logout extends React.Component<{}, {}> {

    render() {
        return (
            <form action="/api/logout" method='post'>
                <input
                    type='submit'
                    value='logout'
                    data-cy='user_logout'
                    className={c(
                        'bg-transparent',
                        'cursor-pointer',
                        'text-gray-300',
                        'underline'
                    )}
                />
            </form>
        )
    }

}

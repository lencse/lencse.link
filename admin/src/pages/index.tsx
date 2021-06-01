import Head from 'next/head'
import React from 'react'
import { GetServerSideProps } from 'next'
import dayjs from 'dayjs'
import { TokenValidationError, validateTokenAndGetUser } from '../user'
import { User } from '../user/types'
import { LinkData } from '../link/types'
import useSWR, { SWRConfiguration, RevalidatorOptions, Revalidator } from 'swr'
import { QueryResult } from '../link/repository'
import Links from '../components/links'
import axios from 'axios'
import AddLink from '../components/add-link'
import EventEmitter from 'events'
import Login from '../components/login'
import Logout from '../components/logout'
import c from 'classnames'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class UserInfo extends React.Component<{ user: User }, {}> {

    render() {
        return (
            <div>
                <div className={c(
                    'flex',
                    'flex-wrap',
                    'justify-end',
                    'text-xs',
                    // 'h=8',
                    // 'align-middle',
                )}>
                    <div className='mr-2 h-8 p-2 flex justify-center flex-col'>
                        <FontAwesomeIcon icon={faUser} width='12px' />
                    </div>
                    <div className='mr-4 flex justify-center flex-col'>
                        <span className='inline-block'>
                            {this.props.user.username}
                        </span>
                    </div>
                    <div className='pr-2 flex justify-center flex-col'>
                        <Logout />
                    </div>
                </div>
            </div>
        )
    }
}


class Main extends React.Component<{ user: User }, {}> {

    private reloadRequest: EventEmitter = new EventEmitter()

    render() {
        return (
            <div>
                <header className={c(
                    'w-full',
                    'bg-gray-900',

                )}>
                    <UserInfo user={this.props.user} />
                </header>
                <div className={c(
                    'container',
                    'mx-auto',
                    'max-w-screen-lg',
                    'w-full',
                    'p-6',
                    'text-xs sm:text-base',
                )}>
                    <AddLink onDataChange={() => this.reloadRequest.emit('shouldReload')} />
                    <Links reloadRequest={this.reloadRequest} />

                </div>
            </div>
        )
    }
}

export default class Home extends React.Component<{
    errorMessage: string,
    user: User | null
}, {}> {

    render() {
        const isLoggedIn = () => null !== this.props.user
        return <>

            <Head>
                <title>admin | lencse.link</title>
                <link rel="icon" href="/favicon.ico" />
                {/* TODO: favicon.svg */}
            </Head>

            <div className='bg-gray-800 min-h-screen text-white'>
                {
                    isLoggedIn() ?
                        <Main user={this.props.user} /> :
                        <Login errorMessage={this.props.errorMessage} />
                }
            </div>

        </>

    }
}

export const getServerSideProps: GetServerSideProps = async context => {
    const { token } = context.req.cookies
    const getUser = async (token: string): Promise<User | null> => {
        try {
            return await validateTokenAndGetUser(token)
        } catch (err) {
            if (err instanceof TokenValidationError) {
                return null
            }
            throw err
        }
    }
    return {
        props: {
            user: await getUser(token),
            errorMessage: context.query.err ?? ''
        }
    }
}

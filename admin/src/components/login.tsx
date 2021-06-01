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
import Input from './input'
import Button from './button'


export default class Login extends React.Component<{ errorMessage: string }, {}> {

    render() {
        return (
            <div className={c(
                'container',
                'mx-auto',
                'max-w-screen-sm',
                'w-full',
                'flex',
                'flex-wrap',
                'content-center',
                'min-h-screen',
                'px-6',
            )}>
                <div className='text-center w-full'>

                    <h1 className={c(
                        'text-3xl sm:text-6xl',
                        'font-black',
                        'mb-12',
                    )}>
                        lencse.link admin
                    </h1>
                    {/* TODO: nagy kepernyon egymas melle */}
                    <form action="/api/login" method='post' className={c(
                        'text-left',
                        'sm:mx-32',
                    )}>

                        <Input
                            name='email'
                            label='Email:'
                            className='mb-8'
                        />

                        <Input
                            name='password'
                            label='Password:'
                            type='password'
                            className='mb-8'
                        />

                        <div className={c(
                            'mb-4',
                            'text-center',
                            'text-red-600'
                        )} >
                            {
                                this.props.errorMessage === '' ?
                                    <span>&nbsp;</span> :
                                    this.props.errorMessage
                            }
                        </div>
                        <div className='text-center'>
                            <Button>Login</Button>
                        </div>
                    </form>
                </div>
            </div >
        )
    }

}

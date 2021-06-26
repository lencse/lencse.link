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

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export default class Button extends React.Component<ButtonProps, {}> {
    render() {
        return (
            <button {...this.props} className={c(
                this.props.className,
                'bg-gray-300',
                this.props.className?.split(/\s+/).some(cl => cl.match(/^p-\d+/)) ? '' : 'p-2',
                'rounded-md',
                'text-gray-900 disabled:text-gray-400',
                'border border-gray-200',
                this.props.className?.split(/\s+/).some(cl => cl.match(/^w-\d+/)) ? '' : 'w-36',
                'cursor-pointer disabled:cursor-default',
            )}>{this.props.children}</button>
        )
    }
}

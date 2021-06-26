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

type InputProps = {
    name: string
    label: string
    type?: string
    value?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
    className?: string
    inputClassName?: string
}

export default class Input extends React.Component<InputProps, {}> {
    render() {
        return (
            <div className={c(
                this.props.className
            )}>
                <div className='mb-2'>
                    <label htmlFor={this.props.name}>{this.props.label}</label>
                </div>
                <div>
                    <div className={c(
                        'absolute'
                    )}>
                        {
                            this.props.children
                        }
                    </div>
                    {
                        'textarea' === this.props.type ? (
                            <textarea
                                name={this.props.name}
                                value={this.props.value}
                                onChange={this.props.onChange}
                                className={c(
                                    'bg-gray-600',
                                    'p-2',
                                    'rounded-md',
                                    'border border-gray-500',
                                    'w-full',
                                    this.props.inputClassName,
                                )}
                            />
                        ) : (
                            <input
                                type={this.props.type ?? 'text'}
                                name={this.props.name}
                                value={this.props.value}
                                onChange={this.props.onChange}
                                className={c(
                                    'bg-gray-600',
                                    'p-2',
                                    'rounded-md',
                                    'border border-gray-500',
                                    'w-full',
                                    this.props.inputClassName,
                                )}
                            />
                        )
                    }
                </div>
            </div>
        )
    }
}

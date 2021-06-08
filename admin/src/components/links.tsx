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
import AddLink from '../components/add-link'
import EventEmitter from 'events'
import c from 'classnames'
import config from '../config/config'

type Data = {
    links: LinkData[]
}

const fetcher = (input, init) => fetch(input, init).then(res => res.json())

interface DataLoaderProps {
    onLoadingSlow: (key: string, config: SWRConfiguration<QueryResult, Error>) => void
    onSuccess: (data: Data, key: string, config: SWRConfiguration<QueryResult, Error>) => void
    // onError: (err: Error, key: string, config: ConfigInterface<QueryResult, Error>) => void
    onErrorRetry: (err: Error, key: string, config: SWRConfiguration<QueryResult, Error>, revalidate: Revalidator, revalidateOpts: RevalidatorOptions) => void,
    onLoad: (mutate: () => void) => void
}

const DataLoader = (props: DataLoaderProps) => {
    const { mutate } = useSWR('/api/links', fetcher, {
        ...props
    })
    props.onLoad(mutate)
    return <></>
}

type LoadingState = {
    isLoading: boolean
    isLoaded: boolean
    isLoadingSlow: boolean
}

type LinksProps = {
    reloadRequest: EventEmitter
}

type LinksState = {
    data: Data,
    loadingState: LoadingState,
    config: { // TODO: ez menjen getserversideprops-ba
        mainUrl: string
    }
}

export default class Links extends React.Component<LinksProps, LinksState> {

    constructor(props: LinksProps) {
        super(props)
        this.state = {
            data: {
                links: []
            },
            loadingState: {
                isLoading: false,
                isLoaded: false,
                isLoadingSlow: false
            },
            config: {
                mainUrl: ''
            }
        }
    }

    componentDidMount() {
        // this.setState({
        //     data: {
        //         links: (____________________ as any[]).map(linkData => ({
        //             ...linkData,
        //             creationDate: new Date(linkData.creationDate)
        //         }))
        //     }
        // })
        axios.get('/api/run-config').then(res => this.setState({
            config: {
                ...res.data
            }
        }))
        this.props.reloadRequest.on('shouldReload', () => this.reloader())
    }

    private reloader: () => void = () => { }

    public render() {
        return <>
            <DataLoader
                onLoad={mutate => {
                    this.reloader = () => {
                        this.setState({
                            loadingState: { isLoading: true, isLoaded: false, isLoadingSlow: true }
                        })
                        mutate()
                    }
                }}
                onSuccess={(data) => {
                    this.setState({
                        data: {
                            ...data,
                            links: data.links.map(linkData => ({
                                ...linkData,
                                creationDate: new Date(linkData.creationDate)
                            }))
                        },
                        loadingState: { isLoading: false, isLoaded: true, isLoadingSlow: false }
                    })
                }}
                onLoadingSlow={() => {
                    console.log('LOADING SLOW')
                    this.setState({
                        loadingState: { isLoading: true, isLoaded: false, isLoadingSlow: true }
                    })
                }}
                onErrorRetry={() => {
                    this.setState({
                        loadingState: { isLoading: true, isLoaded: false, isLoadingSlow: true }
                    })
                }}
            />

            <div className={c(
                'text-xs',
                'mt-16',
                'overflow-hidden',
            )}>
                <table className={c(
                    'w-full',
                    'border-collapse',
                    'block sm:table',
                    '',
                    '',
                    '',
                )}>
                    <tbody className='text-left block sm:table-row-group'>
                        <tr className={c('block sm:table-row whitespace-nowrap')}>
                            <th className={'p-2 block sm:table-cell min-w-min'}>Short link</th>
                            <th className={'p-2 block sm:table-cell min-w-min'}>Full URL</th>
                            <th className={'p-2 block sm:table-cell min-w-min'}>Created by</th>
                            <th className={'p-2 block sm:table-cell min-w-min'}>Created at</th>
                            <th className={'p-2 block sm:table-cell min-w-min'}>Hits</th>
                        </tr>
                        {
                            this.state.data.links.map((link, idx) => (
                                <tr key={link.id} className={c(
                                    'block sm:table-row',
                                    0 === idx % 2 ? 'bg-gray-700' : ''
                                )}>
                                    <td className={'p-2 block sm:table-cell break-all max-w-sm'}>
                                        <a
                                            href={`${this.state.config.mainUrl}/${link.shortLink}?nolog`}
                                            className='text-yellow-500'
                                        >
                                            /{link.shortLink}
                                        </a>
                                    </td>
                                    <td className={'p-2 block sm:table-cell max-w-xl break-all'}>
                                        <a
                                            href={link.redirectTo}
                                            className='text-yellow-500'
                                        >
                                            {link.redirectTo}
                                            <UrlChecker url={link.redirectTo} className={c(
                                                'inline-block',
                                                'pl-2',
                                                'relative',
                                                'top-px'
                                            )} />
                                        </a>
                                    </td>
                                    <td className={'p-2 block sm:table-cell'}>{link.user.username}</td>
                                    <td className={'p-2 block sm:table-cell min-w-min whitespace-nowrap'}>
                                        {dayjs(link.creationDate).format('D MMM YYYY, HH:mm')}
                                    </td>
                                    <td className={'p-2 block sm:table-cell'}>{link.hitCount}</td>
                                </tr>)
                            )
                        }
                    </tbody>
                </table>
            </div>
        </>
    }

}
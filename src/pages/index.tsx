import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { urls } from '~/data/data'
import { Page } from '~/components/layout/page'
import { Screen } from '~/components/layout/screen'
import { HoveredLink } from '~/components/link'
import { Url } from '~/types/types'
import { ReactNode } from 'react'

export default function Home() {
    const urlComponents = (fn: (url: Url, index: number) => ReactNode) => {
        return urls.filter((url) => url.public).map((url, index) => fn(url, index))
    }
    return (
        <Page title="lencse.link">
            <Screen className="bg-white text-black">
                <section className="m-auto p-12">
                    <h1 className="mb-8 md:mb-16">
                        <Image
                            src="/img/logo.svg"
                            alt="lencse.link"
                            width="800"
                            height="400"
                            priority={true}
                        />
                    </h1>
                    <p className="text-base text-center">A personal url shortener</p>
                </section>
            </Screen>
            <Screen extend={true} className="bg-black text-white">
                <section className="m-auto py-16 px-8 text-center">
                    <h2 className="mb-12 text-4xl font-serif font-bold">Links</h2>
                    <div className="hidden md:block max-h-80  px-8 py-2 overflow-scroll">
                        <table className="text-sm text-left border-collapse">
                            <tbody>
                                {urlComponents((url, index) => (
                                    <tr
                                        key={index}
                                        className={index === 0 ? '' : 'border-t border-t-gray'}
                                    >
                                        <td className="pl-2 pr-6 py-6 font-bold">
                                            /{url.shortUrl}
                                        </td>
                                        <td className="pl-6 pr-12 py-6 max-w-lg truncate">
                                            <HoveredLink href={url.link} title={url.link}>
                                                {url.link}
                                            </HoveredLink>
                                        </td>
                                        <td className="pl-12 pr-2 py-6">
                                            <HoveredLink href={`/qr/${url.shortUrl}`}>
                                                QR
                                            </HoveredLink>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="md:hidden text-sm">
                        <ul className="text-left">
                            {urlComponents((url, index) => (
                                <li key={index} className="mb-8 flex">
                                    <div className="flex-auto">
                                        <h3 className="font-bold mb-2">/{url.shortUrl}</h3>
                                        <HoveredLink
                                            className="break-all"
                                            href={url.link}
                                            title={url.link}
                                        >
                                            {url.link}
                                        </HoveredLink>
                                    </div>
                                    <HoveredLink
                                        className="flex-none w-min ml-4 overflow-hidden"
                                        href={`/qr/${url.shortUrl}`}
                                    >
                                        QR
                                    </HoveredLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </Screen>
        </Page>
    )
}

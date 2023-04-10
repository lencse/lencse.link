import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { urls } from '~/data/data'
import { Page } from '~/components/layout/page'
import { Screen } from '~/components/layout/screen'

export default function Home() {
    return (
        <Page title="lencse.link">
            <Screen className="bg-white text-black">
                <section className="m-auto p-4">
                    <h1 className="mb-16">
                        <Image src="/img/logo.svg" alt="lencse.link" width="800" height="400" />
                    </h1>
                    <p className="text-base text-center">A personal url shortener</p>
                </section>
            </Screen>
            <Screen className="bg-black text-white">
                <section className="m-auto py-16 px-8 text-center">
                    <h2 className="mb-10 text-4xl font-serif font-bold">Links</h2>
                    <div className="max-h-80  px-8 py-2 overflow-scroll">
                        <table className="text-sm text-left border-collapse">
                            <tbody>
                                {urls
                                    .filter((url) => url.public)
                                    .map((url, i) => (
                                        <tr
                                            key={url.shortUrl}
                                            className={i === 0 ? '' : 'border-t border-t-gray'}
                                        >
                                            <td className="pl-2 pr-6 py-6 font-bold">
                                                /{url.shortUrl}
                                            </td>
                                            <td className="pl-6 pr-12 py-6 max-w-lg truncate">
                                                <Link href={url.link} title={url.link}>
                                                    {url.link}
                                                </Link>
                                            </td>
                                            <td className="pl-12 pr-2 py-6">
                                                <Link href={`/qr/${url.shortUrl}`}>QR</Link>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </Screen>
        </Page>
    )
}

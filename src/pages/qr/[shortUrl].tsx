import { GetStaticPaths, GetStaticProps } from 'next'
import { urls } from '~/data/data'
import { Url } from '~/types/types'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { config } from '~/config/config'
import { Page } from '~/components/layout/page'
import { Screen } from '~/components/layout/screen'

type params = {
    shortUrl: string
}

type props = {
    url: Url
}

export const getStaticPaths: GetStaticPaths<params> = () => {
    return {
        paths: urls.map((url) => ({
            params: { shortUrl: url.shortUrl },
        })),
        fallback: false,
    }
}

export const getStaticProps: GetStaticProps<props, params> = ({ params }) => {
    const url = urls.find((url) => url.shortUrl === params?.shortUrl) as Url
    return {
        props: { url },
    }
}

export default function Qr({ url }: props) {
    return (
        <Page title={`lencse.link: /${url.shortUrl}`}>
            <Screen className="bg-black text-white">
                <section className="m-auto py-16 px-8 text-center">
                    <Image
                        src={`/img/qr/${url.shortUrl}.png`}
                        alt={`QR code for ${config.siteUrl}/${url.shortUrl}`}
                        width="300"
                        height="300"
                    />
                </section>
            </Screen>
        </Page>
    )
}

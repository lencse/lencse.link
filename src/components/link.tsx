import { FC, ComponentProps } from 'react'
import Link from 'next/link'

export const HoveredLink: FC<ComponentProps<typeof Link>> = (props) => (
    <Link {...props} className={(props.className ?? '') + ' hover:underline'}>
        {props.children}
    </Link>
)

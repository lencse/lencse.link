import { FC, ComponentProps } from 'react'
import Link from 'next/link'
import cl from 'classnames'

export const StyledLink: FC<ComponentProps<typeof Link>> = (props) => (
    <Link
        {...props}
        className={cl(props.className, 'md:hover:underline underline md:no-underline')}
    >
        {props.children}
    </Link>
)

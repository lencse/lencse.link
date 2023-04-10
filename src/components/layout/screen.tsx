import { FC, ReactNode } from 'react'
import cl from 'classnames'

export const Screen: FC<{ className?: string; extend?: boolean; children?: ReactNode }> = (
    { className, extend, children } = { extend: false }
) => <div className={cl('flex min-h-screen', className)}>{children}</div>

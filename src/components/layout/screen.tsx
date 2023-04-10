import { FC, ReactNode } from 'react'

export const Screen: FC<{ className: string; children?: ReactNode }> = (
    { className, children } = { className: '' }
) => <div className={`flex h-screen ${className}`}>{children}</div>

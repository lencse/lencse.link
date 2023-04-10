import { FunctionComponentFactory } from 'react'

export const Screen: FunctionComponentFactory<{ className: string }> = (
    { className, children } = { className: '' }
) => <div className={`flex h-screen ${className}`}>{children}</div>

import React from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import Loader from 'react-loader-spinner'
import theme from '../config/theme'
import handleViewport from 'react-in-viewport'
import EventEmitter from 'events'

type UrlCheckerProps = {
    url: string
    className?: string
}

type UrlCheckerState = {
    status: 'waiting' | 'checking' | 'checked'
    found: boolean
}

type UrlCheckerViewportProps = UrlCheckerProps & {
    inViewPortNotifier: EventEmitter
    inViewport?: boolean
}

class UrlCheckerViewport extends React.Component<UrlCheckerViewportProps, UrlCheckerState> {

    constructor(props: UrlCheckerViewportProps) {
        super(props)
        this.state = {
            status: 'waiting',
            found: false
        }
        props.inViewPortNotifier.on('inViewport', () => this.checkUrl())
    }

    private async checkUrl() {
        if ('checked' === this.state.status) {
            return
        }
        this.setState({
            status: 'checking'
        })
        const params = new URLSearchParams()
        params.set('url', this.props.url)
        const result = await axios.head(`/api/url-availability?${params.toString()}`, {
            validateStatus: statusCode => [200, 404].includes(statusCode)
        })
        this.setState({
            status: 'checked',
            found: 200 === result.status,
        })
    }

    public render() {
        return <span className={this.props.className}>{
            'waiting' === this.state.status ? null :
                'checking' === this.state.status ?
                    <Loader
                        type='Oval'
                        color='#fff' // TODO: color
                        height={10}
                        width={10}
                    /> :
                    this.state.found ?
                        <FontAwesomeIcon title='Url found.' className='text-green-300' icon={faCheckCircle} width='10px' /> :
                        <FontAwesomeIcon title='Url may not be available.' className='text-yellow-300' icon={faExclamationCircle} width='10px' />
        }
        </span>
    }
}

const UrlCheckerInViewport = handleViewport<UrlCheckerViewportProps>(UrlCheckerViewport, {},)

const UrlChecker = (props: UrlCheckerProps) => {
    const emitter = new EventEmitter()
    return (
        <UrlCheckerInViewport
            onEnterViewport={() => emitter.emit('inViewport')}
            inViewPortNotifier={emitter}
            {...props}
        />
    )
}

export default UrlChecker

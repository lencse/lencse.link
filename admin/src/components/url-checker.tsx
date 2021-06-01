import React from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import Loader from 'react-loader-spinner'
import theme from '../config/theme'

type UrlCheckerProps = {
    url: string
    className?: string
}

type UrlCheckerState = {
    status: 'checking' | 'checked'
    found: boolean
}

export default class UrlChecker extends React.Component<UrlCheckerProps, UrlCheckerState> {

    constructor(props) {
        super(props)
        this.state = {
            status: 'checking',
            found: false
        }
    }

    public async componentDidMount() {
        console.log(theme)
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

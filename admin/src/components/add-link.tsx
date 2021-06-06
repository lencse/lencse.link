import React from 'react'
import axios from 'axios'
import UrlChecker from './url-checker'
import Input from './input'
import c from 'classnames'
import Button from './button'

type AddLinkProps = {
    onDataChange: () => void
}

type AddLinkState = {
    shortLink: string
    redirectTo: string
    warning: string | null
    error: string | null
    validating: boolean
    validated: boolean
    saving: boolean
    suggesting: boolean
}

class LoadingAnimation extends React.Component<{ visible: boolean, color1: string, color2: string }, {}> {
    render() {
        return (
            <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 100 1'
                width='100%' height={2}
                preserveAspectRatio='none'
            >
                <defs>
                    <linearGradient id='grad1'>
                        <stop offset='0%'>
                            <animate
                                attributeName="stop-color"
                                values={[this.props.color1, this.props.color2, this.props.color1].join(';')}
                                dur="2s"
                                repeatCount="indefinite"
                            ></animate>
                        </stop>
                        <stop offset='50%'>
                            <animate
                                attributeName="stop-color"
                                values={[this.props.color2, this.props.color1, this.props.color2].join(';')}
                                dur="2s"
                                repeatCount="indefinite"
                            ></animate>
                        </stop>
                        <stop offset='100%'>
                            <animate
                                attributeName="stop-color"
                                values={[this.props.color1, this.props.color2, this.props.color1].join(';')}
                                dur="2s"
                                repeatCount="indefinite"
                            ></animate>
                        </stop>
                    </linearGradient>
                </defs>
                {
                    this.props.visible ?
                        <rect x={0} y={0} width='100%' height='100%' fill='url(#grad1)' /> :
                        null
                }

            </svg>
        )
    }
}

export default class AddLink extends React.Component<AddLinkProps, AddLinkState> {

    private initial: AddLinkState = {
        shortLink: '',
        redirectTo: '',
        warning: null,
        error: null,
        validating: false,
        validated: false,
        saving: false,
        suggesting: false,
    }

    constructor(props) {
        super(props)
        this.state = this.initial
    }

    private saveable(): boolean {
        return this.state.shortLink.length > 0
            && this.state.redirectTo.length > 0
            && this.state.validated
            && !this.state.saving
    }

    private async validateShortLink(shortLink: string) {
        if (0 === shortLink.trim().length) {
            this.setState({
                validating: false,
                validated: false,
                warning: null,
            })
            return
        }
        this.setState({ validating: true })

        const params = new URLSearchParams()
        params.set('shortLink', shortLink)
        const result = await axios.head(`/api/short-link-availability?${params.toString()}`, {
            validateStatus: statusCode => [200, 404].includes(statusCode)
        })
        this.setState({
            validated: 404 === result.status,
            warning: 404 === result.status ? null : 'Short link already exists.',
        })
        this.setState({ validating: false })
    }

    private updateShortLink(shortLink: string) {
        this.setState({ shortLink })
        this.validateShortLink(shortLink)
    }

    private updateRedirectTo(redirectTo: string) {
        if (0 === this.state.shortLink.length) {
            this.suggest()
        }
        this.setState({ redirectTo })
    }

    private async saveLink() {
        this.setState({ saving: true })
        try {
            await axios.post('/api/links', {
                shortLink: this.state.shortLink,
                redirectTo: this.state.redirectTo,
            })
            this.setState(this.initial)
            this.props.onDataChange()
        } catch (e) {
            const statusCode = e.response.status
            if (400 === statusCode) {
                return this.setState({ error: 'Invalid data.' })
            }
            if (409 === statusCode) {
                return this.setState({ error: 'Short link already exists.' })
            }
            return this.setState({ error: 'An error occured.' })
        } finally {
            this.setState({ saving: false })
        }
    }

    private async suggest() {
        this.setState({ suggesting: true })
        const result = await axios.get('/api/short-link-suggestion')
        this.updateShortLink(result.data.shortLinkSuggestion)
        this.setState({
            suggesting: false,
        })
    }


    public render() {
        // const c1 = 'hsl(274, 87%, 43%)'
        // const c2 = 'hsl(264, 96%, 70%)'
        const c1 = 'hsl(29, 80%, 44%)'
        const c2 = 'hsl(48, 94%, 68%)'
        return (
            <div>
                <h2 className={c(
                    'text-xl sm:text-2xl',
                    'font-black',
                    'mb-8',
                )}>
                    Add link
                    </h2>
                <Input
                    name='shortLink'
                    label='Short Link:'
                    value={this.state.shortLink}
                    onChange={e => this.updateShortLink(e.target.value)}
                    inputClassName='pl-16 sm:pl-28'
                    cy={{ input: 'add_suggest_input' }}
                >
                    <Button
                        cy='add_suggest_button'
                        type='button'
                        disabled={this.state.suggesting}
                        onClick={() => this.suggest()}
                        className={c(
                            'p-1',
                            'm-1',
                            'w-14 sm:w-24',
                        )}
                    >
                        Suggest
                    </Button>
                </Input>
                <div className='px-1.5'>
                    <LoadingAnimation
                        visible={ this.state.suggesting || this.state.validating }
                        color1={ this.state.suggesting ? 'hsl(29, 80%, 44%)' : 'hsl(274, 87%, 43%)'}
                        color2={ this.state.suggesting ? 'hsl(48, 94%, 68%)' : 'hsl(264, 96%, 70%)'}
                    />
                </div>
                <div className={c(
                    'mt-1 mb-4',
                    'text-right',
                    'text-red-600',
                )} >
                    {
                        null === this.state.warning ?
                            <span>&nbsp;</span> :
                            this.state.warning
                    }
                </div>

                <Input
                    type='textarea'
                    name='redirectTo'
                    label='Full link:'
                    value={this.state.redirectTo}
                    onChange={e => this.updateRedirectTo(e.target.value)}
                />
                <div className={c(
                    'mt-4 mb-1',
                    'text-right',
                    'text-red-800',
                )} >
                    {
                        null === this.state.error ?
                            <span>&nbsp;</span> :
                            this.state.error
                    }
                </div>
                <div className='text-right'>
                    <Button
                        disabled={!this.saveable()}
                        type='button'
                        value='Add link'
                        onClick={() => this.saveLink()}
                    >Add link</Button>
                </div>
            </div>
        )
    }

}
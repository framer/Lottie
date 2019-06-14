import * as React from "react"
import { PropertyControls, ControlType } from "framer"
import Lottie from "react-lottie"

const styleError: React.CSSProperties = {
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#FF0000",
    padding: 20,
    overflow: "hidden",
}

const style: React.CSSProperties = {
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#131313",
    overflow: "hidden",
}

const lottiePlaceholder =
    "https://raw.githubusercontent.com/framer/Lottie/master/Lottie.framerfx/assets/component.png"
const lottieJsonURL =
    "https://raw.githubusercontent.com/framer/Lottie/master/Lottie.framerfx/assets/logo.json"

export const enum LottiePlayStates {
    Play = "▶",
    Pause = "❙❙",
    Stop = "■",
}

const StringIsNumber = value => isNaN(Number(value)) === false

function enumToArray(enumme) {
    return Object.keys(enumme)
        .filter(StringIsNumber)
        .map(key => enumme[key])
}

interface Props {
    lottieJsonURL: string
    loop: boolean
    refresh: LottiePlayStates
}

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: null,
    rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
    },
}

export class Lottie extends React.Component<Partial<Props>> {
    static defaultProps = {
        lottieJsonURL: lottieJsonURL,
        loop: true,
        refresh: LottiePlayStates.Play,
        // Added three props below so Lottie doesn't complain about props in render()
        options: {},
        isStopped: false,
        isPaused: false,
    }
    static propertyControls: PropertyControls<Props> = {
        lottieJsonURL: { type: ControlType.String, title: "JSON" },
        loop: { type: ControlType.Boolean, title: "Loop" },
        refresh: {
            type: ControlType.SegmentedEnum,
            title: "State",
            options: [
                LottiePlayStates.Play,
                LottiePlayStates.Pause,
                LottiePlayStates.Stop,
            ],
        },
    }
    state = {
        error: false,
        isStopped: false,
        isPaused: false,
        animationData: null,
    }
    componentDidMount() {
        this.loadLottieData(this.props)
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.lottieJsonURL !== this.props.lottieJsonURL) {
            this.loadLottieData(nextProps)
        }
        if (nextProps.refresh !== this.props.refresh) {
            this.setState({
                isPaused: nextProps.refresh === LottiePlayStates.Pause,
                isStopped: nextProps.refresh === LottiePlayStates.Stop,
            })
        }
        if (nextProps.loop !== this.props.loop) {
            // seems like an issue with react-lottie, force it to reload the animation
            this.forceReloadAnimation()
        }
    }
    forceReloadAnimation = () => {
        this.setState({
            animationData: { ...this.state.animationData },
        })
    }
    loadLottieData = props => {
        const { lottieJsonURL } = props
        fetch(lottieJsonURL, {
            method: "GET",
            credentials: "omit",
            redirect: "follow",
        })
            .then(resp => {
                if (!resp.ok) {
                    console.error(
                        "There was an error while the fetching Lottie JSON URL"
                    )
                    console.log("Printing failed response...")
                    console.log(resp)
                    this.setState({
                        error: true,
                    })
                    return
                }
                resp.json()
                    .then(data => {
                        this.setState({
                            error: false,
                            animationData: data,
                        })
                    })
                    .catch(e => {
                        console.error(e)
                        console.log(
                            "Could not parse a valid JSON from the Lottie URL"
                        )
                        this.setState({
                            error: true,
                        })
                    })
            })
            .catch(e => {
                this.setState({
                    error: true,
                })
                console.error(e)
            })
    }
    render() {
        const { loop } = this.props
        const { error, animationData, isPaused, isStopped } = this.state
        if (error) {
            return (
                <div style={styleError}>
                    Error loading URL, please check the URL is a valid Lottie
                    JSON URL
                </div>
            )
        }
        if (!animationData) {
            return (
                <div style={style}>
                    <img src={lottiePlaceholder} />
                </div>
            )
        }
        const options = {
            ...defaultOptions,
            animationData,
            loop,
        }
        return (
            <Lottie
                options={options}
                isStopped={isStopped}
                isPaused={isPaused}
            />
        )
    }
}

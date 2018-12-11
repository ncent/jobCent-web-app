import React from "react";
import "../../scss/components/transfer.css";
import x from "../../img/x.png";
import ncentLogo from "../../img/logo.png";

const convertToDays = dateString => {
    const date = Date.parse(dateString);
    const now = Date.now();

    return (date - now)/(1000*60*60*24);
};

export default class ChallengeDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            referralCode: "",
            tokensPerReferral: 1,
            imageLoadErrBool: true,
        };

        this.handleSetTokensPerReferral = this.handleSetTokensPerReferral.bind(this);
        this.imgLoadError = this.imgLoadError.bind(this);
    }

    componentWillMount() {
        this.props.getReferralCode(this.props.currentUser.uuid, this.props.challengeDetails.uuid)
            .then(referralCodeResp => {
                this.setState({

                    referralCode: referralCodeResp.challengeUserData.data.challengeUser.referralCode,
                    tokensPerReferral: referralCodeResp.challengeUserData.data.challengeUser.tokensPerReferral


                });
            });
        
        document.title = "jobCent - " + this.props.challengeDetails.name;

    }

    componentWillUnmount() {
        document.title = "jobCent";
    }

    async handleSetTokensPerReferral(e) {
        e.preventDefault();
        const challengeUuid = this.props.challengeDetails.uuid;
        const userUuid = this.props.currentUser.uuid;
        const tokensPerReferral = this.state.tokensPerReferral;
        console.log(tokensPerReferral);
        await this.props.setTokensPerReferral(userUuid, challengeUuid, tokensPerReferral);
    }

    imgLoadError(e) {
        if (this.state.imageLoadErrBool) {
            this.setState({imageLoadErrBool: false});
            e.target.src = ncentLogo;
        }
    }


    render() {
        let balanceNotPlural = this.props.challengeBalance === 1;
        let days = Math.floor(convertToDays(this.props.challengeDetails.expiration));
        let daysNotPlural = days === 1;
        return <div className="fs-transfer-sheet">
            <div className="transfer-content">
                <div title="jobCents" className="close-button" onClick={this.props.handleInput("formType")}>
                    <img src={x} alt=""/>
                </div>
                <div className="not-x-button">
                    <div className="headerChallengeImage">
                        <img src={this.props.challengeDetails.imageUrl || ncentLogo} className="challengeImage"
                            onError={this.imgLoadError}
                        />
                    </div>
                    <h1 className="companyName">{this.props.challengeDetails.company}</h1>
                    <h1 className="challengeName">{this.props.challengeDetails.name}</h1>
                    <p className="challengeDescription">{this.props.challengeDetails.description}</p>
                    {/* <div className="challengeContent"> */}
                        <h2 className="challengeReward">Total Reward: ${this.props.challengeDetails.rewardAmount}</h2>
                        <h2>{days} day{daysNotPlural ? "" : "s"} remaining!</h2>
                        <h2 className="referralCodeHeader">Your referral code for this challenge<br />
                        <span className="referralCode">{this.state.referralCode}</span></h2>
                        <span className="currentBalance">Your current balance: {this.props.challengeBalance} jobCent{balanceNotPlural ? "" : "s"}</span>
                        <form className="tokensPerReferralForm" autoComplete="off" spellCheck="true" noValidate="true" onSubmit={this.handleSetTokensPerReferral}>
                            <span className="tokensPerReferralDesc">Total jobCents to send per referral code redemption</span>
                            <div className="enter-email">
                                <div className="recipients">
                                    <div className="token-list">
                                        <input className="transfer-input-field jobCentsRedemption" autoComplete="off"                         spellCheck="false"
                                               placeholder="Default of 1"
                                               autoCorrect="false" autoCapitalize="off" type="text"
                                               value={this.state.tokensPerReferral}
                                               onChange={(e) => this.setState({tokensPerReferral: e.currentTarget.value})}
                                        />
                                    </div>
                                </div>
                                <div className="anchor"/>
                                <div className="error-box"/>
                            </div>
                            <br />
                            <button className="theme-button saveChallengeDetail">
                                Save
                            </button>
                        </form>
                    {/* </div> */}
                </div>
            </div>
        </div>;
    }
}
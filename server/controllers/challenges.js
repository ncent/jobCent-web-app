const User = require("../models").User;
const ncentSDK = require('ncent-sandbox-sdk');
const stellarSDK = require('stellar-sdk');
const sdkInstance = new ncentSDK('http://localhost:8010/api');
const awsEmail = require("./awsEmail.js");
const _ = require('lodash');

module.exports = {
    async create(req, res) {
        let tokenTypeUuid;
        const expiration = '2020';
        const { senderPublicKey, name, rewardAmount } = req.body;
        const rewardAmountInt = parseInt(rewardAmount);
        const user = await User.findOne({where: {publicKey: senderPublicKey}});
        const senderKeypair = stellarSDK.Keypair.fromSecret(user.privateKey);
        const stampResponse = await sdkInstance.stampToken(senderPublicKey, name, rewardAmountInt, expiration);
        tokenTypeUuid = stampResponse.data.tokenType.uuid;
        const createChallengeResponse = await sdkInstance.createChallenge(senderKeypair, name, expiration, tokenTypeUuid, rewardAmountInt);
        res.status(200).send({challenge: createChallengeResponse.data});
    },

    async share({body, params}, res) {
        const fromAddress = body.fromAddress;
        const toAddress = body.toAddress;
        const challengeUuid = params.challengeUuid;

        const fromUser = await User.findOne({where: {email: fromAddress}});
        let toUser = await User.findOne({where: {email: toAddress}});

        if (!toUser) {
            toUser = await User.create({email: toAddress});
            const wallet = sdkInstance.createWalletAddress();
            toUser = await toUser.update({
                        publicKey: wallet.publicKey(),
                        privateKey: wallet._secretKey
                    });
        }
        const senderKeypair = stellarSDK.Keypair.fromSecret(fromUser.privateKey);
        const receiverPublicKey = toUser.publicKey;

        const shareChallengeRes = await sdkInstance.shareChallenge(senderKeypair, challengeUuid, receiverPublicKey);
        res.status(200).send({sharedChallenge: shareChallengeRes.data});
    },

    async redeem({params}, res) {
        const sponsorAddress = params.sponsorAddress;
        const challengeUuid = params.challengeUuid;

        const sponsor = await User.findOne({where: {email: sponsorAddress}});
        const sponsorKeypair = stellarSDK.Keypair.fromSecret(sponsor.privateKey);

        const redeemChallengeResponse = await sdkInstance.redeemChallenge(sponsorKeypair, challengeUuid);
        const sponsoredChallenges = redeemChallengeResponse.data.sponsoredChallenges;
        const heldChallenges = redeemChallengeResponse.data.heldChallenges;
        res.status(200).send({sponsoredChallenges, heldChallenges});
    }
};
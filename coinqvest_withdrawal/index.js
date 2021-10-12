
const dotenv = require('dotenv');
const coinqvest_sdk = require('coinqvest-merchant-sdk');
const btcRequest = require('../tools/btcRequest');
const handleResponse = require('../helpers/response');
// const { mustValidate } = require("../helpers/validation");
module.exports = async function (context, req) {
    try {
        const amount = req.body.amount;
        const targetNetwork = req.body.targetNetwork;
        const targetAsset = req.body.targetAsset;
        const targetAccount = req.body.targetAccount; // it should be account object from https://www.coinqvest.com/en/api-docs#post-withdrawal
        const relay = req.body.relay
        const sourceAsset = req.body.sourceAsset;

        const payloadJson = {
            "sourceAsset": sourceAsset,
            "sourceAmount":amount,
            "targetNetwork":targetNetwork,
            "sourceAmount": amount,
            "targetNetwork": targetNetwork,
            ...(targetAsset && {
                "targetAsset": targetAsset
            }),
            targetAccount: targetAccount,
            ...(relay && { "relay": relay })
        }
        const withdrawalResponse = await btcRequest('withdrawal', payloadJson, 'post');
        if (withdrawalResponse.status !== 200) {
            // something went wrong, let's abort and debug by looking at our log file
            console.log('Could not initiate withdrawal.');
            const res = {
                status: 500,
                body: {"status": "error", "msg": "coult not initiate withdrawal"}
            }
            handleResponse(context, res);
        }
        const withdrawalId = withdrawalResponse.data.withdrawal.id; // store this persistently in your
        const commitPayloadJson ={
            "withdrawalId":withdrawalId
        }
        const result = await btcRequest('withdrawal/commit', commitPayloadJson, 'post');
        if (result.status !== 200) {
            // something went wrong, let's abort and debug by looking at our log file
            const res = {
                status: 500,
                body: {"status": "error", "msg": "could not finish withdrawal"}
            }
            handleResponse(context, res);
        }
        else {
           const data = result.data;
            const res = {
                status: 200,
                body: data
            }
            handleResponse(context, res);
        }

    } catch (err) {
        console.log(err)
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught coinqvest_withdrawal error", "err": err.message ? { detail: err.message}: err}
        }
        handleResponse(context, res)
    }
}

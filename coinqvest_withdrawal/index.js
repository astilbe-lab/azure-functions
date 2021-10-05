
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
        const memo = req.body.memo;
        const krackenWalletId = req.body.krackenWalletId;
        const sourceAsset = req.body.sourceAsset;
        const accountDetail = req.body.accountDetail;
        const payloadJson = {
            "sourceAsset": sourceAsset,
            "sourceAmount":amount,
            "targetNetwork":targetNetwork,
            "targetAsset":targetAsset,
            "targetAccount": accountDetail ? accountDetail : {
                "account":krackenWalletId, // our Kraken account ID for that asset.
                // DANGER!!!!! This must be the exact wallet ID per asset in question.  It will
                // be different for each asset, etc:  BTC, XLM, ETH...
                "memo":memo,
                "memoType":"text"
            },
            //"relay":"BTC:GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5"
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
            console.log('Could not finish withdrawal.', withdrawalId);
            const res = {
                status: 500,
                body: {"status": "error", "msg": "could not finish withdrawal"}
            }
            handleResponse(context, res);
        }
        else {
            context.res = {
                status: 200,
                body: {response}
            }
            handleResponse(context, res);
        }

    } catch (err) {
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught withdrawal error", "err": err}
        }
        handleResponse(context, res);
    }


}

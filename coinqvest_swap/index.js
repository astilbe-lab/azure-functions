const dotenv = require('dotenv');
const handleResponse = require('../helpers/response');
const btcRequest = require('../tools/btcRequest');
// const { mustValidate } = require("../helpers/validation");
module.exports = async function (context, req) {

    try {
        const sourceAmount = req.body.sourceAmount;
        // let sellerTake = parseFloat(sourceAmount) * 0.90;
        // let ourTake = parseFloat(sourceAmount) * 0.10;
        const sourceAsset = req.body.sourceAsset;
        const targetAsset = req.body.targetAsset;
        const targetAmount = req.body.targetAmount;
        let payloadJson = null;
        if(sourceAmount != null && sourceAmount != undefined && sourceAmount != ""){
            payloadJson = {
                "sourceAsset":sourceAsset,
                "sourceAmount":sourceAmount,
                "targetAsset":targetAsset,
            };
        }else{
            payloadJson = {
                "sourceAsset":sourceAsset,
                "targetAsset":targetAsset,
                "targetAmount":targetAmount
            };
        }


        const response = await btcRequest('swap', payloadJson, 'post');
        const swapId = response.data.swap.id; // store this persistently in your database

        const commitPayloadJson = {
            swapId: swapId,
        };
        const returnData = await btcRequest(
            'swap/commit',
            commitPayloadJson,
            'post');
        const res = {
            status: 200,
            body: returnData.data
        }
        handleResponse(context, res);
        return;
    } catch (err) {
        //console.log(err)
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught coinqvest_swap error", "err": err.message ? { detail: err.message}: err}
        }
        handleResponse(context, res)
    }
}

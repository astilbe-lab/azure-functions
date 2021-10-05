const dotenv = require('dotenv');
const coinqvest_sdk = require('coinqvest-merchant-sdk');

function makeRequest(route, payload, method) {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line new-cap
        const client = new coinqvest_sdk(
            process.env.COINQVEST_API_KEY,
            process.env.COINQVEST_API_SECRET
        );
        try {
            if (method === "post") {
                client.post(`/${route}`, payload, function (response) {
                    if (response.data.errors) {
                        reject(response.data.errors);
                    }
                    resolve(response);
                });
            } else if (method === "get") {
                client.get(`/${route}`, {}, function (response) {
                    if (response.data.errors) {
                        reject(response.data.errors);
                    }
                    resolve(response);
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}

// const { mustValidate } = require("../helpers/validation");
module.exports = async function (context, req) {

    try {
        let sourceAmount = req.body.sourceAmount;
        // let sellerTake = parseFloat(sourceAmount) * 0.90;
        // let ourTake = parseFloat(sourceAmount) * 0.10;
        const sourceAsset = req.body.sourceAsset;
        const targetAsset = req.body.targetAsset;

        const payloadJson = {
            "sourceAsset":sourceAsset,
            "sourceAmount":sourceAmount,
            "targetAsset":targetAsset
        };
        const response = await makeRequest('swap', payloadJson, 'post');
        const swapId = response.data.swap.id; // store this persistently in your database

        const commitPayloadJson = {
            swapId: swapId,
        };
        const returnData = await makeRequest(
            'swap/commit',
            commitPayloadJson,
            'post');
        context.res = {
            status: 200,
            body: returnData.data
        }
        return;
    } catch (err) {
        context.res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught swap error", "err": err}
        }
        next(err)
    }
}


const dotenv = require('dotenv');
const joi = require("joi");
const KrakenClient = require("kraken-api");
const { mustValidate } = require("../helpers/validation");
const handleResponse = require("../helpers/response");
module.exports = async function (context, req) {

    try {

        /*
        {
    "keypair": "XXLMZUSD",
    "amount": "10",
    "type": "sell",
    "validate": true,
    "orderType": "market"
}
         */
        //let to_wallet_address = req.params.transaction_id
        const validateSchema = () =>
        joi.object({
            keypair: joi.string().required(),
            amount: joi.string().required(),
            transferType: joi.string().required(),
        }).required()
        const { keypair, amount, transferType } = mustValidate(validateSchema(), req.body);


        const kraken = new KrakenClient(
            process.env.KRAKEN_KEY,
            process.env.KRAKEN_SECRET
        );
        const payload = {
            // "nonce": nonce,
            ordertype: "market",
            type: transferType,
            volume: amount,
            pair: keypair,
            // "price": 27500,  we don't use price for market orders, only limit orders.
        };

        const tradeResult = await kraken.api('AddOrder', payload);

        const res = {
            status: 200,
            body: { "status": "success", "msg": tradeResult }
        }
        handleResponse(context, res);

    } catch (err) {
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught kraken swap error", "err": err.message ? { detail: err.message}: err}
        }
        handleResponse(context, res);
    }
}

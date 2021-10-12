const _ = require('lodash');
const qr = require('qr-encode');
//require('coinqvest-merchant-sdk');
const dotenv = require('dotenv');
const btc_sdk = require('coinqvest-merchant-sdk');
const blockchainHelper = require('../helpers/blockchain');
const btcRequest = require('../tools/btcRequest');
const joi = require("joi");
const { mustValidate } = require("../helpers/validation");
const handleResponse = require("../helpers/response");
module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {
        //let to_wallet_address = req.params.transaction_id
        const validateSchema = () =>
        joi.object({
            email: joi.string().required(),
            amount: joi.number().required(),
            description: joi.string().required()
        }).required()
        const { email, amount, description } = mustValidate(validateSchema(), req.body);
        if (amount > 200000) {

            const res = {
                status: 400,
                body: {"status": "error", "msg": "Amount can not be higher than $200,000"}
            }
            handleResponse(context, res);
            return;
        }
        const customer = {
            customer: {
                email: email
            }
        };

        const customerResponse = await btcRequest('customer',customer, 'post');

        console.log(customerResponse.status);
        console.log(customerResponse.data);
        if (customerResponse.status !== 200) {
            // something went wrong, let's abort and debug by looking at our log file
            console.log('Could not create customer. Inspect above log entry.');
            const res = {
                status: 500,
                body: {"status": "error", "msg": "Could not create customer."}
            }
            handleResponse(context, res);
            return;
        }

        const customer_id = customerResponse.data['customerId']; // store this persistently in your database

        const charge = {
            "charge": {
                "customerId": customer_id,
                "currency": "USD",
                "lineItems": [
                    {
                        "description": description,
                        "netAmount": amount
                    }
                ]
            }
        }

        const checkoutResponse = await btcRequest('checkout',charge, 'post');

        console.log(checkoutResponse.status);
        console.log(checkoutResponse.data);

        if (checkoutResponse.status !== 200) {
            // something went wrong, let's abort and debug by looking at our log file
            console.log('Could not create charge. Inspect above log entry.');
            const res = {
                status: finalResponse.status,
                body: {"status": "error", "msg": "Could not create charge. Inspect above log entry."}
            }
            handleResponse(context, res);
            return;
        }
        const checkout_id = checkoutResponse.data.id;

        const payload = {
            "checkoutId": checkout_id,
            "assetCode": "XLM",
        };

        const finalResponse = await btcRequest('checkout/commit',payload, 'post');

        console.log(finalResponse.status);
        console.log(finalResponse.data);

        if (finalResponse.status !== 200) {
            // something went wrong, let's abort and debug by looking at our log file
            console.log('Could not create charge. Inspect above log entry.');
            const res = {
                status: finalResponse.status,
                body: {"status": "error", "msg": "Could not create charge. Inspect above log entry."}
            }
            handleResponse(context, res);
            return;
        }

        const deposit_address = finalResponse.data.depositInstructions.address;
        const deposit_amount = finalResponse.data.depositInstructions.amount;
        const deposit_qr_code = blockchainHelper.generateQRCode(deposit_address);
        const memo = finalResponse.data.depositInstructions.memo;
        const return_obj = {customer_id, checkout_id, deposit_address, deposit_amount, memo, deposit_qr_code};

        const res = {
            status: 200,
            body: {"return_obj": return_obj}
        }
        handleResponse(context, res);

    } catch (err) {
        console.log(err)
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught xlm transaction error", "err": err.message ? { detail: err.message}: err}
        }
        handleResponse(context, res)
    }
}

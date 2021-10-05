const _ = require('lodash');
const qr = require('qr-encode');
//require('coinqvest-merchant-sdk');
const dotenv = require('dotenv');
const btc_sdk = require('coinqvest-merchant-sdk');
const blockchainHelper = require('../../helpers/blockchain');
const fetchTransaction = require('../../tools/fetchTransaction');
const createCharge = require('../../tools/createCharge');
const commitCharge = require('../../tools/commitCharge');
const createCustomer = require('../../tools/createCustomer');


module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {

        const key = process.env.COINQVEST_API_KEY;
        const secret = process.env.COINQVEST_API_SECRET;
        const client = new btc_sdk(
            key, secret
        );
        //let to_wallet_address = req.params.transaction_id
        let email = req.body.email
        let amount = req.body.amount
        if (amount > 200000) {

            context.res = {
                status: 400,
                body: {"status": "error", "msg": "Amount can not be higher than $200,000"}
            }
        }
        let description = req.body.description

        const customer = {
            customer: {
                email: email
            }
        };

        const customerResponse = await createCustomer(customer, client);

        console.log(customerResponse.status);
        console.log(customerResponse.data);

        // save customer_id, then get hosted link...

        if (customerResponse.status !== 200) {
            // something went wrong, let's abort and debug by looking at our log file
            console.log('Could not create customer. Inspect above log entry.');
            context.res = {
                status: 500,
                body: {"status": "error", "msg": "Could not create customer."}
            }
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

        const checkoutResponse = await createCharge(charge, client);

        console.log(checkoutResponse.status);
        console.log(checkoutResponse.data);

        if (checkoutResponse.status !== 200) {
            // something went wrong, let's abort and debug by looking at our log file
            console.log('Could not create charge. Inspect above log entry.');
            context.res = {
                status: finalResponse.status,
                body: {"status": "error", "msg": "Could not create charge. Inspect above log entry."}
            }
        }
        const checkout_id = checkoutResponse.data.id;

        const payload = {
            "checkoutId": checkout_id,
            "assetCode": "ETH",
        };

        const finalResponse = await commitCharge(payload, client);

        console.log(finalResponse.status);
        console.log(finalResponse.data);

        if (finalResponse.status !== 200) {
            // something went wrong, let's abort and debug by looking at our log file
            console.log('Could not create charge. Inspect above log entry.');
            context.res = {
                status: finalResponse.status,
                body: {"status": "error", "msg": "Could not create charge. Inspect above log entry."}
            }
        }

        const deposit_address = finalResponse.data.depositInstructions.address;
        const deposit_amount = finalResponse.data.depositInstructions.amount;
        const deposit_qr_code = blockchainHelper.generateQRCode(deposit_address);
        const memo = finalResponse.data.depositInstructions.memo;
        const return_obj = {customer_id, checkout_id, deposit_address, deposit_amount, memo, deposit_qr_code};

        context.res = {
            status: 200,
            body: {"return_obj": return_obj}
        }


    } catch (err) {
        context.res = {
            status: 500,
            body: {"error": return_obj}
        }
    }
}

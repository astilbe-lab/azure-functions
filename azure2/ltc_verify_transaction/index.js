const dotenv = require('dotenv');
const btc_sdk = require("coinqvest-merchant-sdk");


const fetchTransaction = (checkout_id, client = null) => {
    return new Promise((resolve, reject) => {
        if(client === null){
            client = new btc_sdk(
                process.env.BTC_API_KEY,
                process.env.BTC_API_SECRET,
            );
        }

        const endPoint = "/checkout";
        client.get(endPoint, {id: checkout_id}, (response) => {
            resolve(response);
        });
    });
}

module.exports = async function (context, req) {

    const checkout_id = req.params.checkout_id;
    const key = process.env.COINQVEST_API_KEY;
    const secret = process.env.COINQVEST_API_SECRET;

    const client = new btc_sdk(
        key, secret
    );

    const response = await fetchTransaction(checkout_id, client);

    if (response == undefined || response == null) {
        //res.status(500).send({ "status": "error", "msg": "no response from the coinqvest server" });
        context.res = {
            status: 500,
            body: {"status": "error", "msg": "no response from the coinqvest server"}
        }

        return;
    }
    console.log(response.status);
    console.log(response.data);

    if (response.status === 200) {
        let state = response.data['checkout']['state'];
        let checkout_obj = response.data['checkout'];
        if (['COMPLETED', 'DELAYED_COMPLETED', 'RESOLVED'].includes(state)) {
            //res.status(200).send({ 'status': 'successful', 'checkout': checkout_obj });

            context.res = {
                status: 200,
                body: {"status": "successful", "checkout": checkout_obj}
            }
        } else {
            context.res = {
                status: 200,
                body: {"status": "unresolved", "checkout": checkout_obj}
            }

        }
        return;
    } else {
        context.res = {
            status: response.status,
            body: {"status": "error", "msg": response.statusText}
        }
        return;
    }
}

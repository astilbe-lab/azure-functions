const dotenv = require('dotenv');
const coinqvest_sdk = require('coinqvest-merchant-sdk');
const handleResponse = require('../helpers/response');

module.exports = async function (context, req) {

    const checkout_id = req.query.checkout_id;
    const response = await btcRequest('get',{id: checkout_id}, 'get');
    // client.get('/checkout',
    //   {id: checkout_id},
    //   function(response) {
    if (response == undefined || response == null) {
        //res.status(500).send({ "status": "error", "msg": "no response from the coinqvest server" });
        context.res = {
            status: 500,
            body: {"status": "error", "msg": "no response from the coinqvest server"}
        }
        handleResponse(context, res);
        return;
    }
    console.log(response.status);
    console.log(response.data);

    if (response.status === 200) {
        let state = response.data['checkout']['state'];
        let checkout_obj = response.data['checkout'];
        if (['COMPLETED', 'DELAYED_COMPLETED', 'RESOLVED'].includes(state)) {
            //res.status(200).send({ 'status': 'successful', 'checkout': checkout_obj });

            const res = {
                status: 200,
                body: {"status": "successful", "checkout": checkout_obj}
            }
            handleResponse(context, res);
            return;
        } else {
            const res = {
                status: 200,
                body: {"status": "unresolved", "checkout": checkout_obj}
            }
            handleResponse(context, res);

            //res.status(200).send({ 'status': 'unresolved', 'checkout': checkout_obj });
            return;
        }
    } else {

        const res = {
            status: response.status,
            body: {"status": "error", "msg": response.statusText}
        }
        handleResponse(context, res);

        //res.status(response.status).send(response.statusText);
        return;
    }


}

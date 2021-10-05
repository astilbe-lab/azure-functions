const dotenv = require('dotenv');
const coinqvest_sdk = require('coinqvest-merchant-sdk');

const fetchTransaction = (checkout_id, client = null) => {
    return new Promise((resolve, reject) => {
        if(client === null){
            client = new coinqvest_sdk(
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

module.exports = fetchTransaction;

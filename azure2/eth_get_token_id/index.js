// import { AzureFunction, Context, HttpRequest } from "@azure/functions";


module.exports = async function (context, req) {
    try {

        const dotenv = require('dotenv');
        const web3 = require('web3');
        const api_key = process.env["ETHERSCAN_API_KEY"];
        // context.res = { api_key };
        console.log(api_key);

        let api = require('etherscan-api').init(api_key, "ropsten");
        // const tx_hash = req.params.tx_hash;
        const tx_hash = context.bindingData.tx_hash;
        const transaction = await api.proxy.eth_getTransactionReceipt(tx_hash);
        const logs = transaction.result.logs;
        console.log(logs);

        const tokenId = web3.utils.hexToNumber(logs[0].topics[3])

        // res.status(200).send({tokenId});

        context.res = {
            status: 200,
            body: {"tokenId": tokenId}
        }
    } catch(error) {
        const err = JSON.stringify(error);
        context.res = {
            status: 500,
            body: `Request error. ${err}`
        };
    }
};

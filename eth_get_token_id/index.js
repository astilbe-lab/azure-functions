const handleResponse = require("../helpers/response");
module.exports = async function (context, req) {
    try {

        const dotenv = require('dotenv');
        const web3 = require('web3');
        const api_key = process.env.ETHERSCAN_API_KEY;
        // context.res = { api_key };
        let api = require('etherscan-api').init(api_key, "kovan");
        // const tx_hash = req.params.tx_hash;
        const tx_hash = context.bindingData.tx_hash;
        const transaction = await api.proxy.eth_getTransactionReceipt(tx_hash);
        const logs = transaction.result.logs;
        const tokenId = web3.utils.hexToNumber(logs[0].topics[3])

        const res = {
            status: 200,
            body: {"tokenId": tokenId}
        }
        handleResponse(context, res)
    } catch (err) {
        console.log(err)
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught get token_id error", "err": err.message ? { detail: err.message}: err}
        }
        handleResponse(context, res)
    }
};

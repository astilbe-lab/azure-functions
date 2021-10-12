const dotenv = require('dotenv');
const handleResponse = require("../helpers/response");

module.exports = async function (context, req) {

    try {
        let api = require('etherscan-api').init(process.env.ETHERSCAN_API_KEY, "kovan");
        const tx_hash = req.params.tx_hash;

        let transaction_result = await api.proxy.eth_getTransactionByHash(tx_hash);
        let receipt = await api.proxy.eth_getTransactionReceipt(tx_hash);

        context.res = {
            status: 200,
            body: { transaction_result, receipt }
        }
        return;
        //res.status(200).send({ transaction_result, receipt });

    } catch (err) {
        console.log(err)
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught verify transaction error", "err": err.message ? { detail: err.message}: err}
        }
        handleResponse(context, res)
    }

}

const Web3Eth = require('web3-eth')
const dotenv = require('dotenv');
const joi = require('joi');
const NFTMarket = require('../abi/NFTMarket.json')
const handleResponse = require('../helpers/response');
const { mustValidate } = require('../helpers/validation');

module.exports = async function (context, req) {
    try {
        const token_id = parseInt(req.params.token_id);
        const dotenv = require('dotenv');
        const URL = process.env.KOVAN_RPC_URL;
        const web3Eth = new Web3Eth(Web3Eth.givenProvider || URL);
        const smartContractAddress = process.env.MARKET_CONTRACT_ADDRESS;
        const contract = new web3Eth.Contract(NFTMarket.abi, smartContractAddress)
        const result = await contract.methods.fetchMarketItemsByTokenId(token_id).call();

        // console.log(result)
        const res = {
            status: 200,
            body: result
        }
        handleResponse(context, res)
    } catch (err) {
        console.log(err)
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught blockchain fetch error", "err": err.message ? { detail: err.message}: err}
        }
        handleResponse(context, res)
    }
}

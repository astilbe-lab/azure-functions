const joi = require('joi');
const Web3Eth = require('web3-eth')
const NTFMarket = require('../abi/NFTMarket.json')
const handleResponse = require('../helpers/response');
const { mustValidate } = require('../helpers/validation');

module.exports = async function (context, req) {
    const body = req.body;
    const validationSchema = () => joi.object({
        itemId: joi.number().required()
    }).required()
    try {
        const { itemId } = mustValidate(validationSchema(), body)
        const URL = "https://ropsten.infura.io/v3/1ae9ee83c4cf46d091d2041db5ab9512";
        const web3Eth = new Web3Eth(Web3Eth.givenProvider || URL);
        const smartContractAddress = process.env.CONTRACT_ADDRESS;
        const contract = new web3Eth.Contract(NTFMarket.abi, smartContractAddress)
        
        const result = await contract.methods.createMarketSale(itemId).call()
        const res = {
            status: 200,

            body: { message: "Purchase successful" }
        }
        handleResponse(context, res)
    } catch (err) {
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught transfer error", "err": err.data ? { detail: err.message}: err}
        }
        handleResponse(context, res)
    }
}
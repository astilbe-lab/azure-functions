
const dotenv = require('dotenv');
const coinqvest_sdk = require("coinqvest-merchant-sdk");
const handleResponse = require("../helpers/response");
const Web3Eth = require('web3-eth');
const NFTabi = require("../abi/NFT.json");

module.exports = async function (context, req) {

    try {
        const token_id = req.params.token_id;
        const from_address = req.params.from_address.toUpperCase();
        const to_address = req.params.to_address.toUpperCase();
        const URL = process.env.KOVAN_RPC_URL;
        const web3Eth = new Web3Eth(Web3Eth.givenProvider || URL);
        const smartContractAddress = process.env.CONTRACT_ADDRESS;
        const contract = new web3Eth.Contract(NFTabi.abi, smartContractAddress)

        let myEvents = [];
        let eventTokenId = null;
        let eventFromAddress = null;
        let currentIndex = 0;

        const events = await contract.getPastEvents('Transfer', {
                fromBlock: 0,
                toBlock: 'latest'
            });

                for(var i=0;i<events.length;i++){
                    let currentEvent = events[i];
                    eventTokenId = events[i].returnValues.tokenId;
                    eventToAddress = events[i].returnValues.to.toUpperCase();
                    eventFromAddress = events[i].returnValues.from.toUpperCase();
                    if(eventTokenId == token_id && eventFromAddress == from_address && eventToAddress == to_address){
                        myEvents.push(events[i]);
                        currentIndex = i;
                    }

                    //console.log(events[i].returnValues.tokenId)
                }

                if(myEvents.length >= 1){
                    const res = {
                        status: 200,
                        body: {"status": true, "msg": "NFT transaction found"}
                    }
                    handleResponse(context, res);
                    return;
                }else{
                    const res = {
                        status: 200,
                        body: {"status": false, "msg": "NFT transaction not in events"}
                    }
                    handleResponse(context, res);
                    return;
                }

    } catch (err) {
        console.log(err)
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught verify transfer error", "err": err.message ? { detail: err.message}: err}
        }
        handleResponse(context, res)
    }


}


const dotenv = require('dotenv');
const coinqvest_sdk = require("coinqvest-merchant-sdk");
const handleResponse = require("../helpers/response");
const Web3Eth = require('web3-eth');
const NFTabi = require("../abi/ALTNFT.json");

module.exports = async function (context, req) {

    try {
        const token_id = req.params.token_id;
        const from_address = req.params.from_address.toUpperCase();
        const URL = "https://ropsten.infura.io/v3/1ae9ee83c4cf46d091d2041db5ab9512";
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

                    eventTokenId = events[i].returnValues.tokenId;
                    eventFromAddress = events[i].returnValues.from.toUpperCase();
                    if(eventTokenId == token_id && eventFromAddress == from_address){
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
        const res = {
            status: 500,
            body: { "status": "unknown error", "err": err }
        }
        handleResponse(context, res);
        return;
    }


}

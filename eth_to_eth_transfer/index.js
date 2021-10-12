const dotenv = require('dotenv');
const joi = require('joi');
const Web3 = require('web3');
const NFTMarket = require('../abi/NFTMarket.json');
const handleResponse = require('../helpers/response');
const { mustValidate } = require('../helpers/validation');

module.exports = async function (context, req) {
    const body = req.body;
    const validationSchema = () => joi.object({
        sellerAddress: joi.string().required(),
        tokenId: joi.number().required(),
        price: joi.string().required(),
        mintTxHash: joi.string().required(),
        commission: joi.number().optional(),
        isPremium: joi.bool().optional(),
    }).required()
    try {


        //let commission = 10;
        //let isPremium = false;
        let { sellerAddress, tokenId, price, mintTxHash, commission, isPremium } = mustValidate(validationSchema(), body)

        //price = parseInt(price, 16);
        if(req.body.commission != null && req.body.commission != ""){
            commission = parseInt(commission);
        }

        if(req.body.isPremium != null){
            isPremium = Boolean(isPremium);
        }

        const requestUrl = "https://nupay.azurewebsites.net/api/nfts/commission/" + mintTxHash;
        const URL = process.env.KOVAN_RPC_URL;
        const smartContractAddress = process.env.MARKET_CONTRACT_ADDRESS;
        const nftContractAddress = process.env.CONTRACT_ADDRESS;

        const web3 = new Web3(URL);
        const txMarketContract = new web3.eth.Contract(NFTMarket.abi,smartContractAddress);
        const gasEstimate = await txMarketContract.methods
              .createMarketItem(sellerAddress, nftContractAddress, tokenId, price, commission, isPremium)
              .estimateGas({from: process.env.NUPAY_WALLET_ADDRESS, gas: 9950000});
        let gasPrice = await web3.eth.getGasPrice();

        const txData = txMarketContract.methods
            .createMarketItem(sellerAddress, nftContractAddress, tokenId, price, commission, isPremium)
            .encodeABI();
        const tx = {
            // this could be provider.addresses[0] if it exists
            from: process.env.NUPAY_WALLET_ADDRESS,
            // target address, this could be a smart contract address
            to: smartContractAddress,
            // optional if you want to specify the gas limit
            gas: web3.utils.toHex(gasEstimate),
            //gas: 190048,
            gasPrice: web3.utils.toHex(gasPrice),

            // optional if you are invoking say a payable function
            // value: price,
            // this encodes the ABI of the method and the arguements
            data: txData
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.NUPAY_WALLET_KEY);

        // const sendResult = await signPromise;

        // signPromise.then((signedTx) => {
        const sentTx = await web3.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);

        let itemId = null
        const marketItems = await txMarketContract.methods.fetchMarketItemsByTokenId(tokenId).call();
        if(marketItems.length <= 0){
            const res = {
                status: 200,
                body: { message: "MarketItem not created yet error:", "tokenId": tokenId, "txHash": sentTx.transactionHash }
            }
            handleResponse(context, res);
            return;
        }else{
            const marketItem = marketItems[marketItems.length - 1];
            itemId = parseInt(marketItem[0]);
        }

        // const oracleGas = await txMarketContract.methods
        //     .doRequest(requestUrl, itemId)
        //     .estimateGas({from: process.env.NUPAY_WALLET_ADDRESS, gas: 9950000});
        // const oracleTxData =  txMarketContract.methods
        //     .doRequest(requestUrl, itemId)
        //     .encodeABI();
        // const oracleTx = {
        //     // this could be provider.addresses[0] if it exists
        //     from: process.env.NUPAY_WALLET_ADDRESS,
        //     // target address, this could be a smart contract address
        //     to: smartContractAddress,
        //     // optional if you want to specify the gas limit
        //     gas: web3.utils.toHex(oracleGas),
        //     //gas: 190048,
        //     gasPrice: web3.utils.toHex(gasPrice),
        //
        //     // optional if you are invoking say a payable function
        //     // value: price,
        //     // this encodes the ABI of the method and the arguements
        //     data: oracleTxData
        // };
        // const signedOracleTx = await web3.eth.accounts.signTransaction(oracleTx, process.env.NUPAY_WALLET_KEY);
        // const sentOracleTx = await web3.eth.sendSignedTransaction(signedOracleTx.raw || signedOracleTx.rawTransaction);


        const res = {
                    status: 200,
                    body: {
                        message: "TX received:",
                        "tx": sentTx,
                        "itemId": itemId,
                        "txHash": sentTx.transactionHash,
                        //"oracleTxHash": sentOracleTx.transactionHash
                    }
                }
        handleResponse(context, res);


    } catch (err) {
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught eth_to_eth transfer error", "err": err.message ? { detail: err.message}: err}
        }
        handleResponse(context, res)
    }
}

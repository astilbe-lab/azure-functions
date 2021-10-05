
const dotenv = require('dotenv');
const coinqvest_sdk = require('coinqvest-merchant-sdk');
const joi = require('joi')
const btcRequest = require('../tools/btcRequest');
const handleResponse = require('../helpers/response');
const { mustValidate } = require('../helpers/validation');

module.exports = async function (context, req) {
    try {
        const validateTargetNetwork = () => joi.object({
            targetNetwork: joi.string().length(3).required()
        }).unknown().required()
        const {targetNetwork} = mustValidate(validateTargetNetwork(), req.body)

        const validationSchema = () => joi.object({
            sourceAsset: joi.string().required(),
            amount: joi.number().required(),
            targetNetwork: joi.string().required(),
            accountDetail: joi.object({
                ...validationsForNetworkType(targetNetwork)
            }).required(),
            relay: joi.string(),
            targetAsset: joi.string()
        }).required();
        const body = mustValidate(validationSchema(), req.body)
        
        const amount = body.amount;
        const targetAsset = body.targetAsset;
        const sourceAsset = body.sourceAsset;
        const relay = body.relay
        const accountDetail = body.accountDetail;
        const payloadJson = {
            "sourceAsset": sourceAsset,
            "sourceAmount": amount,
            "targetNetwork": targetNetwork,
            ...(targetAsset && {
                "targetAsset": targetAsset
            }),
            targetAccount: accountDetail,
            ...(relay && { "relay": relay })
        }
        const withdrawalResponse = await btcRequest('withdrawal', payloadJson, 'post');
        if (withdrawalResponse.status !== 200) {
            // something went wrong, let's abort and debug by looking at our log file
            console.log('Could not initiate withdrawal.');
            const res = {
                status: 500,
                body: { "status": "error", "msg": "coult not initiate withdrawal" }
            }
            handleResponse(context, res);
        }
        const withdrawalId = withdrawalResponse.data.withdrawal.id; // store this persistently in your 
        const commitPayloadJson = {
            "withdrawalId": withdrawalId
        }
        const result = await btcRequest('withdrawal/commit', commitPayloadJson, 'post');
        if (result.status !== 200) {
            // something went wrong, let's abort and debug by looking at our log file
            console.log('Could not finish withdrawal.', withdrawalId);
            const res = {
                status: 500,
                body: { "status": "error", "msg": "could not finish withdrawal" }
            }
            handleResponse(context, res);
        }
        else {
            context.res = {
                status: 200,
                body: { response }
            }
            handleResponse(context, res);
        }

    } catch (err) {
        const res = {
            status: 500,
            body: {"status": "error", "msg": "uncaught withdrawal error", "err": err}
        }
        handleResponse(context, res);
    }


}

// refer https://www.coinqvest.com/en/api-docs#post-withdrawal
function validationsForNetworkType (targetNetwork) {
    switch (targetNetwork) {
        case "ARS":
           return {
            cbu: joi.string().required(),
            cuitPersonal: joi.string().required(),
            cuitCompany: joi.string().required()
           } 
        case "BRL":
            return {
                pixKey: joi.string().required(),
                // The recipient's tax id. CNPJ format (00.000.000/0000-00) for corporate identities or CPF format (000.000.000-00) for individuals.
                taxId: joi.string().pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/).required() 
            }
        case "EUR": 
            return {
                iban: joi.string().required(),
                swift: joi.string().required()
            }
        case "NGN":
            return {
                nuban: joi.string().required(),
                bankName: joi.string().valid(
                    "AccessBank", "CitiBank", "DiamondBank", "Ecobank",
                    "EnterpriseBank", "FCMB", "FidelityBank", "FirstBank",
                    "GTBank", "Heritage", "JaizBank", "KeystoneBank",
                    "ProvidusBank", "SkyeBank", "Stanbic", "StandardChartered",
                    "SterlingBank", "SuntrustBank", "UBA", "UnionBank", "UnityBank",
                    "WemaBank", "ZenithBank"
                ).required()
            }
        case "BTC":
        case "ETH":
        case "LTC":
            return {
                address: joi.string().required()
            }
        case "XLM":
            return {
                account: joi.string().required(),
                memo: joi.string(),
                memoType: joi.string()
            }
        case "XRP":
            return {
                account: joi.string().required(),
                destinationTag: joi.string()
            }
        default:
            return {}
    }
}

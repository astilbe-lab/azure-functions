const handleResponse = require('../helpers/response');
const triggerNFTTransfer = require('../tools/triggerSecureServerNFTTransfer')

module.exports = async function (context, req) {
  const type = req.body.eventType;
  customerId = req.params.id;

  
    if(type === 'CHECKOUT_COMPLETED'){
      const { sourceAmountReceived, settlementAmountRequired } =
        req.body?.data?.checkout;
      console.log(sourceAmountReceived, settlementAmountRequired);
      // trigger secure server to transfer nft
      await triggerNFTTransfer(customerId)
      handleResponse(context, {
        status: 200,
        body: {
          customerId,
          eventStatus: type,
        },
      });
    } else {
      handleResponse(context, {
        status: 400,
        body: {
          customerId,
        },
      });
    }
};

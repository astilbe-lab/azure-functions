const handleResponse = require('../helpers/response');

module.exports = async function (context, req) {
  const type = req.body.eventType;
  customer_id = req.params.id;

  switch (type) {
    case 'CHECKOUT_COMPLETED':
      const { sourceAmountReceived, settlementAmountRequired } =
        req.body?.data?.checkout;
      console.log(sourceAmountReceived, settlementAmountRequired);
      handleResponse(context, {
        status: 200,
        body: {
          customer_id,
          eventStatus: type,
        },
      });
      // TODO: Send a request to the secure server to instruct it to instruct the seller to send nft to the buyer
      break;
    // case 'CHECKOUT_UNDERPAID':
    //   console.log('Checkout completed ******');
    //   break;
    // case 'UNDERPAID_ACCEPTED':
    //   console.log('Checkout completed ******');
    //   break;
    // case 'REFUND_COMPLETED':
    //   console.log('Checkout completed ******');
    //   break;
    // case 'DEPOSIT_COMPLETED':
    //   console.log('Checkout completed ******');
    //   break;
  }

  handleResponse(context, {
    status: 200,
    body: {
      customer_id,
    },
  });
};

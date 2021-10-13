const handleResponse = require('../helpers/response');
const btcRequest = require('../tools/btcRequest');

const tempCustomer = {
  customer: {
    email: 'john@doe.com',
    firstname: 'John',
    lastname: 'Doe',
    company: 'ACME Inc.',
    adr1: '810 Beach St',
    adr2: 'Finance Dept',
    zip: 'CA 94133',
    city: 'San Francisco',
    countrycode: 'US',
    phonenumber: '+14156226819',
    taxid: 'US1234567890',
    note: 'Always pays on time. Never late.',
    meta: {
      reference: 123,
    },
  },
};

module.exports = async function (context, req) {
  let error;
  const response = await btcRequest('customer', tempCustomer, 'post').catch(
    (err) => {
      console.log(err);
      error = err;
    },
  );

  if (response && response.status === 200) {
    handleResponse(context, {
      status: 200,
      body: {
        ...response.data,
        webhook: `${WEBHOOK_URL}/${response?.data?.customerId}`,
      },
    });
  } else {
    handleResponse(context, {
      status: 500,
      body: {
        message: 'Unable to create customer',
      },
    });
  }
};

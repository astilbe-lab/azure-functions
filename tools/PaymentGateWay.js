const querystring = require("querystring");
const axios = require("axios");

module.exports = {
  async processPayment(amount, token) {
    const requestOptions = {
      type: "sale",
      amount,
    };
    const response = await this._doRequest(requestOptions, token);
    return response;
  },

  async _doRequest(postData, token) {
    try {
      const url = process.env.NMI_TRANSACTION_URL;
      let body = postData;
      body.payment_token = token;
      body.security_key = process.env.NMI_PUBLIC_KEY;
      body = querystring.stringify(postData);
      const response = await axios({
        method: "POST",
        url,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: body,
      });
      return response.data;
    } catch (e) {
      throw new Error(e);
    }
  },
};

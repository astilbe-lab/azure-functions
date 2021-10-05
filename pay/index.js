const joi = require("joi");
const { mustValidate } = require("../helpers/validation");
const PaymentGateway = require("../tools/PaymentGateWay");
const handleResponse = require("../helpers/response");

module.exports = async function (context, req) {
    try {
        const validateSchema = () =>
          joi.object({
            amount: joi.number().required(),
            token: joi.string().required(),
          }).required()
        const { amount, token } = mustValidate(validateSchema(), req.body);
        const response = await PaymentGateway.processPayment(amount, token);

        const  res = {
            // status: 200, /* Defaults to 200 */
            body: response
        };
        handleResponse(context, res);
      } catch (err) {
          console.log(err)
        const res = {
            status: 500, /* Defaults to 200 */
            body: err
        };
        handleResponse(context, res);
      }

   
}
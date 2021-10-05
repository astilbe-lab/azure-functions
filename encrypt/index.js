const CryptoJS = require("crypto-js");
const handleResponse = require("../helpers/response");
module.exports = async function (context, req) {
  try {
    const { content, password } = req.query; // content & password should be strings

    const _key = CryptoJS.enc.Utf8.parse(password);
    const _iv = CryptoJS.enc.Utf8.parse(password);

    const encrypted = CryptoJS.AES.encrypt(content, _key, {
      keySize: 128 / 8,
      iv: _iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const res = {
      status: 200 /* Defaults to 200 */,
      body: encrypted.toString(),
    };
    handleResponse(context, res)
  } catch (error) {
    const err = JSON.stringify(error);
    const res = {
      status: 500,
      body: `Request error. ${err}`,
    };
    handleResponse(context, res)
  }
};

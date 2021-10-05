const CryptoJS = require("crypto-js");
const axios = require("axios");
const handleResponse = require("../helpers/response");
module.exports = async function (context, req) {
  try {
    const { url, key } = req.query; // url & key should be strings

    const response = await axios.get(url);

    const _key = CryptoJS.enc.Utf8.parse(key);
    const _iv = CryptoJS.enc.Utf8.parse(key);

    const decrypted = CryptoJS.AES.decrypt(response.data, _key, {
      keySize: 128 / 8,
      iv: _iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const typedArray = convertWordArrayToUint8Array(decrypted);

    const res = {
      status: 200 /* Defaults to 200 */,
      body: typedArray,
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

// https://stackoverflow.com/questions/60520526/aes-encryption-and-decryption-of-files-using-crypto-js
function convertWordArrayToUint8Array(wordArray) {
  const arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
  const length = wordArray.hasOwnProperty("sigBytes")
    ? wordArray.sigBytes
    : arrayOfWords.length * 4;
  const uInt8Array = new Uint8Array(length);

  let index = 0;
  let word;
  for (let i = 0; i < length; i++) {
    word = arrayOfWords[i];
    uInt8Array[index++] = word >> 24;
    uInt8Array[index++] = (word >> 16) & 0xff;
    uInt8Array[index++] = (word >> 8) & 0xff;
    uInt8Array[index++] = word & 0xff;
  }
  return uInt8Array;
}

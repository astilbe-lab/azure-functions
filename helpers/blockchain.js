'use strict';

const fs = require('fs');
const path = require('path');
const qr = require('qr-encode');

function generateQRCode(address = ""){

  let dataURI = qr(address, {type: 6, size: 6, level: 'Q'})

  return dataURI;
}

module.exports = {
  generateQRCode: generateQRCode,
};

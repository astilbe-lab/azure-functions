// eslint-disable-next-line camelcase
const btc_sdk = require("coinqvest-merchant-sdk");

function btcRequest(route, payload, method) {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line new-cap
        const client = new btc_sdk(
            process.env.COINQVEST_API_KEY,
            process.env.COINQVEST_API_SECRET
        );
        try {
            if (method === "post") {
                client.post(`/${route}`, payload, function (response) {
                    if (response.data.errors) {
                        reject(response.data.errors);
                    }
                    resolve(response);
                });
            } else if (method === "get") {
                client.get(`/${route}`,  payload? payload: {}, function (response) {
                    if (response.data.errors) {
                        reject(response.data.errors);
                    }
                    resolve(response);
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = btcRequest;

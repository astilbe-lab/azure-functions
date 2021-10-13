const { default: axios } = require("axios")

module.exports = customerId => {
    const secureServerUrl = process.env.SECURE_SERVER_URL
    const triggerEndpoint = `${secureServerUrl}/transferNFT`

    try {
        axios.post(triggerEndpoint, {
            customerId
        })
    } catch (error) {
        throw error
    }
}
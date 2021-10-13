const { default: axios } = require("axios")

module.exports = sellerId => {
    const secureServerUrl = process.env.SECURE_SERVER_URL
    const triggerEndpoint = `${secureServerUrl}/sendPasswordFile`

    try {
        axios.post(triggerEndpoint, {
            sellerId
        })
    } catch (error) {
        throw error
    }
}
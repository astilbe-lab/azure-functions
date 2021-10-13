const { default: axios } = require("axios")

module.exports = async accountId => {
    const sellerUrl = `${process.env.SECURE_SERVER_URL}?account=${accountId}`
    let accountType
    try {
        accountType = await axios.get(sellerUrl) 
    } catch (error) {
        throw error
    }
    return accountType
}
const handleResponse = (context, res) => {
    context.res = {
        ...res,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    context.done();
}

module.exports = handleResponse
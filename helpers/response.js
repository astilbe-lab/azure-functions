const handleResponse = (context, res) => {
    context.res = {
        // should include ...context.res if it is set in the calling function
        // left as it is so that it won't break
        ...res,
        headers: {
            'Content-Type': 'application/json'
        }
    }
    context.done();
}

module.exports = handleResponse
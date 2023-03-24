const ApiError = require('../error/ApiError')

module.exports = function(err, req, res) {
    if (err instanceof ApiError) {
        return res.status(err.status).json({message: err.message});
    }
    return err.status(500).json({message: 'Unknown error'});
}
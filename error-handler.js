module.exports = function (err, req, res, next) {
	if(req.timedout && !res.headersSent) {
		console.log('request timeout')
		res.status(500).send({error: 'timeout'})
	}
}

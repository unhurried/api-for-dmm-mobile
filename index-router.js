const express = require('express')
const router = express.Router()
const co = require('co')
const ScrapeUtil = require('./scrape-util');

router.post('/', co.wrap(function*(request, response, next) {
	try {
		const loginId = request.body.loginId
		const password = request.body.password
		const highSpeedStatus = request.body.highSpeedStatus
		if(loginId == null || password == null) {
			sendError(response, 400, 'invalid_parameters')
			return;
		}

		const status = yield ScrapeUtil.updateHighSpeedStatus(loginId, password, highSpeedStatus)
		sendSuccess(response, status)

	} catch (e) {
		console.log(e)
		sendError(response, 500, 'server_error')
	}
}));

const sendSuccess = function(response, body) {
	sendResponse(response, 200, body);
}
const sendError = function(response, statusCode, errorCode) {
	sendResponse(response, statusCode, {error: errorCode});
}
const sendResponse = function(response, statusCode, body) {
	// Send response only if the error handler hasn't sent it yet.
	if(!response.headersSent) response.status(statusCode).send(body)
}

module.exports = router

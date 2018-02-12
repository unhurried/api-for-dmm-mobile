const bodyParser = require('body-parser')
const express = require('express')
const timeout = require('connect-timeout')
const indexRouter = require('./index-router')
const errorHandler = require('./error-handler')

var app = express()
app.use(timeout(29500))
app.use(bodyParser.json())
app.use('/', indexRouter)
app.use(errorHandler)

var port = process.env.PORT || 3000
app.listen(port)

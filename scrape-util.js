const co = require('co')
const path = require('path');
const puppeteer = require('puppeteer');
const url = require('url');

const ScrapeUtil = {}
ScrapeUtil.updateHighSpeedStatus = co.wrap(function*(loginId, password, highSpeedStatus){
	let browser;

	try {
		// Open browser and new page.
		// A browser instance needs to be created in each request,
		// as it doesn't support a function to clear all the cookie data.
		const options = {}
		if(process.env.DYNO) {
			options.args = ['--no-sandbox', '--disable-setuid-sandbox']
		}

		browser = yield puppeteer.launch(options)
		const page = yield browser.newPage()

		// Prevent unnecessary requests from being submitted for better performance.
		yield page.setRequestInterception(true)
		page.on('request', interceptedRequest => {
			const reqUrl = url.parse(interceptedRequest.url())
			const reqExt = path.extname(reqUrl.pathname)
			const reqHost = reqUrl.hostname
			// Resources from 3rd party domains
			if (reqHost !== 'www.dmm.com'
					&& reqHost !== 'accounts.dmm.com'
					&& reqHost !== 'mvno.dmm.com') {
				interceptedRequest.abort();
			// Images and css files
			} else if ( reqExt === '.png'
					|| reqExt === '.jpg'
					|| reqExt === '.svg'
					|| reqExt === '.gif'
					|| reqExt === '.css') {
					interceptedRequest.abort();
			} else {
				interceptedRequest.continue();
			}
		});

		// Login
		yield page.goto('https://mvno.dmm.com/mypage/', { waitUntil: 'domcontentloaded' })
		yield page.type('#login_id', loginId)
		yield page.type('#password', password)
		yield page.click('input[type="submit"]')
		yield page.waitForFunction(() => {
			const locationCondition = window.location.href === 'https://mvno.dmm.com/mypage/'
			const readyStateCondition = window.document.readyState === 'interactive' || window.document.readyState === 'complete'
			const rtn = locationCondition && readyStateCondition
			return rtn;
		})

		let status = {}

		// Fetch hi-speed mode status.
		status['highSpeedStatus'] = yield getHighSpeedStatus(page)

		// Fetch remaining hi-speed balance.
		const numberP = yield page.$('.number')
		numberContent = yield (yield numberP.getProperty('innerHTML')).jsonValue()
		status['remainingDataBalance'] = numberContent.replace(/<[^>]+>/g, '')

		// Turn on/off hi-speed mode.
		if(highSpeedStatus && highSpeedStatus !== status['highSpeedStatus']) {
			if(status['highSpeedStatus'] === 'on') {
				// <button class="btn btn--off">OFF</button>
				const buttonOff = yield page.$('button.btn--off')
				yield buttonOff.click()
			} else if(status['highSpeedStatus'] === 'off') {
				// <button class="btn btn--on">ON</button>
				const buttonOn = yield page.$('button.btn--on')
				yield buttonOn.click()
			}

			// Fetch hi-speed mode status again.
			yield page.waitForFunction(() => {
				return window.document.readyState === 'interactive' || window.document.readyState === 'complete'
			})
			if(page.url() !== 'https://mvno.dmm.com/mypage/') {
				throw new Error('Failed to change high speed status.')
			}
			status['highSpeedStatus'] = yield getHighSpeedStatus(page)
		}

		// Close the browser
		browser.close()
		return status

	} catch (e) {
		browser.close()
		throw e
	}
});

const getHighSpeedStatus = co.wrap(function*(page){
	const statusInput = yield page.$('input[name="status"]')
	const statusInputValue = yield (yield statusInput.getProperty('value')).jsonValue()
	if (statusInputValue === '0') {
		return "on"
	} else if (statusInputValue === '1') {
		return "off"
	} else {
		throw new Error('Failed to get high speed status.')
	}
})

module.exports = ScrapeUtil

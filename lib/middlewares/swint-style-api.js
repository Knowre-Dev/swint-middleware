'use strict';

module.exports = function(req, res, next) {
	req.output = {
		success: false,
		session: false,
		token: false,
		error: null,
		data: {}
	};

	req.out = function(key, data) {
		if (data === undefined) {
			return req.output.data[key];
		}
		req.output.data[key] = data;
	};

	req.success = function() {
		req.output.success = true;
		res.header('Content-Type', 'application/json; charset=utf-8');
		res.send(req.output);
	};

	req.error = function(str, code) {
		if (code === undefined) {
			code = 500;
		}

		if (code === 200) {
			res.header('Content-Type', 'application/json; charset=utf-8');
		}

		if (typeof str === 'string') {
			req.output.error = str;
		} else {
			req.output.error = JSON.stringify(str);
		}

		print(4, str);
		res.status(code).json(req.output);
	};

	if (!req.accepts('json')) {
		req.error('Error: Input is not JSON.');
		return;
	}
	
	try {
		switch (req.method) {
			case 'GET':
				if (req.query.hasOwnProperty('input')) {
					req.input = JSON.parse(req.query['input']);
					req.log.input = censor(JSON.parse(req.query['input']));
				} else {
					req.log.input = req.input = {};
				}
				break;
			case 'POST':
				if (req.body.hasOwnProperty('input')) {
					req.input = JSON.parse(req.body['input']);
					req.log.input = censor(JSON.parse(req.body['input']));
				} else {
					req.log.input = req.input = {};
				}
				break;
			default:
				req.error('Error: The method is not GET nor POST.');
				return;
		}
	} catch (e) {
		switch (req.method) {
			case 'GET':
				print(4, req.query['input']);
				break;
			case 'POST':
				print(4, req.body['input']);
				break;
		}
		req.error('Error: Input JSON is not valid');
		return;
	}

	next();
};

var censor = function(obj) {
	if (Array.isArray(obj)) {
		return obj;
	} else if (typeof obj !== 'object') {
		return obj;
	}

	for (var key in obj) {
		if (['pass', 'pwd', 'pw', 'password', 'key', 'secret'].indexOf(key.toLowerCase()) !== -1) {
			obj[key] = '[CENSORED]';
		} else {
			obj[key] = censor(obj[key]);
		}
	}

	return obj;
};

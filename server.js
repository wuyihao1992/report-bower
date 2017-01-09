'use strict';

var browserSync = require('browser-sync').create();
var http = require('http');

var proxySrv = function(req, res) {
	var options = {
		hostname: 'lcs.com',
		port: 8086,
		path: req.url.replace(/^\/api/,''),
		method: 'POST'
	};

	var apiReq = http.request(options, apiRes => {
		apiRes.setEncoding('utf8');
		apiRes.on('data', data => {
			console.log('response data \n', data);
			res.write(data);
		}).on('end', () => {
			res.end()
		});
	});

	req.addListener('data', data => {
		console.log('request data \n', data.toString())
		apiReq.write(data);
	});
	req.addListener('end', () => {
		apiReq.end();
	});
};

browserSync.init({
	server: {
		baseDir: './',
		directory: true,
		index: 'index.html',
		middleware: function(req, res, next) {
			console.log(req.url);
			if (req.url.match(/^\/api/)) {
				proxySrv(req, res);
				return;
			}
			next();
		}
	}
});
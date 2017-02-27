'use strict';

var browserSync = require('browser-sync').create();
var http = require('http');
var TEST = true,
	dev = {0:"poly.hengtech.com.cn",1:"uat.hengtech.com.cn",2:"train.hengtech.com.cn",3:"wechat.kai-men.cn"};

var proxySrv = function(req, res) {
	var options = {
        hostname: dev[3],
		port: 80,
		// path: req.url.replace(/^\/api/,''),
        path:  (TEST ? '/pmsSrv' : '') +  req.url,
        // path: '/pmsSrv' +  req.url,
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
		// directory: true,
        // startPath: "/index.html",
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
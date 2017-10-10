'use strict';

/**
 * http://poly.hengtech.com.cn/pmsSrv/api/api!gateway.action
 * @param req
 * @param res
 *
 * 调试方法：
 * 修改 runRul 参数
 */
var browserSync = require('browser-sync').create();
var http = require('http');
var URL = require('url').URL;

var dev = {
	0: new URL('http://poly.hengtech.com.cn/api/api!gateway.action'),
	1: new URL('http://uat.hengtech.com.cn/pmsSrv/api/api!gateway.action'),
	2: new URL('http://train.hengtech.com.cn/pmsSrv/api/api!gateway.action'),
	3: new URL('http://wechat.kai-men.cn/pmsSrv/api/api!gateway.action'),
	4: new URL('http://srv.sit.hengtech.com.cn/')
};
var runRul = dev[1];	// TODO: 调试修改这里

var proxySrv = function(req, res) {
	var options = {
        hostname: runRul.host,
		port: 80,
        path:  runRul.pathname,
        // path: '/pmsSrv' +  req.url,
        // path: req.url.replace(/^\/api/,''),
		method: 'POST'
	};

	console.info(options.hostname,options.path);

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
		console.log('request data \n', data.toString());
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
			if (req.url.match(/api/)) {
				proxySrv(req, res);
				return;
			}
			next();
		}
	}
});
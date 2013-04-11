#REST API JavaScript Client Generator

##About
Describe your REST API using [WADL](http://www.w3.org/Submission/wadl/) and get complete JavaScript client.

##Requirements

[xsltproc](http://www.sagehill.net/docbookxsl/InstallingAProcessor.html)

##Installation

	npm install apic.js

##Usage
Convert your WADL spec to javascript module

	node /path/to/apic.js/bin/apic -w your.wadl -o descriptor.js
	
If you installed apic.js globally

	apic -w your.wadl -o descriptor.js
	
Create your api module

	var apic = require('apic'),
	    descriptior = require('./descriptor');
		
	return apic(descriptor);

Use it

	var api = require('api');
	
	api.users.get({ select: 50, omit: 100}, function(err, users) {
	  console.log(users);
	});
	/*
	GET http://{baseUri}/users?select=50&omit=100
	*/

	api.users.post({ name: 'John', age: 32 });
	/*
	POST http://{baseUri}/users
	{ "name": "John", "age": 32 }
	*/

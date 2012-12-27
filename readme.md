#apic.js — REST API JavaScript Client Generator

##About
Describe your REST API using [WADL](http://www.w3.org/Submission/wadl/) and get complete JavaScript client.

Current early version is a CommonJS module (RequireJS compatible) with jquery dependency.

##Installation

	npm install apic.js

##Usage
Convert your WADL spec to javascript module

	apic -w your.wadl -o descriptor.js
	
Create your api module

	var apic = require('apic'),
	    descriptior = require('./descriptor');
		
	return apic(descriptor);

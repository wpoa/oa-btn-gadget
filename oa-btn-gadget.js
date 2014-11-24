var accessIsAlreadyOpenPrefixes = new Array(
	'10.1098', '10.1155', '10.1186', '10.1371', '10.1534', '10.2196', '10.3352', '10.3389', '10.3390',
	'10.3814', '10.3897', '10.4061', '10.5194', '10.5402', '10.6064', '10.7167', '10.7554', '10.7717'
	);
var refLinkSelector = "a";
var doiRegex = /dx\.doi\.org\/(.*)/g;
var links = document.querySelectorAll(refLinkSelector);
var doiLinks = new Array();
for (i = 0; i < links.length; i++) {
	var link = decodeURIComponent(links[i].href);
	var match = doiRegex.exec(link);
	if (match != null && accessIsAlreadyOpenPrefixes.indexOf(match[1].slice(0, 8)) == -1) {
		doiLinks.push(link);
	}
}
console.log(doiLinks);

function oabutton(options) {
    var about = {
        version: 0.1,
        author: "Mark MacGillivray",
        created: "01102014",
        description: "A javascript client that operates against the Open Access Button 2.0 API"
    }
    var defaults = {
        api: 'http://oabutton.cottagelabs.com/api',
        api_key: ''
    }
    this.options = $.extend(defaults, options);
    this.response = {};
}

oabutton.prototype = {
    send: function(action,o) {
        this.options.api_key && !o.data.api_key ? o.data.api_key = this.options.api_key : false;
        var vars = {
            type: 'POST',
            url: this.options.api + '/' + action,
            contentType: 'application/json',
            dataType: 'JSON',
            processData: false,
            //crossDomain: true,
            cache: false,
            context: this,
            data: JSON.stringify(o.data)
        }
        vars.success = function(res) {
            this.response = res;
            if ( !this.options.api_key && res.api_key ) {
                this.options.api_key = res.api_key;
            }
            if ( !this.options.username && res.username ) {
                this.options.username = res.username;
            }
            typeof o.success == 'function' ? o.success(res) : false;
        }
        typeof o.error == 'function' ? vars.error = o.error : false;
        $.ajax(vars);
    },
    register: function(o) {
        // o should be an object containing a data object with email, profession, username
        // and also a success function and error function if required
        this.send('register',o);
    },
    status: function(o) {
        //this.send('status',o);
        // TODO: annoying behaviour of CORS on POST means this is being fugded as a JSONP GET for now
        this.options.api_key && !o.data.api_key ? o.data.api_key = this.options.api_key : false;
        var vars = {
            type: 'GET',
            url: this.options.api + '/status',
            cache: false,
            context: this,
            dataType: 'JSONP',
            data: o.data,
            success: function(res) {
                this.response = res;
                typeof o.success == 'function' ? o.success(res) : false;
            }
        }
        typeof o.error == 'function' ? vars.error = o.error : false;
        $.ajax(vars);
    },
    blocked: function(o,rid) {
        var t = 'blocked';
        if ( rid ) {
            t += '/' + rid;
        }
        this.send(t,o);
    },
    wishlist: function(o) {
        this.send('wishlist',o);
    }
    // TODO: add the processor API route
}

var successfunctions = {
    register: function(data) {
    },
    status: function(data) {
        console.log(data);
    },
    blocked: function(data) {
    },
    wishlist: function(data) {
    }
}

var OaButton = new oabutton({api_key: '44ab0972-3a56-4d1d-ba10-c98c5342ac1d'});
doiLinks.forEach(function(e,i,a) {
	var data = {url: e};
	OaButton.status({data: data, success: successfunctions.status});
});

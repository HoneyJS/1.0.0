(function(){

window.foreach = function(obj, func, start, end) {
	if (obj instanceof window.Array || typeof obj == "string")
		for (var i=start||0, end=end||obj.length; i<end; ++i) {
			var re = func.call(this, obj[i], i, obj);
			if (re != undefined) return re;
		}
	else if (obj instanceof window.Object)
		for (var i in obj) {
			var re = func.call(this, obj[i], i, obj);
			if (re != undefined) return re;
		}
};
window.forback = function(arr, func, start, end) {
	for (var i=start||arr.length-1, end=end||0; i>=end; --i) {
		var re = func.call(this, arr[i], i, arr);
		if (re != undefined) return re;
	}
};
window.forloop = function(times, func, start) {
	for (var i=start||0; i<times; ++i) {
		var re = func.call(this, i);
		if (re != undefined) return re;
	}
};
window.random = function(arg) {
	if (arg instanceof Array) {
		return arg[Math.floor(arg.length*Math.random())];
	}
	if (typeof arg == "number") {
		return Math.floor(arg*Math.random());
	}
	if (arg instanceof Object) {
		var arr = [];
		foreach(arg, function(val, i){
			arr.push(val);
		});
		return random(arr);
	}
};
window.randomIndex = function(obj) {
	var arr = [];
	foreach(obj, function(val, i){
		arr.push(i);
	});
	return random(arr);
};
window.getset = function(ind, onchange) {
	return function(val){
		if (val != undefined) {
			this[ind] = val;
			onchange && onchange.call(this);
		}
		return this[ind];
	};
};
window.attach = function(obj1, obj2) {
	for (var ind in obj2) {
		if (typeof obj1[ind] == "function")
			obj1[ind](obj2[ind]);
		else
			obj1[ind] = obj2[ind];
	}
	return obj1;
};
window.isEmpty = function(obj) {
	if (obj instanceof window.Array) return !obj.length;
	if (obj instanceof window.Object) {
		for (var i in obj) {
			return false;
		}
		return true;
	}
	return obj == null;
};

window.isMobile = function() {
	var ua = navigator.userAgent.toLowerCase();
	return ua.indexOf('mobile') != -1 || ua.indexOf('android') != -1;
};

window.unit = function(d) {
	return d ? d/Math.abs(d) : 0;
};

window.extend = function(dest, src, trans) {
	for (var ind in src) {
		dest[trans&&trans[ind]||ind] = src[ind];
	}
	return dest;
};
})();

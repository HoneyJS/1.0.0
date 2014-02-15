(function(){
	
var Honey = {
	body : null,
	_bodies : [],
	Styles : {},
	ScaleRate : 1,
};
window.Honey = Honey;

Honey.inherit = function(childClass, parentClass) {
	var tempConstructor = function() {};
	tempConstructor.prototype = parentClass.prototype;
	childClass.parentClass = parentClass.prototype;
	childClass.prototype = new tempConstructor();
	childClass.prototype.constructor = childClass;
};

var __idCount = 0;
Honey.generateId = function() {
	return ++__idCount;
};
Honey.trace = function() {
	var log = "Honey.trace:: ";
	foreach(arguments, function(arg){
		if (arg === undefined)
			log += "undefined ";
		else if (arg === null)
			log += "null ";
		else
			log += arg.toString()+" ";
	});
	console.log(log);
};

Honey.pushBody = function(body) {
	this._bodies.push(body);
	this.body = body;
};
Honey.popBody = function() {
	this._bodies.pop();
	this.body = this._bodies[this._bodies.length-1];
};
Honey.fitBody = function(fitting) {
	this.bodyFitting = fitting;
	EventM.trigger("resize");
};
Honey.resize = function() {
	if (!Honey.body) return;
	//canvas绝不进行不等比缩放
	var canvas = Honey.body._canvas;
	var w = window.innerWidth, h = window.innerHeight, tan = w/h;
	var _w = w, _h = h;
	if (this.bodyFitting) {
		var scaleW = 100, scaleH = 100;
		if (this.bodyFitting.width) {
			scaleW = w / this.bodyFitting.width;
		}
		if (this.bodyFitting.height) {
			scaleH = h / this.bodyFitting.height;
		}
		if (scaleW < scaleH) {
			Honey.ScaleRate = scaleW;
			_w = this.bodyFitting.width;
			_h = parseInt(_w/tan);
		} else {
			Honey.ScaleRate = scaleH;
			_h = this.bodyFitting.height;
			_w = parseInt(_h*tan);
		}
	} else {
		if (_h < Config.Height) {
			_h = Config.Height;
			_w = parseInt(_h*tan);
		}
		Honey.ScaleRate = _h/h;
	}
	canvas.width = _w;
	canvas.height = _h;
	canvas.style.width = w+"px";
	canvas.style.height = h+"px";
	/*
	canvas.width = window.innerWidth || Config.Width;
	canvas.height = window.innerHeight || Config.Height;
	*/
	Honey.body.width(canvas.width);
	Honey.body.height(canvas.height);
	window.scrollTo(0, 0);
};

Honey.now = function() {
	return new Date().getTime();
};

var Watches = {};
Honey.$watch = function(key, caller, callback) {
	if (!Watches[key]) Watches[key] = [];
	Watches[key].push([caller, callback]);
	if (caller && callback) {
		__digest(caller, callback);
	}
};
Honey.$digest = function(key) {
	if (!Watches[key]) return;
	foreach(Watches[key], function(cb) {
		__digest(cb[0], cb[1]);
	});
};
function __digest(caller, callback) {
	if (typeof callback == "string") {
		(function(){
			caller.content(eval(callback));
		}).call(caller);
	} else if (typeof callback == "function") {
		callback.call(caller);
	}
};

})();

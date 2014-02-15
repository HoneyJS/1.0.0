/**
 * 一些常量
 */
var Define = {
	Path : {
		Image:"images/",
		Dialog:"dialogs/",
	},
};(function(){

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
};
window.isEmpty = function(obj) {
	if (obj instanceof window.Array) return !obj.length;
	if (obj instanceof window.Object) {
		for (var i in obj) {
			return true;
		}
		return false;
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
})();
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

})();
/**
 * Storage 存储
 * @author Rhine
 * @version 2013-12-30
 */
(function(){
var Storage = {
	storage : window.localStorage,
	get : function(key) {
		if (!this.storage) return;
		var val = this.storage.getItem(key);
		if (val) return JSON.parse(val);
	},
	getAll : function() {
		var all = {};
		forloop.call(this, this.storage.length, function(i){
			all[this.storage.key(i)] = this.get(this.storage.key(i));
		});
		return all;
	},
	set : function(key, val) {
		if (!this.storage) return;
		this.storage.setItem(key, JSON.stringify(val));
	},
	setAll : function(all) {
		foreach(this, all, function(val, ind){
			this.set(ind, val);
		});
		return all;
	},
	remove : function(key) {
		if (!this.storage) return;
		this.storage.removeItem(key);
	},
	clear : function() {
		if (!this.storage) return;
		this.storage.clear();
	},
};

Honey.Storage = {
	_storage : Storage,
	load : function() {
		this._data = this._storage.getAll();
	},
	save : function() {
		this._storage.setAll(this._data);
	},
	get : function(ind) {
		return this._data[ind];
	},
	set : function(ind, val) {
		this._data[ind] = val;
		this._storage.set(ind, val);
	},
	remove : function(ind) {
		delete this._data[ind];
		this._storage.remove(ind);
	},
};
Honey.Storage.load();
})();
/**
 * Resource 资源
 * @author Rhine
 * @version 2013-10-30
 */
(function(){
/**
 * 图片资源
 */
var Images = {};
var loadingImages = {};
var Resource = {
	getURL : function(url, path) {
		return !path || url.substr(0, 7) == "http://" ? url : path+url;
	},
	getImage : function(url) {
		return Images[url];
	},
	loadImage : function(url, caller, callback, mark) {
		if (Images[url]) {
			callback.call(caller, url, Images[url], mark);
		} else {
			if (!loadingImages[url]) {
				var img = new Image();
				loadingImages[url] = [img, [[caller, callback, mark]]];
				img.onload = function(){
					Resource.__onLoadImage(url);
				};
				img.src = this.getURL(url, Define.Path.Image);
			} else {
				loadingImages[url][1].push([caller, callback, mark]);
			}
		}
	},
	loadImages : function(images, caller, callback) {
		if (isEmpty(images)) {
			callback.call(caller);
			return;
		}
		foreach(images, function(image){
			Resource.loadImage(image, Resource, callback && __callback);
		});
		function __callback(url, img) {
			if (!foreach(images, function(image){
				if (!Images[image]) return 1;
			})) callback.call(caller);
		};
	},
	__onLoadImage : function(url) {
		if (!loadingImages[url]) return;
		Images[url] = loadingImages[url][0];
		foreach (loadingImages[url][1], function(arr){
			arr[1] && arr[1].call(arr[0], url, Images[url], arr[2]);
		});
		delete loadingImages[url];
	},
	loadJS : function(url, caller, callback) {
		var oHead = document.getElementsByTagName('HEAD').item(0);
		var oScript = document.createElement("script");
		oScript.type = "text/javascript";
		oScript.src = url+(url.indexOf('?')<0?'?':'&')+"_t="+new Date().getTime();
		oScript.onload = function(){
			callback && callback.call(caller);
		};
		oHead.appendChild(oScript);
	},
	loadData : function(url, caller, callback) {
		this.loadJS(url, this, function(){
			if (!Honey.data) {
				Honey.trace("Resource.loadData(", url ,") error!");
			} else {
				callback.call(caller, url, Honey.data);
				delete Honey.data;
			}
		});
	},
};
Honey.Resource = Resource;
})();
/**
 * Graphics 测绘制图
 * @author Rhine
 * @version 2013-10-24
 */
(function(){

function Graphics() {
	this._canvas = document.createElement("canvas");
	this._canvas.width = this._canvas.height = 100;
	this._context = this._canvas.getContext("2d");
};
Graphics.prototype.setStyle = function(style) {
	style.affect(this._context);
};
Graphics.prototype.measureTextWidth = function(text) {
	return this._context.measureText(text).width;
};
Graphics.prototype.textWidth = function(text, style) {
	this._context.save();
	this.setStyle(style);
	var width = this.measureTextWidth(text);
	this._context.restore();
	return width;
};
Honey.Graphics = new Graphics();

})();
/**
 * HoneyJS Matrix base on CasualJS Framework by Flashlizi, Copyright (c) 2011 RIAidea.com
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

(function(){
/**
 * Constructor.
 * @name Matrix
 * @class The Matrix class represents a transformation matrix that determines how to map points from one coordinate space to another.
 * @property a The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
 * @property b The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
 * @property c The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
 * @property d The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
 * @property tx The distance by which to translate each point along the x axis.
 * @property ty The distance by which to translate each point along the y axis.
 */ 
function Matrix(a, b, c, d, tx, ty) {
	this.a = a || 1;
	this.b = b || 0;
	this.c = c || 0;
	this.d = d || 1;
	this.tx = tx || 0;
	this.ty = ty || 0;
	
	this.x = this.y = 0;
	this.sx = this.sy = 1;
	this.r = 0;
};
Honey.Matrix = Matrix;

/**
 * Concatenates a matrix with the current matrix, effectively combining the geometric effects of the two.
 */
Matrix.prototype.concat = function(mtx) {
	var a = mtx.a, b = mtx.b, c = mtx.c, d = mtx.d, tx = mtx.tx, ty = mtx.ty;
	this.transform(a, b, c, d, tx, ty);
};

/**
 * Matrix transforms
 */
Matrix.prototype.transform = function(a, b, c, d, tx, ty) {
	var _a = this.a, _b = this.b, _c = this.c, _d = this.d, _tx = this.tx, _ty = this.ty;
	this.a = a * _a + c * _b;
	this.b = b * _a + d * _b;
	this.c = a * _c + c * _d;
	this.d = b * _c + d * _d;
	this.tx = a * _tx + c * _ty + tx;
	this.ty = b * _tx + d * _ty + ty;
};

/**
 * Matrix affects a context
 */
Matrix.prototype.affect = function(context) {
	context.transform(this.a, this.b, this.c, this.d, this.tx, this.ty);
};

/**
 * Concatenates a transformation with the current matrix, effectively combining the geometric effects of the two.
 */
Matrix.prototype.concatTransform = function(x, y, scaleX, scaleY, rotation, regX, regY)
{
	var cos = 1;
	var sin = 0;
	if(rotation%360)
	{
		var r = rotation * Math.PI / 180;
		cos = Math.cos(r);
		sin = Math.sin(r);
	}
	
	if(regX != 0) this.tx -= regX; 
	if(regY != 0) this.ty -= regY;
	this.concat(new Matrix(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y));
}


/**
 * Applies a rotation transformation to the Matrix object.
 */
Matrix.prototype.rotate = function(angle, px, py) {
	if (!(angle%360)) return;
	var radian = angle * Math.PI / 180;
	var cos = Math.cos(radian), sin = Math.sin(radian);
	this.translate(-px, -py);
	this.transform(cos, sin, -sin, cos, 0, 0);
	this.translate(px, py);
};

/**
 * Applies a scaling transformation to the matrix.
 */
Matrix.prototype.scale = function(sx, sy, px, py) {
	this.translate(-px, -py);
	this.transform(sx, 0, 0, sy, 0, 0);
	this.translate(px, py);
};

/**
 * Translates the matrix along the x and y axes, as specified by the dx and dy parameters.
 */
Matrix.prototype.translate = function(dx, dy) {
	this.tx += dx;
	this.ty += dy;
};

/**
 * compute the matrix
 */
Matrix.prototype.compute = function(px, py) {
	this.identity();
	this.scale(this.sx, this.sy, px, py);
	this.rotate(this.r, px, py);
	this.translate(this.x, this.y);
};

/**
 * compute the coordinate after this matrix transform
 */
Matrix.prototype.coordinate = function(x, y) {
	return [Math.floor(this.a * x + this.c * y + this.tx), Math.floor(this.b * x + this.d * y + this.ty)];
};

/**
 * Sets each matrix property to a value that causes a null transformation.
 */
Matrix.prototype.identity = function() {
	this.a = this.d = 1;
	this.b = this.c = this.tx = this.ty = 0;
}

/**
 * Performs the opposite transformation of the original matrix.
 */
Matrix.prototype.invert = function()
{
	var a = this.a;
	var b = this.b;
	var c = this.c;
	var d = this.d;
	var tx = this.tx;
	var i = a * d - b * c;
	
	this.a = d / i;
	this.b = -b / i;
	this.c = -c / i;
	this.d = a / i;
	this.tx = (c * this.ty - d * tx) / i;
	this.ty = -(a * this.ty - b * tx) / i;
}

/**
 * Returns a new Matrix object that is a clone of this matrix, with an exact copy of the contained object.
 */
Matrix.prototype.clone = function() {
	return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
};

/**
 * Returns a text value listing the properties of the Matrix object.
 */
Matrix.prototype.toString = function()
{
	return "(a="+this.a+", b="+this.b+", c="+this.c+", d="+this.d+", tx="+this.tx+", ty="+this.ty+")";
}

})();/**
 * Style 式样
 * @author Rhine
 * @version 2013-10-24
 */
(function(){
function Style(element, style) {
	this.element = element;
	this.color = "";
	this.fontWidth = 1;
	this.fontSize = 20;
	this.fontFamily = "Arial";
	this.align = "left";
	this.baseLine = "top";
	this.alpha = 1;
	this.display = 1;
	
	style && this.set(style);
};
Honey.Style = Style;

/**
 * 设置
 */
Style.prototype.set = function(style) {
	attach(this, style);
};
/**
 * 设置预定义式样
 */
Style.prototype.attach = function(className) {
	if (!Honey.Styles[className]) {
		Honey.trace("Style attaches an undefined class:", className);
		return;
	}
	this.set(Honey.Styles[className]);
};
/**
 * 元素设置
 */
Style.prototype.ElementAttach = function(attr) {
	this.element.set(attr);
};
/**
 * style作用于context
 */
Style.prototype.affect = function(context) {
	context.fillStyle = context.strokeStyle = this.color;
	context.lineWidth = this.fontWidth;
	context.font = this.fontSize+"px "+this.fontFamily;
	context.textAlign = this.align;
	context.textBaseline = this.baseLine;
	context.globalAlpha *= this.alpha;
};
/**
 * style绘制
 */
Style.prototype.draw = function(context, rects) {
	this.__drawBgColor(context, rects);
	this.__drawBgImage(context, rects);
	this.__drawBorderColor(context, rects);
	this.__draw(context, rects);
};
Style.prototype.__draw = function(context, rects) {};

//背景色
Style.prototype.__drawBgColor = function(context, rects) {
	if (!this.bgColor) return;
	var w = this.element.width(), h = this.element.height();
	var globalAlpha = context.globalAlpha;
	var fillStyle = context.fillStyle;
	if (this.bgAlpha) context.globalAlpha *= this.bgAlpha;
	context.fillStyle = this.bgColor;
	context.fillRect(0, 0, w, h);
	if (this.bgAlpha) context.globalAlpha = globalAlpha;
	context.fillStyle = fillStyle;
};
//背景图
Style.prototype.setBgImage = function(image) {
	if (typeof image == "object") {
		this.bgImage = image.concat();
	} else if (typeof image == "string") {
		this.bgImage = [image, 0, 0, 0, 0];
	} else {
		this.bgImage = null;
	}
	if (this.bgImage) {
		Honey.Resource.loadImage(this.bgImage[0], this, function(url, img, mark){
			this.bgImage[0] = img;
			if (!this.bgImage[3] || !this.bgImage[4]) {
				this.bgImage[3] = img.width;
				this.bgImage[4] = img.height;
			}
			this.element.dirty();
		});
	}
};
Style.prototype.__drawBgImage = function(context, rects) {
	if (!this.bgImage || typeof this.bgImage[0] != "object") return;
	var w = this.element.width(), h = this.element.height();
	var bg = this.bgImage;
	var globalAlpha = context.globalAlpha;
	if (this.bgAlpha) context.globalAlpha *= this.bgAlpha;
	if (this.bgRepeat) {
		//平铺
		forloop (Math.ceil(w/bg[3]), function(i){
			forloop (Math.ceil(h/bg[4]), function(j){
				context.drawImage(bg[0], bg[1], bg[2], bg[3], bg[4], bg[3]*i, bg[4]*j, bg[3], bg[4]);
			});
		});
	} else {
		//拉伸
		context.drawImage(bg[0], bg[1], bg[2], bg[3], bg[4], 0, 0, w, h);
	}
	if (this.bgAlpha) context.globalAlpha = globalAlpha;
};
//边框
Style.prototype.__drawBorderColor= function(context, rects) {
	if (!this.borderColor) return;
	var w = this.element.width(), h = this.element.height();
	var globalAlpha = context.globalAlpha;
	if (this.bgAlpha) context.globalAlpha *= this.bgAlpha;
	context.strokeStyle = this.borderColor;
	context.lineWidth = this.borderWidth||1;
	context.strokeRect(0, 0, w, h);
	if (this.bgAlpha) context.globalAlpha = globalAlpha;
};
/**
 * 设置附属元素坐标
 */
Style.prototype.x = function(x) {
	this.element.x(x);
};
Style.prototype.y = function(y) {
	this.element.y(y);
};
})();
/**
 * Event 事件
 * @author Rhine
 * @version 2013-10-24
 */
(function(){
/**
 * 事件管理（注册，移除，触发s）
 */
var EventM = {
	_idCounter : 0,
	events : {},
	regist : function(type, caller, callback) {
		if (!this.events[type]) this.events[type] = [];
		this.events[type].unshift({caller:caller, callback:callback, id:++this._idCounter});
		return this._idCounter;
	},
	trigger : function(type, arg) {
		if (!this.events[type]) return;
		//使用forback是为了防止callback执行中会移除该callback，影响后面的callback执行
		forback(this.events[type], function(evt){
			evt.callback.call(evt.caller, type, arg);
		});
	},
	remove : function(id) {
		for (var type in this.events) {
			var events = this.events[type];
			foreach (events, function(evt, i){
				if (evt.id == id) {
					events.splice(i, 1);
					return i;
				}
			});
		}
	},
};
window.EventM = EventM;

//注册旋转屏幕/重置大小事件
EventM.regist("resize", window, function(){
	Honey.resize();
});
window.addEventListener("onorientationchange", function(){
	EventM.trigger("resize");
}, false);
/*window.onorientationchange = function() {
	EventM.trigger("resize");
};*/
window.addEventListener("resize", function(){
	EventM.trigger("resize");
}, false);
/*window.onresize = function() {
	EventM.trigger("resize");
};*/

//预先注册鼠标/触摸事件
var elements = [], startX = 0, startY = 0;
EventM.regist("onmousedown", null, function(type, arg){
	elements = [];
	startX = arg[1];
	startY = arg[2];
	__onmousedown(arg[0], startX, startY, arg[3]);
});
EventM.regist("onmouseup", null, function(type, arg){
	__onmouseup(arg[1], arg[2], arg[3]);
	elements = [];
});
EventM.regist("onmousemove", null, function(type, arg){
	__onmousemove(arg[1], arg[2], arg[1]-startX, arg[2]-startY, arg[3]);
	startX = arg[1], startY = arg[2];
});
EventM.regist("onmouseout", null, function(type, arg){
	__onmouseout(arg[1], arg[2], arg[3]);
});
function __onmousedown(ele, x, y, evt) {
	if (ele.pointIsOut(x, y)) return ele.clickMask;
	if (ele.children) {
		if (forback(ele.children, function(ele, i){
			if (ele.display()) return __onmousedown(ele, x, y, evt);
		})) return 1;
	}
	elements.push(ele);
	if (ele.Events.onmousedown && ele.Events.onmousedown.call(ele, x, y, evt)) return 1;
	if (ele.clickMask || ele.clickBreak) return 1;
};
function __onmouseup(x, y, evt) {
	foreach(elements, function(ele){
		if (ele.pointIsOut(x, y)) {
			ele.Events.onmouseout && ele.Events.onmouseout.call(ele);
			return;
		}
		if (ele.Events.onmouseup && ele.Events.onmouseup.call(ele, x, y, evt)) return 1;
		if (ele.Events.onclick && ele.Events.onclick.call(ele, x, y, evt)) return 1;
		if (ele.clickBreak) return 1;
	});
	elements = [];
};
function __onmouseout(x, y, evt) {
	foreach(elements, function(ele){
		ele.Events.onmouseout && ele.Events.onmouseout.call(ele);
	});
	elements = [];
};
function __onmousemove(x, y, dx, dy, evt) {
	foreach(elements, function(ele){
		if (ele.Events.onmousemove && ele.Events.onmousemove.call(ele, x, y, dx, dy, evt)) return 1;
		if (ele.scrollable) {
			ele.scroll.call(ele, dx, dy, evt);
			elements = [ele];
			return 1;
		}
		if (ele.draggable) {
			ele.drag.call(ele, dx, dy, evt);
			elements = [ele];
			return 1;
		}
		if (ele.clickBreak) return 1;
	});
};

/**
 * 事件集对象
 */
function Events(events) {
	this.set(events);
};
Honey.Events = Events;
Events.prototype.set = function(events) {
	attach(this, events);
};
Events.prototype.add = function(type, evt) {
	this[type] = evt;
};
})();
/**
 * Action 动作
 * @author Rhine
 * @version 2013-11-29
 */
(function(){
function Action(duration, end) {
	this.duration = duration || 1;
	this.counter = 0;
	this.start = {};
	this.end = end;
};
Honey.Action = Action;

//执行动作
Action.prototype.act = function(ele, span) {
	this.counter += span;
	for (var type in this.end) {
		this[type](ele);
	}
	return this.finished();
};
Action.prototype.finished = function() {
	return this.counter >= this.duration;
};
Action.prototype.reset = function() {
	this.counter = 0;
};
//生成动作
Action.Create = function(duration, end) {
	return new Action(duration, end);
};
/**
 * 移动动作
 */
Action.MoveTo = function(duration, x, y) {
	return Action.Create(duration, {MoveTo:[x, y]});
};
Action.prototype.MoveTo = function(ele) {
	if (this.start.MoveTo == null) this.start.MoveTo = [ele.x(), ele.y()];
	var start = this.start.MoveTo, end = this.end.MoveTo;
	var x = start[0], y = start[1];
	var _x = end[0], _y = end[1];
	var rate = this.counter / this.duration;
	if (rate >= 1) {
		ele.x(_x);
		ele.y(_y);
	} else {
		ele.x(x+(_x-x)*rate);
		ele.y(y+(_y-y)*rate);
	}
};
/**
 * 缩放动作
 */
Action.ScaleTo = function(duration, sx, sy) {
	return Action.Create(duration, {ScaleTo:[sx, sy]});
};
Action.prototype.ScaleTo = function(ele) {
	if (this.start.ScaleTo == null) this.start.ScaleTo = [ele.Matrix.sx, ele.Matrix.sy];
	var start = this.start.ScaleTo, end = this.end.ScaleTo;
	var x = start[0], y = start[1];
	var _x = end[0], _y = end[1];
	var rate = this.counter / this.duration;
	if (rate >= 1) {
		ele.scale(_x, _y);
	} else {
		ele.scale(x+(_x-x)*rate, y+(_y-y)*rate);
	}
};
/**
 * 隐现动作
 */
Action.AlphaTo = function(duration, a) {
	return Action.Create(duration, {AlphaTo:a});
};
Action.prototype.AlphaTo = function(ele) {
	if (this.start.AlphaTo == null) this.start.AlphaTo = ele.alpha();
	var alpha = this.start.AlphaTo, _alpha = this.end.AlphaTo;
	var rate = this.counter / this.duration;
	if (rate >= 1) {
		ele.alpha(_alpha);
	} else {
		ele.alpha(alpha+(_alpha-alpha)*rate);
	}
};
})();
/**
 * Element 元素
 * @author Rhine
 * @version 2013-10-24
 */
(function(){

function Element(attr/*attributes*/, style, events) {
	this.tag = "Element";
	this.id = Honey.generateId();
	this.name = null;
	this.className = null;
	this.Style = new Honey.Style(this);
	this.Style.set(style);
	this.Matrix = new Honey.Matrix();
	this.Events = new Honey.Events(events);
	this._z = 0;
	this._ready = 1;
	this._dirty = 0;
	this._onScreen = 0;
	this._sx = this._sy = 0;	//scrollXY
	this._schedule = [];
	this._actions = [];
	
	attr && this.set(attr);
};
Honey.Element = Element;

/**
 * 设置
 */
Element.prototype.set = function(attr) {
	attach(this, attr);
};
//获取/设置内容
Element.prototype.content = function(content) {};
/**
 * 字符串化
 */
Element.prototype.toString = function() {
	return this.tag+this.id;
};
/**
 * 设置预定义style
 */
Element.prototype.setClass = function(name) {
	this.Style.attach(this.className = name);
};
/**
 * 准备好状态
 */
Element.prototype.ready = getset("_ready", function(val){
	this.dirty();
});
/**
 * 脏矩形
 */
Element.prototype.dirty = function() {
	if (!this.ready()) return;
	if (!this.body() || !this.body().useDirty) return;
	if (this.isDirty) return;
	this.isDirty = 1;
	if (!this.display() || this.isOut()) return;
	this.body().DirtyRects.add(this);
}
Element.prototype.clean = function() {
	this.isDirty = 0;
}

/**
 * 获取元素所属的body
 */
Element.prototype.body = function() {
	var ele = this;
	while (ele.parentNode) {
		ele = ele.parentNode;
	}
	if (ele.tag == "Body") return ele;
};

/**
 * 元素是否出界
 */
Element.prototype.isOut = function() {
	if (!this.parentNode) return;
	var node = this.parentNode;
	var rect = new Honey.Rect();
	rect.range = [[-node._sx, -node._sy], [-node._sx+node.width(), -node._sy+node.height()]];
	return !rect.check(this.Matrix.coordinate(0, 0), this.Matrix.coordinate(this.width(), 0), this.Matrix.coordinate(this.width(), this.height()), this.Matrix.coordinate(0, this.height()));
	/*
	if (xy[0]+wh[0] < 0 || xy[1]+wh[1] < 0) {
		return 1;
	}
	if (this.parentNode && (xy[0] > this.parentNode.width() || this.y() > this.parentNode.height())) {
		return 1;
	}
	*/
};
/**
 * 计算点是否在此元素内
 */
Element.prototype.pointIsOut = function(x, y) {
	var range = new Honey.Rect(this).range;
	if (x < range[0][0] || x > range[1][0] || y < range[0][1] || y > range[1][1]) return 1;
};

/**
 * 添加脏矩形
 */
Element.prototype.addDiryRect = function(DirtyRects) {
	if (!this.display() || !this.isDirty || this.isOut()) return;
	DirtyRects.add(this);
};
/**
 * 显示
 */
Element.prototype.draw = function(context, rects) {};
Element.prototype.__draw = function(context, rects) {
	if (!this.ready() || !this.display()) return;
	if (this.isOut()) return;
	if (this.body() && this.body().useDirty && !this.isDirty && !rects.check(this)) return;
	context.save();
	this.Matrix.affect(context);
	
	context.beginPath();
	context.rect(0, 0, this.width(), this.height());
	context.closePath();
	context.clip();
	
	this.Style.affect(context);
	this.Style.draw(context, rects);
	context.translate(this._sx, this._sy);
	this.draw(context, rects);
	/**遍历子元素**/
	if (this.children) {
		var i = forback(this.children, function(child, i){
			if (child.display() && child.fullScreen) return i;
		});
		foreach(this.children, function(child){
			child.__draw(context, rects);
		}, i);
	}
	//context.strokeRect(0,0,this.width()/2,this.height()/2);
	context.restore();
	this.clean();
};
/**
 * 获取设置宽高
 */
Element.prototype.width = function(width) {
	if (width != undefined) {
		width = parseInt(width);
		this.dirty();
		this.Style.width = width;
	}
	return this.Style.width || this._width || 0;
};
Element.prototype.height = function(height) {
	if (height != undefined) {
		height = parseInt(height);
		this.dirty();
		this.Style.height = height;
	}
	return this.Style.height || this._height || 0;
};
Element.prototype.size = function(size) {
	this.width(size[0]);
	this.height(size[1]);
};
/**
 * 透明度
 */
Element.prototype.alpha = function(a) {
	if (a != undefined) {
		a = Math.min(Math.max(a, 0), 1);
		this.dirty();
		this.Style.alpha = a;
	}
	return this.Style.alpha;
};
/**
 * 获取设置坐标
 */
Element.prototype.x = function(x) {
	if (x != undefined) {
		x = parseInt(x);
		this.dirty();
		this.Matrix.translate(x-this.Matrix.x, 0);
		this.Matrix.x = x;
	}
	return this.Matrix.x;
};
Element.prototype.y = function(y) {
	if (y != undefined) {
		y = parseInt(y);
		this.dirty();
		this.Matrix.translate(0, y-this.Matrix.y);
		this.Matrix.y = y;
	}
	return this.Matrix.y;
};
/**
 * 设置居中缩放
 */
Element.prototype.scale = function(sx, sy) {
	if (sx != 0 && sy != 0) {
		this.dirty();
		this.Matrix.sx = sx;
		this.Matrix.sy = sy;
		this.Matrix.compute(this.width()/2, this.height()/2);
	}
};
/**
 * 设置居中旋转
 */
Element.prototype.rotate = function(r) {
	this.dirty();
	this.Matrix.r = r;
	this.Matrix.compute(this.width()/2, this.height()/2);
};

/***
 * 相对于body坐标
 */
Element.prototype.xyToBody = function() {
	var ele = this, x = this.x(), y = this.y();
	while (ele.parentNode) {
		ele = ele.parentNode;
		x += ele.x();
		y += ele.y();
	}
	return [x, y];
};

/**
 * 获取设置显示
 */
Element.prototype.display = function(val) {
	if (val != undefined) {
		this.dirty();
		this.Style.display = !!val;
	}
	return this.Style.display;
};


/**
 * 元素隐藏和显示的切换
 */
Element.prototype.toggle = function() {
	this.display(!this.display());
};

/**
 * 定时任务
 */
Element.prototype.schedule = function(info/*[func, cycle, arg]*/) {
	this.unschedule(info[0]);
	info[1] *= 10;
	info.splice(2, 0, 0);
	this._schedule.unshift(info);
	this._onScreen && this.body().schedule(this/*, info[0], info[1], info[2]*/);
};
Element.prototype.unschedule = function(func) {
	foreach(this._schedule, function(s, i, arr){
		if (s[0] === func) {
			arr.splice(i, 1);
			return 1;
		}
	});
	if (!this._schedule.length && this._onScreen) this.body().unschedule(this);
};
Element.prototype.__schedule = function(span) {
	var flag = 0;
	forback.call(this, this._schedule, function(s){
		s[2] += span;
		if (s[2] >= s[1]) {
			s[2] -= s[1];
			s[0].call(this, s[3], s[0], s[1]);
		}
		if (s[2] >= s[1]) flag = 1;
		/*
		if (s[2] >= s[1]*100) s[2] = s[1];
		while (s[2] >= s[1]) {
			s[2] -= s[1];
			s[0].call(this, s[3]);
		}
		*/
	});
	return flag;
};

/**
 * z方向排序
 */
Element.prototype.z = function(z) {
	if (z != undefined) {
		this.dirty();
		this._z = z;
		if (this.parentNode && typeof this.parentNode.sort == "function") this.parentNode.sort();
	}
	return this._z;
};

/**
 * 被移除
 */
Element.prototype.removed = function(z) {
	if (this.parentNode) this.parentNode.removeChild(this);
};

/**
 * 出入屏幕
 */
Element.prototype.onScreen = function() {
	this._onScreen = 1;
	this._schedule.length && this.body().schedule(this/*, this._schedule[0], this._schedule[1], this._schedule[2]*/);
	if (this.children) {
		foreach(this.children, function(child){
			child.onScreen();
		});
	}
};
Element.prototype.outScreen = function() {
	this._onScreen = 0;
	this._schedule.length && this.body() && this.body().unschedule(this);
	if (this.children) {
		foreach(this.children, function(child){
			child.outScreen();
		});
	}
};
/**
 * 元素移动
 */
Element.prototype.drag = function(dx, dy) {
	this.dirty();
	this.x(this.x()+dx);
	this.y(this.y()+dy);
	if (this.Events.ondrag) this.Events.ondrag.call(this, dx, dy);
};

/**
 * 元素内移动
 */
Element.prototype.scroll = function(dx, dy) {
	if (!dx && !dy) return;
	this.dirty();
	this._sx += dx;
	this._sy += dy;
	if (this.Events.onscroll) this.Events.onscroll.call(this, dx, dy);
};

/**
 * Action动作
 * actions传入数组，里面元素可以是Action对象，也可以是函数
 */
Element.prototype.addAction = function(actions, times) {
	if (!this._actions.length) this.schedule([this.__action, 4]);
	var id = Honey.generateId();
	this._actions.unshift([actions, times||1, 0, id]);
	return id;
};
Element.prototype.removeAction = function(id) {
	foreach(this._actions, function(arr, i, actions){
		if (arr[3] == id) {
			actions.splice(i, 1);
			return 1;
		}
	});
};
Element.prototype.__action = function(arg, func, span) {
	forback.call(this, this._actions, function(arr, i, actions){
		var action = arr[0][arr[2]];
		if (typeof action == "function") {
			action.call(this);
		} else if (action.act(this, span)) {
			action.reset();
		} else {
			return;
		}
		if (++arr[2] >= arr[0].length) {
			arr[2] = 0;
			if (arr[1] > 0 && --arr[1] == 0) {
				actions.splice(actions.indexOf(arr), 1);
			}
		}
	});
};
})();
/**
 * Node 节点
 * @author Rhine
 * @version 2013-10-24
 */
(function(){
	
function Node(attr, style, events) {
	this.children = [];
	Honey.Element.apply(this, arguments);
	
	this.tag = "Node";
};
Honey.inherit(Node, Honey.Element);
Honey.Node = Node;
/**
 * 返回带有指定 ID的子元素
 */
Node.prototype.getChildByName = function(name) {
	return foreach(this.children, function(child){
		if (child.name == name) return child;
	});
};
/**
 * 添加子元素
 */
Node.prototype.appendChild = function(child) {
	if (this.children.indexOf(child) == -1) {
		child.removed();
		this.children.push(child);
		this.sort();
		if (child.name != null) this[child.name] = child;	//提供快捷索引
	}
	child.parentNode = this;
	child.dirty();
	this._onScreen && child.onScreen();
	return child;
};
/**
 * 删除子元素
 */
Node.prototype.removeChild = function(child) {
	child.dirty();
	var ind = this.children.indexOf(child);
	if (ind != -1) {
		this.children.splice(ind, 1);
		if (child.name != null && this[child.name] == child) delete this[child.name];
	}
	child.outScreen();
	child.parentNode = null;
	return child;
};
/**
 * 清空子元素
 */
Node.prototype.clearChildren = function() {
	forback.call(this, this.children, function(child){
		this.removeChild(child);
	});
};

/**
 * 添加子元素接口
 */
Node.prototype.add = function(type, name, x, y, content, attr, style, events) {
	//type, attr{name:,x:,y:,width:,height:,content:,..}, style
	//type, name, x, y, content, attr, style
	//element
	//[]
	if (type instanceof Array) {
		var re = [];
		foreach.call(this, arguments, function(arg){
			re.push(this.add.apply(this, arg));
		});
		return re;
	}
	if (type instanceof Honey.Element) {
		return this.appendChild(type);
	}
	var element = (typeof type == "function" ? type : Honey[type]);
	if (name instanceof Object) {
		attr = name;
		style = x;
		events = y;
	} else {
		if (!attr) attr = {};
		attr.name = name;
		attr.x = x;
		attr.y = y;
		attr.content = content;
	}
	return this.appendChild(new element(attr, style, events));
};
Node.prototype.addDiryRect = function(DirtyRects) {
	if (!this.display() || this.isOut()) return;
	if (this.isDirty) {
		DirtyRects.add(this);
	} else {
		foreach(this.children, function(child){
			child.addDiryRect(DirtyRects);
		});
	}
};
/**
 * 排序
 */
function zSort(a, b) {
	return a._z - b._z;
};

Node.prototype.sort = function() {
	this.children.sort(this.zSort||zSort);
};

})();/**
 * BasicElement 一些基础的元素
 * @author Rhine
 * @version 2013-10-24
 */
(function(){
/**
 * 图片元素
 */
function Image(attr, style, events) {
	Honey.Element.apply(this, arguments);
	
	this.tag = "Image";
};
Honey.inherit(Image, Honey.Element);
Honey.Image = Image;

/**
 * 设置image
 */
Image.prototype.content = function(image) {
	this.ready(0);
	if (!image) {
		this.image = null;
		this._width = this._height = 0;
	} else if (typeof image == "object") {
		this.image = image.concat();
		this._width = image[3];
		this._height = image[4];
		Honey.Resource.loadImage(this.image[0], this, this.__onImageReady);
	} else if (typeof image == "string") {
		this.image = [image,0,0,0,0];
		this._width = this._height = 0;
		Honey.Resource.loadImage(this.image[0], this, this.__onImageReady);
	}
};
Image.prototype.__onImageReady = function(src, img, mark) {
	if (!this.image || this.image[0] != src) return;
	this.ready(1);
	this.image[0] = img;
	if (!this.image[3] || !this.image[4]) {
		this._width = this.image[3] = img.width;
		this._height = this.image[4] = img.height;
	}
};

Image.prototype.draw = function(context, rects) {
	this.image && context.drawImage(this.image[0], this.image[1], this.image[2], this.image[3], this.image[4], 0, 0, this.width(), this.height());
};

/**
 * 单行文本元素
 */
function LineText(attr, style, events) {
	this._width = 0;
	this._align = "left";
	this._left = 0;
	this._top = 0;
	
	Honey.Element.apply(this, arguments);
	
	this.tag = "LineText";
	this._height = this.Style.fontSize;
	this.align();
};
Honey.inherit(LineText, Honey.Element);
Honey.LineText = LineText;

/**
 * 对齐方式
 */
LineText.prototype.align = function(align){
	if (align) this._align = align;
	if (!this._height) return;
	switch (this._align) {
		case 'left':
			this._left = 0;
			break;
		case 'center':
			this._left = Math.floor((this.width()-this._width)/2);
			break;
		case 'right':
			this._left = this.width()-this._width;
			break;
	}
	this._top = Math.floor((this.height()-this._height)/2);
};
/**
 * 设置text
 */
LineText.prototype.content = function(text) {
	this.dirty();
	if (text != undefined) {
		this._text = text+"";
		this._width = Honey.Graphics.textWidth(this._text, this.Style);
		this.align();
	} else {
		this._text = null;
		this._width = 0;
	}
};
LineText.prototype.draw = function(context, rects) {
	if (!this._text) return;
	//阴影
	if (this.Style.shadow) {
		context.shadowColor = "#000000";
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 10;
	}
	context.fillText(this._text, this._left, this._top-1);
};

/**
 * 多行文本元素
 */
function Text(attr, style, events) {
	this.texts = [];
	this._width = 100;
	Honey.Element.apply(this, arguments);
	
	this.tag = "Text";
};
Honey.inherit(Text, Honey.Element);
Honey.Text = Text;

/**
 * 设置text
 */
Text.prototype.content = function(texts) {
	this.dirty();
	if (typeof texts == "string") {
		this._texts = [[texts]];
		this.split();
	} else if (typeof texts == "object") {
		this._texts = texts;
		this.split();
	} else {
		this._texts = null;
		this._width = 0;
	}
};
/**
 * 拆分到不同行和颜色
 */
Text.prototype.split = function() {
	var x = 0, y = 0, w1 = 0, w2 = 0, h = this.Style.fontSize, text, color, width = this.width();
	var texts = this.texts = [];
	Honey.Graphics.setStyle(this.Style);
	foreach(this._texts, function(_text, i){
		color = _text[1];
		text = "";
		_text[0] = _text[0]+"";
		foreach(_text[0], function(_char, j){
			if (_char == "\n") {
				__newline();
			} else {
				w2 = Honey.Graphics.measureTextWidth(text+_char);
				if (x + w2 > width) {
					__newline();
					text = _char;
				} else {
					text += _char;
					w1 = w2;
				}
			}
		});
		if (text.length) texts.push([x, y, text, color]);
		x = x + w1;
		w1 = 0;
	});
	this._height = y + h;
	
	function __newline() {
		if (text.length) texts.push([x, y, text, color]);
		x = 0;
		y += h;
		w2 = w2 - w1;
		w1 = w2;
		text = "";
	};
};
Text.prototype.draw = function(context, rects) {
	if (!this.texts.length) return;
	foreach.call(this, this.texts, function(_text, i){
		var color = _text[3] || this.Style.color;
		context.fillStyle = color;
		context.fillText(_text[2], _text[0], _text[1]);
	});
};

/**
 * 按钮元素
 */
function Button() {
	this._state = "up";	//按钮的三个状态：弹起，按下，禁用(up,down,unusable)
	this._images = {};
	this._text = null;
	Honey.Element.apply(this, arguments);
	
	this.tag = "Button";
	this.clickBreak = 1;
	this.Events.set({
		onmousedown : function(){
			this.dirty();
			this._state = "down";
			this.__buttonDown();
		},
		onmouseup : function(){
			this.dirty();
			this._state = "up";
			this.__buttonUp();
		},
		onmouseout : function(){
			this.dirty();
			this._state = "up";
			this.__buttonUp();
		},
	});
};
Honey.inherit(Button, Honey.Element);
Honey.Button = Button;

/**
 * 获取/改变状态
 */
Button.prototype.state = getset("_state", function(val){
	this.dirty();
});
/**
 * 文字
 */
Button.prototype.text = function(text) {
	this.dirty();
	if (text != undefined) {
		this._text = text+"";
		this._textWidth = Honey.Graphics.textWidth(this._text, this.Style);
		this.alignText();
	} else {
		this._text = null;
		this._width = 0;
	}
};
Button.prototype.alignText = function(text) {
	this._textHeight = this.Style.fontSize;
	this._textLeft = Math.floor((this.width()-this._textWidth)/2);
	this._textTop = Math.floor((this.height()-this._textHeight)/2);
};
/**
 * 按钮特殊用法，设置内容为设置点击事件
 */
Button.prototype.content = function(onclick) {
	this.Events.set({onclick:onclick});
};
/**
 * 设置按钮
 */
Button.prototype.images = function(states) {
	this.ready(0);
	foreach.call(this, states, function(image, state){
		this.__setImage(state, image);
	});
	this.__resize();
	Honey.Resource.loadImages(this._images, this, this.__onImageReady);
};
Button.prototype.__setImage = function(state, image) {
	if (!image) {
		this._images[state] = null;
	} else if (typeof image == "object") {
		this._images[state] = image.concat();
	} else if (typeof image == "string") {
		this._images[state] = [image,0,0,0,0];
	}
};
Button.prototype.__resize = function() {
	var width = 0, height = 0;
	foreach(this._images, function(image){
		if (image) {
			width = Math.max(image[3], width);
			height = Math.max(image[4], height);
		}
	});
	this._width = width;
	this._height = height;
};
Button.prototype.__onImageReady = function() {
	this.ready(1);
	foreach(this._images, function(image){
		image[0] = Honey.Resource.getImage(image[0]);
	});
	this.__resize();
};
/**
 * 绘制
 */
Button.prototype.draw = function(context, rects) {
	var image = this._images[this._state];
	if (!image && this._state == "down" && this._images.up) {
		image = this._images.up;
	}
	if (image) context.drawImage(image[0], image[1], image[2], image[3], image[4], 0, 0, this.width(), this.height());
	if (!this._text) return;
	if (!this._textHeight) this.alignText();
	//context.fillText(this._text, this._textLeft, this._textTop-1);
	//阴影
	if (this.Style.shadow) {
		context.shadowColor = "#000000";
		context.shadowOffsetX = 0;
		context.shadowOffsetY = 0;
		context.shadowBlur = 10;
	}
	context.fillText(this._text, this._textLeft, this._textTop-1);
};
/**
 * 特殊按钮按下操作
 */
Button.prototype.__buttonDown = function() {
	if (!this._images.down && !this._buttonDown) {	//未设置按下图片则进行偏移操作
		this.x(this.x()+2);
		this.y(this.y()+2);
		this._buttonDown = 2;
	}
};
			
Button.prototype.__buttonUp = function() {
	if (this._buttonDown) {
		this.x(this.x()-2);
		this.y(this.y()-2);
		this._buttonDown = 0;
	}
};

})();
/**
 * Sprite 精灵元素
 * @author Rhine
 * @version 2013-11-04
 */
(function(){

function Sprite(attr, style, events) {
	this.configed = 0;
	this.images = [];
	this.pieces = [];
	this.frames = [];	//所有图片动画帧
	this.frameLength = 0;	//动画帧数（包括粒子发射器动画）
	this.frameDelay = 0;	//帧间隔
	this.currentFrame = -1;	//当前帧
	this._delayCounter = -1;	//帧间隔计数
	this.playing = 0;	//播放状态
	this.loop = 1;	//循环
	this.offset = [0, 0];	//偏移值
	this._matrix = new Honey.Matrix();	//矩阵变换
	
	Honey.Element.apply(this, arguments);
	
	this.tag = "Sprite";
	this.ready(0);
};
Honey.inherit(Sprite, Honey.Element);
Honey.Sprite = Sprite;
	
//更新
Sprite.prototype.update = function() {
	if (!this.playing || !this.ready() || !this.frameLength) return;
	//通过判断帧间隔计数来控制动画速度
	if (++this._delayCounter >= this.frameDelay) {
		this.dirty();
		this._delayCounter = 0;
		//动画是否播放结束
		if (++this.currentFrame >= this.frameLength) {
			this.currentFrame = 0;
			//this._onStop && this._onStop();
			if (!this.loop) {
				this.playing = 0;
				return;
			}
		}
	}
	/*
	//检测粒子发射器是否update
	for (var i=0; i<this._particles.length; ++i) {
		var p = this._particles[i];
		if (this.currentFrame >= p.startFrame && this.currentFrame <= p.endFrame) {
			p.update();
			this.dirty();
		}
	}
	*/
};
//绘制
Sprite.prototype.draw = function(ctx,rect) {
	//是否翻转
	if (this._reverse) {
		this._matrix.identity();
		this._matrix.scale(-1,1,this.width()/2,this.height()/2);
		this._matrix.affect(ctx);
	}
	
	//图片
	var frame = this.frames[1][this.currentFrame];
	if (frame) foreach.call(this, frame, function(fragment){
		ctx.save();
		//移位
		(fragment[1]||fragment[2]) && ctx.translate(fragment[1], fragment[2]);
		this._matrix.identity();
		//var w =  framess[0][fragment[0]]._width, h =  framess[0][fragment[0]]._height;
		var w, h, flag = (fragment[0] instanceof Sprite/*Honey.Particle*/);
		//宽高
		if (flag) {
			w = fragment[0].width, h = fragment[0].height;
		} else {
			var img = this.pieces[fragment[0]];
			w = img[3], h = img[4];
		}
		//旋转
		if (fragment[5]) this._matrix.rotate(fragment[5], w/2, h/2);
		//缩放
		if (fragment[3] != 1 || fragment[4] != 1) this._matrix.scale(fragment[3],fragment[4],w/2,h/2);
		this._matrix.affect(ctx);
		//透明度
		if (fragment[6] > 0 && fragment[6] > 1) ctx.globalAlpha *= fragment[6];
		//绘制
		if (flag) {
			fragment[0].__draw(ctx, rect);
		} else {
			var img = this.pieces[fragment[0]];
			ctx.drawImage(img[0],img[1],img[2],img[3],img[4],0,0,w,h);
		}
		ctx.restore();
	});
	/*
	for (var i=0; i<this._particles.length; ++i) {
		var p = this._particles[i];
		if (this.currentFrame >= p.startFrame && this.currentFrame <= p.endFrame) {
			p.draw(ctx,rect);
		}
	}
	*/
	
	///绘制hitPoint
	///ctx.strokeStyle = "green";
	///ctx.strokeRect(this.offsetX[this._partFrames], this.offsetY[this._partFrames], 40, 40);
};
Sprite.prototype.__onContentReady = function() {
	if (this.ready()) return;
	foreach(this.pieces, function(piece){
		piece[0] = Honey.Resource.getImage(piece[0]);
	});
	this.ready(1);
	this.dirty();
	
	this.schedule([this.update, 1]);
};
	/*
	 *frames[i] = [
	 * [url1,url2,....],
	 * [
	 * 	[[id1,28,26,2,2,5,1],[],...],
	 *	[[id2,28,26,2,2,0,0.6]]
	 * ]
	 * [
	 * 	["60#20_3#300_0#5_0#90_30#50_0#0#2#80_50#50_50#02ffff3c_00000005#00ffff32_00000000#167_266",-35,33,0,10000],
	 * 	["60#20_3#300_0#5_0#90_30#50_0#0#2#80_50#50_50#02ffff3c_00000005#00ffff32_00000000#167_266",-35,33,0,10000]
	 * ],
	 * x,y,w,h,sum
	 *]
	 */
Sprite.prototype.content = function(frames) {
	this.configed = 1;
	this.ready(0);
	this.currentFrame = 0;
	this.playing = 1;
	this.frames = frames||[];
	this._reverse = 0;
	this.images = [];	//所有用到的图片
	this.pieces = [];	//所有用到的图片块
	this._particles = [];
	this._w = this._h = 1;
	//偏移值
	this.offset = [0, 0];
	
	var _ready = 1;
	if (!frames) return;
	var a = frames;
	this.offset = [a[3], a[4]];
	this.width(a[5]);
	this.height(a[6]);
	this.frameLength = a[7];
	this.frameDelay = a[8]||1;
	
	//统计图片
	foreach.call(this, a[0], function(piece, i){
		this.pieces.push(piece.concat());
		if (this.images.indexOf(piece[0]) < 0) this.images.push(piece[0]);
	});
	/*
	//替换粒子
	for (var j=0; j<a[1].length; ++j) {
		for (var k=0; k<a[1][j].length; ++k) {
			if (typeof a[1][j][k][0] == 'string') {
				a[1][j][k][0] = new Honey.Particle(AniM.Pars[a[1][j][k][0]] || a[1][j][k][0]);
			}
		}
	}
	*/
	/*
	//粒子发射器
	for (var n=0; n<a[2].length; ++n) {
		var pe = new ParticleEmitter();
		var b = a[2][n];
		pe.decode(b[0]);
		pe.x = b[1];
		pe.y = b[2];
		pe.startFrame = b[3];
		pe.endFrame = b[4];
		this._particles[n] = pe;
	}
	*/
	//加载图片
	Honey.Resource.loadImages(this.images, this, this.__onContentReady);
};
})();
/**
 * DirtyRect 脏矩形
 * @author Rhine
 * @version 2013-10-24
 */
(function(){

function DirtyRects(body) {
	this.rects = [];
	this.fullScreen = 0;	//整个屏幕是脏矩形
};
Honey.DirtyRects = DirtyRects;

/**
 * 添加一个脏矩形
 */
DirtyRects.prototype.add = function(ele) {
	if (this.rects.length >= 20 || ele.fullScreen) {
		this.fullScreen = 1;
		this.rects = [new Rect(Honey.body)];
		return;
	}
	var newRect = new Rect(ele);
	var rect = foreach (this.rects, function(rect) {
		if (rect.checkRect(newRect)) return rect;
	});
	if (!rect) {
		this.rects.push(newRect);
	} else {
		var range1 = rect.range;
		var range2 = newRect.range;
		rect.range = __range(range1[0], range1[1], range2[0], range2[1]);
	}
};

/**
 * 清除脏矩形
 */
DirtyRects.prototype.clean = function() {
	this.rects = [];
	this.fullScreen = 0;
};

/**
 * make rects on context
 */
DirtyRects.prototype.rect = function(context) {
	foreach (this.rects, function(rect) {
		rect.rect(context);
	});
};


/**
 * 判断元素是否在脏矩形里
 */
DirtyRects.prototype.check = function(ele) {
	var mtx = ele.Matrix.clone(), width = ele.width(), height = ele.height();
	while (ele = ele.parentNode) {
		mtx.translate(ele._sx, ele._sy);
		mtx.concat(ele.Matrix);
	}
	return foreach (this.rects, function(rect) {
		if (rect.check(mtx.coordinate(0, 0), mtx.coordinate(width, 0), mtx.coordinate(width, height), mtx.coordinate(0, height))) return rect;
	});
};

/**
 * a Rect contains two vertices' coordinates
 */
function Rect(ele) {
	this.range = [[0, 0], [0, 0]];	//minX, minY, maxX, maxY
	ele && this.transform(ele);
};
Honey.Rect = Rect;
/**
 * transform matrix to coordinates
 */
Rect.prototype.transform = function(ele) {
	var mtx = ele.Matrix.clone(), width = ele.width(), height = ele.height();
	while (ele = ele.parentNode) {
		mtx.translate(ele._sx, ele._sy);
		mtx.concat(ele.Matrix);
	}
	this.range = __range(mtx.coordinate(0, 0), mtx.coordinate(width, 0), mtx.coordinate(width, height), mtx.coordinate(0, height));
};

/**
 * make a rect on context
 */
Rect.prototype.rect = function(context) {
	context.rect(this.range[0][0]-1, this.range[0][1]-1, this.range[1][0]-this.range[0][0]+2, this.range[1][1]-this.range[0][1]+2);
};

/**
 * 判断两个矩形是否相交
 */
Rect.prototype.check = function(a, b, c, d) {
	var range1 = __range(a, b, c, d);
	var range2 = this.range;
	var range3 = __range(range1[0], range1[1], range2[0], range2[1]);
	var w1 = range1[1][0] - range1[0][0], w2 = range2[1][0] - range2[0][0], w3 = range3[1][0] - range3[0][0];
	var h1 = range1[1][1] - range1[0][1], h2 = range2[1][1] - range2[0][1], h3 = range3[1][1] - range3[0][1];
	if (w1 + w2 >= w3 && h1 + h2 >= h3) return 1;
};
Rect.prototype.checkRect = function(rect) {
	var range1 = rect.range;
	var range2 = this.range;
	var range3 = __range(range1[0], range1[1], range2[0], range2[1]);
	var w1 = range1[1][0] - range1[0][0], w2 = range2[1][0] - range2[0][0], w3 = range3[1][0] - range3[0][0];
	var h1 = range1[1][1] - range1[0][1], h2 = range2[1][1] - range2[0][1], h3 = range3[1][1] - range3[0][1];
	if (w1 + w2 >= w3 && h1 + h2 >= h3) return 1;
};

/**
 * 字符串化
 */
Rect.prototype.toString = function() {
	return "Rect("+this.range[0][0]+","+this.range[0][1]+","+this.range[1][1]+","+this.range[1][1]+")";
};

/**
 * find out the range of coordinates
 */
function __range(a, b, c, d) {
	return [
		[
			Math.min(a[0], b[0], c[0], d[0]),
			Math.min(a[1], b[1], c[1], d[1]),
		],
		[
			Math.max(a[0], b[0], c[0], d[0]),
			Math.max(a[1], b[1], c[1], d[1]),
		],
	];
};

})();
/**
 * Body 主体
 * @author Rhine
 * @version 2013-10-25
 */
(function(){
function Body(canvas, attr, style, events) {
	if (!canvas) throw Error("Create Body without a canvas!");
	
	this.fps(50);
	this.fpsShow = 50;
	this._fpsCounter = 0;
	this.dirtyShow = 0;
	this._dirtyCounter = 0;
	this.useDirty = 0;
	this.fullScreen = 1;
	
	Honey.Node.call(this, attr, style, events);
	
	this.tag = "Body";
	this.ready(0);
	this._canvas = canvas;
	this.context = canvas.getContext("2d");
	this.width(canvas.width);
	this.height(canvas.height);
	
	this.DirtyRects = new Honey.DirtyRects(this);
	this.ready(1);
	
	//注册事件
	var _this = this;
	if (!isMobile()) {
		MouseEvent.regEvent(canvas, "mousedown", function(x, y, evt){
			x /= Honey.ScaleRate;
			y /= Honey.ScaleRate;
			EventM.trigger("onmousedown", [_this, x, y, evt]);
		});
		MouseEvent.regEvent(canvas, "mouseup", function(x, y, evt){
			x /= Honey.ScaleRate;
			y /= Honey.ScaleRate;
			EventM.trigger("onmouseup", [_this, x, y, evt]);
		});
		MouseEvent.regEvent(canvas, "mousemove", function(x, y, evt){
			x /= Honey.ScaleRate;
			y /= Honey.ScaleRate;
			EventM.trigger("onmousemove", [_this, x, y, evt]);
		});
		MouseEvent.regEvent(canvas, "mouseout", function(x, y, evt){
			x /= Honey.ScaleRate;
			y /= Honey.ScaleRate;
			EventM.trigger("onmouseout", [_this, x, y, evt]);
		});
	} else {
		TouchEvent.regEvent(canvas, "touchstart", function(x, y, evt){
			x /= Honey.ScaleRate;
			y /= Honey.ScaleRate;
			EventM.trigger("onmousedown", [_this, x, y, evt]);
		});
		TouchEvent.regEvent(canvas, "touchend", function(x, y, evt){
			x /= Honey.ScaleRate;
			y /= Honey.ScaleRate;
			EventM.trigger("onmouseup", [_this, x, y, evt]);
		});
		TouchEvent.regEvent(canvas, "touchmove", function(x, y, evt){
			x /= Honey.ScaleRate;
			y /= Honey.ScaleRate;
			EventM.trigger("onmousemove", [_this, x, y, evt]);
		});
		TouchEvent.regEvent(canvas, "touchcancel", function(x, y, evt){
			x /= Honey.ScaleRate;
			y /= Honey.ScaleRate;
			EventM.trigger("onmouseout", [_this, x, y, evt]);
		});
	}
	
	this._schedules = {};
	
	this._onScreen = 1;
	
	//this.__loop();
	/*采用setInterval回调方式执行循环*/
	var body = this;
	setInterval(function(){
		body.__loop();
	}, this._fpsSpan);
};
Honey.inherit(Body, Honey.Node);
Honey.Body = Body;
/**
 * body的主循环
 */
Body.prototype.__loop = function() {
	if (this != Honey.body) return;	//此处为了更好的适应多body的情况
	
	var now = new Date().getTime(), span = now - this._lastLoopTime;
	if (!this._lastLoopTime) span = 0;
	this._lastLoopTime = now;
	
	//this.context.clearRect(0,0,this.width(),this.height());
//try {
	this.__schedule(span);
/*} catch(e) {
	console.log("schedule : ", e);
	alert("schedule : "+e);
}*/
//try {
	this.context.save();
	//if (this.DirtyRects.rects.length) this.context.clearRect(0,0,this.width(),this.height());
	if (this.useDirty) this.clipDirtyRects();
	if (!this.useDirty || this.DirtyRects.rects.length) this.__draw(this.context, this.DirtyRects);
/*} catch(e) {
	alert("draw : "+e);
	//console.log("draw : ", e);
}*/
	this.context.restore();
	this.__fps(now);
	
	this.DirtyRects.clean();
	/*采用setTimeout回调方式执行循环
	var body = this;
	setTimeout(function(){
		body.__loop();
	}, this._fpsSpan);
	*/
};
/**
 * 帧数设置
 */
Body.prototype.fps = function(num) {
	if (num) {
		this._fps = num;
		this._fpsSpan = ~~(1000/num);
	}
	return this._fps;
};
/**
 * 帧数统计
 */
Body.prototype.__fps = function(now) {
	if (!this._fpsTime) this._fpsTime = now;
	++this._fpsCounter;
	this._dirtyCounter += this.DirtyRects.rects.length;
	if (now - this._fpsTime > 1000) {
		this.fpsShow = this._fpsCounter;
		this._fpsTime = now;
		this._fpsCounter = 0;
		this.dirtyShow = this._dirtyCounter;//(this._dirtyCounter/this.fpsShow).toFixed(2);
		this._dirtyCounter = 0;
	}
};
/**
 * 脏矩形
 */
Body.prototype.clipDirtyRects = function() {
	this.addDiryRect(this.DirtyRects);
	if (this.DirtyRects.rects.length) {
		var context = this.context;
		context.beginPath();
		this.DirtyRects.rect(context);
		context.closePath();
		//context.stroke();
		if (this.DirtyRects.rects.length) context.clip();
		//console.log(this.DirtyRects.fullScreen, this.DirtyRects.rects);
	}
};
/**
 * 添加定时任务
 */
Body.prototype.schedule = function(element/*, func, cycle, arg*/) {
	this._schedules[element.id] = element;
	//this._schedules[element.id] = [element, func, cycle*10, 0, arg];
};
/**
 * 删除定时任务
 */
Body.prototype.unschedule = function(element) {
	delete this._schedules[element.id];
};
/**
 * 执行定时任务
 */
Body.prototype.__schedule = function(span) {
	var flag = 0;
	foreach (this._schedules, function(ele){
		if (ele.__schedule(span)) ++flag;
	});
	if (flag) this.__schedule(0);	//进行循环补偿
	
	/*
	for (var i in this._schedules) {
		var s = this._schedules[i];
		s[3] += span;
		if (s[3] >= s[2]*100) s[3] = s[2];
		while (s[3] >= s[2]) {
			s[3] -= s[2];
			s[1].call(s[0], s[4]);
		}
	}
	*/
};
})();
/**
 * Audio 音频
 * @author Rhine
 * @version 2013-10-29
 */
(function(){

function Audio(src) {
	this.audio = new window.Audio();
	console.log(this.audio);
	if (src) this.audio.src = src;
};
Honey.Audio = Audio;

Audio.prototype.autoplay = function() {
	this.audio.autoplay = true;
	return this;
};
Audio.prototype.loop = function() {
	this.audio.loop = true;
	return this;
};
Audio.prototype.pause = function() {
	this.audio.pause();
	return this;
};
Audio.prototype.play = function() {
	this.audio.play();
	return this;
};
Audio.prototype.restart = function() {
	this.audio.currentTime = 0;
	this.audio.play();
	return this;
};

})();
(function(){
	var KeyEvent = {
		keydown : {},
		keyup : {},
		states : {},	//用来记录按键状态
	};
	var KeyCodes = {
		LEFT : 37,
		UP : 38,
		RIGHT : 39,
		DOWN : 40,
		BACKSPACE : 8,
		ENTER : 13,
		SPACE : 32,
	};
	//监听整个document的keydown,keyup事件，为了保证能够监听到，监听方式使用Capture
	document.addEventListener("keydown", function(evt){
		//按下某按键，该键状态为true
		var code = evt.keyCode;
		KeyEvent.states[code] = true;
		if (KeyEvent.keydown[code]) {
			for (var i=0; i<KeyEvent.keydown[code].length; ++i) {
				KeyEvent.keydown[code][i]( evt );
			}
		}
	}, true);
	document.addEventListener("keyup", function(evt){
		//放开下某按键，该键状态为false
		var code = evt.keyCode;
		KeyEvent.states[code] = false;
		if (KeyEvent.keyup[code]) {
			for (var i=0; i<KeyEvent.keyup[code].length; ++i) {
				KeyEvent.keyup[code][i]( evt );
			}
		}
	}, true);
	
	KeyEvent.regEvent = function(type, key, func) {
		if (typeof key == "string") key = KeyCodes[key] || key.charCodeAt();
		if (!this[type][key]) this[type][key] = [];
		this[type][key].push(func);
		return this[type][key].length-1;
	}
	KeyEvent.rmEvent = function(type, key, index) {
		this[type][KeyCodes[key]].slice(index, 1);
	}
	KeyEvent.checkState = function(key) {
		return this.states[KeyCodes[key]];
	}
	
	window.KeyEvent = KeyEvent;
})();

(function(){
	var MouseEvent = {
		//mousedown, mouseup, mousemove
		regEvent : function(element, type, func) {
			var left = element.offsetLeft, top = element.offsetTop;
			var ele = element;
			while (ele = ele.offsetParent) {
				left += ele.offsetLeft;
				top += ele.offsetTop;
			}
			element.addEventListener(type, function(evt){
				func(evt.pageX-left, evt.pageY-top, evt);
				evt.preventDefault();
				evt.stopPropagation();
			}, false);
		},
	};
	window.MouseEvent = MouseEvent;
})();

(function(){
	var TouchEvent = {
		//touchstart, touchmove, touchend, touchcancel
		regEvent : function(element, type, func) {
			var left = element.offsetLeft, top = element.offsetTop;
			var ele = element;
			while (ele = ele.offsetParent) {
				left += ele.offsetLeft;
				top += ele.offsetTop;
			}
			element.addEventListener(type, function(evt){
				var touch = evt.touches && evt.touches.length ? evt.touches[0] : (evt.changedTouches&&evt.changedTouches.length?evt.changedTouches[0]:null);
				var x = touch.pageX||touch.clientX||touch.screenX, y = touch.pageY||touch.clientY||touch.screenY;
				func(x-left, y-top, evt);
				if (type != "touchstart") evt.preventDefault();		//不能取消默认事件，会导致输入框控件填写时出问题
				evt.stopPropagation();
			}, false);
		},
	};
	window.TouchEvent = TouchEvent;
})();

(function(){
	var xys = [], events = [];
	
	var SlideEvent = {
		init : function(){
			function _start(x, y) {
				xys = [[x, y]];
			}
			MouseEvent.regEvent(document, "mousedown", _start);
			TouchEvent.regEvent(document, "touchstart", _start);
			
			function _move(x, y) {
				if (!xys.length) return;
				for (var i=0; i<events.length; ++i) {
					events[i].move && events[i].move(x-xys[0][0], y-xys[0][1]);
				}
				xys.push([x, y]);
			}
			MouseEvent.regEvent(document, "mousemove", _move);
			TouchEvent.regEvent(document, "touchmove", _move);
			
			function _end(x, y){
				if (!xys.length) return;
				for (var i=0; i<events.length; ++i) {
					events[i].end && events[i].end(x-xys[0][0], y-xys[0][1]);
				}
				xys = [];
			}
			MouseEvent.regEvent(document, "mouseup", _end);
			MouseEvent.regEvent(document, "mouseout", _end);
			TouchEvent.regEvent(document, "touchend", _end);
			
			delete this.init;
		},
		regEvent : function(move,end) {
			if (this.init) this.init();
			events.push({move:move,end:end});
		},
	};
	window.SlideEvent = SlideEvent;
})();

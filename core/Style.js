/**
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
	if (className instanceof window.Array) {
		foreach.call(this, className, function(name) {
			this.attach(name);
		});
	} else {
		if (!Honey.Styles[className]) {
			Honey.trace("Style attaches an undefined class:", className);
			return;
		}
		this.set(Honey.Styles[className]);
	}
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
Style.prototype.bgImage = Style.prototype.setBgImage = function(image) {
	if (typeof image == "object") {
		this._bgImage = image.concat();
	} else if (typeof image == "string") {
		this._bgImage = [image, 0, 0, 0, 0];
	} else {
		this._bgImage = null;
	}
	if (this._bgImage) {
		Honey.Resource.loadImage(this._bgImage[0], this, function(url, img, mark){
			this._bgImage[0] = img;
			if (!this._bgImage[3] || !this._bgImage[4]) {
				this._bgImage[3] = img.width;
				this._bgImage[4] = img.height;
			}
			this.element.dirty();
		});
	}
};
Style.prototype.__drawBgImage = function(context, rects) {
	if (!this._bgImage || typeof this._bgImage[0] != "object") return;
	var w = this.element.width(), h = this.element.height();
	var bg = this._bgImage;
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

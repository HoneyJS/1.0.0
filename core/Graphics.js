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

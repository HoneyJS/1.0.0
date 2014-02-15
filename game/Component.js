/**
 * Component 一些扩展的元素控件
 * @author Rhine
 * @version 2013-11-11
 */
(function(){
/**
 * 条
 */
function Bar() {
	this._percent = 100;
	Honey.Node.apply(this, arguments);
	
	this.tag = "Bar";
	this.alignChild(Define.Const.Align_CC);
	// 前景图片
	this.add(Define.Element.Image, {name:"front_l", alignParent:Define.Const.Align_NC});
	this.add(Define.Element.Image, {name:"front_m", alignParent:Define.Const.Align_NC});
	this.add(Define.Element.Image, {name:"front_r", alignParent:Define.Const.Align_NC});
	this.__front();
	this.__percent();
	// 文字显示
	this.add(Define.Element.LineText, {name:"info", text:this._text, z:1}, this._textStyle||Honey.Styles.BarText);
};
Honey.inherit(Bar, Honey.Node);
Honey.Bar = Bar;
Define.Element.Bar = "Bar";

/**
 * 设置百分比
 */
Bar.prototype.content = Bar.prototype.percent = getset("_percent", function() {
	this.__percent();
	this.dirty();
});
/**
 * 设置前景（进度条）
 */
Bar.prototype.front = getset("_front", function() {
	if (this.front_l) this.__front();
});
Bar.prototype.__front = function() {
	if (!this._front) return;
	var image = this._front[0], left = this._front[1]||0, right = this._front[2]||left, middle = image[3]-left-right;
	this.front_l.image([image[0], image[1], image[2], left, image[4]]);
	this.front_m.image([image[0], image[1]+left, image[2], middle, image[4]]);
	this.front_r.image([image[0], image[1]+left+middle, image[2], right, image[4]]);
};
Bar.prototype.__percent = function() {
	if (this._front && this.front_l) {
		var image = this._front[0], left = this._front[1]||0, right = this._front[2]||left, middle = image[3]-left-right;
		var wRate = this.width()/image[3];
		middle = middle*this._percent/100;
		this.front_l.size(left*wRate, this.height());
		this.front_m.size(~~(middle*wRate)||1, this.height());
		this.front_m.x(this.front_l.x()+this.front_l.width());
		this.front_r.size(right*wRate, this.height());
		this.front_r.x(this.front_m.x()+this.front_m.width());
	}
};
/**
 * 设置文字显示
 */
Bar.prototype.text = getset("_text", function(text) {
	if (this.info) this.info.text(this._text);
});
Bar.prototype.textStyle = getset("_textStyle", function(style) {
	if (this.info) this.info.Style.set(this._textStyle);
});
/**
 * 绘制
 */
Bar.prototype.draw = function(context, rects) {
	if (!this._front) context.fillRect(1, 1, (this.width()-2)*this._percent/100, this.height()-2);
};
})();

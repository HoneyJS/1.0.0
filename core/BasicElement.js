/**
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
Image.prototype.content = Image.prototype.image = function(image) {
	if (image)this.ready(0);
	if (!image) {
		this._image = null;
		this._width = this._height = 0;
	} else if (typeof image == "object") {
		this._image = image.concat();
		this._width = image[3];
		this._height = image[4];
		Honey.Resource.loadImage(this._image[0], this, this.__onImageReady);
	} else if (typeof image == "string") {
		this._image = [image,0,0,0,0];
		this._width = this._height = 0;
		Honey.Resource.loadImage(this._image[0], this, this.__onImageReady);
	}
};
Image.prototype.__onImageReady = function(src, img, mark) {
	if (!this._image || this._image[0] != src) return;
	this.ready(1);
	this._image[0] = img;
	if (!this._image[3] || !this._image[4]) {
		this._width = this._image[3] = img.width;
		this._height = this._image[4] = img.height;
	}
	this.alignParent();
};

Image.prototype.draw = function(context, rects) {
	this._image && context.drawImage(this._image[0], this._image[1], this._image[2], this._image[3], this._image[4], 0, 0, this.width(), this.height());
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
LineText.prototype.content = LineText.prototype.text = function(text) {
	this.dirty();
	if (text != undefined) {
		this._text = text+"";
		this._width = Honey.Graphics.textWidth(this._text, this.Style);
		this.align();
	} else {
		this._text = null;
		this._width = 0;
	}
	this.alignParent();
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
 * 单行输入控件
 */
function Input() {
	Honey.LineText.apply(this, arguments);
	
	this.tag = "Input";
	this.clickBreak = 1;
	
	Honey.Input.createDOM.call(this);
	Honey.Input.initDOM.call(this);
	this.Events.onclick = Honey.Input.onclick;
	this.DOM.onblur = Honey.Input.onblur;
};
Honey.inherit(Input, Honey.LineText);
Honey.Input = Input;

Input.createDOM = function() {
	this.DOM = document.createElement("input");
	this.DOM.type = "text";
};
Input.initDOM = function() {
	this.DOM.Element = this;
	this.DOM.style.position = "absolute";
	this.DOM.style.display = "none";
	this.DOM.style.padding = 0;
	this.DOM.style.margin = 0;
	this.DOM.style.border = 0;
};
Input.onclick = function() {
	document.body.appendChild(this.DOM);
	//获取Input相对于画布的宽高坐标，设置DOM
	var rect = this.rangeToWindow();
	this.DOM.style.left = rect[0]+"px";
	this.DOM.style.top = rect[1]+"px";
	this.DOM.style.width = rect[2]+"px";
	this.DOM.style.height = rect[3]+"px";
	//设置style
	this.DOM.style.color = this.Style.color;
	this.DOM.style.fontSize = ~~(this.Style.fontSize*Honey.ScaleRate)+"px";
	this.DOM.style.backgroundColor = this.Style.bgColor;
	//移到页面中并获焦
	this.DOM.style.display = '';
	this.DOM.focus();
	this.DOM.click();
};
Input.onblur = function(event) {
	//移出页面
	event.preventDefault();
	event.stopPropagation();
	this.style.display = 'none';
	this.Element.text(this.value);
	this.Element.onChange && this.Element.onChange(this.value);
};
Input.prototype.getValue = function() {
	return this.DOM.value;
};
Input.prototype.setValue = function(value) {
	this.text(this.DOM.value = value);
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
Text.prototype.content = Text.prototype.text = function(texts) {
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
	this.alignParent();
};
/**
 * 拆分到不同行和颜色
 */
Text.prototype.split = function() {
	var x = 0, y = 0, w1 = 0, w2 = 0, h = this.Style.lineHeight || this.Style.fontSize, text, color, width = this.width();
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
 * 多行输入控件
 */
function TextArea() {
	Honey.Text.apply(this, arguments);
	
	this.tag = "TextArea";
	this.clickBreak = 1;
	
	Honey.TextArea.createDOM.call(this);
	Honey.Input.initDOM.call(this);
	this.Events.onclick = Honey.Input.onclick;
	this.DOM.onblur = Honey.Input.onblur;
};
Honey.inherit(TextArea, Honey.Text);
Honey.TextArea = TextArea;

TextArea.createDOM = function() {
	this.DOM = document.createElement("textarea");
};
TextArea.prototype.getValue = function() {
	return this.DOM.innerHTML;
};
TextArea.prototype.setValue = function(value) {
	this.text(this.DOM.innerHTML = value);
};

/**
 * 按钮元素
 */
function Button() {
	this._state = null;	//按钮的三个状态：弹起，按下，禁用(up,down,unusable)
	this._backs = {};
	this._front = null;	//前部
	this._back = null;	//后部（目前设定为：切换状态时只改变后部）
	Honey.Node.apply(this, arguments);
	
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
	if (!this._state) this.state("up");
};
Honey.inherit(Button, Honey.Node);
Honey.Button = Button;

//设置内容（命令）
Button.prototype.content = Button.prototype.command = function(onclick) {
	this.Events.set({onclick:onclick});
};
//设置前部
Button.prototype.front = getset("_front", function(){
	this._front = this.add(this._front);
	this.alignParent();
});
//设置所有状态的后部
Button.prototype.backs = getset("_backs", function(){
	var backs = {};
	foreach.call(this, this._backs, function(back, type){
		backs[type] = this.add(back);
	});
	this._backs = backs;
	this.alignParent();
});
//切换状态
Button.prototype.state = getset("_state", function() {
	this.clearChildren();
	this._back = this._backs[this._state] || this._backs.up;
	if (this._back) this.add(this._back);
	if (this._front) {
		this.add(this._front);
	}
});
//特殊按钮按下操作
Button.prototype.__buttonDown = function() {
	if (!this._backs.down && !this._buttonDown) {	//未设置按下图片则进行偏移操作
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

/**
 * 复选框元素
 */
function CheckBox() {
	this._states = [];
	this._checks = {};
	Honey.Node.apply(this, arguments);
	
	this.tag = "CheckBox";
	this.clickBreak = 1;
	this.Events.set({
		onclick : this.switchState,
	});
	if (this._selected == undefined) this.selected(0);
};
Honey.inherit(CheckBox, Honey.Node);
Honey.CheckBox = CheckBox;

//获得|设置合集
CheckBox.prototype.checks = getset("_checks");
//获得|设置值
CheckBox.prototype.value = getset("_value");
//切换状态
CheckBox.prototype.switchState = function() {
	this.selected(1 - this._selected);
};
CheckBox.prototype.selected = getset("_selected", function() {
	this._selected = (this._selected ? 1 : 0);
	this.clearChildren();
	if (this._states[this._selected]) a = this.add(this._states[this._selected]);
	if (this._selected)
		this._checks[this.id] = this._value;
	else
		delete this._checks[this.id];
	if (this.onChange) this.onChange(this._selected);
});
//设置内容
CheckBox.prototype.content = CheckBox.prototype.states = getset("_states", function(){
	var states = [];
	foreach.call(this, this._states, function(state){
		states.push(this.add(state));
	});
	this._states = states;
});

/**
 * 单选框元素
 */
function Radio() {
	this._radios = [];
	Honey.CheckBox.apply(this, arguments);
	
	this.tag = "Radio";
};
Honey.inherit(Radio, Honey.CheckBox);
Honey.Radio = Radio;

//获得|设置单选框合集
Radio.prototype.radios = getset("_radios", function() {
	if (this._radios.indexOf(this) == -1) this._radios.push(this);
});
//切换状态（只能被切换）
Radio.prototype.switchState = function() {
	foreach.call(this, this._radios, function(radio) {
		if (radio != this) {
			radio.selected(0);
		}
	}, 1);
	this.selected(1);
	this._radios[0] = this._value;
};

})();

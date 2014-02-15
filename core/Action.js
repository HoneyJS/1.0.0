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
 * 旋转动作
 */
Action.RotateTo = function(duration, r) {
	return Action.Create(duration, {RotateTo:r});
};
Action.prototype.RotateTo = function(ele) {
	if (this.start.RotateTo == null) this.start.RotateTo = ele.Matrix.r;
	var r = this.start.RotateTo, _r = this.end.RotateTo;
	var rate = this.counter / this.duration;
	if (rate >= 1) {
		ele.rotate(_r);
	} else {
		ele.rotate(r+(_r-r)*rate);
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
/**
 * 滚动动作
 */
Action.ScrollTo = function(duration, sx, sy) {
	return Action.Create(duration, {ScrollTo:[sx, sy]});
};
Action.prototype.ScrollTo = function(ele) {
	if (this.start.ScrollTo == null) this.start.ScrollTo = [ele.sx(), ele.sy()];
	var start = this.start.ScrollTo, end = this.end.ScrollTo;
	var x = start[0], y = start[1];
	var _x = end[0], _y = end[1];
	var rate = this.counter / this.duration;
	if (rate >= 1) {
		ele.sx(_x);
		ele.sy(_y);
	} else {
		ele.sx(x+(_x-x)*rate);
		ele.sy(y+(_y-y)*rate);
	}
};
})();

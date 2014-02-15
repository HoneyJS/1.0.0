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
	this.Matrix = new Honey.Matrix();
	this.Events = new Honey.Events(events);
	this._z = 0;
	this._ready = 1;
	this._dirty = 0;
	this._onScreen = 0;
	this._sx = this._sy = 0;	//scrollXY
	this._schedule = [];
	this._actions = [];
	
	this.Style.set(style);
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
	if (!this.$body() || !this.$body().useDirty) return;
	if (this.isDirty) return;
	this.isDirty = 1;
	if (!this.display() || this.isOut()) return;
	this.$body().DirtyRects.add(this);
}
Element.prototype.clean = function() {
	this.isDirty = 0;
}

/**
 * 获取元素所属的body
 */
Element.prototype.$body = function() {
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
	if (this.$body() && this.$body().useDirty && !this.isDirty && !rects.check(this)) return;
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
		this.alignChildren && this.alignChildren();
	}
	return this.Style.width || this._width || 0;
};
Element.prototype.height = function(height) {
	if (height != undefined) {
		height = parseInt(height);
		this.dirty();
		this.Style.height = height;
		this.alignChildren && this.alignChildren();
	}
	return this.Style.height || this._height || 0;
};
Element.prototype.size = function(w, h) {
	if (typeof w == "object") {
		h = w[1];
		w = w[0];
	}
	this.width(w);
	this.height(h);
};
/**
 * 获取内容的宽高(继承类可以重写)
 */
Element.prototype.getContentWidth = function() {
	return this._width || 0;
};
Element.prototype.getContentHeight = function() {
	return this._height || 0;
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
 * 相对于window范围
 */
Element.prototype.rangeToWindow = function() {
	var rect = new Honey.Rect(this);
	var x = rect.range[0][0], y = rect.range[0][1], w = rect.range[1][0]-x, h = rect.range[1][1]-y;
	x *= Honey.ScaleRate;
	y *= Honey.ScaleRate;
	w *= Honey.ScaleRate;
	h *= Honey.ScaleRate;
	var xy = Honey.body.xyToWindow();
	return [~~(x-xy[0]), ~~(y-xy[1]), ~~w, ~~h];
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
	this._onScreen && this.$body().schedule(this/*, info[0], info[1], info[2]*/);
};
Element.prototype.unschedule = function(func) {
	foreach(this._schedule, function(s, i, arr){
		if (s[0] === func) {
			arr.splice(i, 1);
			return 1;
		}
	});
	if (!this._schedule.length && this._onScreen) this.$body().unschedule(this);
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
 * 对齐方式
 */
Element.prototype.alignParent = function(align) {
	if (align != undefined) {
		this._alignParent = align;
	} else if (this._alignParent != undefined) {
		align = this._alignParent;
	} else if (this.parentNode && this.parentNode.alignChild() != undefined) {
		align = this.parentNode.alignChild();
	}
	if (align != undefined && this.parentNode) {
		if ((align&0x0f) == Define.Const.Align_Left) {
			//x左对齐
			this.x(0);
		} else if ((align&0x0f) == Define.Const.Align_Center) {
			//x中对齐
			this.x((this.parentNode.width()-this.width())/2);
		} else if ((align&0x0f) == Define.Const.Align_Right) {
			//x右对齐
			this.x(this.parentNode.width()-this.width());
		}
		align = align >> 4;
		if (align == Define.Const.Align_Top) {
			//y上对齐
			this.y(0);
		} else if (align == Define.Const.Align_Center) {
			//y中对齐
			this.y((this.parentNode.height()-this.height())/2);
		} else if (align == Define.Const.Align_Bottom) {
			//y下对齐
			this.y(this.parentNode.height()-this.height());
		}
	}
};

/**
 * 被移除
 */
Element.prototype.removed = function() {
	if (this.parentNode) this.parentNode.removeChild(this);
};

/**
 * 出入屏幕
 */
Element.prototype.onScreen = function() {
	this._onScreen = 1;
	this._schedule.length && this.$body().schedule(this/*, this._schedule[0], this._schedule[1], this._schedule[2]*/);
	if (this.children) {
		foreach(this.children, function(child){
			child.onScreen();
		});
	}
};
Element.prototype.outScreen = function() {
	this._onScreen = 0;
	this._schedule.length && this.$body() && this.$body().unschedule(this);
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
Element.prototype.sx = getset("_sx", function(){
	this.dirty();
});
Element.prototype.sy = getset("_sy", function(){
	this.dirty();
});
Element.prototype.scroll = function(dx, dy) {
	if (!dx && !dy) return;
	if (typeof dx == "object") {
		dy = dx[1];
		dx = dx[0];
	}
	this.dirty();
	//只能水平移
	if (this.scrollable & Define.Const.ScrollX) {
		this._sx += dx;
	}
	//只能竖直移
	if (this.scrollable & Define.Const.ScrollY) {
		this._sy += dy;
	}
	if (this.Events.onscroll) this.Events.onscroll.call(this, dx, dy);
};
//滚动结束后判断边界
Element.prototype.afterScroll = function() {
	//不能超过边界
	var _w = this.width(), _h = this.height();
	var _cw = this.getContentWidth(), _ch = this.getContentHeight();
	var _sx = this._sx, _sy = this._sy;
	if (_sx > 0) _sx = 0;
	else if (_sx < 0 && _sx + _cw < _w) _sx = Math.min(_w - _cw, 0);
	if (_sy > 0) _sy = 0;
	else if (_sy < 0 && _sy + _ch < _h) _sy = Math.min(_h - _ch, 0);
	
	if (_sx != this._sx || _sy != this._sy)
		this.addAction([Honey.Action.ScrollTo(300, _sx, _sy)]);
};

/**
 * Action动作
 * actions传入数组，里面元素可以是Action对象，也可以是函数
 */
Element.prototype.addAction = function(actions, times) {
	if (!this._actions.length) this.schedule([this.__action, 3]);
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
	if (!this._actions.length) this.unschedule(this.__action);
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
				this.removeAction(arr[3]);
				//actions.splice(actions.indexOf(arr), 1);
			}
		}
	});
};

/**
 * 观察变化(设计思想取自于AngularJS)
 */
Element.prototype.$watch = function(args) {
	var key = args[0], callback = args[1];
	Honey.$watch(key, this, callback);
};
})();

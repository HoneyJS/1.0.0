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
try {
	this.__schedule(span);
} catch(e) {
	console.log("schedule : ", e);
	alert("schedule : "+e);
}
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

/**
 * 相对于window坐标
 */
Body.prototype.xyToWindow = function() {
	var ele = this._canvas;
	var x = ele.offsetLeft, y = ele.offsetTop;
	while (ele = ele.offsetParent) {
		x += ele.offsetLeft;
		y += ele.offsetTop;
	}
	return [x, y];
};
})();

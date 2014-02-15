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
var elements = [], startX = 0, startY = 0, focusMoved = null;
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
	focusMoved = null;
	if (ele.pointIsOut(x, y)) return ele.clickMask;
	if (ele.children) {
		if (forback(ele.children, function(ele, i){
			if (ele.display()) return __onmousedown(ele, x, y, evt);
		})) {
			elements.push(ele);
			return 1;
		}
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
		if (!focusMoved && ele.Events.onclick && ele.Events.onclick.call(ele, x, y, evt)) return 1;
		if (ele.clickBreak) return 1;
	});
	elements = [];
	if (focusMoved) focusMoved.afterScroll();
};
function __onmouseout(x, y, evt) {
	foreach(elements, function(ele){
		ele.Events.onmouseout && ele.Events.onmouseout.call(ele);
	});
	elements = [];
	if (focusMoved) focusMoved.afterScroll();
};
function __onmousemove(x, y, dx, dy, evt) {
	foreach(elements, function(ele){
		if (ele.Events.onmousemove && ele.Events.onmousemove.call(ele, x, y, dx, dy, evt)) return 1;
		if (ele.scrollable) {
			ele.scroll.call(ele, dx, dy, evt);
			//elements = [ele];
			focusMoved = ele;
			return 1;
		}
		if (ele.draggable) {
			ele.drag.call(ele, dx, dy, evt);
			elements = [ele];
			focusMoved = ele;
			return 1;
		}
		//if (ele.clickBreak) return 1;
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

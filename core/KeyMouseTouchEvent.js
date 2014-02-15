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
				if (type != "mousedown") evt.preventDefault();		//不能取消默认事件，会导致输入框控件填写时出问题
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

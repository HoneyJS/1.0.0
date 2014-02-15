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

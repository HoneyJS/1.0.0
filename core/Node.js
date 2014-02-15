/**
 * Node 节点
 * @author Rhine
 * @version 2013-10-24
 */
(function(){
	
function Node(attr, style, events) {
	this.children = [];
	Honey.Element.apply(this, arguments);
	
	this.tag = "Node";
};
Honey.inherit(Node, Honey.Element);
Honey.Node = Node;

//获取/设置内容
Node.prototype.content = Honey.Element.prototype.size;
/**
 * 返回带有指定 ID的子元素
 */
Node.prototype.getChildByName = function(name) {
	return foreach(this.children, function(child){
		if (child.name == name) return child;
	});
};
/**
 * 添加子元素（最终都要用这个接口）
 */
Node.prototype.appendChild = function(child) {
	if (this.children.indexOf(child) == -1) {
		child.removed();
		this.children.push(child);
		this.sort();
		if (child.name != null) this[child.name] = child;	//提供快捷索引
	}
	child.parentNode = this;
	child.dirty();
	this._onScreen && child.onScreen();
	//计算尺寸
	this._width = this._height = 0;
	foreach.call(this, this.children, function(child) {
		this._width = Math.max(child.x() + child.width(), this._width);
		this._height = Math.max(child.y() + child.height(), this._height);
	});
	//对齐
	child.alignParent();
	return child;
};
/**
 * 删除子元素（最终都要用这个接口）
 */
Node.prototype.removeChild = function(child) {
	child.dirty();
	var ind = this.children.indexOf(child);
	if (ind != -1) {
		this.children.splice(ind, 1);
		if (child.name != null && this[child.name] == child) delete this[child.name];
	}
	child.outScreen();
	child.parentNode = null;
	//计算尺寸
	this._width = this._height = 0;
	foreach.call(this, this.children, function(child) {
		this._width = Math.max(child.x() + child.width(), this._width);
		this._height = Math.max(child.y() + child.height(), this._height);
	});
	return child;
};
/**
 * 清空子元素
 */
Node.prototype.clearChildren = function() {
	forback.call(this, this.children, function(child){
		this.removeChild(child);
	});
};

/**
 * 添加子元素接口
 */
Node.prototype.add = function(type, name, x, y, content, attr, style, events) {
	//type, attr{name:,x:,y:,width:,height:,content:,..}, style
	//type, name, x, y, content, attr, style
	//element
	//[]
	if (type instanceof Array) {
		var re = [];
		foreach.call(this, arguments, function(arg){
			re.push(this.add.apply(this, arg));
		});
		return re;
	}
	if (type instanceof Honey.Element) {
		return this.appendChild(type);
	}
	var element = (typeof type == "function" ? type : Honey[type]);
	if (name instanceof Object) {
		attr = name;
		style = x;
		events = y;
	} else {
		if (!attr) attr = {};
		attr.name = name;
		attr.x = x;
		attr.y = y;
		attr.content = content;
	}
	return this.appendChild(new element(attr, style, events));
};
Node.prototype.addDiryRect = function(DirtyRects) {
	if (!this.display() || this.isOut()) return;
	if (this.isDirty) {
		DirtyRects.add(this);
	} else {
		foreach(this.children, function(child){
			child.addDiryRect(DirtyRects);
		});
	}
};
/**
 * 排序
 */
function zSort(a, b) {
	return a._z - b._z;
};

Node.prototype.sort = function() {
	this.children.sort(this.zSort||zSort);
};

/**
 * 子元素对齐方式
 */
Node.prototype.alignChild = getset("_alignChild", function(){
	this.alignChildren();
});
/**
 * 子元素对齐
 */
Node.prototype.alignChildren = function(){
	foreach.call(this, this.children, function(child){
		child.alignParent();
	});
};

})();
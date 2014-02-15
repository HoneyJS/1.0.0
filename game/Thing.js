/**
 * Thing(Object) 东西(物件)
 * @author Rhine
 * @version 2013-11-07
 */
(function(){

function Thing() {
	this._coordinate = [0, 0];
	//立足点偏移
	this._foothold = [0, -20];
	this._footholdXY = [0, 0];
	
	Honey.Node.apply(this, arguments);
	
	this.tag = "Thing";
};
Honey.inherit(Thing, Honey.Node);
Honey.Thing = Thing;

/**
 * 设置人物形象
 */
Thing.prototype.figure = function(figure) {
	//精灵
	if (!this.sprite) this.add("Sprite", {name:"sprite"});
	this.sprite.content(figure);
	//计算宽
	this.width(this.sprite.width());
	//计算高
	this.height(this.sprite.height());
};

Thing.prototype.foothold = getset("_foothold");
/**
 * 获取立足点
 */
Thing.prototype.getFoothold = function() {
	if (this.sprite) return [(this.sprite.x()+parseInt(this.sprite.width())/2)+this._foothold[0], this.sprite.y()+this.sprite.height()+this._foothold[1]];
	return this._foothold;
};
/**
 * 获取立足点对应xy
 */
Thing.prototype.getFootholdXY = function() {
	return this._footholdXY;
};
/**
 * 设置立足点对应xy
 */
Thing.prototype.setFootholdXY = function(xy) {
	this._footholdXY = xy;
	var foot = this.getFoothold();
	this.x(xy[0]-foot[0]);
	this.y(xy[1]-foot[1]);
};
/**
 * 设置xy对应立足点
 */
Thing.prototype.resetFootholdXY = function() {
	var foot = this.getFoothold();
	this._footholdXY = [this.x()+foot[0], this.y()+foot[1]];
};
/**
 * 坐标
 */
Thing.prototype.coordinate = getset("_coordinate");
})();

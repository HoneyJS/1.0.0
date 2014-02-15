/**
 * Cell 图块
 * @author Rhine
 * @version 2013-11-28
 */
(function(){
var Game = Smage.FruitHit;
function Cell() {
	this.classify = "white";
	this._coordinate = [0, 0];
	Honey.Element.apply(this, arguments);
	
	this.tag = "Cell";
	this.Style.set(Honey.Styles.FruitHit.Cell);
	this.content(this.classify);
};
Honey.inherit(Cell, Honey.Element);
Game.Cell = Cell;

Cell.prototype.content = function(classify) {
	this.dirty();
	this.classify = classify;
	this.Style.color = Smage.FruitHit.Define.CellColor[this.classify] || this.classify;
};
Cell.prototype.draw = function(context, rects) {
	context.beginPath();
	context.arc(this.width()/2, this.height()/2, this.width()/2, 0, 2*Math.PI);
	context.closePath();
	context.fill();
};
//位置
Cell.prototype.coordinate = getset("_coordinate");
//比较颜色
Cell.prototype.checkColor = function(cell) {
	return cell && this.classify == cell.classify;
};
//座位位置
Cell.prototype.getSeatXY = function() {
	var coor = this.coordinate();
	var x = Game.Config.CellWidth*coor[0]+this.paddingWidth, y = Game.Config.CellHeight*coor[1]+this.paddingWidth;
	return [x, y];
};
//添加进屏幕
Cell.prototype.added = function() {
	this.scale(0.1, 0.1);
	this.addAction([
		Honey.Action.ScaleTo(300, 1.1, 1.1),
		Honey.Action.ScaleTo(100, 0.9, 0.9),
		Honey.Action.ScaleTo(50, 1, 1),
	]);
};
//消除
Cell.prototype.razed = function() {
	if (this._razed) return;
	this._razed = 1;
	this.x(this.x()+this.parentNode.x());
	this.y(this.y()+this.parentNode.y());
	this.z(1);
	this.parentNode.parentNode.add(this);
	this.addAction([Honey.Action.Create(500, {MoveTo:[160, 15], ScaleTo:[0.4, 0.4]}), function(){
		this.removed();
	}]);
};
//闪烁
Cell.prototype.shine = function(flag) {
	if (this._shineId) this.removeAction(this._shineId);
	if (flag) {
		this._shineId = this.addAction([Honey.Action.AlphaTo(400, 0.4), Honey.Action.AlphaTo(400, 1)], -1);
	} else {
		this.alpha(1);
	}
};
})();

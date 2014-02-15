/**
 * Cell 图块
 * @author Rhine
 * @version 2013-11-28
 */
(function(){
var Game = Smage.CellRush;
function Cell() {
	this.classify = "white";
	this._coordinate = [0, 0];
	Honey.Image.apply(this, arguments);
	
	this.tag = "Cell";
	this.clickBreak = 1;
	this.Style.set(Honey.Styles.CellRush.Cell);
	this.content(Game.Define.CellImage[this.classify]);
	
	//this.draggable = 1;
	//this.Events.onclick = this.onclick;
	this.Events.onmousedown = function() {
		this.focused();
	};
	this.Events.onmousemove = function(x, y, dx, dy) {
		this.dragged(x, y);
	};
	this.Events.onmouseup = this.Events.onmouseout = function() {
		this.unfocused();
		this.undragged();
	};
};
Honey.inherit(Cell, Honey.Image);
Game.Cell = Cell;

//位置
Cell.prototype.coordinate = getset("_coordinate");
//比较颜色
Cell.prototype.checkColor = function(cell) {
	return cell && this.classify == cell.classify;
};
//消除
Cell.prototype.razed = function() {
	if (this._razed) return;
	this._razed = 1;
	this.addAction([Honey.Action.Create(300, {ScaleTo:[0.1, 0.1]}), function(){
		this.removed();
		Game.Rule.seat(this._coordinate[0]);
	}]);
};
/*
Cell.prototype.onclick = function() {
	Game.Rule.clickCell(this);
};
*/
//选中
Cell.prototype.focused = function() {
	if (this._focused) return;
	this.z(1);
	this._focused = this.addAction([Honey.Action.ScaleTo(200, 0.8, 0.8), Honey.Action.ScaleTo(200, 1, 1)], -1);
};
Cell.prototype.unfocused = function() {
	if (!this._focused) return;
	this.removeAction(this._focused);
	this.scale(1, 1);
	this.z(0);
	this._focused = null;
};
//座位位置
Cell.prototype.getSeatXY = function() {
	var coor = this.coordinate();
	var x = Game.Config.CellWidth*coor[0]+this.paddingWidth, y = Game.Config.CellHeight*(Game.Config.CellY-1-coor[1])+this.paddingWidth;
	return [x, y];
};

//找座
Cell.prototype.seat = function() {
	if (this.seating) {
		//this.removeAction(this.seating);
		//this.seating = 0;
		return;
	};
	var xy = this.getSeatXY();
	if (this.x() != xy[0] || this.y() != xy[1]) {
		Game.Rule.isSeating(1);
		this.seating = this.addAction([Honey.Action.MoveTo(200, xy[0], xy[1]), function(){
			this.seating = 0;
			Game.Rule.onCellSeatFinish();
		}]);
	}
};
//是否相邻cell
Cell.prototype.isNear = function(cell) {
	var coor1 = this.coordinate(), coor2 = cell.coordinate();
	return (coor1[0] == coor2[0] && Math.abs(coor1[1]-coor2[1]) == 1) || (coor1[1] == coor2[1] && Math.abs(coor1[0]-coor2[0]) == 1);
};

//拖拽
Cell.prototype.dragged = function(x, y) {
	if (!this._dragged && this.pointIsOut(x, y)) {
		var xy = this.xyToBody();
		if (x > xy[0]+this.width()) {
			this._dragged = ["horizon", 1];
		} else if (x < xy[0]) {
			this._dragged = ["horizon", -1];
		} else if (y < xy[1]) {
			this._dragged = ["vertical", 1];
		} else if (y > xy[1]+this.height()) {
			this._dragged = ["vertical", -1];
		}
	}
	/*
	if (!this._dragged) {
		if (Math.abs(dx) >= Math.abs(dy)) {
			this._dragged = ["horizon", unit(dx)];
		} else {
			this._dragged = ["vertical", -unit(dy)];	//竖直方向的坐标是反的
		}
		this.z(1);
	}
	*/
};
Cell.prototype.undragged = function() {
	if (!this._dragged) return;
	Game.Rule.exchange(this, this._dragged);
	this._dragged = null;
	this.z(0);
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

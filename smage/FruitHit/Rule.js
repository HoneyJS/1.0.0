/**
 * Rule 游戏规则
 * @author Rhine
 * @version 2013-11-28
 */
(function(){
var Game = Smage.FruitHit;
var Rule = {
	storage : Honey.Storage.get("FruitHit") || {myRecord:0},
	score : 0,
	worldRecord : 0,
	step : 0,
	startTime : null,
	leftTime : 100,
	totalTime : 100,
	start : function() {
		this.score = 0;
		this.totalTime = this.leftTime = Game.Config.TotalTime;
		this.startTime = new Date().getTime();
		this.initCells();
		
		this.getWorldRecord();
	},
	//获取世界纪录
	getWorldRecord : function(caller, callback) {
		Honey.Resource.loadData("http://121.101.219.106/admin/HoneyJS/smage/FruitHit/world_record.php?record="+this.storage.myRecord, this, function(url, data){
			this.worldRecord = data;
			callback && callback.call(caller, data);
		});
	},
	updateTime : function() {
		if (!this.startTime) return;
		this.leftTime = Math.max(this.totalTime - Math.ceil((new Date().getTime() - this.startTime) / 1000), 0);
		if (!this.leftTime) this.end();
	},
	end : function() {
		this.startTime = null;
		this.record();
		Game.Stage.showResult();
	},
	record : function() {
		this.storage.myRecord = Math.max(this.storage.myRecord, this.score);
		Honey.Storage.set("FruitHit", this.storage);
		this.getWorldRecord(this, function(){
			if (!this.startTime) Game.Stage.showResult();
		});
	},
	
	cells : [],
	getCell : function(x, y) {
		if (x >= 0 && x < Game.Config.CellX && y >= 0 && y < Game.Config.CellY) return this.cells[x][y];
	},
	initCells : function() {
		this.clearCells();
		this.cells = [];
		forloop.call(this, Game.Config.CellX, function(i){
			this.cells.push([]);
			forloop.call(this, Game.Config.CellY, function(j){
				this.createCell(i);
			});
		});
	},
	createCell : function(x, color) {
		color = color || random(Game.Define.CellColor);
		var cell = Game.Stage.addCell(new Game.Cell({classify:color, coordinate:[x, this.cells[x].length]}));
		this.cells[x].push(cell);
		return cell;
	},
	clearCells : function() {
		foreach.call(this, this.cells, function(_cells, i){
			foreach.call(this, _cells, function(cell, j){
				if (this.cells[i][j]) this.cells[i][j].removed();
			});
		});
	},
	onclick : function(x, y) {
		if (!this.leftTime) return;
		this.razeCells(x, y);
		++this.step;
	},
	
	//遍历寻找可消除的cells
	checkRaze : function(x, y) {
		var cells = [];
		var directs = Game.Define.CellNearCoor;
		foreach.call(this, directs, function(direct){
			var i = 0;
			while (++i) {
				var _x = x+direct[0]*i, _y = y+direct[1]*i;
				var cell = this.getCell(_x, _y);
				if (cell == undefined) break;
				if (cell) {
					cells.push(cell);
					break;
				}
			}
		});
		var same = this.__countSame(cells);
		var re = [];
		if (same && same[0] >= 2) {
			foreach(same, function(_cells){
				re = re.concat(_cells);
			}, 1);
		}
		return re;
	},
	//执行消除
	razeCells : function(x, y) {
		var check = this.checkRaze(x, y);
		if (!check.length) {
			this.punish();
			return;
		}
		
		//先将check中的cell转化为0
		var cells = this.cells;
		foreach.call(this, check, function(cell){
			var coor = cell.coordinate();
			this.razeCell(coor[0], coor[1]);
		});
		this.reward(check.length);
		//判断是否还有能消除的
		if (!this.getSuggest()) {
			this.initCells();
		}
	},
	razeCell : function(x, y) {
		if (typeof this.cells[x][y] != "object") return;
		this.cells[x][y].razed();
		this.cells[x][y] = 0;
		//this.createCell(x);
	},
	//奖励
	reward: function(counter) {;
		var score = counter*2-3;
		this.addScore(score);
		var time = Game.Config["RewardTime"+counter];
		if (time) this.addTime(time);
	},
	//错误惩罚
	punish : function() {
		this.addTime(-Game.Config.PunishTime);
	},
	//奖励分数
	addScore : function(score) {
		this.score += score;
		Game.Stage.addScore(score);
	},
	//奖罚时间
	addTime : function(time) {
		this.startTime += time*1000;
		Game.Stage.addTime(time);
		this.updateTime();
	},
	/**
	 * 遍历寻找可消除的cells
	 */
	getSuggest : function() {
		var suggest = foreach.call(this, this.cells, function(_cells, i){
			return foreach.call(this, _cells, function(A, j){
				var check = this.checkRaze(i, j);
				if (check.length) return check;
			});
		});
		return suggest;
	},
	__countSame : function(cells) {
		var _cells = [];
		foreach.call(this, cells, function(cell){
			if (!foreach(_cells, function(__cells){
				if (__cells[0].checkColor(cell)) {
					__cells.push(cell);
					return 1;
				}
			})) {
				_cells.push([cell]);
			}
		});
		var twoCells = [2];
		return foreach(_cells, function(__cells, i){
			if (__cells.length == 4) return [4, __cells];
			if (__cells.length == 3) return [3, __cells];
			if (__cells.length == 2) twoCells.push(__cells);
			if (i == _cells.length-1) return twoCells.length > 1 ? twoCells : [0];
		});
	},
};
Game.Rule = Rule;
})();

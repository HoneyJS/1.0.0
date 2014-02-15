/**
 * Rule 游戏规则
 * @author Rhine
 * @version 2013-11-28
 */
(function(){
var Game = Smage.CellRush;
var Rule = {
	storage : Honey.Storage.get("CellRush") || {myRecord:0},
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
		Honey.Resource.loadData("http://121.101.219.106/admin/HoneyJS/smage/CellRush/world_record.php?record="+this.storage.myRecord, this, function(url, data){
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
		Honey.Storage.set("CellRush", this.storage);
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
		this.seat();
	},
	createCell : function(x, color) {
		color = color || randomIndex(Game.Define.CellColor);
		var cell = Game.Stage.addCell(new Game.Cell({classify:color, coordinate:[x, this.cells[x].length]}));
		this.cells[x].push(cell);
		return cell;
	},
	clearCells : function() {
		foreach.call(this, this.cells, function(_cells, i){
			foreach.call(this, _cells, function(cell, j){
				this.cells[i][j].razed();
			});
		});
	},
	//遍历寻找可消除的cells
	checkCells : function() {
		var re = [];
		foreach.call(this, this.cells, function(_cells, i){
			foreach.call(this, _cells, function(cell, j){
				var check = this.checkCell(i, j);
				if (check[0] || check[1]) re.push([i, j].concat(check));
			});
		});
		return re;
	},
	checkCell : function(x, y) {
		var cells = this.cells;
		var re = [0, 0];
		var cell = cells[x][y], w = Game.Config.CellX, h = Game.Config.CellY;
		if (!cell) return re;
		//横向判断
		if ( x < w-2 && (!x || !cell.checkColor(cells[x-1][y])) ) {	//横向前一个和自己相同则跳过
			if (cell.checkColor(cells[x+1][y]) && cell.checkColor(cells[x+2][y])) {
				var end = forloop(w, function(i){
					if (!cell.checkColor(cells[i][y])) return i-1;
				}, x+3) || w-1;
				re[0] = end-x+1;
			}
		}
		//竖向判断
		if ( y < h-2 && (!y || !cell.checkColor(cells[x][y-1])) ) {	//同横向
			if (cell.checkColor(cells[x][y+1]) && cell.checkColor(cells[x][y+2])) {
				var end = forloop(h, function(j){
					if (!cell.checkColor(cells[x][j])) return j-1;
				}, y+3) || h-1;
				re[1] = end-y+1;
			}
		}
		return re;
	},
	//执行消除
	razeCells : function() {
		var check = this.checkCells();
		if (!check.length) {
			if (this._exchange) {
				this.__exchange(this._exchange[0], this._exchange[1]);
				this._exchange = null;
			} else {
				this.isSeating(0);
				if (!this.getSuggest()) {
					this.initCells();
				}/* else
					this.__exchange(this._suggest[0], this._suggest[1]);
				*/
			}
			return;
		}
		if (this._exchange) {
			++this.step;
			this._exchange = null;
		}
		this.isSeating(1);
		
		//先将check中的cell转化为-1
		var cells = this.cells;
		foreach(check, function(arr){
			//横向
			if (arr[2]) {
				forloop(arr[0]+arr[2], function(i){
					Rule.razeCell(i, arr[1]);
					cells[i][arr[1]] = -1;
				}, arr[0]);
			}
			//竖向
			if (arr[3]) {
				forloop(arr[1]+arr[3], function(j){
					Rule.razeCell(arr[0], j);
					cells[arr[0]][j] = -1;
				}, arr[1]);
			}
		});
		var counter = 0;
		foreach(this.cells, function(cells, i){
			forback(cells, function(cell, j){
				if (cell == -1) {
					cells.splice(j, 1);
					++counter;
					foreach(cells, function(cell){
						if (typeof cell == "object") {
							--cell.coordinate()[1];
						}
					}, j);
				}
			});
		});
		this.reward(counter);
	},
	razeCell : function(x, y) {
		if (typeof this.cells[x][y] != "object") return;
		this.cells[x][y].razed();
		this.createCell(x);
	},
	//奖励
	reward : function(counter) {
		var score = counter*2-5;
		this.addScore(score);
		var time = Game.Config.RewardTime*score;
		if (time) this.addTime(time);
		return score;
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
	//找座
	seat : function(x) {
		if (x != undefined) {
			foreach(this.cells[x], function(cell){
				if (typeof cell == "object") cell.seat();
			});
		} else {
			foreach(this.cells, function(cells){
				foreach(cells, function(cell){
					if (typeof cell == "object") cell.seat();
				});
			});
		}
	},
	//当一个cell找到座位
	onCellSeatFinish : function() {
		if (!foreach(this.cells, function(cells){
			return foreach(cells, function(cell){
				if (typeof cell == "object" && cell.seating) return 1;
			});
		})) {
			this.razeCells();
		}
	},
	//是否有cell在找座
	_isSeating : 0,
	isSeating : getset("_isSeating"),
	//点击事件
	/*clickCell : function(cell) {
		if (!this._focusedCell) {	//选中
			this._focusedCell = cell;
			this._focusedCell.focused();
		} else if (this._focusedCell == cell) {	//取消选中
			this._focusedCell.unfocused();
			this._focusedCell = null;
		} else if (!this._focusedCell.isNear(cell)) {	//更换选中
			this._focusedCell.unfocused();
			this._focusedCell = cell;
			this._focusedCell.focused();
		} else {	//交换两个cell
			this._exchange = [this._focusedCell, cell];
			this.exchange(this._focusedCell, cell);
			this._focusedCell.unfocused();
			this._focusedCell = null;
		}
	},*/
	//交换cell
	exchange : function(cell, dir) {
		if (!this.leftTime) return;
		if (cell.seating) return;
		var coor = cell.coordinate();
		var cell2;
		if (dir[0] == "horizon") {
			cell2 = this.getCell(coor[0]+dir[1], coor[1]);
		} else {
			cell2 = this.getCell(coor[0], coor[1]+dir[1]);
		}
		if (cell2 && !cell2.seating) {
			this._exchange = [cell, cell2];
			this.__exchange(cell, cell2);
		}
	},
	__exchange : function(cell1, cell2) {
		var coor = cell1.coordinate();
		this.coordinate(cell1, cell2.coordinate());
		this.coordinate(cell2, coor);
	},
	//设置坐标
	coordinate : function(cell, coor) {
		cell.coordinate(coor);
		this.cells[coor[0]][coor[1]] = cell;
		cell.seat();
	},
	/**
	 * 智能寻找可移动至消除的cells
	 * 1.遍历方块，得到方块A
	 * 2.遍历A四周相邻方块，统计出其中相同方块个数，若为4则进行3-1，若为3则进行3-2，若为2则进行3-3，其余返回到1的遍历过程
	 * 3-1.找到A左侧的B，cells加入[A, B]
	 * 3-2.找到三个相同方块里在A单独一侧的B，cells加入[A, B]
	 * 3-3.遍历两个相同方块，得到方块B、C，进行3-3-1
	 * 3-3-1.以B为中心，找到A的对侧方块D，若D存在且和B为相同方块，则得到cells加入[A, C]，否则进行3-3-2
	 * 3-3-2.以C为中心，进行3-3-1相似流程
	 * 注1：步骤2里相同方块个数为2时，可能有两组相同方块，所以3-3应为重复流程
	 * 注2：若只需得到一个结果，cells加入结果操作后可以跳出寻找过程
	 */
	getSuggest : function() {
		var suggest = foreach.call(this, this.cells, function(_cells, i){
			return foreach.call(this, _cells, function(A, j){
				var find = this.__getSuggest_2(A);
				if (find) return [find, A];
			});
		});
		if (suggest) {
			if (this._suggest) {
				this._suggest[0].unfocused();
				this._suggest[1].unfocused();
			}
			this._suggest = suggest;
			this._suggestTime = Honey.now();
		}
		return suggest;
	},
	__getSuggest_2 : function(A) {
		var coorA = A.coordinate();
		var count = this.__countCoorSame(coorA);
		//3-1
		if (count[0] == 4) {
			return count[1][0];
		}
		//3-2
		if (count[0] == 3) {
			//这里count[1]需要按照相对于A左下右上的顺序设置
			return foreach(Smage.CellRush.Define.CellNearCoor, function(arr, i){
				if (i == 3 || coorA[0]+arr[0] != count[1][i].coordinate()[0])
					return count[1][(i+1)%3];
			});
		}
		//3-3
		if (count[0] == 2) {
			if (count[1]) {
				var D = __findD.call(this, count[1][0], count[1][1]);
				if (D) return D;
			}
			if (count[2]) {
				var D = __findD.call(this, count[2][0], count[2][1]);
				if (D) return D;
			}
			
			function __findD(B, C) {
				//3-3-1
				var coorB = B.coordinate();
				var coorD = [coorB[0]*2-coorA[0], coorB[1]*2-coorA[1]];
				var D = this.getCell(coorD[0], coorD[1]);
				if (D && B.checkColor(D)) return C;
				//3-3-2
				var coorC = C.coordinate();
				coorD = [coorC[0]*2-coorA[0], coorC[1]*2-coorA[1]];
				D = this.getCell(coorD[0], coorD[1]);
				if (D && C.checkColor(D)) return B;
			};
		}
	},
	__countCoorSame : function(coor) {
		var cells = [];
		foreach.call(this, Smage.FruitHit.Define.CellNearCoor, function(arr){
			var B = this.getCell(coor[0]+arr[0], coor[1]+arr[1]);
			if (B) cells.push(B);
		});
		return this.__countSame(cells);
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
	//显示suggest
	showSuggest : function() {
		if (Honey.now() > this._suggestTime + Game.Config.SuggestLag) {
			this._suggest[0].focused();
			this._suggest[1].focused();
		}
	},
};
Game.Rule = Rule;
})();

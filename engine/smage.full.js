/**
 * Smage - Small Game
 * @author Rhine
 * @version 2013-11-28
 */
(function(){
Smage = {
	CellRush : {},
	FruitHit : {},
};

})();
/**
 * 预定义式样列表
 */
(function(){
	
var Styles = Honey.Styles;

Styles.fps = {
	x:0,
	color:"white",
	fontSize:20,
	bgColor:"#000",
	bgAlpha:0.6,
};
Styles.Button = {
	Home:{
		color:"yellow",
		fontSize:40,
		width:300,
		height:60,
		shadow:1,
		bgColor:"green"
	},
};

})();
/**
 * Home 主页
 */
(function(){
var Home = new Honey.Node(
	{
		fullScreen : 1,
		clickBreak : 1,
		quitGame : function() {
			Honey.body.add(Home);
			Honey.fitBody();
		},
		add : [
			["Node", {name:"Games", width:480, height:800}],
		],
	},
	{
		bgColor:"#000"
	}
);
Smage.Home = Home;

EventM.regist("resize", Home, function(){
	this.width(Honey.body.width());
	this.height(Honey.body.height());
	this.Games.x((this.width()-this.Games.width())/2);
});

//游戏列表
var games = [
	{
		name:"消方块",
		begin:function(){
			Honey.body.add(Smage.CellRush.Stage);
			Smage.CellRush.load();
			return 1;
		},
	},
	{
		name:"打豆豆",
		begin:function(){
			Honey.body.add(Smage.FruitHit.Stage);
			Smage.FruitHit.load();
			return 1;
		},
	},
];
foreach(games, function(game, i){
	Home.Games.add("Button", "begin"+i, (Home.Games.width()-Honey.Styles.Button.Home.width)/2, 50+(Honey.Styles.Button.Home.height+20)*i, function(){
		if (this.game.begin()) Home.removed();
	}, {game:game, text:game.name}, Honey.Styles.Button.Home);
});

})();
/**
 * 一些常量
 */
Smage.CellRush.Define = {
	CellColor : {
		//black: "#000",
		red: "#f00",
		green: "#0f0",
		blue: "#00f",
		yellow: "#ff0",
		purple: "#f0f",
		cyan: "#0ff",
		white: "#fff",
	},
	CellImage : {
		//black: "#000",
		red: ["smage/cell.png", 0, 0, 70, 70],
		green: ["smage/cell.png", 70, 0, 70, 70],
		blue: ["smage/cell.png", 140, 0, 70, 70],
		yellow: ["smage/cell.png", 210, 0, 70, 70],
		purple: ["smage/cell.png", 280, 0, 70, 70],
		cyan: ["smage/cell.png", 350, 0, 70, 70],
		white: ["smage/cell.png", 420, 0, 70, 70],
	},
	CellBackImage : "smage/cell_back.png",
	CellNearCoor : [[-1, 0], [0, -1], [1, 0], [0, 1]],
};/**
 * 配置文件
 */
Smage.CellRush.Config = {
	Width:480, Height:800,
	CellWidth:80, CellHeight:80,
	CellX:6, CellY:8,
	SuggestLag:3000,
	TotalTime :60,
	RewardTime:1,
};
/**
 * 预定义式样列表
 */
(function(){
	
var Styles = Honey.Styles;

Styles.CellRush = {
	Info : {
		color:"#B5F5BC",
		fontSize:30,
		shadow:1,
	},
	Cell : {
		width:Smage.CellRush.Config.CellWidth-10,
		height:Smage.CellRush.Config.CellHeight-10,
		//borderColor:"gray",
		//borderWidth:2,
		ElementAttach:{
			paddingWidth:5,
		},
	},
	Center : {
		width:480,
		height:800,
	},
	Score : {
		fontSize:100,
		color:"#0f0",
		fontWidth:5,
		shadow:1,
	},
	Time : {
		fontSize:100,
		color:"#0f0",
		fontWidth:5,
		shadow:1,
	},
	TimerBar : {
		width:440,
		height:20,
		bgColor:"gray",
		color:"green",
		borderColor:"#000",
		borderWidth:2,
	},
	Result : {
		bgColor:"gray",
		borderColor:"black",
		borderWidth:3,
	},
	Button : {
		Result : {
			color:"yellow",
			fontSize:30,
			width:120,
			height:50,
			shadow:1,
			bgColor:"green"
		},
		Pause : {
			color:"yellow",
			fontSize:30,
			width:120,
			height:40,
			shadow:1,
			bgColor:"green"
		},
	},
};

})();
/**
 * Game 游戏
 * @author Rhine
 * @version 2013-12-16
 */
(function(){
var Game = Smage.CellRush;
//加载游戏
Game.load = function() {
	//资源
	this.Stage.showLoading(1);
	Honey.Resource.loadImages([this.Define.CellImage.red[0], this.Define.CellBackImage], this.Stage, function(){
		this.showLoading(0);
		//初始化
		Smage.CellRush.Rule.start();
	});
	
	//适配屏幕
	Honey.fitBody({width:this.Config.Width, height:this.Config.Height});
};
//离开游戏
Game.quit = function() {
	Game.Stage.removed();
	Smage.Home.quitGame();
};
})();/**
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
			Game.Stage.showResult();
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
		var coor = cell.coordinate();
		var cell2;
		if (dir[0] == "horizon") {
			cell2 = this.getCell(coor[0]+dir[1], coor[1]);
		} else {
			cell2 = this.getCell(coor[0], coor[1]+dir[1]);
		}
		if (cell2) {
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
/**
 * Stage 舞台
 * @author Rhine
 * @version 2013-11-28
 */
(function(){
var Game = Smage.CellRush;
var Stage = new Honey.Node(
	{
		fullScreen: 1,
		clickBreak: 1,
		showLoading: function(val) {
			this.Center.loading.display(val);
			this.Center.Board.display(!val);
		},
		schedule: [function(){
			Game.Rule.showSuggest();
			this.updateTime();
		}, 50],
		updateTime : function() {
			Game.Rule.updateTime();
			this.Center.TimerBar.percent(100*Game.Rule.leftTime/Game.Rule.totalTime);
			this.updateInfo();
		},
		updateInfo : function() {
			this.Center.Info.content("SCORE:"+Game.Rule.score+"   TIME:"+Game.Rule.leftTime+"s");
		},
		addCell : function(cell) {
			var xy = cell.getSeatXY();
			var coor = cell.coordinate();
			cell.x(xy[0]);
			var lastCell = Game.Rule.getCell(coor[0], coor[1]-1);
			if (!lastCell)
				cell.y(xy[1]-this.Center.Board.height());
			else
				cell.y(lastCell.y()-cell.height()-cell.paddingWidth*2);
			return this.Center.Board.add(cell);
		},
		//加分
		addScore : function(score) {
			var s = this.Center.add("LineText", {z:10, content:"+"+score, x:this.Center.width()/2-50, y:this.Center.height()/2-50}, Honey.Styles.CellRush.Score);
			s.addAction([
				Honey.Action.ScaleTo(150, 1.5, 1.5),
				Honey.Action.ScaleTo(750, 2, 2),
				//Honey.Action.Create(750, {ScaleTo:[2, 2], AlphaTo:0.5}),
				Honey.Action.ScaleTo(150, 0.2, 0.2),
				//Honey.Action.Create(300, {ScaleTo:[0.1, 0.1], AlphaTo:0.1}),
				function(){
					this.removed();
				}
			]);
			this.updateInfo();
		},
		//时间
		addTime : function(time) {
			var s = this.Center.add("LineText", {z:10, content:(time>0?"+"+time:time)+"s", x:this.Center.width()/2-75, y:this.Center.height()/2-200}, Honey.Styles.CellRush.Time);
			if (time <= 0) s.Style.color = "#f00";
			s.addAction([
				Honey.Action.ScaleTo(500, 1.5, 1.5),
				Honey.Action.Create(300, {MoveTo:[270, 0], ScaleTo:[0.4, 0.4], AlphaTo:0.4}),
				function(){
					this.removed();
				}
			]);
			this.updateInfo();
		},
		showResult : function() {
			this.Center.Result.showResult();
		},
	},
	{
		bgColor:"#000"
	}
);
Game.Stage = Stage;

//中心区域
Stage.add("Node", {name:"Center"}, Honey.Styles.CellRush.Center);
//适配
EventM.regist("resize", Stage, function(){
	this.width(Honey.body.width());
	this.height(Honey.body.height());
	this.Center.x((this.width()-this.Center.width())/2);
	this.Center.y((this.height()-this.Center.height())/2);
});

//资源加载中
Stage.Center.add("LineText", {name:"loading", content:"loading...", align:"center", width:Stage.Center.width(), height:Stage.Center.height()}, {color:"white"});
//信息
Stage.Center.add("LineText", "Info", 0, 10, "SCORE:0   TIME:0s", {width:Stage.Center.width(), align:"center"}, Honey.Styles.CellRush.Info);
Stage.Center.add("Element", {
	name : "TimerBar",
	y : 50,
	_percent : 100,
	percent : getset("_percent", function(){
		this.dirty();
	}),
}, Honey.Styles.CellRush.TimerBar);
Stage.Center.TimerBar.draw = function(context, rects) {
	context.fillRect(1, 1, (this.width()-2)*Math.min(this._percent/100, 1), this.height()-2);
};
Stage.Center.TimerBar.x((Stage.Center.width() - Stage.Center.TimerBar.width()) / 2);
//图块板
Stage.Center.add("Node", {name:"Board", y:80, width:Game.Config.CellWidth*Game.Config.CellX, height:Game.Config.CellHeight*Game.Config.CellY});
//背景格子
forloop (Game.Config.CellX, function(i){
	forloop (Game.Config.CellY, function(j){
		Stage.Center.Board.add("Image", 0, Game.Config.CellWidth*i, Game.Config.CellHeight*j, Game.Define.CellBackImage, {z:-1, width:Game.Config.CellWidth, height:Game.Config.CellHeight});
	});
});

//操作按钮
Stage.Center.add("Button", "Finish", (Stage.Center.width()-Honey.Styles.CellRush.Button.Pause.width)/2, Stage.Center.Board.y()+Stage.Center.Board.height()+10, function(){
	Game.Rule.end();
}, {text:"FINISH"}, Honey.Styles.CellRush.Button.Pause);

//结果
Stage.Center.add("Element", {name:"grayBG", z:99, display:0, width:Stage.Center.width(), height:Stage.Center.height()}, {bgColor:"#000", bgAlpha:0.6});
Stage.Center.add("Node", {
	name:"Result",
	z:100,
	width:400,
	height:300,
	x:(Stage.Center.width()-400)/2,
	y:(Stage.Center.height()-300)/2,
	clickMask:1,
	display:0,
	add:[
		["LineText", {name:"score", y:20, width:400, align:"center"}, Honey.Styles.CellRush.Info],
		["LineText", {name:"myRecord", y:70, width:400, align:"center"}, Honey.Styles.CellRush.Info],
		["LineText", {name:"worldRecord", y:120, width:400, align:"center"}, Honey.Styles.CellRush.Info],
		["Button", "again", 70, 230, function(){
			Stage.Center.Result.display(0);
			Stage.Center.grayBG.display(0);
			Game.Rule.start();
		}, {text:"AGAIN"}, Honey.Styles.CellRush.Button.Result],
		["Button", "quit", 210, 230, function(){
			Stage.Center.Result.display(0);
			Stage.Center.grayBG.display(0);
			Game.quit();
		}, {text:"QUIT"}, Honey.Styles.CellRush.Button.Result],
	],
	showResult:function(){
		this.score.content("SCORE: "+Game.Rule.score);
		this.myRecord.content("YOUR RECORD: "+Game.Rule.storage.myRecord);
		this.worldRecord.content("WORLD RECORD: "+Game.Rule.worldRecord);
		Stage.Center.Result.display(1);
		Stage.Center.grayBG.display(1);
	},
}, Honey.Styles.CellRush.Result);
/*移动时屏蔽
Stage.Center.Board.add("Element", {z:100, width:Stage.Center.Board.width(), height:Stage.Center.Board.height()}, null, {
	onmousedown: function(x, y, evt) {
		if (Game.Rule.isSeating()) return 1;
	}
});
*/
})();
/**
 * 一些常量
 */
Smage.FruitHit.Define = {
	CellColor : {
		//black: "#000",
		red: "#f00",
		green: "#0f0",
		blue: "#00f",
		yellow: "#ff0",
		purple: "#f0f",
		cyan: "#0ff",
		white: "#fff",
	},
	CellImage : {
		//black: "#000",
		red: ["smage/cell.png", 0, 0, 70, 70],
		green: ["smage/cell.png", 70, 0, 70, 70],
		blue: ["smage/cell.png", 140, 0, 70, 70],
		yellow: ["smage/cell.png", 210, 0, 70, 70],
		purple: ["smage/cell.png", 280, 0, 70, 70],
		cyan: ["smage/cell.png", 350, 0, 70, 70],
		white: ["smage/cell.png", 420, 0, 70, 70],
	},
	CellBackImage : "smage/cell_back.png",
	CellNearCoor : [[-1, 0], [0, -1], [1, 0], [0, 1]],
};/**
 * 配置文件
 */
Smage.FruitHit.Config = {
	Width:480, Height:800,
	CellWidth:60, CellHeight:60,
	CellX:8, CellY:11,
	TotalTime :60,
	PunishTime:3,
	RewardTime3:2,
	RewardTime4:5,
};
/**
 * 预定义式样列表
 */
(function(){
	
var Styles = Honey.Styles;

Styles.FruitHit = {
	Info : {
		color:"#B5F5BC",
		fontSize:30,
		shadow:1,
	},
	Cell : {
		width:Smage.FruitHit.Config.CellWidth-10,
		height:Smage.FruitHit.Config.CellHeight-10,
		//borderColor:"gray",
		//borderWidth:2,
		ElementAttach:{
			paddingWidth:5,
		},
	},
	Center : {
		width:480,
		height:800,
	},
	Score : {
		fontSize:100,
		color:"#0f0",
		fontWidth:5,
		shadow:1,
	},
	Time : {
		fontSize:100,
		color:"#0f0",
		fontWidth:5,
		shadow:1,
	},
	TimerBar : {
		width:440,
		height:20,
		bgColor:"gray",
		color:"green",
		borderColor:"#000",
		borderWidth:2,
	},
	Result : {
		bgColor:"gray",
		borderColor:"black",
		borderWidth:3,
	},
	Button : {
		Result : {
			color:"yellow",
			fontSize:30,
			width:120,
			height:50,
			shadow:1,
			bgColor:"green"
		},
		Pause : {
			color:"yellow",
			fontSize:30,
			width:120,
			height:40,
			shadow:1,
			bgColor:"green"
		},
	},
};

})();
/**
 * Game 游戏
 * @author Rhine
 * @version 2013-12-16
 */
(function(){
var Game = Smage.FruitHit;
//加载游戏
Game.load = function() {
	//资源
	this.Stage.showLoading(1);
	//Honey.Resource.loadImages([this.Define.CellImage.red[0], this.Define.CellBackImage], this, function(){
		this.Stage.showLoading(0);
		//初始化
		this.Rule.start();
	//});
	
	//适配屏幕
	Honey.fitBody({width:this.Config.Width, height:this.Config.Height});
};
//离开游戏
Game.quit = function() {
	Game.Stage.removed();
	Smage.Home.quitGame();
};
})();/**
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
			Game.Stage.showResult();
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
				if (!A) return;
				var check = this.checkRaze.apply(this, A.coordinate());
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
/**
 * Stage 舞台
 * @author Rhine
 * @version 2013-11-28
 */
(function(){
var Game = Smage.FruitHit;
var Stage = new Honey.Node(
	{
		fullScreen : 1,
		clickBreak : 1,
		showLoading : function(val) {
			this.Center.loading.display(val);
			this.Center.Board.display(!val);
		},
		schedule : [function(){
			this.updateTime();
		}, 50],
		updateTime : function() {
			Game.Rule.updateTime();
			this.Center.TimerBar.percent(100*Game.Rule.leftTime/Game.Rule.totalTime);
			this.updateInfo();
		},
		updateInfo : function() {
			this.Center.Info.content("SCORE:"+Game.Rule.score+"   TIME:"+Game.Rule.leftTime+"s");
		},
		addCell : function(cell) {
			var xy = cell.getSeatXY();
			cell.x(xy[0]);
			cell.y(xy[1]);
			cell.added();
			return this.Center.Board.add(cell);
		},
		//加分
		addScore : function(score) {
			var s = this.Center.add("LineText", {z:10, content:"+"+score, x:this.Center.width()/2-50, y:this.Center.height()/2-50}, Honey.Styles.FruitHit.Score);
			s.addAction([
				Honey.Action.ScaleTo(150, 1.5, 1.5),
				Honey.Action.ScaleTo(750, 2, 2),
				//Honey.Action.Create(750, {ScaleTo:[2, 2], AlphaTo:0.5}),
				Honey.Action.ScaleTo(150, 0.2, 0.2),
				//Honey.Action.Create(300, {ScaleTo:[0.1, 0.1], AlphaTo:0.1}),
				function(){
					this.removed();
				}
			]);
			this.updateInfo();
		},
		//时间
		addTime : function(time) {
			var s = this.Center.add("LineText", {z:10, content:(time>0?"+"+time:time)+"s", x:this.Center.width()/2-75, y:this.Center.height()/2-200}, Honey.Styles.FruitHit.Time);
			if (time <= 0) s.Style.color = "#f00";
			s.addAction([
				Honey.Action.ScaleTo(500, 1.5, 1.5),
				Honey.Action.Create(300, {MoveTo:[270, 0], ScaleTo:[0.4, 0.4], AlphaTo:0.4}),
				function(){
					this.removed();
				}
			]);
			this.updateInfo();
		},
		showResult : function() {
			this.Center.Result.showResult();
		},
	},
	{
		bgColor:"#000"
	}
);
Game.Stage = Stage;

//中心区域
Stage.add("Node", {name:"Center"}, Honey.Styles.FruitHit.Center);
//适配
EventM.regist("resize", Stage, function(){
	this.width(Honey.body.width());
	this.height(Honey.body.height());
	this.Center.x((this.width()-this.Center.width())/2);
	this.Center.y((this.height()-this.Center.height())/2);
});

//资源加载中
Stage.Center.add("LineText", {name:"loading", content:"loading...", align:"center", width:Stage.Center.width(), height:Stage.Center.height()}, {color:"white"});
//信息
Stage.Center.add("LineText", "Info", 0, 10, "SCORE:0   TIME:0s", {width:Stage.Center.width(), align:"center"}, Honey.Styles.FruitHit.Info);
Stage.Center.add("Element", {
	name : "TimerBar",
	y : 50,
	_percent : 100,
	percent : getset("_percent", function(){
		this.dirty();
	}),
}, Honey.Styles.FruitHit.TimerBar);
Stage.Center.TimerBar.draw = function(context, rects) {
	context.fillRect(1, 1, (this.width()-2)*Math.min(this._percent/100, 1), this.height()-2);
};
Stage.Center.TimerBar.x((Stage.Center.width() - Stage.Center.TimerBar.width()) / 2);
//图块板
Stage.Center.add("Node", {
	name:"Board", 
	y:80, 
	width:Game.Config.CellWidth*Game.Config.CellX, 
	height:Game.Config.CellHeight*Game.Config.CellY
}, null, {
	onclick: function(x, y) {
		var xy = this.xyToBody();
		x -= xy[0];
		y -= xy[1];
		Game.Rule.onclick(parseInt(x/Game.Config.CellWidth), parseInt(y/Game.Config.CellHeight));
	},
});
//背景格子
forloop (Game.Config.CellX, function(i){
	forloop (Game.Config.CellY, function(j){
		Stage.Center.Board.add("Element", 0, Game.Config.CellWidth*i, Game.Config.CellHeight*j, Game.Define.CellBackImage, {z:-1, width:Game.Config.CellWidth, height:Game.Config.CellHeight}, {bgColor:(i+j)%2?"#bbb":"#999"});
	});
});

//操作按钮
Stage.Center.add("Button", "Finish", (Stage.Center.width()-Honey.Styles.FruitHit.Button.Pause.width)/2, Stage.Center.Board.y()+Stage.Center.Board.height()+10, function(){
	Game.Rule.end();
}, {text:"FINISH"}, Honey.Styles.FruitHit.Button.Pause);

//结果
Stage.Center.add("Element", {name:"grayBG", z:99, display:0, width:Stage.Center.width(), height:Stage.Center.height()}, {bgColor:"#000", bgAlpha:0.6});
Stage.Center.add("Node", {
	name:"Result",
	z:100,
	width:400,
	height:300,
	x:(Stage.Center.width()-400)/2,
	y:(Stage.Center.height()-300)/2,
	clickMask:1,
	display:0,
	add:[
		["LineText", {name:"score", y:20, width:400, align:"center"}, Honey.Styles.FruitHit.Info],
		["LineText", {name:"myRecord", y:70, width:400, align:"center"}, Honey.Styles.FruitHit.Info],
		["LineText", {name:"worldRecord", y:120, width:400, align:"center"}, Honey.Styles.FruitHit.Info],
		["Button", "again", 70, 230, function(){
			Stage.Center.Result.display(0);
			Stage.Center.grayBG.display(0);
			Game.Rule.start();
		}, {text:"AGAIN"}, Honey.Styles.FruitHit.Button.Result],
		["Button", "quit", 210, 230, function(){
			Stage.Center.Result.display(0);
			Stage.Center.grayBG.display(0);
			Game.quit();
		}, {text:"QUIT"}, Honey.Styles.FruitHit.Button.Result],
	],
	showResult:function(){
		this.score.content("SCORE:"+Game.Rule.score);
		this.myRecord.content("YOUR RECORD: "+Game.Rule.storage.myRecord);
		this.worldRecord.content("WORLD RECORD: "+Game.Rule.worldRecord);
		Game.Stage.Center.Result.display(1);
		Game.Stage.Center.grayBG.display(1);
	},
}, Honey.Styles.FruitHit.Result);

/*
forloop (Game.Config.CellX, function(i){
	forloop (Game.Config.CellY, function(j){
		Stage.Center.Board.add("Image", 0, Game.Config.CellWidth*i, Game.Config.CellHeight*j, Game.Define.CellBackImage, {z:-1, width:Game.Config.CellWidth, height:Game.Config.CellHeight});
	});
});
*/
/*移动时屏蔽
Stage.Center.Board.add("Element", {z:100, width:Stage.Center.Board.width(), height:Stage.Center.Board.height()}, null, {
	onmousedown: function(x, y, evt) {
		if (Game.Rule.isSeating()) return 1;
	}
});
*/
})();

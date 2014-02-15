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
		bgColor:"#000",
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
		Game.Stage.Center.Result.show();
		Stage.Center.grayBG.display(1);
	},
	show: function() {
		this.scale(0.1, 0.1);
		this.addAction([Honey.Action.ScaleTo(300, 1, 1)]);
		this.display(1);
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

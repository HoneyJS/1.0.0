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

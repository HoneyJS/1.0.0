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
})();
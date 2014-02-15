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
Styles.zuobiao = {
	color:"white",
	fontSize:20,
	bgColor:"#000",
	alpha:0.6,
};
Styles.nameBar = {
	width:100,
	color:"#ff0",
	fontSize:20,
	height:Define.Image.Actor.NameBar[4],
	setBgImage:Define.Image.Actor.NameBar,
	bgAlpha:0.6,
	shadow:1,
};
Styles.HP_Bar = {
	width:100, height:10, bgColor:"gray", color:"red", borderColor:"#000", borderWidth:2,
};
Styles.Button = {
	talk:{
		ElementAttach:{
			images:{up:Define.Image.Actor.NameBar},
		},
		color:"yellow",
		fontSize:26,
		width:100,
		height:36,
		shadow:1,
	},
};

})();

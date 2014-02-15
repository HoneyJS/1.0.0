/**
 * 一些常量
 */
Define.Path = {
	Image:"images/",
	Dialog:"dialogs/",
	Map:"detail/map/",
	NPC:"detail/npc/",
	Creep:"detail/creep/",
	Figure:"detail/figure/",
};
Define.Actor = {
	State : {
		Stand:"stand",
		Move:"move",
		Attack:"attack",
		Hurt:"hurt",
	},
	Direction : {
		Down:0,
		Left:1,
		Up:2,
		Right:3,
	},
};
Define.Image = {
	Actor:{
		NameBar:["nameBar.png", 0, 0, 100, 26],
		Shadow:["shadow_60X30.png", 0, 0, 60, 30],
		Target:["target.png", 0, 0, 40, 48],
	},
};
Define.Sprite = {
	Actor:{
		Target:[
			[["target.png",0,0,40,48],["shadow_60X30.png",0,0,60,30],],
			[[[1,0,43,1,1,0,1],[0,10,0,1,1,0,1]],[[1,0,43,1,1,0,1],[0,10,5,1,1,0,1]],[[1,0,43,1,1,0,1],[0,10,10,1,1,0,1]],[[1,0,43,1,1,0,1],[0,10,5,1,1,0,1]],],
			[],0,0,60,73,4,20
		],
	},
};
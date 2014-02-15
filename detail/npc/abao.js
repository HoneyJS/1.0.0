Honey.data=
{
	nickname:"阿宝",
	level:100,
	setFigure:"abao",
	avatar:["abao.png", 390, 0, 130, 130],
	talk:"我擦！What's Up?",
	block:1,
	options:[
		["攻击",function(npc){
			Honey.MyRole.attackTarget(npc);
			/*DialogM.open("shop", function(d){
				d.npc("abao");
			});*/
		}],
	],
}
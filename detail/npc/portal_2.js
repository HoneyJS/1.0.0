Honey.data=
{
	nickname:"传送门",
	level:1,
	setFigure:"portal_2",
	avatar:["map/building/portal_2.png",0,0,135,180],
	talk:"这是一个传说中的传……传送门",
	block:1,
	options:[
		["传送",function(npc){
			Honey.MyRole.mapName = "test";
			Honey.MyRole.coordinate([1,1]);
			MainMap.setMyActor(Honey.MyRole);
		}],
	],
}
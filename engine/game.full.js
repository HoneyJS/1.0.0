/**
 * 配置文件
 */
Config = {
	Width:800, Height:480,
	TileWidth:100, TileHeight:50,
	ActorTiming : 1,
};
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
};/**
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
/**
 * Dialog 对话框
 * @author Rhine
 * @version 2013-11-09
 */
(function(){

function Dialog(attr, style, events) {
	this.children = [];
	Honey.Node.apply(this, arguments);
	
	this.tag = "Dialog";
	DialogM.dialogs[this.name] = this;
};
Honey.inherit(Dialog, Honey.Node);
Honey.Dialog = Dialog;
/**
 * 重置位置
 */
Dialog.prototype.resetXY = function() {};
/**
 * 刷新界面
 */
Dialog.prototype.freshen = function() {};

var DialogM = {
	dialogs : {},
	get : function(name) {
		return this.dialogs[name];
	},
	load : function(name, callback) {
		if (this.dialogs[name]) {
			callback(this.dialogs[name]);
		} else {
			Honey.Resource.loadData(Define.Path.Dialog+name+".js", this, function(url, data){
				if (typeof data != "function") {
					Honey.trace("DialogM load( "+name+" ) ERROR: data is not a function!!!");
					return;
				}
				data(name);
				if (!DialogM.dialogs[name]) {
					Honey.trace("DialogM load( "+name+" ) ERROR: has not created a Dailog!!!");
					return;
				}
				callback(DialogM.dialogs[name]);
			});
		}
	},
	open : function(name, callback){
		this.load(name, function(dialog){
			dialog.resetXY();
			Honey.body.add(dialog);
			callback && callback(dialog);
		});
	},
	close : function(name) {
		if (name instanceof Dialog) Honey.body.removeChild(name);
		else if (this.dialogs[name]) Honey.body.removeChild(this.dialogs[name]);
	},
};
window.DialogM = DialogM;

})();/**
 * Component 一些扩展的元素控件
 * @author Rhine
 * @version 2013-11-11
 */
(function(){
/**
 * 条
 */
function Bar() {
	this._percent = 100;
	Honey.Element.apply(this, arguments);
	
	this.tag = "Bar";
};
Honey.inherit(Bar, Honey.Element);
Honey.Bar = Bar;

Bar.prototype.percent = getset("_percent", function(){
	this.dirty();
});
/**
 * 绘制
 */
Bar.prototype.draw = function(context, rects) {
	context.fillRect(1, 1, (this.width()-2)*this._percent/100, this.height()-2);
};
})();
/**
 * Figure 外形（内容为Sprite的设置数据）
 * @author Rhine
 * @version 2013-11-08
 */
(function(){
function Figure(name, data) {
	this.name = name;
	this.tag = "Figure";
	this.figures = {};
	data && this.set(data);
};

Figure.prototype.set = function(data) {
	for (var status in data) {
		this.statusImage(status, data[status]);
	}
};
/**
 * 获取某个类型的外形
 */
Figure.prototype.get = function(type) {
	return this.figures[type];
};
/**
 * 设置某个状态的图片切图
 */
Figure.prototype.statusImage = function(status, image) {
	var width = image[1], height = image[2], frameLength = image[3], offsetX = image[4], offsetY = image[5];
	for (var dr in Define.Actor.Direction) {
		var i = Define.Actor.Direction[dr];
		var figure = [[], [], [], offsetX, offsetY, width, height, frameLength, parseInt(100/frameLength)];
		forloop (frameLength, function(j){
			figure[0].push([image[0], width*j, height*i, width, height]);
			figure[1].push([[j,0,0,1,1,0,1]]);
		});
		this.figures[status+i] = figure;
	}
};

var loading = {};
var FigureM = {
	figures : {},
	__get : function(name) {
		return new Figure(name, this.figures[name]);
	},
	load : function(name, caller, callback) {
		if (this.figures[name]) {
			callback.call(caller, this.__get(name));
		} else {
			if (!loading[name]) {
				loading[name] = [[caller, callback]];
				Honey.Resource.loadData(Define.Path.Figure+name+".js", this, function(url, data){
					FigureM.__onLoad(name, data);
				});
			} else {
				loading[name].push([caller, callback]);
			}
		}
	},
	__onLoad : function(name, data) {
		if (!loading[name]) return;
		this.figures[name] = data;;
		foreach.call(this, loading[name], function(arr){
			arr[1] && arr[1].call(arr[0], this.__get(name));
		});
		delete loading[name];
	},
};
window.FigureM = FigureM;

})();
/**
 * Character 人物
 * @author Rhine
 * @version 2013-11-05
 */
(function(){

function Character(name, setting) {
	this.tag = "Character";
	this.id = Honey.generateId();
	this.name = name;
	this._nickname = "Character";
	this._attributes = {
		moveSpeed:1,
		attackSpeed:1,
		attack:10,
		defence:2,
		HP:100,
		MP:100,
		HP_MAX:100,
		MP_MAX:100,
	};	//数值属性
	this._level = 1;	//人物等级
	this._profession = "";	//人物职业
	this._skills = [];	//人物技能
	this._avatar = null;	//人物头像
	this._figureName = null;	//人物形象名
	this._figure = null;	//人物形象名
	this._map = null;	//所在地图名
	this._coordinate = [0, 0];	//坐标
	this.Actor = null;
	this.enemy = [];
	this._attackCount = 0;
	
	setting && attach(this, setting);
};
Honey.Character = Character;

Character.prototype.nickname = getset("_nickname");
Character.prototype.attributes = getset("_attributes");
/**
 * 获取设置属性接口
 */
Character.prototype.attr = function(ind, val) {
	if (typeof ind == "object") {
		attach(this._attributes, ind);
		return;
	}
	if (val != undefined) this._attributes[ind] = val;
	return this._attributes[ind];
};
Character.prototype.level = getset("_level");
Character.prototype.profession = getset("_profession");
Character.prototype.skills = getset("_skills");
Character.prototype.avatar = getset("_avatar");
Character.prototype.figure = getset("_figure");
/**
 * 复制出一个副本
 */
Character.prototype.copy = function() {
	var Char = new Character(this.name);
	Char.tag = this.tag;
	Char.nickname(this.nickname());
	Char.level(this.level());
	Char.profession(this.profession());
	Char.skills(this.skills());
	Char.avatar(this.avatar());
	Char.setFigure(this._figureName);
	attach(Char._attributes, this._attributes);
	this.__copy(Char);
	return Char;
};
Character.prototype.__copy = function(Char) {};
/**
 * 设置外形名
 */
Character.prototype.setFigure = function(name) {
	this._figureName = name;
	FigureM.load(name, this, function(figure){
		this.figure(figure);
	});
};
Character.prototype.map = getset("_map", function(){
	if (this.block) this._map.addBlock(this._coordinate);
});
Character.prototype.coordinate = getset("_coordinate");
/**
 * 百分比HP
 */
Character.prototype.percentHP = function() {
	return this.attr("HP")*100/this.attr("HP_MAX");
};

/**
 * 开始战斗
 */
Character.prototype.addEnemy = function(target) {
	if (!this.enemy.length) this.attackTarget(target);
	else if (this.enemy.indexOf(this._attackTarget) == -1) this.enemy.unshift(this._attackTarget);
};
/**
 * 设置攻击目标
 */
Character.prototype.attackTarget = getset("_attackTarget", function(){
	if (!this.inFight()) this.startFight();
	if (this.enemy.indexOf(this._attackTarget) == -1) this.enemy.unshift(this._attackTarget);
});
/**
 * 失去攻击目标
 */
Character.prototype.loseAttackTarget = function() {
	if (!this._attackTarget) return;
	this.enemy.shift();
	if (this.enemy.length) {
		this.attackTarget(this.enemy[0]);
	} else {
		this.endFight();
	}
};
/**
 * 开始战斗
 */
Character.prototype.startFight = function() {
	this.inFight(1);
	this._attackCount = 0;
	this.Actor.startFight(this._attackTarget.Actor);
	//拉近屏幕
	if (this == Honey.MyRole) MainMap.fightScale();
};
Character.prototype.inFight = getset("_inFight");
/**
 * 结束战斗
 */
Character.prototype.endFight = function(result) {
	this._attackTarget = null;
	this.enemy = [];
	this.inFight(0);
	this.Actor.endFight();
	//拉远屏幕
	if (this == Honey.MyRole) MainMap.fightScale();
};
/**
 * 攻击间隔（ms）
 */
Character.prototype.attackSpan = function() {
	return 1000/this.attr("attackSpeed");
};
/**
 * 执行攻击检查
 */
Character.prototype.attack = function() {
	if (this.Actor.moving) return;
	if (!this.inRange(this._attackTarget)) {
		this.Actor.Catch(this._attackTarget.Actor, this, function(){
			this.Actor.startFight(this._attackTarget.Actor);
		});
		return;
	}
	this._attackCount += 10;
	if (this._attackCount >= this.attackSpan()) {
		this._attackCount -= this.attackSpan();
		this.__attack();
	}
};
/**
 * 是否在射程（暂定为1）
 */
Character.prototype.inRange = function(target) {
	var coor1 = this.coordinate(), coor2 = target.coordinate();
	return Math.abs(coor1[0]-coor2[0]) <= 1 && Math.abs(coor1[1]-coor2[1]) <= 1;
};
/**
 * 执行一次攻击
 */
Character.prototype.__attack = function() {
	this.Actor.attack();
	if (this._attackTarget) {
		var target = this._attackTarget;
		var die = target.hurt(this.attr("attack"));
		if (die) this.loseAttackTarget();
	}
};

/**
 * 受伤
 */
Character.prototype.hurt = function(attack) {
	var defence = this.attr("defence");
	var hurt = attack - defence;
	var HP = this.attr("HP");
	HP -= hurt;
	if (HP < 0) HP = 0;
	this.attr("HP", HP);
	this.Actor.floatHurt(hurt);
		
	if (!HP) {
		this.die();
		return 1;
	}
};
/**
 * 死亡
 */
Character.prototype.die = function() {
	if (this.inFight()) this.endFight();
	//if (this == Honey.MyRole) alert("你华丽的败了…");
};

})();
/**
 * Role 角色（玩家Character）
 * @author Rhine
 * @version 2013-11-09
 * 若做网游则Role模块需要增强功能
 */
(function(){

function Role() {
	Honey.Character.apply(this, arguments);
	
	this.tag = "Role";
};
Honey.inherit(Role, Honey.Character);
Honey.Role = Role;

var RoleM = {
	roles : {},
	get : function(name){
		if (!this.roles[name]) this.roles[name] = new Role(name);
		return this.roles[name];
	},
};
window.RoleM = RoleM;

})();
/**
 * NPC Non-Player Character
 * @author Rhine
 * @version 2013-11-09
 */
(function(){

function NPC() {
	this.talk = "...";
	this.options = [];
	
	Honey.Character.apply(this, arguments);
	
	this.tag = "NPC";
};
Honey.inherit(NPC, Honey.Character);
Honey.NPC = NPC;

NPC.prototype.__copy = function(npc) {
	npc.talk = this.talk;
	npc.options = this.options;
};

/**
 * 设置NPC信息
 */
NPC.prototype.config = function(cfg) {
	attach(this, cfg);
	this.configed = 1;
};

var loading = {};
var NPCM = {
	npcs : {},
	__get : function(name) {
		return new NPC(name, this.npcs[name]);
	},
	load : function(name, caller, callback) {
		if (this.npcs[name]) {
			callback.call(caller, this.__get(name));
		} else {
			if (!loading[name]) {
				loading[name] = [[caller, callback]];
				Honey.Resource.loadData(Define.Path.NPC+name+".js", this, function(url, data){
					NPCM.__onLoad(name, data);
				});
			} else {
				loading[name].push([caller, callback]);
			}
		}
	},
	__onLoad : function(name, data) {
		if (!loading[name]) return;
		this.npcs[name] = data;;
		foreach.call(this, loading[name], function(arr){
			arr[1] && arr[1].call(arr[0], this.__get(name));
		});
		delete loading[name];
	},
};
window.NPCM = NPCM;

})();
/**
 * Creep 怪物
 * @author Rhine
 * @version 2013-11-11
 */
(function(){

function Creep() {
	Honey.Character.apply(this, arguments);
	
	this.tag = "Creep";
};
Honey.inherit(Creep, Honey.Character);
Honey.Creep = Creep;

/**
 * 设置怪物信息
 */
Creep.prototype.config = function(cfg) {
	attach(this, cfg);
	this.configed = 1;
};

var loading = {};
var CreepM = {
	creeps : {},
	__get : function(name) {
		return new Creep(name, this.creeps[name]);
	},
	load : function(name, caller, callback) {
		if (this.creeps[name]) {
			callback.call(caller, this.__get(name));
		} else {
			if (!loading[name]) {
				loading[name] = [[caller, callback]];
				Honey.Resource.loadData(Define.Path.Creep+name+".js", this, function(url, data){
					CreepM.__onLoad(name, data);
				});
			} else {
				loading[name].push([caller, callback]);
			}
		}
	},
	__onLoad : function(name, data) {
		if (!loading[name]) return;
		this.creeps[name] = data;;
		foreach.call(this, loading[name], function(arr){
			arr[1] && arr[1].call(arr[0], this.__get(name));
		});
		delete loading[name];
	},
};
window.CreepM = CreepM;

})();
/**
 * Thing(Object) 东西(物件)
 * @author Rhine
 * @version 2013-11-07
 */
(function(){

function Thing() {
	this._coordinate = [0, 0];
	//立足点偏移
	this._foothold = [0, -20];
	this._footholdXY = [0, 0];
	
	Honey.Node.apply(this, arguments);
	
	this.tag = "Thing";
};
Honey.inherit(Thing, Honey.Node);
Honey.Thing = Thing;

/**
 * 设置人物形象
 */
Thing.prototype.figure = function(figure) {
	//精灵
	if (!this.sprite) this.add("Sprite", {name:"sprite"});
	this.sprite.content(figure);
	//计算宽
	this.width(this.sprite.width());
	//计算高
	this.height(this.sprite.height());
};

Thing.prototype.foothold = getset("_foothold");
/**
 * 获取立足点
 */
Thing.prototype.getFoothold = function() {
	if (this.sprite) return [(this.sprite.x()+parseInt(this.sprite.width())/2)+this._foothold[0], this.sprite.y()+this.sprite.height()+this._foothold[1]];
	return this._foothold;
};
/**
 * 获取立足点对应xy
 */
Thing.prototype.getFootholdXY = function() {
	return this._footholdXY;
};
/**
 * 设置立足点对应xy
 */
Thing.prototype.setFootholdXY = function(xy) {
	this._footholdXY = xy;
	var foot = this.getFoothold();
	this.x(xy[0]-foot[0]);
	this.y(xy[1]-foot[1]);
};
/**
 * 设置xy对应立足点
 */
Thing.prototype.resetFootholdXY = function() {
	var foot = this.getFoothold();
	this._footholdXY = [this.x()+foot[0], this.y()+foot[1]];
};
/**
 * 坐标
 */
Thing.prototype.coordinate = getset("_coordinate");
})();
/**
 * I am an Actor!
 * @author Rhine
 * @version 2013-11-05
 */
(function(){

function Actor() {
	this.Character = null;
	//活动范围
	this.activeRect = new Honey.Element({width:Config.TileWidth});
	//姓名条
	this.nameBar = new Honey.LineText({x:0, y:20, setClass:"nameBar", align:"center", z:2});
	//HP条
	this.HP = new Honey.Bar({percent:100, z:3, setClass:"HP_Bar"});
	//人物精灵
	this._sprites = {};
	//阴影
	this.shadow = new Honey.Image({z:0, content:Define.Image.Actor.Shadow});
	//伤害
	this.floatDialog = new Honey.Dialog({z:4, width:100, height:100, texts:[]});
	//方向
	this._direction = Define.Actor.Direction.Down;
	//状态
	this._state = Define.Actor.State.Stand;
	
	Honey.Thing.apply(this, arguments);
	
	this.tag = "Actor";
	this.add([this.floatDialog], [this.activeRect], [this.nameBar], [this.HP], [this.shadow]);
};
Honey.inherit(Actor, Honey.Thing);
Honey.Actor = Actor;

/**
 * 设置人物对象
 */
Actor.prototype.setChar = function(character) {
	this.Character = character;
	character.Actor = this;
	this.fitFigure();
	this.coordinate(character.coordinate());
	switch (character.tag) {
		case "NPC":
			this.activeRect.clickBreak = 1;
			this.activeRect.Events.set({onclick:function(){
				MainMap.moveCloseTo(this.parentNode, function(){
					DialogM.open("npcTalk", function(d){
						d.npc(character);
					});
				});
				/*
				MainMap.MyActor.Catch(this.parentNode, MainMap.MyActor, function(block){
					if (block) return;
					DialogM.open("npcTalk", function(d){
						d.npc(character);
					});
				});
				*/
			}});
			break;
		case "Creep":
			this.activeRect.clickBreak = 1;
			this.activeRect.Events.set({onclick:function(){
				var creep = this.parentNode.Character;
				MainMap.moveCloseTo(this.parentNode, function(){
					Honey.MyRole.attackTarget(creep);
					creep.addEnemy(Honey.MyRole);
				});
				/*
				MainMap.MyActor.Catch(this.parentNode, MainMap.MyActor, function(block){
					if (block) return;
					Honey.MyRole.attackTarget(creep);
					creep.addEnemy(Honey.MyRole);
				});
				*/
			}});
			break;
	}
};
/**
 * 设置人物形象
 */
Actor.prototype.fitFigure = function() {
	var footXY = this.getFootholdXY();
	//获取人物的精灵
	if (this.sprite) this.removeChild(this.sprite);
	this.sprite = this.getCurrentSprite();
	this.add(this.sprite);
	this.foothold(this.sprite.offset);
	//计算宽
	this.width(Math.max(this.sprite.width(), this.shadow.width(), this.nameBar.width()));
	//精灵位置
	this.sprite.x((this.width()-this.sprite.width())/2);
	this.sprite.y(this.nameBar.y()+this.nameBar.height());
	//姓名条位置
	this.nameBar.content(this.Character.nickname());
	this.nameBar.x((this.width()-this.nameBar.width())/2);
	//血条位置
	this.HP.percent(this.Character.percentHP());
	this.HP.x((this.width()-this.HP.width())/2);
	this.HP.y(this.nameBar.y()+this.nameBar.height());
	//阴影位置
	var foot = this.getFoothold();
	this.shadow.x(foot[0]-this.shadow.width()/2);
	this.shadow.y(foot[1]-this.shadow.height()/2);
	//计算高
	this.height(Math.max(this.sprite.y()+this.sprite.height(), this.shadow.y()+this.shadow.height()));
	
	//重置xy
	this.setFootholdXY(footXY);
	
	//计算并设置活动范围
	this.activeRect.x((this.width()-this.activeRect.width())/2);
	this.activeRect.y(this.nameBar.y());
	this.activeRect.height(this.sprite.y()+this.sprite.height()+this.nameBar.y());
	
	//飘伤害位置
	this.floatDialog.x((this.width()-this.floatDialog.width())/2);
};
/**
 * 绘制
 */
/*这里是控制战斗中是否显示其他物体的接口
Actor.prototype.__draw = function(context, rects) {
	if (Honey.MyRole.inFight() && this.Character && !this.Character.inFight()) return;
	Actor.parentClass.__draw.call(this, context, rects);
};
*/
Actor.prototype.draw = function(context, rects) {
	/*context.save();
	context.globalAlpha *= 0.3;
	context.fillRect(0,0,this.width(),this.height());
	context.restore();*/
};
/**
 * 状态（站立，移动，攻击，受伤）
 */
Actor.prototype.state = function(state) {
	if (this._state == state) return;
	this._state = state;
	this.fitFigure();
};
/**
 * 转向
 */
Actor.prototype.turn = function(dx, dy) {
	var direction;
	if (dx > 0) {
		if (dy > 0)
			direction = Define.Actor.Direction.Down;
		else
			direction = Define.Actor.Direction.Right;
	} else if (dx < 0) {
		if (dy < 0)
			direction = Define.Actor.Direction.Up;
		else
			direction = Define.Actor.Direction.Left;
	} else {
		if (dy > 0)
			direction = Define.Actor.Direction.Down;
		else
			direction = Define.Actor.Direction.Up;
	}
	if (dx || dy) this.__turn(direction);
};
Actor.prototype.__turn = function(direction) {
	if (this._direction == direction) return;
	this._direction = direction;
	this.fitFigure();
};
/**
 * 获取当前使用精灵
 */
Actor.prototype.getCurrentSprite = function() {
	var dr = this._state+this._direction;
	if (!this._sprites[dr]) {
		this._sprites[dr] = new Honey.Sprite({z:1,width:100,height:100});
	}
	if (this.Character.figure()) {
		this._sprites[dr].content(this.Character.figure().get(dr));
		if (this._state == Define.Actor.State.Attack) {
			this._sprites[dr].frameDelay /= this.Character.attr("attackSpeed");
		}
	} else
		this.schedule([this.update, Config.ActorTiming]);
	return this._sprites[dr];
};
/**
 * 更新
 */
Actor.prototype.update = function() {
	//检查sprite和figure
	if (!this.sprite.configed && this.Character.figure()) {
		this.sprite.content(this.Character.figure().get(this._state+this._direction));
		if (this._state == Define.Actor.State.Attack) {
			this.sprite.frameDelay /= this.Character.attr("attackSpeed");
		}
		this.fitFigure();
		this.unschedule(this.update);
	}
};
/**
 * 移动到位置
 */
Actor.prototype.moveTo = function(xy, caller, callback) {
	if (!this.moving) this.schedule([this.move, Config.ActorTiming]);
	this.moving = [xy, caller, callback];
};
/**
 * 移动到坐标
 */
Actor.prototype.moveToCoordinate = function(coor, caller, callback) {
	this.moveTo(this.parentNode.coor2xy(coor), caller, callback);
};
/**
 * 追赶上目标
 */
Actor.prototype.Catch = function(actor, caller, callback) {
	this.moveTo(actor, caller, callback);
};
Actor.prototype.move = function() {
	if (!this.moving) return;
	var footXY = this.getFootholdXY();
	var dx, dy;
	if (this.moving[0] instanceof Array) {
		dx = this.moving[0][0]-footXY[0], dy = this.moving[0][1]-footXY[1];
	} else {
		var xy = this.moving[0].getFootholdXY();
		dx = xy[0]-footXY[0], dy = xy[1]-footXY[1];
		if (Math.abs(dx) <= Config.TileWidth/2 && Math.abs(dy) <= Config.TileHeight/2) dx = dy = 0;
	}
	var speed = this.Character.attr("moveSpeed");
	speed *= Config.ActorTiming;
	if (Math.abs(dx) > speed*2) {
		dx = __unit(dx)*speed*2;
	}
	if (Math.abs(dy) > speed) {
		dy = __unit(dy)*speed;
	}
	//转向
	this.turn(dx, dy);
	this.state(Define.Actor.State.Move);
	
	//角色则计算前进是否受阻
	if (this.Character.tag == "Role") {
		var _x = this.x()+dx, _y = this.y()+dy;
		var _coor = this.parentNode.getCoordinate(this.parentNode._sx+footXY[0]+dx, this.parentNode._sy+footXY[1]+dy);
		var _block = this.Character.map().block(_coor);
		if (_block) {
			this.stopMoving(1);
			return;
		}
	}
	
	//未受阻则移动
	if (this == this.parentNode.MyActor) {
		//当前人物移动需要滚动地图
		this.parentNode.scroll(-dx, -dy);
	} else {
		this.x(this.x()+dx);
		this.y(this.y()+dy);
		this.resetFootholdXY();
	}
	if (Math.abs(dx) < speed*2 && Math.abs(dy) < speed) {
		this.stopMoving(0);
	}
	
	
	//计算并设置坐标
	footXY = this.getFootholdXY();
	var coor = this.parentNode.getCoordinate(this.parentNode._sx+footXY[0], this.parentNode._sy+footXY[1]);
	this.coordinate(coor);
	this.Character.coordinate(coor);
	
	function __unit(d) {
		return d ? d/Math.abs(d) : 0;
	};
};
/**
 * 停止移动
 */
Actor.prototype.stopMoving = function(block) {
	this.unschedule(this.move);
	this.state(Define.Actor.State.Stand);
	this.moving[2] && this.moving[2].call(this.moving[1], block);
	this.moving = null;
};

/**
 * 开始战斗
 */
Actor.prototype.startFight = function(target) {
	this.unschedule(this.move);
	this.schedule([this.__attack, 1]);
	this.state(Define.Actor.State.Attack);
	var coor1 = this.getFootholdXY(), coor2 = target.getFootholdXY();
	this.turn(coor2[0]-coor1[0], coor2[1]-coor1[1]);
};
/**
 * 结束战斗
 */
Actor.prototype.endFight = function() {
	this.unschedule(this.__attack);
	this.state(Define.Actor.State.Stand);
};
/**
 * 攻击检查
 */
Actor.prototype.__attack = function() {
	this.Character.attack();
	//this.schedule([this.__attack, 1]);
	//this.state(Define.Actor.State.Attack);
};
/**
 * 执行攻击动作
 */
Actor.prototype.attack = function() {
	this.state(Define.Actor.State.Attack);
	var target = this.Character.attackTarget();
	if (!target) return;
	target = target.Actor;
	var coor1 = this.getFootholdXY(), coor2 = target.getFootholdXY();
	this.turn(coor2[0]-coor1[0], coor2[1]-coor1[1]);
};
/**
 * 飘伤害
 */
Actor.prototype.floatHurt = function(hurt) {
	var text = foreach(this.floatDialog.texts, function(text){
		if (!text.parentNode) return text;
	});
	if (!text) {
		text = this.floatDialog.add("LineText", {width:100, height:20, align:"center", schedule:[function(arg){
			this.y(this.y()-2);
			arg.count = Math.min(arg.count+1, 10);
			this.scale(1+(arg.count/10), 1+(arg.count/10));
			if (this.y() < 20) {
				arg.count = 0;
				this.scale(1, 1);
				this.removed();
			}
		}, 3, {count:0}]}, {color:"red",shadow:1});
		this.floatDialog.texts.push(text);
	}
	text.content("-"+hurt);
	text.y(80);
	this.floatDialog.add(text);
	this.HP.percent(this.Character.percentHP());
};
})();
/**
 * 地图
 */
(function(){

function Map(name, cfg) {
	this.name = name;
	this.width = this.height = 1;
	this.images = [];
	this.pieces = [];
	this.tiles = [];
	this.blocks =  {};	//阻挡
	this._buildings = [];
	this.roles = [];	//该地图玩家角色列表，单机则只有一个
	this._npcs = {};
	this._creeps = {};
	this._ready = 0;
	cfg && this.config(cfg);
};

Map.prototype.ready = getset("_ready");
/**
 * 设置地图信息
 */
Map.prototype.config = function(cfg) {
	attach(this, cfg);
	this.configed = 1;
	this.ready(0);
};
/**
 * 地图初始化数据
 */
Map.prototype.init = function(caller, callback) {
	if (!this.inited) {
		//设置npc
		foreach.call(this, this.npcs(), function(info){
			NPCM.load(info[0], this, function(npc){
				npc.coordinate([info[1], info[2]]);	//由于自动设置阻挡的原因，所以设置坐标要比设置地图靠前
				npc.map(this);
				info[3] = npc;
				this.__onInit(caller, callback);
			});
		});
		//设置怪物
		foreach.call(this, this.creeps(), function(info){
			CreepM.load(info[0], this, function(creep){
				creep.coordinate([info[1], info[2]]);
				creep.map(this);
				info[3] = creep;
				this.__onInit(caller, callback);
			});
		});
	} else {
		callback && callback.call(caller);
	}
};
Map.prototype.__onInit = function(caller, callback) {
	if (foreach.call(this, this.npcs(), function(info){
		if (!info[3]) return 1;
	})) return 0;
	if (foreach.call(this, this.creeps(), function(info){
		if (!info[3]) return 1;
	})) return 0;
	this.inited = 1;
	callback && callback.call(caller);
};

/**
 * 加载地图图片
 */
Map.prototype.loadImages = function(caller, callback) {
	Honey.Resource.loadImages(this.images, this, function(){
		foreach(this.pieces, function(piece){
			piece[0] = Honey.Resource.getImage(piece[0]);
		}, 1);
		this.ready(1);
		callback && callback.call(caller);
	});
};
/**
 * 获取设置npc，设置时传入参数须为数组
 */
Map.prototype.npcs = function(npcs) {
	if (npcs != undefined) {
		foreach.call(this, npcs, function(info){
			this._npcs[info[1]+info[2]*this.height] = info;
		});
	}
	return this._npcs;
};
Map.prototype.npc = function(x, y) {
	return this._npcs[x+y*this.height];
};
/**
 * 获取设置creep，设置时传入参数须为数组
 */
Map.prototype.creeps = function(creeps) {
	if (creeps != undefined) {
		foreach.call(this, creeps, function(info){
			this._creeps[info[1]+info[2]*this.height] = info;
		});
	}
	return this._creeps;
};
Map.prototype.creep = function(x, y) {
	return this._creeps[x+y*this.height];
};

/**
 * 获取格子
 */
Map.prototype.tile = function(x, y) {
	if (x < this.width && y < this.height) return this.pieces[this.tiles[x+y*this.height]];
};

/*
 * 获取阻挡
 */
Map.prototype.block = function(xy) {
	return this.blocks[xy[0]+xy[1]*this.height];
};
/**
 * 添加阻挡
 */
Map.prototype.addBlock = function(xy) {
	var ind = xy[0]+xy[1]*this.height;
	if (!this.blocks[ind]) this.blocks[ind] = 0;
	++this.blocks[ind];
};
/**
 * 减少阻挡
 */
Map.prototype.removeBlock = function(xy) {
	var ind = xy[0]+xy[1]*this.height;
	if (this.blocks[ind]) --this.blocks[ind];
};

var MapM = {
	maps : {},
	get : function(name) {
		if (!this.maps[name]) this.maps[name] = new Map(name);
		return this.maps[name];
	},
	load : function(name, caller, callback) {
		var map = this.get(name);
		if (map.configed) {
			callback.call(caller, map);
		} else {
			Honey.Resource.loadData(Define.Path.Map+name+".js", this, function(url, data){
				map.config(data);
				callback.call(caller, map);
			});
		}
	},
};
window.MapM = MapM;

})();
/**
 * 地图
 */
var MainMap = new Honey.Node(
	{
		fullScreen : 1,
		clickBreak : 1,
		z : -100,
		//scrollable:1,
		schedule : [function(){
			this.children.sort(this.zSort);
		}, 10],
		zSort : function(a, b){
			var aXY = a.getFootholdXY(), bXY = b.getFootholdXY();
			return aXY[1] - bXY[1] || aXY[0] - bXY[0] || a._z-b._z;
		},
	},
	{
		bgColor : "#000",
	},
	{
		onscroll : function(dx, dy){
			var footXY = this.MyActor.getFootholdXY();
			this.MyActor.setFootholdXY([footXY[0]-dx, footXY[1]-dy]);
		},
		onmousedown : function(x, y, evt){
			//if (Honey.MyRole.inFight()) return;
			this._moveGuideXY = [x, y];
			this.moveTo(x, y);
			this.schedule([this.moveGuide, 10]);
			evt.preventDefault();	//取消长按导致的默认事件
			return 1;
		},
		onmousemove : function(x, y){
			//if (Honey.MyRole.inFight()) return;
			this._moveGuideXY = [x, y];
			this.moveTo(x, y);
			return 1;
		},
		onmouseup : function(x, y){
			//if (Honey.MyRole.inFight()) return;
			this.moveTo(x, y);
			this.unschedule(this.moveGuide);
			return 1;
		},
		onmouseout : function(x, y){
			//if (Honey.MyRole.inFight()) return;
			this.moveTo(x, y);
			this.unschedule(this.moveGuide);
		},
	}
);
MainMap.MyActor = MainMap.add("Actor", {z:10});
MainMap.Target = new Honey.Thing({z:9, figure:Define.Sprite.Actor.Target, foothold:[0, -15]});

//注册重置大小事件
EventM.regist("resize", MainMap, function(){
	this.width(this.body().width());
	this.height(this.body().height());
	this.setMyActor(Honey.MyRole);
});
	
/**
 * 设置当前人物
 */
MainMap.setMyActor = function(role) {
	this.MyActor.setChar(role);
	//1.先设置MyActor立柱点在MainMap显示的位置，居中
	this.MyActor.setFootholdXY([ -this._sx + this.width()/2, -this._sy + this.height()/2 ]);
	//2.获取MyActor的坐标所在tile的中心点的xy，移动至显示中心
	var coor = this.MyActor.coordinate();
	var xy = this.coor2xy(coor);
	this.scroll(-this._sx+this.width()/2-xy[0], -this._sy+this.height()/2-xy[1]);
	//设置地图
	if (!this.map || this.map.name != role.mapName) this.setMap(role.mapName);
};
/**
 * 设置地图
 */
MainMap.setMap = function(name) {
	if (this.map) {
		if (this.map.schedule) this.unschedule(this.map.schedule[0]);
	}
	this.mapName = name;
	this.map = MapM.get(name);
	this.clearChildren();
	this.add(this.MyActor);
	MapM.load(name, this, function(map){
		Honey.MyRole.map(map);
		if (map.ready())
			this.dirty();
		else
			map.loadImages(this, function(){
				this.dirty();
			});
		map.init(this, function(){
			//设置npc
			foreach.call(this, map.npcs(), function(info){
				var npc = info[3];
				this.addActor(npc);
			});
			//设置怪物
			foreach.call(this, map.creeps(), function(info){
				var creep = info[3];
				this.addActor(creep);
			});
		});
		//定时
		if (map.schedule) this.schedule(map.schedule);
	});
};

(function(){
//tile宽高，正弦
var w = Config.TileWidth, h = Config.TileHeight, tan = h/w;
/**
 * 添加一个物件
 */
MainMap.addThing = function(thing) {
	this.add(thing);
	var xy = this.coor2xy(thing.coordinate());
	thing.setFootholdXY(xy);
	return thing;
};
/**
 * 添加一个人物
 */
MainMap.addActor = function(character) {
	var actor = character instanceof Honey.Actor ? this.add(character) : this.add("Actor", {name:character.name,setChar:character});
	return this.addThing(actor);
};
/**
 * 绘制
 */
MainMap.draw = function(context) {
	var map = this.map;
	if (!map.configed || !map.ready()) return;
	
	context.save();
	context.translate(-this._sx, -this._sy);
	/*var x0 = -this._sx-w*4-30, y0 = -this._sy+h*4;
	var _x0 = Math.floor((x0+y0/tan)/w);
	var _y0 = Math.floor((-x0+y0/tan)/w);*/
	var x0 = -this._sx, y0 = -MainMap._sy;
	var _xy = this.getCoordinate(0, 0);
	var _x0 = _xy[0], _y0 = _xy[1];
	forloop(Math.ceil(MainMap.width()/w)+2, function(i){
		forloop(Math.ceil(MainMap.height()*2/h)+4, function(j){
			var _x = _x0+i+Math.ceil(j/2)-2;
			var _y = _y0-i+Math.floor(j/2);
			if (_x < 0 || _y < 0) return;
			var x = w/2*(_x-_y-1) - x0;	//x坐标有w/2的左移才能让俩个坐标系零点重合
			var y = h/2*(_x+_y) - y0;
			var img = map.tile(_x, _y);
			if (img && (img[0] instanceof window.Image)) context.drawImage(img[0], img[1], img[2], img[3], img[4], x, y, w, h);
			//显示坐标
			//context.fillStyle = "blue";
			//context.fillText(_x+","+_y, x+20, y+h/2-10);
		});
	});
	context.restore();
};
/**
 * 获取地图上点的坐标
 */
MainMap.getCoordinate = function(x, y) {
	var x0 = -this._sx+x, y0 = -this._sy+y;
	var _x0 = Math.floor((x0+y0/tan)/w);
	var _y0 = Math.floor((-x0+y0/tan)/w);
	return [_x0, _y0];
};
/**
 * 坐标（方块上中心）对应xy值
 */
MainMap.coor2xy = function(coor) {
	return [(coor[0]-coor[1])*w/2, (coor[0]+coor[1]+1)*h/2];
};
/**
 * 当前人物移动
 */
MainMap.moveTo = function(x, y) {
	var coor = this.getCoordinate(x, y);
	if (coor[0] < 0 || coor[1] < 0 || coor[0] >= this.map.width || coor[1] >= this.map.height) return;
	this.Target.coordinate(coor);
	//this.Target.display(1);
	this.addThing(this.Target);
	this.MyActor.moveTo(this.coor2xy(coor), this, function(){
		//this.Target.display(0);
		this.removeChild(this.Target);
	});
};
/**
 * 长按时自动走路
 */
MainMap.moveGuide = function() {
	this.moveTo.apply(this, this._moveGuideXY);
};
/**
 * 移动至某物体附近(强制设定附近不同)
 */
MainMap.moveCloseTo = function(actor, callback) {
	var coor = actor.coordinate();
	this.Target.coordinate(coor);
	//this.Target.display(1);
	this.addThing(this.Target);
	var coor2 = this.MyActor.coordinate();
	var coor3 = [coor[0]+(__unit(coor2[0]-coor[0])||1), coor[1]];
	this.MyActor.moveTo(this.coor2xy(coor3), this, function(){
		//this.Target.display(0);
		this.removeChild(this.Target);
		callback && callback();
	});
	
	function __unit(d) {
		return d ? d/Math.abs(d) : 0;
	};
};

/**
 * 战斗镜头拉近
 */
MainMap.fightScale = function(){
	if (Honey.MyRole.inFight()) {
		this.schedule([function(arg, func){
			arg.count *= 1.05;
			if (arg.count >= 100) {
				arg.count = 100;
				this.unschedule(func);
			}
			var rate = 1+arg.count/300;
			this.scale(rate, rate);
		}, 1, {count:1}]);
	} else {
		this.schedule([function(arg, func){
			if (--arg.count <= 0) {
				this.unschedule(func);
			}
			var rate = 1+arg.count/300;
			this.scale(rate, rate);
		}, 1, {count:100}]);
	}
};
})();
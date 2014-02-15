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

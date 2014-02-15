/**
 * 战斗控制模块
 * @author Rhine
 * @version 2013-11-10
 * 设计 思想：
 * 1.采用即时战斗模式
 * 2.战斗中玩家不可控制（暂定）
 * 3.由战斗心跳控制攻击，玩家比怪先出手
 * 4.战斗中其他玩家不可干预（网游）
 */
(function(){
function Fight() {
	this.tag = "Fight";
	this.id = Honey.generateId();
	
	this.Chars = [];	//[[[Char,count],[Char,count],..],[[Char,count],[Char,count],..],..]
	foreach.call(this, arguments, function(Chars, i){
		this.Chars.push([]);
		foreach.call(this, Chars, function(Char){
			this.Chars[i].push([Char, 0]);
		});
	});
	this.schedule();
};
Fight.prototype.schedule = function() {
	Honey.body.schedule(this);
};
Fight.prototype.unschedule = function() {
	Honey.body.unschedule(this);
};
Fight.prototype.__schedule = function(span) {
	var fight = this;
	foreach(this.Chars, function(Chars){
		foreach(Chars, function(info){
			var Char = info[0];
			if (Char.dead) return;
			info[1] += span;
			if (info[1] >= Char.attackSpan()) {
				info[1] -= Char.attackSpan();
				fight.attack(Char);
			}
		});
	});
	/*
	this.count1 += span;
	this.count2 += span;
	if (this.count1 >= this.Char1.attackSpan()) {
		this.count1 -= this.Char1.attackSpan();
		this.attack(this.Char1, this.Char2);
	}
	if (this.count2 >= this.Char2.attackSpan()) {
		this.count2 -= this.Char2.attackSpan();
		this.attack(this.Char2, this.Char1);
	}
	*/
};
/**
 * Char攻击
 */
Fight.prototype.attack = function(Char) {
	var target = this.getTarget(Char);
	var ap = Char.attr("attack");
	var df = target.attr("defence");
	var damage = ap - df;
	var HP = target.attr("HP");
	HP -= damage;
	if (HP < 0) HP = 0;
	target.attr("HP", HP);
	console.log(Char.nickname(), "attack", target.nickname());
	console.log("damage", damage);
	console.log(target.nickname(), "HP", HP);
	if (!HP) this.die(target);
};
/**
 * 获取攻击目标
 */
Fight.prototype.getTarget = function(Char) {
	if (!Char.attackTarget) {
		Char.attackTarget = foreach(this.Chars, function(Chars){
			return foreach(Chars, function(info){
				if (info[0].tag != Char.tag) return info[0];
			});
		});
	}
	return Char.attackTarget;
};
/**
 * Char死亡
 */
Fight.prototype.die = function(Char) {
	console.log(Char.nickname(), "die");
	Char.dead = 1;
	this.unschedule();
};

var FightM = {
	add : function(Char1, Char2){
		return new Fight([Char1], [Char2]);
	},
	del : function(fight) {
		fight.unschedule();
	},
};
window.FightM = FightM;
})();

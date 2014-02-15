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

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
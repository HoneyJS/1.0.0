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

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

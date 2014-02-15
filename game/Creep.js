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

/**
 * Storage 存储
 * @author Rhine
 * @version 2013-12-30
 */
(function(){
var Storage = {
	storage : window.localStorage,
	get : function(key) {
		if (!this.storage) return;
		var val = this.storage.getItem(key);
		if (val) return JSON.parse(val);
	},
	getAll : function() {
		var all = {};
		forloop.call(this, this.storage.length, function(i){
			all[this.storage.key(i)] = this.get(this.storage.key(i));
		});
		return all;
	},
	set : function(key, val) {
		if (!this.storage) return;
		this.storage.setItem(key, JSON.stringify(val));
	},
	setAll : function(all) {
		foreach(this, all, function(val, ind){
			this.set(ind, val);
		});
		return all;
	},
	remove : function(key) {
		if (!this.storage) return;
		this.storage.removeItem(key);
	},
	clear : function() {
		if (!this.storage) return;
		this.storage.clear();
	},
};

Honey.Storage = {
	_storage : Storage,
	load : function() {
		this._data = this._storage.getAll();
	},
	save : function() {
		this._storage.setAll(this._data);
	},
	get : function(ind) {
		return this._data[ind];
	},
	set : function(ind, val) {
		this._data[ind] = val;
		this._storage.set(ind, val);
	},
	remove : function(ind) {
		delete this._data[ind];
		this._storage.remove(ind);
	},
};
Honey.Storage.load();
})();

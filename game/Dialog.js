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
Define.Element.Dialog = "Dialog";
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
			Game.Stage.add(dialog);
			dialog.resetXY();
			callback && callback(dialog);
		});
	},
	openWrap : function(name, callback){
		this.open("Wrap", function(wrap) {
			DialogM.open(name, function(dialog) {
				wrap.setInside(dialog);
				callback && callback(dialog);
			});
		})
	},
	close : function(name) {
		if (name instanceof Dialog) Game.Stage.removeChild(name);
		else if (this.dialogs[name]) Game.Stage.removeChild(this.dialogs[name]);
	},
};
window.DialogM = DialogM;

})();
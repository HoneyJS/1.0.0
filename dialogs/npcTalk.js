Honey.data=
function(name){

var dialog = new Honey.Dialog({name:name, width:400, height:120, clickBreak:1}, {bgColor:"#aaa",bgAlpha:0.75}, {onclick:function(){
	DialogM.close(dialog);
}});
dialog.add([
	["Image", "avatar"],
	["LineText", "nickname", 150, 10, null, null, {color:"black"}],
	["LineText", "level", 150, 30, null, null, {color:"black"}],
	["LineText", "talk", 150, 50, null, null, {color:"green"}],
]);
dialog.npc = function(npc) {
	this._npc = npc;
	this.freshen();
};
dialog.resetXY = function() {
	this.x((Honey.body.width()-this.width())/2);
	this.y((Honey.body.height()-this.height())/2);
};
dialog.freshen = function() {
	var npc = this._npc;
	this.avatar.content(npc.avatar());
	this.avatar.x((120-this.avatar.width())/2);
	this.avatar.y((120-this.avatar.height())/2);
	//this.avatar.scale(2, 2);
	this.nickname.content(npc.nickname());
	this.level.content("Lv:"+npc.level());
	this.talk.content(npc.talk);
	foreach.call(this, npc.options, addOption);
	forloop.call(this, 10, function(i){
		if (this["option"+i]) this["option"+i].display(0);
	}, npc.options.length);
};

function addOption(option, i) {
	var npc = this._npc, button = this["option"+i];
	if (!button) {
		this.add("Button", "option"+i, 150+110*i, 80, function(){
			option[1](npc);
			DialogM.close(dialog);
		}, {text:option[0]}, Honey.Styles.Button.talk);
	} else {
		button.text(option[0]);
		button.Events.onclick = function(){
			option[1](npc);
			DialogM.close(dialog);
		};
		button.display(1);
	}
};

};
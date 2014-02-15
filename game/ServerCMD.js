(function(){
var ServerCMD = {
	trans : function(data) {
		var arr = splitWithNum(data,' ',2);
		if (this.cmdTrans[arr[0]]) {
			arr[0] = this.cmdTrans[arr[0]];
			arr = splitWithNum(arr.join(' '), ' ',2);
		}
		return arr;
	},
	cmdTrans : {
"#200":"#warehouse",
	},
};
function splitWithNum(str, separtor, num) {
	var arr = str.split(separtor);
	if (arr.length > num) {
		var tmp = arr.splice(num-1);
		arr.push(tmp.join(separtor));
	}
	return arr;
};

ServerCMD.handle = function(cmd, data) {
	var info;
	switch (cmd) {
		case '#allChars':
		case '#register':
		case '#login':
		case '#init':
			Game.Command.Init.handle(cmd, data);
			break;
		case '#fightInfo':
			Game.Command.Fight.handle(cmd, data);
			break;
		default:
			console.log("!!!Unknown ServerCMD: "+cmd);
			break;
	}
	return info;
}

window.ServerCMD = ServerCMD;
})();

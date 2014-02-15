/**
 * Figure 外形（内容为Sprite的设置数据）
 * @author Rhine
 * @version 2013-11-08
 */
(function(){
function Figure(name, data) {
	this.name = name;
	this.tag = "Figure";
	this.figures = {};
	data && this.set(data);
};

Figure.prototype.set = function(data) {
	for (var status in data) {
		this.statusImage(status, data[status]);
	}
};
/**
 * 获取某个类型的外形
 */
Figure.prototype.get = function(type) {
	return this.figures[type];
};
/**
 * 设置某个状态的图片切图
 */
Figure.prototype.statusImage = function(status, image) {
	var width = image[1], height = image[2], frameLength = image[3], offsetX = image[4], offsetY = image[5];
	for (var dr in Define.Actor.Direction) {
		var i = Define.Actor.Direction[dr];
		var figure = [[], [], [], offsetX, offsetY, width, height, frameLength, parseInt(100/frameLength)];
		forloop (frameLength, function(j){
			figure[0].push([image[0], width*j, height*i, width, height]);
			figure[1].push([[j,0,0,1,1,0,1]]);
		});
		this.figures[status+i] = figure;
	}
};

var loading = {};
var FigureM = {
	figures : {},
	__get : function(name) {
		return new Figure(name, this.figures[name]);
	},
	load : function(name, caller, callback) {
		if (this.figures[name]) {
			callback.call(caller, this.__get(name));
		} else {
			if (!loading[name]) {
				loading[name] = [[caller, callback]];
				Honey.Resource.loadData(Define.Path.Figure+name+".js", this, function(url, data){
					FigureM.__onLoad(name, data);
				});
			} else {
				loading[name].push([caller, callback]);
			}
		}
	},
	__onLoad : function(name, data) {
		if (!loading[name]) return;
		this.figures[name] = data;;
		foreach.call(this, loading[name], function(arr){
			arr[1] && arr[1].call(arr[0], this.__get(name));
		});
		delete loading[name];
	},
};
window.FigureM = FigureM;

})();

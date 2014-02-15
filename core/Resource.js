/**
 * Resource 资源
 * @author Rhine
 * @version 2013-10-30
 */
(function(){
/**
 * 图片资源
 */
var Images = {};
var loadingImages = {};
var Resource = {
	getURL : function(url, path) {
		return !path || url.substr(0, 7) == "http://" ? url : path+url;
	},
	getImage : function(url) {
		return Images[url];
	},
	loadImage : function(url, caller, callback, mark) {
		if (url instanceof window.Array) url = url[0];
		if (Images[url]) {
			callback && callback.call(caller, url, Images[url], mark);
		} else {
			if (!loadingImages[url]) {
				var img = new Image();
				loadingImages[url] = [img, [[caller, callback, mark]]];
				img.onload = function(){
					Resource.__onLoadImage(url);
				};
				img.src = this.getURL(url, Define.Path.Image);
			} else {
				loadingImages[url][1].push([caller, callback, mark]);
			}
		}
	},
	loadImages : function(images, caller, callback) {
		if (isEmpty(images)) {
			callback.call(caller);
			return;
		}
		var flag = 0;
		foreach(images, function(image){
			!flag && Resource.loadImage(image, Resource, callback && __callback);
		});
		function __callback(url, img) {
			if (!flag && !foreach(images, function(image){
			if (image instanceof window.Array) image = image[0];
				if (!Images[image]) return 1;
			})) {
				callback.call(caller);
				flag = 1;
			}
		};
	},
	__onLoadImage : function(url) {
		if (!loadingImages[url]) return;
		Images[url] = loadingImages[url][0];
		foreach (loadingImages[url][1], function(arr){
			arr[1] && arr[1].call(arr[0], url, Images[url], arr[2]);
		});
		delete loadingImages[url];
	},
	loadJS : function(url, caller, callback) {
		var oHead = document.getElementsByTagName('HEAD').item(0);
		var oScript = document.createElement("script");
		oScript.type = "text/javascript";
		oScript.src = url+(url.indexOf('?')<0?'?':'&')+"_t="+new Date().getTime();
		oScript.onload = function(){
			callback && callback.call(caller);
		};
		oHead.appendChild(oScript);
	},
	loadData : function(url, caller, callback) {
		this.loadJS(url, this, function(){
			if (!Honey.data) {
				Honey.trace("Resource.loadData(", url ,") error!");
			} else {
				callback.call(caller, url, Honey.data);
				delete Honey.data;
			}
		});
	},
};
Honey.Resource = Resource;
})();

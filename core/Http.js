/***
 * Http Http网络请求模块
 * @author Rhine
 * @version 2013-1-13
 */
(function(){
var Http = {
	get : function(url, params, caller, callback, timeout) {
		var http = this.getXMLHttpRequest();
		if (!http) {
			if (callback) callback.call(caller, false, Define.Http.Fail.NotSupport);
			return;
		}
		url += (url.indexOf('?') < 0 ? '?' : '&')+'_v=';	//TODO:version
		//鍚堝苟鍙傛暟
		if (params && typeof(params) == 'object') {
			for (var key in params)
				url += '&'+key+'='+params[key];
		}
		http.open('GET', url, true);
		this.__callback(http, caller, callback, timeout);
		http.send(null);
	},
	post : function(url, body, caller, callback, timeout){
		var http = this.getXMLHttpRequest();
		if (!http) {
			if (callback) callback.call(caller, false, Define.Http.Fail.NotSupport);
			return;
		}
		
		url += (url.indexOf('?') < 0 ? '?' : '&')+'_v=';	//TODO:version
		http.open('POST', url, true);
		this.__callback(http, caller, callback, timeout);
		http.send(body);
	},
	getXMLHttpRequest : function() {
		if (window.XMLHttpRequest) return new XMLHttpRequest();
		if (window.ActiveXObject) return new ActiveXObject('Microsoft.XMLHttp');
		return null;
	},
	__callback : function(http, caller, callback, timeout) {
		if (!callback) return;
		http.onreadystatechange = function(){
			switch (http.readyState) {
				case Define.Http.ReadyState.Uninitialized:
				case Define.Http.ReadyState.Open:
				case Define.Http.ReadyState.Send:
				case Define.Http.ReadyState.Receiving:
					break;
				case Define.Http.ReadyState.Loaded:
					if (_timeoutId != -1) {
						clearTimeout(_timeoutId);
						_timeoutId = -1;
					}
					if (http.status == 200 || http.status == 304)
						callback.call(caller, true, http.responseText, http);
					else
						callback.call(caller, false, Define.Http.Fail.State+":"+http.status, http);
				break;
			}
		};
		var _timeoutId = setTimeout(function(){
			_timeoutId = -1;
			http.abort();
			callback.call(caller, false, Define.Http.Fail.Timeout, http);
		}, timeout||20000);
	},
};
Honey.Http = Http;
})();
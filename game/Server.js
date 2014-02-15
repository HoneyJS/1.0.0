(function(){
	var Server = {
		sendBuffer:[],
		sendCallbacks:[],
		recvCallbacks:[],
		callbackCMDs:{},
		logintime:0,
		connecting:0,	//用于标识正处理联网状态
		lastConnTime:0,	//用于标识正处理联网状态
		hideLoading:0,	//是否显示联网加载窗口
		loadingDialog:null,	//用于标识本次联网使用的加载窗口
		loadingCount:0,
		loadingCountExtra:0,
		remoteLogined:0,	//异地登录标识
		afkTime:0,
	};
	Server.init = function() {
		if (!this.logintime) {
			//this.logintime = ~~(Honey.now()/1000);
			setInterval(this._sendData, 100);
			this.afkTime = Honey.now();
		}
		//直接准备好每次联网的前缀部分
		this.server = 'p.php?uid='+User.UID+'&pwd='+User.PWD+'&time='+this.logintime+"&name="+(User.ClubID||"");
		//if (_POST.gameId) this.server += "&gameid="+_POST.gameId;
		if (!this.updateInterval) this.updateInterval = setInterval(this.update, 1000*10);
	};
	/**
	 * 
	 */
	Server.__openLoading = function() {
		++this.loadingCount;
		this.loadingDialog&&DialogM.open(this.loadingDialog);
		console.log("loadingCount:", this.loadingCount);
	};
	Server.__closeLoading = function() {
		this.loadingCount -= this.loadingCountExtra;
		this.loadingCountExtra = 0;
		if (--this.loadingCount <= 0) {
			this.loadingCount = 0;
			this.loadingDialog&&DialogM.close(this.loadingDialog);
		}
		console.log("loadingCount:", this.loadingCount);
	};
	/**
	 * 添加需要发送的网络指令及回调函数
	 */
	Server.sendData = function(cmd, callback, extra) {
		var _cmd = cmd||null,
		_callback = callback||null,
		_loading = extra?extra.loadingDialog:null,	//联网窗口id（这里可以指定联网窗口）
		_hideLoading = extra?extra.hideLoading:false,
		_callbackCMD =  extra?extra.callbackCMD:null;	//接收到指定返回命令调用回调函数
		if (_hideLoading) this.hideLoading = _hideLoading;
		else {
			++this.loadingCountExtra;
			Server.__openLoading();
		}
		
		_cmd && this.pushData(_cmd, _callback, _callbackCMD);
		
		//刷新超时未有动作时间
		if (_cmd != "check_mess") this.afkTime = Honey.now();
	};
	/**
	 * 把需要发送的网络指令及回调函数加入缓冲
	 */
	Server.pushData = function(cmd, callback, callbackCMD) {
		if (cmd instanceof Array)
			this.sendBuffer = this.sendBuffer.concat(cmd);
		else if (cmd)
			this.sendBuffer.push(cmd);
		this.addCallback(callback, callbackCMD);
	};
	/**
	 * 添加一个网络连接结束回调
	 */
	Server.addCallback = function(callback, callbackCMD) {
		if (callbackCMD && callback) {
			this.callbackCMDs[callbackCMD] = callback;
		} else if (callback instanceof Array)
			this.sendCallbacks = this.sendCallbacks.concat(callback);
		else if (callback)
			this.sendCallbacks.push(callback);
	};

	Server._sendData = function() {
		if (Server.connecting || !Server.sendBuffer.length) return;
		if (!Server.hideLoading)
			Server.__openLoading();
		else
			++Server.loadingCount;
		Server.connecting = 1;
		var _body = Server.sendBuffer.join('$$');
		//清空指令缓存，并发送请求
		Server.sendBuffer.length = 0;	//清空数组（在此效果与赋值为[]相同，据说效率后者更高，但前者可以保留数组其他属性）
		Server.recvCallbacks = Server.sendCallbacks;
		Server.sendCallbacks = [];
		Honey.Http.post(Server.server, _body, Server, Server.RequestCallback, 30000);
		//if (!Server.hideLoading && window.Loading) Loading.setRate(0, "连接中...");
		console.log("Server._sendData : ", Server.server);
		console.log("Server._sendData : ", _body);
	};
	/**
	*联网回调函数，用于处理联网各种状态下的逻辑
	**/
	Server.RequestCallback = function(success, content, http) {
		if (success) this._recvData(content);
		this.connecting = 0;
		this.lastConnTime = Honey.now();
		this.hideLoading = false;
		this.__recvCallback(success);
		this.onConnectionDone();
		this.__closeLoading();
	};
	Server.__recvCallback = function(success) {
		if (!this.recvCallbacks.length) return;
		foreach(this.recvCallbacks, function(callback){
			callback(success);
		});
		this.recvCallbacks = [];
	};
	/**
	*此函数可以用来进行一些联网结束时要做的事情
	**/
	Server.onConnectionDone = function() {
		if (this.sendBuffer.length) {	//当数据接收并处理结束时，如果发送数据缓存里有新的数据需要发送，则再次调用发送逻辑
			this._sendData();
		}
	};
	/**
	 * 处理接收到的服务器数据
	 */
	Server._recvData = function(str) {
		var arr = str.split('$$');
		console.log("Server._recvData : ", arr.join("\r\n"));
		if (arr[arr.length-1] == "") arr.pop();
		for (var i=0; i<arr.length; ++i) {
			//try{
			var data = ServerCMD.trans(arr[i]);
			var info = ServerCMD.handle(data[0], data[1]);
			//} catch (e) {
			//	console.log(data[0], e);
			//}
			Server.callbackCMDs[data[0]] && Server.callbackCMDs[data[0]](info);
		}
	};
	/**
	*此函数用来进行定时联网
	**/
	Server.update = function() {
		if (!Server.connecting && User.logined && !Server.remoteLogined && !Server.sendBuffer.length && Honey.now()-Server.lastConnTime>5000) {
			//超时离开
			if (Honey.now()-Server.afkTime>600000) {
				alert("您长时间没有动作了，请重新进入游戏！");
				window.location.reload();
				//window.relogin ? window.relogin() : window.history.go(-1);
			} else
				Server.sendData('check_mess', null, {hideLoading:true});
		}
	};
	window.Server = Server;
})();
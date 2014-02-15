/**
 * Sprite 精灵元素
 * @author Rhine
 * @version 2013-11-04
 */
(function(){

function Sprite(attr, style, events) {
	this.configed = 0;
	this.images = [];
	this.pieces = [];
	this.frames = [];	//所有图片动画帧
	this.frameLength = 0;	//动画帧数（包括粒子发射器动画）
	this.frameDelay = 0;	//帧间隔
	this.currentFrame = -1;	//当前帧
	this._delayCounter = -1;	//帧间隔计数
	this.playing = 0;	//播放状态
	this.loop = 1;	//循环
	this.offset = [0, 0];	//偏移值
	this._matrix = new Honey.Matrix();	//矩阵变换
	
	Honey.Element.apply(this, arguments);
	
	this.tag = "Sprite";
	this.ready(0);
};
Honey.inherit(Sprite, Honey.Element);
Honey.Sprite = Sprite;
	
//更新
Sprite.prototype.update = function() {
	if (!this.playing || !this.ready() || !this.frameLength) return;
	//通过判断帧间隔计数来控制动画速度
	if (++this._delayCounter >= this.frameDelay) {
		this.dirty();
		this._delayCounter = 0;
		//动画是否播放结束
		if (++this.currentFrame >= this.frameLength) {
			this.currentFrame = 0;
			//this._onStop && this._onStop();
			if (!this.loop) {
				this.playing = 0;
				return;
			}
		}
	}
	/*
	//检测粒子发射器是否update
	for (var i=0; i<this._particles.length; ++i) {
		var p = this._particles[i];
		if (this.currentFrame >= p.startFrame && this.currentFrame <= p.endFrame) {
			p.update();
			this.dirty();
		}
	}
	*/
};
//绘制
Sprite.prototype.draw = function(context, rect) {
	//是否翻转
	if (this._reverse) {
		this._matrix.identity();
		this._matrix.scale(-1,1,this.width()/2,this.height()/2);
		this._matrix.affect(context);
	}
	
	//图片
	var frame = this.frames[1][this.currentFrame];
	if (frame) foreach.call(this, frame, function(fragment){
		//移位
		(fragment[1]||fragment[2]) && context.translate(fragment[1], fragment[2]);
		this._matrix.identity();
		//var w =  framess[0][fragment[0]]._width, h =  framess[0][fragment[0]]._height;
		var w, h, flag = (fragment[0] instanceof Sprite/*Honey.Particle*/);
		//宽高
		if (flag) {
			w = fragment[0].width, h = fragment[0].height;
		} else {
			var img = this.pieces[fragment[0]];
			w = img[3], h = img[4];
		}
		//旋转
		if (fragment[5]) this._matrix.rotate(fragment[5], w/2, h/2);
		//缩放
		if (fragment[3] != 1 || fragment[4] != 1) this._matrix.scale(fragment[3],fragment[4],w/2,h/2);
		if (!this._matrix.isInitial()) {
			context.save();
			this._matrix.affect(context);
		}
		//透明度
		if (fragment[6] > 0 && fragment[6] > 1) context.globalAlpha *= fragment[6];
		//绘制
		if (flag) {
			fragment[0].__draw(context, rect);
		} else {
			var img = this.pieces[fragment[0]];
			context.drawImage(img[0],img[1],img[2],img[3],img[4],0,0,w,h);
		}
		if (!this._matrix.isInitial()) context.restore();
	});
	/*
	for (var i=0; i<this._particles.length; ++i) {
		var p = this._particles[i];
		if (this.currentFrame >= p.startFrame && this.currentFrame <= p.endFrame) {
			p.draw(context,rect);
		}
	}
	*/
	
	///绘制hitPoint
	///context.strokeStyle = "green";
	///context.strokeRect(this.offsetX[this._partFrames], this.offsetY[this._partFrames], 40, 40);
};
Sprite.prototype.__onContentReady = function() {
	if (this.ready()) return;
	foreach(this.pieces, function(piece){
		piece[0] = Honey.Resource.getImage(piece[0]);
	});
	this.ready(1);
	this.dirty();
	
	this.schedule([this.update, 1]);
};
	/*
	 *frames[i] = [
	 * [url1,url2,....],
	 * [
	 * 	[[id1,28,26,2,2,5,1],[],...],
	 *	[[id2,28,26,2,2,0,0.6]]
	 * ]
	 * [
	 * 	["60#20_3#300_0#5_0#90_30#50_0#0#2#80_50#50_50#02ffff3c_00000005#00ffff32_00000000#167_266",-35,33,0,10000],
	 * 	["60#20_3#300_0#5_0#90_30#50_0#0#2#80_50#50_50#02ffff3c_00000005#00ffff32_00000000#167_266",-35,33,0,10000]
	 * ],
	 * x,y,w,h,sum
	 *]
	 */
Sprite.prototype.content = function(frames) {
	this.configed = 1;
	this.ready(0);
	this.currentFrame = 0;
	this.playing = 1;
	this.frames = frames||[];
	this._reverse = 0;
	this.images = [];	//所有用到的图片
	this.pieces = [];	//所有用到的图片块
	this._particles = [];
	this._w = this._h = 1;
	//偏移值
	this.offset = [0, 0];
	
	var _ready = 1;
	if (!frames) return;
	var a = frames;
	this.offset = [a[3], a[4]];
	this.width(a[5]);
	this.height(a[6]);
	this.frameLength = a[7];
	this.frameDelay = a[8]||1;
	
	//统计图片
	foreach.call(this, a[0], function(piece, i){
		this.pieces.push(piece.concat());
		if (this.images.indexOf(piece[0]) < 0) this.images.push(piece[0]);
	});
	/*
	//替换粒子
	for (var j=0; j<a[1].length; ++j) {
		for (var k=0; k<a[1][j].length; ++k) {
			if (typeof a[1][j][k][0] == 'string') {
				a[1][j][k][0] = new Honey.Particle(AniM.Pars[a[1][j][k][0]] || a[1][j][k][0]);
			}
		}
	}
	*/
	/*
	//粒子发射器
	for (var n=0; n<a[2].length; ++n) {
		var pe = new ParticleEmitter();
		var b = a[2][n];
		pe.decode(b[0]);
		pe.x = b[1];
		pe.y = b[2];
		pe.startFrame = b[3];
		pe.endFrame = b[4];
		this._particles[n] = pe;
	}
	*/
	//加载图片
	Honey.Resource.loadImages(this.images, this, this.__onContentReady);
};
})();

/**
 * Audio 音频
 * @author Rhine
 * @version 2013-10-29
 */
(function(){

function Audio(src) {
	this.audio = new window.Audio();
	console.log(this.audio);
	if (src) this.audio.src = src;
};
Honey.Audio = Audio;

Audio.prototype.autoplay = function() {
	this.audio.autoplay = true;
	return this;
};
Audio.prototype.loop = function() {
	this.audio.loop = true;
	return this;
};
Audio.prototype.pause = function() {
	this.audio.pause();
	return this;
};
Audio.prototype.play = function() {
	this.audio.play();
	return this;
};
Audio.prototype.restart = function() {
	this.audio.currentTime = 0;
	this.audio.play();
	return this;
};

})();

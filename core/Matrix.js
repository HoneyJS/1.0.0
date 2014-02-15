/**
 * HoneyJS Matrix base on CasualJS Framework by Flashlizi, Copyright (c) 2011 RIAidea.com
 * 
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

(function(){
/**
 * Constructor.
 * @name Matrix
 * @class The Matrix class represents a transformation matrix that determines how to map points from one coordinate space to another.
 * @property a The value that affects the positioning of pixels along the x axis when scaling or rotating an image.
 * @property b The value that affects the positioning of pixels along the y axis when rotating or skewing an image.
 * @property c The value that affects the positioning of pixels along the x axis when rotating or skewing an image.
 * @property d The value that affects the positioning of pixels along the y axis when scaling or rotating an image.
 * @property tx The distance by which to translate each point along the x axis.
 * @property ty The distance by which to translate each point along the y axis.
 */ 
function Matrix(a, b, c, d, tx, ty) {
	this.a = a || 1;
	this.b = b || 0;
	this.c = c || 0;
	this.d = d || 1;
	this.tx = tx || 0;
	this.ty = ty || 0;
	
	this.x = this.y = 0;
	this.sx = this.sy = 1;
	this.r = 0;
};
Honey.Matrix = Matrix;

/**
 * Concatenates a matrix with the current matrix, effectively combining the geometric effects of the two.
 */
Matrix.prototype.concat = function(mtx) {
	var a = mtx.a, b = mtx.b, c = mtx.c, d = mtx.d, tx = mtx.tx, ty = mtx.ty;
	this.transform(a, b, c, d, tx, ty);
};

/**
 * Matrix transforms
 */
Matrix.prototype.transform = function(a, b, c, d, tx, ty) {
	var _a = this.a, _b = this.b, _c = this.c, _d = this.d, _tx = this.tx, _ty = this.ty;
	this.a = a * _a + c * _b;
	this.b = b * _a + d * _b;
	this.c = a * _c + c * _d;
	this.d = b * _c + d * _d;
	this.tx = a * _tx + c * _ty + tx;
	this.ty = b * _tx + d * _ty + ty;
};

/**
 * Matrix affects a context
 */
Matrix.prototype.affect = function(context) {
	if (!this.isInitial()) context.transform(this.a, this.b, this.c, this.d, this.tx, this.ty);
};

/**
 * Concatenates a transformation with the current matrix, effectively combining the geometric effects of the two.
 */
Matrix.prototype.concatTransform = function(x, y, scaleX, scaleY, rotation, regX, regY)
{
	var cos = 1;
	var sin = 0;
	if(rotation%360)
	{
		var r = rotation * Math.PI / 180;
		cos = Math.cos(r);
		sin = Math.sin(r);
	}
	
	if(regX != 0) this.tx -= regX; 
	if(regY != 0) this.ty -= regY;
	this.concat(new Matrix(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y));
}


/**
 * Applies a rotation transformation to the Matrix object.
 */
Matrix.prototype.rotate = function(angle, px, py) {
	if (!(angle%360)) return;
	var radian = angle * Math.PI / 180;
	var cos = Math.cos(radian), sin = Math.sin(radian);
	this.translate(-px, -py);
	this.transform(cos, sin, -sin, cos, 0, 0);
	this.translate(px, py);
};

/**
 * Applies a scaling transformation to the matrix.
 */
Matrix.prototype.scale = function(sx, sy, px, py) {
	this.translate(-px, -py);
	this.transform(sx, 0, 0, sy, 0, 0);
	this.translate(px, py);
};

/**
 * Translates the matrix along the x and y axes, as specified by the dx and dy parameters.
 */
Matrix.prototype.translate = function(dx, dy) {
	this.tx += dx;
	this.ty += dy;
};

/**
 * computes the matrix
 */
Matrix.prototype.compute = function(px, py) {
	this.identity();
	this.scale(this.sx, this.sy, px, py);
	this.rotate(this.r, px, py);
	this.translate(this.x, this.y);
};

/**
 * computes the coordinate after this matrix transform
 */
Matrix.prototype.coordinate = function(x, y) {
	return [Math.floor(this.a * x + this.c * y + this.tx), Math.floor(this.b * x + this.d * y + this.ty)];
};

/**
 * Sets each matrix property to a value that causes a null transformation.
 */
Matrix.prototype.identity = function() {
	this.a = this.d = 1;
	this.b = this.c = this.tx = this.ty = 0;
}

/**
 * checks if each matrix property equals its initial value
 */
Matrix.prototype.isInitial = function() {
	return this.a == this.b == 1 && this.c == this.d == this.tx == this.ty == 0;
};

/**
 * Performs the opposite transformation of the original matrix.
 */
Matrix.prototype.invert = function()
{
	var a = this.a;
	var b = this.b;
	var c = this.c;
	var d = this.d;
	var tx = this.tx;
	var i = a * d - b * c;
	
	this.a = d / i;
	this.b = -b / i;
	this.c = -c / i;
	this.d = a / i;
	this.tx = (c * this.ty - d * tx) / i;
	this.ty = -(a * this.ty - b * tx) / i;
}

/**
 * Returns a new Matrix object that is a clone of this matrix, with an exact copy of the contained object.
 */
Matrix.prototype.clone = function() {
	return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
};

/**
 * Returns a text value listing the properties of the Matrix object.
 */
Matrix.prototype.toString = function()
{
	return "(a="+this.a+", b="+this.b+", c="+this.c+", d="+this.d+", tx="+this.tx+", ty="+this.ty+")";
}

})();
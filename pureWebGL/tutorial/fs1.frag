precision mediump float;

uniform float ratio;
uniform sampler2D textureUnit1;
uniform sampler2D textureUnit2;
uniform sampler2D textureUnit3;
uniform sampler2D textureUnit4;
uniform vec2 fittingRatio;
uniform float threshold;
uniform float edgeWidth;
uniform float time;
uniform vec2 resolution;

varying vec4 vColor;
varying vec2 vTexCoord;

// void disk(vec2 r, vec2 center, float radius, vec3 color, inout vec3 pixel) {
// 	if( length(r-center) < radius) {
// 		pixel = color;
// 	}
// }
// // 20
// float disk(vec2 r, vec2 center, float radius) {
// 	float distanceFromCenter = length(r-center);
// 	float outsideOfDisk = smoothstep( radius-0.005, radius+0.005, distanceFromCenter);
// 	float insideOfDisk = 1.0 - outsideOfDisk;
// 	return insideOfDisk;
// }
float PI = 3.142592;
float TWOPI = PI * 2.;
float linearstep(float edge0, float edge1, float x) {
	float t = (x - edge0)/(edge1 - edge0);
	return clamp(t, 0.0, 1.0);
}
float smootherstep(float edge0, float edge1, float x) {
	float t = (x - edge0)/(edge1 - edge0);
	float t1 = t*t*t*(t*(t*6. - 15.) + 10.);
	return clamp(t1, 0.0, 1.0);
}
// void plot(vec2 r, float y, float lineThickness, vec3 color, inout vec3 pixel) {
// 	if( abs(y - r.y) < lineThickness ) pixel = color;
// }

// 21
// a function that draws an (anti-aliased) grid of coordinate system
float coordinateGrid(vec2 r) {
	vec3 axesCol = vec3(0.0, 0.0, 1.0);
	vec3 gridCol = vec3(0.5);
	float ret = 0.0;
	
	// Draw grid lines
	const float tickWidth = 0.1;
	for(float i=-2.0; i<2.0; i+=tickWidth) {
		// "i" is the line coordinate.
		ret += 1.-smoothstep(0.0, 0.008, abs(r.x-i));
		ret += 1.-smoothstep(0.0, 0.008, abs(r.y-i));
	}
	// Draw the axes
	ret += 1.-smoothstep(0.001, 0.015, abs(r.x));
	ret += 1.-smoothstep(0.001, 0.015, abs(r.y));
	return ret;
}
// // returns 1.0 if inside circle
// float disk(vec2 r, vec2 center, float radius) {
// 	return 1.0 - smoothstep( radius-0.005, radius+0.005, length(r-center));
// }
// returns 1.0 if inside the rectangle
float rectangle(vec2 r, vec2 topLeft, vec2 bottomRight) {
	float ret;
	float d = 0.005;
	ret = smoothstep(topLeft.x-d, topLeft.x+d, r.x);
	ret *= smoothstep(topLeft.y-d, topLeft.y+d, r.y);
	ret *= 1.0 - smoothstep(bottomRight.y-d, bottomRight.y+d, r.y);
	ret *= 1.0 - smoothstep(bottomRight.x-d, bottomRight.x+d, r.x);
	return ret;
}
// 24
// TIME, MOTION AND ANIMATION
//
// One of the inputs that a shader gets can be the time.
// In ShaderToy, "iTime" variable holds the value of the
// time in seconds since the shader is started.
//
// Let's change some variables in time!
float disk(vec2 r, vec2 center, float radius) {
	return 1.0 - smoothstep( radius-0.005, radius+0.005, length(r-center));
}
float rect(vec2 r, vec2 bottomLeft, vec2 topRight) {
	float ret;
	float d = 0.005;
	ret = smoothstep(bottomLeft.x-d, bottomLeft.x+d, r.x);
	ret *= smoothstep(bottomLeft.y-d, bottomLeft.y+d, r.y);
	ret *= 1.0 - smoothstep(topRight.y-d, topRight.y+d, r.y);
	ret *= 1.0 - smoothstep(topRight.x-d, topRight.x+d, r.x);
	return ret;
}
// 28
float hash(float seed)
{
	// Return a "random" number based on the "seed"
    return fract(sin(seed) * 43758.5453);
}

vec2 hashPosition(float x)
{
	// Return a "random" position based on the "seed"
	return vec2(hash(x), hash(x * 1.1));
}
float plot(vec2 r, float y, float thickness) {
	return ( abs(y - r.y) < thickness ) ? 1.0 : 0.0;
}

void main() {
	// 28
	vec2 p = vec2(gl_FragCoord.xy / resolution.xy);
	vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y;
	float xMax = resolution.x/resolution.y;	

	vec3 bgCol = vec3(0.3);
	vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	vec3 col2 = vec3(1.00, 0.329, 0.298); // yellow
	vec3 col3 = vec3(0.867, 0.910, 0.247); // red

	vec3 ret = bgCol;

	vec3 white = vec3(1.);
	vec3 gray = vec3(.3);
	if(r.y > 0.7) { // -1 to 1 coord +y方向70%
		
		// translated and rotated coordinate system
		vec2 q = (r - vec2(0.,0.9)) * vec2(1., 20.);
		ret = mix(white, gray, coordinateGrid(q));
		
		// just the regular sin function
		float y = sin(5.*q.x) * 2.0 - 1.0;
		
		ret = mix(ret, col1, plot(q, y, 0.1));
	}
	else if(r.y > 0.4) {
		vec2 q = (r-vec2(0.,0.6))*vec2(1.,20.);
		ret = mix(white, col1, coordinateGrid(q));
		
		// take the decimal part of the sin function
		float y = fract(sin(10.*q.x)) * 2.0 - 1.0;
		
		ret = mix(ret, col2, plot(q, y, 0.1));
	}	
	else if(r.y > 0.1) {
		vec3 white = vec3(1.);
		vec2 q = (r-vec2(0.,0.25))*vec2(1.,20.);
		ret = mix(white, gray, coordinateGrid(q));
		
		// scale up the outcome of the sine function
		// increase the scale and see the transition from
		// periodic pattern to chaotic pattern
		float scale = 3.0;
		float y = fract(sin(5.*q.x) * scale) * 2.0 - 1.0;
		
		ret = mix(ret, col1, plot(q, y, 0.2));
	}	
	else if(r.y > -0.2) {
		vec3 white = vec3(1.);
		vec2 q = (r-vec2(0., -0.0))*vec2(1.,10.);
		ret = mix(white, col1, coordinateGrid(q));
		
		float seed = q.x;
		// Scale up with a big real number
		float y = fract(sin(seed) * 43758.5453) * 2.0 - 1.0;
		// this can be used as a pseudo-random value
		// These type of function, functions in which two inputs
		// that are close to each other (such as close q.x positions)
		// return highly different output values, are called "hash"
		// function.
		
		ret = mix(ret, col2, plot(q, y, 0.1));
	}
	else {
		vec2 q = (r-vec2(0., -0.6));
		
		// use the loop index as the seed
		// and vary different quantities of disks, such as
		// location and radius
		for(float i=0.0; i<6.0; i++) {
			// change the seed and get different distributions
			float seed = i + 0.0; 
			vec2 pos = (vec2(hash(seed), hash(seed + 0.5))-0.5)*3.;;
			float radius = hash(seed + 3.5);
			pos *= vec2(1.0,0.3);
			ret = mix(ret, col1, disk(q, pos, 0.2*radius));
		}		
	}
	
	vec3 pixel = ret;
	gl_FragColor = vec4(pixel, 1.0);



	// // 26
	// vec2 p = vec2(gl_FragCoord.xy / resolution.xy);
	// vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y;
	// float xMax = resolution.x/resolution.y;	
	
	// vec3 bgCol = vec3(0.3);
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // yellow
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // red
	
	// vec3 ret;
	// p.y = 1. - p.y;

	// if(p.x < 1./3.) { // Part I
	// 	ret = texture2D(textureUnit1, vec2(p.x, p.y)).xyz;
	// }
	// else if(p.x < 2./3.) { // Part II
	// 	// ret = texture(iChannel1, 4.*p+vec2(0.,time)).xyz;
	// 	ret = texture2D(
	// 		textureUnit1, // unit number
	// 		p + vec2( // uv
	// 			0.,
	// 			time
	// 		)
	// 	).xyz;
	// } 
	// else if(p.x < 3./3.) { // Part III
	// 	// テクスチャ回転
	// 	r = r - vec2(xMax * 2. / 3., 0.); // 座標調整
	// 	float angle = time; // radian
	// 	mat2 rotMat = mat2(cos(angle), -sin(angle),
  //       	               sin(angle),  cos(angle)); // matrix 2D
	// 	vec2 q = rotMat*r; // 回転
	// 	// vec3 texA = texture(iChannel1, q).xyz;
	// // 	vec3 texB = texture(iChannel2, q).xyz;
	// 	vec3 texA = texture2D(
	// 		textureUnit1, q
	// 	).xyz;
	// 	vec3 texB = texture2D(
	// 		textureUnit2, q
	// 	).xyz;
		
	// 	//マスク逆回転
	// 	angle = -time;
	// 	rotMat = mat2(cos(angle), -sin(angle),
  //       	               sin(angle),  cos(angle));
	// 	q = rotMat*r;
	// 	ret = mix(texA, texB, rect(q, vec2(-0.3, -0.3), vec2(.3, .3))); // rect範囲の時 0 to 1
	// }
	
	// vec3 pixel = ret;
	// gl_FragColor = vec4(pixel, 1.0);



	// // 25
	// // 座標合わせ
	// vec2 p = vec2(gl_FragCoord.xy / resolution.xy);
	// vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y;
	// float t = time;
	// r = r * 8.0;

	// // アニメーション
	// float v1 = sin(r.x + t); // X軸
	// float v2 = sin(r.y + t); // X軸
	// float v3 = sin(r.x + r.y + t); // XY軸（斜め）
	// float v4 = sin(length(r) + t);
	// float v = v1+v2+v3+v4;
	
	// vec3 ret;
	
	// if(p.x < 1./10.) { // Part I
	// 	ret = vec3(v1); // vertical waves
	// } 
	// else if(p.x < 2./10.) { // Part II 0 to 1
	// 	ret = vec3(v2); // horizontal waves
	// } 
	// else if(p.x < 3./10.) { // Part III
	// 	ret = vec3(v3); // diagonal waves
	// }
	// else if(p.x < 4./10.) { // Part IV
	// 	ret = vec3(v4); // circular waves
	// }
	// else if(p.x < 5./10.) { // Part V
	// 	ret = vec3(v);
	// }	
	// else if(p.x < 6./10.) { // Part VI
	// 	ret = vec3(sin(2.*v)); // Add periodicity to the gradients
	// }
	// else if(p.x < 10./10.) { // Part VII
	// 	// mix colors
	// 	v *= 1.0; // sinは増やす
	// 	ret = vec3(sin(v), sin(v + 0.5*PI), sin(v + 1.0*PI));
	// }	
	
	// ret = 0.5 + 0.5 * ret; // 0.5(fixed) to 1.0(dynamic) 黒減らす
	
	// vec3 pixel = ret;
	// gl_FragColor = vec4(pixel, 1.);



	// // 24
	// vec2 p = vec2(gl_FragCoord.xy / resolution.xy);
	// vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y; // yを基準とする
	// float xMax = resolution.x/resolution.y;	
	
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // yellow
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // red
	
	// vec3 ret;
		
	// if(p.x < 1./5.) { // Part I
	// 	vec2 q = r + vec2(xMax * 4./5., 0.);
	// 	ret = vec3(0.2);
	// 	// y coordinate depends on time
	// 	float y = time;
	// 	// mod constraints y to be between 0.0 and 2.0,
	// 	// and y jumps from 2.0 to 0.0
	// 	// substracting -1.0 makes why jump from 1.0 to -1.0
	// 	y = mod(y, 2.0) - 1.0;
	// 	ret = mix(ret, col1, disk(q, vec2(0.0, y), 0.1) );
	// } 
	// else if(p.x < 2./5.) { // Part II
	// 	vec2 q = r + vec2(xMax * 2./5., 0.); // 中心移動
	// 	ret = vec3(0.3);
	// 	// oscillation
	// 	// float amplitude = 0.8;
	// 	// y coordinate oscillates with a period of 0.5 seconds
	// 	float y = 0.8 * sin(0.5 * time * TWOPI);
	// 	// radius oscillates too
	// 	float radius = 0.15 + 0.05 * sin(time*8.0);
	// 	ret = mix(ret, col1, disk(q, vec2(0.0, y), radius) );		
	// } 
	// else if(p.x < 3./5.) { // Part III
	// 	vec2 q = r + vec2(xMax * 0. / 5., 0.); // x scaling
	// 	ret = vec3(0.4); // background
	// 	float x = 0.2 * cos(time * 5.0); // x軸振幅 5倍速
	// 	// but they have a phase difference of PI/2
	// 	float y = -0.3 * sin(time * 5.0);
	// 	// make the color mixture time dependent
	// 	vec3 color = mix(col1, col2, sin(time) * 0.5 + 0.5);
	// 	ret = mix(ret, color, rect(q, vec2(x-0.1, y-0.1), vec2(x+0.1, y+0.1)) );		
	// 	// try different phases, different amplitudes and different frequencies
	// 	// for x and y coordinates
	// }
	// else if(p.x < 4./5.) { // Part IV (0 to 1)
	// 	vec2 q = r + vec2(-xMax * 2./5., 0.); // -1 to 1, + .4の位置
	// 	ret = vec3(0.3); // background
	// 	for(float i=-1.0; i<1.0; i+= 0.2) { // 0.2間隔
	// 		// float x = 0.2*cos(time * 5.0 + i * PI);
	// 		float x = 0.2 * cos(time + i * PI); // 移動にDelayをかける
	// 		float y = i;
	// 		vec2 s = q - vec2(x, y); // 相対原点からアニメーション座標動かす
	// 		// float angle = time * 3. + i;
	// 		float angle = time + i; // 個々の回転のDelay
	// 		mat2 rot = mat2(cos(angle), -sin(angle), sin(angle),  cos(angle));
	// 		s = rot * s; // 行列は乗算
	// 		ret = mix(ret, col1, rect(s, vec2(-0.06, -0.06), vec2(0.06, 0.06)) );			
	// 	}
	// }
	// else if(p.x < 5./5.) { // Part V // よくわからない
	// 	vec2 q = r + vec2(-xMax*4./5., 0.); // -0.8の位置
	// 	ret = vec3(0.2); // 背景色
	// 	// let stop and move again periodically
	// 	// float speed = 2.0;
	// 	float t = time * 2.; // 2倍速
	// 	float stopEveryAngle = PI / 2.0; // 90deg
	// 	float stopRatio = 0.5;
	// 	float t1 = (floor(t) + smoothstep(0.0, 1.0-stopRatio, fract(t)) )*stopEveryAngle;
		
	// 	float x = -0.2*cos(t1);
	// 	float y = 0.3*sin(t1);
	// 	float dx = 0.1 + 0.03*sin(t*10.0);
	// 	float dy = 0.1 + 0.03*sin(t*10.0+PI);
	// 	ret = mix(ret, col1, rect(q, vec2(x-dx, y-dy), vec2(x+dx, y+dy)) );		
	// }
	
	// vec3 pixel = ret;
	// gl_FragColor = vec4(pixel, 1.0);



	// // 23
	// vec2 p = vec2(gl_FragCoord.xy / resolution.xy);
	// vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y;
	// float xMax = resolution.x/resolution.y;	
	
	// vec3 bgCol = vec3(1.0);
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // yellow
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // red
		
	// vec3 ret = bgCol;

	// float angle = 0.6;
	// mat2 rotationMatrix = mat2(cos(angle), -sin(angle),
  //                              sin(angle),  cos(angle));	

	// if(p.x < 1./2.) { // Part I
	// 	// put the origin at the center of Part I
	// 	r = r - vec2(-xMax/2.0, 0.0); // マイナスX方向に

	// 	// 座標を描く
	// 	vec2 rotated = rotationMatrix*r; // 座標を回転
	// 	vec2 rotatedTranslated = rotated - vec2(0.4, 0.5); // 回転済の座標から移動
	// 	ret = mix(ret, col1, coordinateGrid(r)*0.3); // 標準座標
	// 	ret = mix(ret, col2, coordinateGrid(rotated)*0.3); // 回転座標
	// 	ret = mix(ret, col3, coordinateGrid(rotatedTranslated)*0.3); // 回転移動座標

	// 	// 四角
	// 	ret = mix(ret, col1, rectangle(r, vec2(-.1, -.2), vec2(0.1, 0.2)) );
	// 	ret = mix(ret, col2, rectangle(rotated, vec2(-.1, -.2), vec2(0.1, 0.2)) );
	// 	ret = mix(ret, col3, rectangle(rotatedTranslated, vec2(-.1, -.2), vec2(0.1, 0.2)) );
	// } 
	// else if(p.x < 2./2.) { // Part II
	// 	r = r - vec2(xMax*0.5, 0.0); 

	// 	vec2 translated = r - vec2(0.4, 0.5); // 移動
	// 	vec2 translatedRotated = rotationMatrix*translated; //
		
	// 	ret = mix(ret, col1, coordinateGrid(r)*0.3);
	// 	ret = mix(ret, col2, coordinateGrid(translated)*0.3);
	// 	ret = mix(ret, col3, coordinateGrid(translatedRotated)*0.3);

	// 	ret = mix(ret, col1, rectangle(r, vec2(-.1, -.2), vec2(0.1, 0.2)) );
	// 	ret = mix(ret, col2, rectangle(translated, vec2(-.1, -.2), vec2(0.1, 0.2)) );
	// 	ret = mix(ret, col3, rectangle(translatedRotated, vec2(-.1, -.2), vec2(0.1, 0.2)) );		
	// }
	
	// vec3 pixel = ret;
	// gl_FragColor = vec4(pixel, 1.0);



	// // 22
	// vec2 p = vec2(gl_FragCoord.xy / resolution.xy);
	// vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y;
	// float xMax = resolution.x/resolution.y;	
	
	// vec3 bgCol = vec3(1.0);
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // yellow
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // red
		
	// vec3 ret = bgCol;
	
	// // original
	// ret = mix(ret, col1, coordinateGrid(r)/2.0);
	// // scaled
	// float scaleFactor = 3.3; // zoom in this much
	// vec2 q = r / scaleFactor;
	// ret = mix(ret, col2, coordinateGrid(q)/2.0);

	// ret = mix(ret, col2, disk(q, vec2(0.0, 0.0), 0.1));	
	// ret = mix(ret, col1, disk(r, vec2(0.0, 0.0), 0.1));
	
	// ret = mix(ret, col1, rectangle(r, vec2(-0.5, 0.0), vec2(-0.2, 0.2)) );
	// ret = mix(ret, col2, rectangle(q, vec2(-0.5, 0.0), vec2(-0.2, 0.2)) );
	
	// // note how the rectangle that are not centered at the coordinate origin
	// // changed its location after scaling, but the disks at the center
	// // remained where they are.
	// // This is because scaling is done by multiplying all pixel
	// // coordinates with a constant.
	
	// vec3 pixel = ret;
	// gl_FragColor = vec4(pixel, 1.0);



	// // 21
	// vec2 p = vec2(gl_FragCoord.xy / resolution.xy);
	// vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y;
	// float xMax = resolution.x/resolution.y;	
	
	// vec3 bgCol = vec3(1.0);
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // yellow
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // red
	
	// vec3 ret;
	
	// vec2 q;
	// float angle;
	// angle = 0.2*PI; // angle in radians (PI is 180 degrees)
	// // q is the rotated coordinate system
	// q.x =   cos(angle)*r.x + sin(angle)*r.y; // 正規化したglsl座標 + 回転
	// q.y = - sin(angle)*r.x + cos(angle)*r.y;
	
	// ret = bgCol;
	// // draw the old and new coordinate systems
	// ret = mix(ret, col1, coordinateGrid(r)*0.4 ); // .4は薄さ
	// ret = mix(ret, col2, coordinateGrid(q) );
	
	// // draw shapes in old coordinate system, r, and new coordinate system, q
	// ret = mix(ret, col1, disk(r, vec2(1.0, 0.0), 0.2));
	// ret = mix(ret, col2, disk(q, vec2(1.0, 0.0), 0.2));
	// ret = mix(ret, col1, rectangle(r, vec2(-0.8, 0.2), vec2(-0.5, 0.4)) );	
	// ret = mix(ret, col2, rectangle(q, vec2(-0.8, 0.2), vec2(-0.5, 0.4)) );	
	// // as you see both circle are drawn at the same coordinate, (1,0),
	// // in their respective coordinate systems. But they appear
	// // on different locations of the screen
		
	// vec3 pixel = ret;
	// gl_FragColor = vec4(pixel, 1.0);



	// // 20
	// // COLOR ADDITION AND SUBSTRACTION
	// //
	// // How to draw a shape on top of another, and how will the layers
	// // below, affect the higher layers?
	// //
	// // In the previous shape drawing functions, we set the pixel
	// // value from the function. This time the shape function will
	// // just return a float value between 0.0 and 1.0 to indice the
	// // shape area. Later that value can be multiplied with some color
	// // and used in determining the final pixel color.

	// // A function that returns the 1.0 inside the disk area
	// // returns 0.0 outside the disk area
	// // and has a smooth transition at the radius
	// vec2 p = vec2(gl_FragCoord.xy / resolution.xy);
	// vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y;
	// float xMax = resolution.x/resolution.y;	
	
	// vec3 black = vec3(0.0);
	// vec3 white = vec3(1.0);
	// vec3 gray = vec3(0.3);
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // red
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // yellow
	
	// vec3 ret;
	// float d;
	
	// if(p.x < 1./3.) { // Part I
	// 	// opaque layers on top of each other
	// 	ret = gray;
	// 	// assign a gray value to the pixel first
	// 	d = disk(r, vec2(-1.1,0.3), 0.4);
	// 	ret = mix(ret, col1, d); // mix the previous color value with
	// 	                         // the new color value according to
	// 	                         // the shape area function.
	// 	                         // at this line, previous color is gray.
	// 	d = disk(r, vec2(-1.3,0.0), 0.4);
	// 	ret = mix(ret, col2, d);
	// 	d = disk(r, vec2(-1.05,-0.3), 0.4); 
	// 	ret = mix(ret, col3, d); // here, previous color can be gray,
	// 	                         // blue or pink.
	// } 
	// else if(p.x < 2./3.) { // Part II
	// 	// Color addition
	// 	// This is how lights of different colors add up
	// 	// http://en.wikipedia.org/wiki/Additive_color
	// 	ret = black; // start with black pixels
	// 	ret += disk(r, vec2(0.1,0.3), 0.4)*col1; // add the new color
	// 	                                         // to the previous color
	// 	ret += disk(r, vec2(-.1,0.0), 0.4)*col2;
	// 	ret += disk(r, vec2(.15,-0.3), 0.4)*col3;
	// 	// when all components of "ret" becomes equal or higher than 1.0
	// 	// it becomes white.
	// } 
	// else if(p.x < 3./3.) { // Part III
	// 	// Color substraction
	// 	// This is how dye of different colors add up
	// 	// http://en.wikipedia.org/wiki/Subtractive_color
	// 	ret = white; // start with white
	// 	ret -= disk(r, vec2(1.1,0.3), 0.4)*col1;
	// 	ret -= disk(r, vec2(1.05,0.0), 0.4)* col2;
	// 	ret -= disk(r, vec2(1.35,-0.25), 0.4)* col3;			
	// 	// when all components of "ret" becomes equals or smaller than 0.0
	// 	// it becomes black.
	// }
	
	// vec3 pixel = ret;
	// gl_FragColor = vec4(pixel, 1.0);



	// // 19
	// vec2 r = 2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y;
	
	// vec3 bgCol = vec3(1.0);
	// vec3 axesCol = vec3(0.0, 0.0, 1.0);
	// vec3 gridCol = vec3(0.5);
	// vec3 col1 = vec3(0.841, 0.582, 0.594);
	// vec3 col2 = vec3(0.884, 0.850, 0.648);
	// vec3 col3 = vec3(0.348, 0.555, 0.641);	

	// vec3 pixel = bgCol;
	
	// // Draw grid lines
	// const float tickWidth = 0.1;
	// for(float i=-2.0; i<2.0; i+=tickWidth) {
	// 	// "i" is the line coordinate.
	// 	if(abs(r.x - i)<0.004) pixel = gridCol;
	// 	if(abs(r.y - i)<0.004) pixel = gridCol;
	// }
	// // Draw the axes
	// if( abs(r.x)<0.006 ) pixel = axesCol;
	// if( abs(r.y)<0.007 ) pixel = axesCol;
	
	// // Draw functions
	// float x = r.x;
	// float y = r.y;
	
	// // pink functions
	// // y = 2*x + 5
	// if( abs(2.*x + .5 - y) < 0.02 ) pixel = col1;
	// // y = x^2 - .2
	// if( abs(r.x*r.x-0.2 - y) < 0.01 ) pixel = col1;
	// // y = sin(PI x)
	// if( abs(sin(PI*r.x) - y) < 0.02 ) pixel = col1;
	
	// // blue functions, the step function variations
	// // (functions are scaled and translated vertically)
	// if( abs(0.25*step(0.0, x)+0.6 - y) < 0.01 ) pixel = col3;
	// if( abs(0.25*linearstep(-0.5, 0.5, x)+0.1 - y) < 0.01 ) pixel = col3;
	// if( abs(0.25*smoothstep(-0.5, 0.5, x)-0.4 - y) < 0.01 ) pixel = col3;
	// if( abs(0.25*smootherstep(-0.5, 0.5, x)-0.9 - y) < 0.01 ) pixel = col3;
	
	// // yellow functions
	// // have a function that plots functions :-)
	// plot(r, 0.5*clamp(sin(TWOPI*x), 0.0, 1.0)-0.7, 0.015, col2, pixel);
	// // bell curve around -0.5
	// plot(r, 0.6*exp(-10.0*(x+0.8)*(x+0.8)) - 0.1, 0.015, col2, pixel);
	
	// gl_FragColor = vec4(pixel, 1.0);



	// // 18
	// vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y;
	// float xMax = resolution.x/resolution.y;
	
	// vec3 bgCol = vec3(0.3);
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // yellow
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // red

	// vec3 pixel = bgCol;
	// float m;
	
	// float radius = 0.4; // increase this to see the effect better
	// if( r.x < -0.5 * xMax ) { // Part I
	// 	// no interpolation, yes aliasing
	// 	m = step( radius, length(r - vec2(-0.5 * xMax - 0.4, 0.0)) );
	// 	// if the distance from the center is smaller than radius,
	// 	// then mix value is 0.0
	// 	// otherwise the mix value is 1.0
	// 	pixel = mix(col1, bgCol, m);
	// }
	// else if( r.x < -0.0 * xMax ) { // Part II
	// 	// linearstep (first order, linear interpolation)
	// 	m = linearstep(
	// 		radius - 0.005, // edge start
	// 		radius + 0.005, // edge end
	// 		length(r - vec2(-0.0 * xMax -0.4, 0.0)) // 中心から半径分移動
	// 	);
	// 	// mix value is linearly interpolated when the distance to the center
	// 	// is 0.005 smaller and greater than the radius.
	// 	pixel = mix(col1, bgCol, m);
	// }	
	// else if( r.x < 0.5*xMax ) { // Part III
	// 	// smoothstep (cubical interpolation)
	// 	m = smoothstep( radius-0.005, radius+0.005, length(r - vec2(0.5 * xMax -0.4,0.0)) );
	// 	pixel = mix(col1, bgCol, m);
	// }
	// else if( r.x < 1.0*xMax ) { // Part IV
	// 	// smootherstep (sixth order interpolation)
	// 	m = smootherstep( radius-0.005, radius+0.005, length(r - vec2(1.0*xMax-0.4,0.0)) );
	// 	pixel = mix(col1, bgCol, m);
	// }

	// gl_FragColor = vec4(pixel, 1.0);



	// // 17
	// vec2 p = vec2(gl_FragCoord.xy / resolution.xy);
	
	// vec3 bgCol = vec3(0.3);
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // red
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // yellow 
	
	// vec3 ret;
	
	// // divide the screen into four parts horizontally for different
	// // examples
	// if(p.x < 1./5.) { // Part I
	// 	// implementation of mix
	// 	float x0 = 0.2; // first item to be mixed
	// 	float x1 = 0.7;  // second item to be mixed
	// 	float m = 0.1; // amount of mix (between 0.0 and 1.0)
	// 	// play with this number
	// 	// m = 0.0 means the output is fully x0
	// 	// m = 1.0 means the output is fully x1
	// 	// 0.0 < m < 1.0 is a linear mixture of x0 and x1
	// 	float val = x0*(1.0-m) + x1 * m;
	// 	ret = vec3(val);
	// } 
	// else if(p.x < 2./5.) { // Part II
	// 	// try all possible mix values 
	// 	float x0 = 0.2;
	// 	float x1 = 0.7;
	// 	float m = p.y; 
	// 	float val = x0*(1.0-m) + x1 * m;
	// 	ret = vec3(val);		
	// } 
	// else if(p.x < 3./5.) { // Part III
	// 	// use the mix function
	// 	float x0 = 0.2;
	// 	float x1 = 0.7;
	// 	float m = p.y; 
	// 	float val = mix(x0, x1, m);
	// 	ret = vec3(val);		
	// }
	// else if(p.x < 4./5.) { // Part IV
	// 	// mix colors instead of numbers
	// 	float m = p.y;
	// 	ret = mix(col1, col2, m);
	// }
	// else if(p.x < 5./5.) { // Part V
	// 	// combine smoothstep and mix for color transition
	// 	float m = smoothstep(0.5, 0.6, p.y);
	// 	ret = mix(col1, col2, m);
	// }
	
	// vec3 pixel = ret;
	// gl_FragColor = vec4(pixel, 1.0);



	// // 16
	// vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5*resolution.xy)/resolution.y;
	// vec2 p = vec2(gl_FragCoord.xy / resolution.xy);
	
	// vec3 bgCol = vec3(0.0); // black
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // red
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // yellow

	// vec3 pixel = bgCol;
	
	// float edge, variable, ret;
	
	// // divide the screen into four parts horizontally for different
	// // examples
	// if(p.x < 1./5.) { // Part I
	// 	float edge = 0.5;
	// 	ret = step(edge, p.y); // simple step function
	// } 
	// else if(p.x < 2./5.) { // Part II
	// 	// linearstep (not a builtin function)
	// 	float edge0 = 0.45;
	// 	float edge1 = 0.55;
	// 	float t = (p.y - edge0)/(edge1 - edge0); // Normalize
	// 	// when p.y == edge0 => t = 0.0
	// 	// when p.y == edge1 => t = 1.0
	// 	// RHS is a linear function of y
	// 	// so, between edge0 and edge1, t has a linear transition
	// 	// between 0.0 and 1.0
	// 	float t1 = clamp(t, 0.0, 1.0);
	// 	// t will have negative values when t<edge0 and
	// 	// t will have greater than 1.0 values when t>edge1
	// 	// but we want it be constraint between 0.0 and 1.0
	// 	// so, clamp it!		
	// 	ret = t1;
	// } 
	// else if(p.x < 3./5.) { // Part III
	// 	// implementation of smoothstep
	// 	float edge0 = 0.45;
	// 	float edge1 = 0.55;
	// 	float t = clamp((p.y - edge0)/(edge1 - edge0), 0.0, 1.0);
	// 	float t1 = 3.0*t*t - 2.0*t*t*t;
	// 	// previous interpolation was linear. Visually it does not
	// 	// give an appealing, smooth transition.
	// 	// To achieve smoothness, implement a cubic Hermite polynomial
	// 	// 3*t^2 - 2*t^3
	// 	ret = t1;
	// }
	// else if(p.x < 4./5.) { // Part IV
	// 	ret = smoothstep(0.45, 0.55, p.y);
	// }
	// else if(p.x < 5./5.) { // Part V
	// 	// smootherstep, a suggestion by Ken Perlin
	// 	float edge0 = 0.45;
	// 	float edge1 = 0.55;
	// 	float t = clamp((p.y - edge0)/(edge1 - edge0), 0.0, 1.0);		
	// 	// 6*t^5 - 15*t^4 + 10*t^3
	// 	float t1 = t*t*t*(t*(t*6. - 15.) + 10.);
	// 	ret = t1;
	// 	// faster transition and still smoother
	// 	// but computationally more involved.
	// }	
		
	// pixel = vec3(ret); // make a color out of return value.
	// gl_FragColor = vec4(pixel, 1.0);



	// // 15
	// vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5* resolution.xy)/ resolution.y;
	// vec2 p = vec2(gl_FragCoord.xy /  resolution.xy);
	// // use [0,1] coordinate system for this example
	
	// vec3 bgCol = vec3(0.0); // black
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // yellow
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // red

	// vec3 pixel = bgCol;
	
	// float edge, variable, ret;
	
	// // divide the screen into four parts horizontally for different
	// // examples
	// if(p.x < 0.25) { // Part I
	// 	ret = p.y; // the brightness value is assigned the y coordinate
	// 	           // it'll create a gradient
	// } 
	// else if(p.x < 0.5) { // Part II
	// 	float minVal = 0.3; // implementation of clamp
	// 	float maxVal = 0.6;
	// 	float variable = p.y;
	// 	if( variable<minVal ) {
	// 		ret = minVal;
	// 	}
	// 	if( variable>minVal && variable<maxVal ) {
	// 		ret = variable;
	// 	}
	// 	if( variable>maxVal ) {
	// 		ret = maxVal;
	// 	}
	// } 
	// else if(p.x < 0.75) { // Part III
	// 	float minVal = 0.6;
	// 	float maxVal = 0.8;
	// 	float variable = p.y;
	// 	ret = clamp(variable, minVal, maxVal);
	// } 
	// else  { // Part IV
	// 	float y = cos(5.*TWOPI*p.y); // oscillate between +1 and -1
	// 	                             // 5 times, vertically
	// 	y = (y+1.0)*0.5; // map [-1,1] to [0,1]
	// 	ret = clamp(y, 0.2, 0.8);
	// }
	
	// pixel = vec3(ret); // make a color out of return value.
	// gl_FragColor = vec4(pixel, 1.0);



	// // 14
	// vec2 r =  2.0 * vec2(gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
	// float xMax =  resolution.x / resolution.y; // xにfit
	
	// vec3 bgCol = vec3(0.0); // black
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // yellow
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // red

	// vec3 pixel = bgCol;

	// float edge, variable, ret;

	// // divide the screen into five parts horizontally
	// // for different examples
	// if(r.x < -0.6 * xMax) { // Part I
	// 	variable = r.y;
	// 	edge = 0.2;
	// 	if( variable > edge ) { // if the "variable" is greater than "edge"
	// 		ret = 1.0;          // return 1.0
	// 	} else {                // if the "variable" is less than "edge"
	// 		ret = 0.0;          // return 0.0
	// 	}
	// } 
	// else if(r.x < -0.2 * xMax) { // Part II
	// 	variable = r.y;
	// 	edge = -0.2;
	// 	ret = step(edge, variable); // step function is equivalent to the
	// 	                            // if block of the Part I
	// } 
	// else if(r.x < 0.2 * xMax) { // Part III
	// 	// "step" returns either 0.0 or 1.0.
	// 	// "1.0 - step" will inverse the output
	// 	ret = 1.0 - step(0.5, r.y); // Mirror the step function around edge
	// } 
	// else if(r.x < 0.6 * xMax) { // Part IV
	// 	// if y-coordinate is smaller than -0.4 ret is 0.3
	// 	// if y-coordinate is greater than -0.4 ret is 0.3+0.5=0.8
	// 	ret = 0.3 + 0.5 * step(-0.4, r.y);
	// }
	// else { // Part V
	// 	// Combine two step functions to create a gap
	// 	ret = step(-0.3, r.y) * (1.0 - step(0.2, r.y));
	// 	// "1.0 - ret" will create a gap
	// }
	
	// pixel = vec3(ret); // make a color out of return value.
	// gl_FragColor = vec4(pixel, 1.0);



	// // 13
	// vec2 r =  2.0*vec2(gl_FragCoord.xy - 0.5 * resolution.xy)/ resolution.y;
	
	// vec3 bgCol = vec3(0.3);
	// vec3 col1 = vec3(0.216, 0.471, 0.698); // blue
	// vec3 col2 = vec3(1.00, 0.329, 0.298); // red
	// vec3 col3 = vec3(0.867, 0.910, 0.247); // Yellow

	// vec3 pixel = bgCol;
	
	// disk(r, vec2(.25, .25), .25, col3, pixel);
	// disk(r, vec2(-0.5, -0.5), .5, col1, pixel);
	// disk(r, vec2(.25, .75), .25, col2, pixel);
	
	// gl_FragColor = vec4(pixel, 1.0);



	// // 12
	// // [0, resolution.x] -> [-0.5*resolution.x]
	// // [-0.5*resolution.x, 0.5*resolution.x] -> [-1.0, 1.0]
	// // https://nogson2.hatenablog.com/entry/2017/10/23/190343
	// vec2 r =  vec2(gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y * 2.0;
	
	// vec3 bgCol = vec3(0.3);
	// vec3 colBlue = vec3(0.216, 0.471, 0.698);
	// vec3 colRed = vec3(1.00, 0.329, 0.298);
	// vec3 colYellow = vec3(0.867, 0.910, 0.247);

	// vec3 pixel = bgCol;
	
	// // To draw a shape we should know the analytic geometrical
	// // expression of that shape.
	// // A circle is the set of points that has the same distance from
	// // it its center. The distance is called radius.
	// // The distance from the coordinate center is sqrt(x*x + y*y)
	// // Fix the distance as the radius will give the formula for
	// // a circle at the coordinate center
	// // sqrt(x*x + y*y) = radius
	// // The points inside the circle, the disk, is given as
	// // sqrt(x*x + y*y) < radius
	// // Squaring both sides will give
	// // x*x + y*y < radius*radius
	// float radius = .8;
	// if( r.x*r.x + r.y*r.y < radius*radius ) {
	// 	pixel = colBlue;
	// }
	
	// // There is a shorthand expression for sqrt(v.x*v.x + v.y*v.y)
	// // of a given vector "v", which is "length(v)"
	// if( length(r) < 0.3) {
	// 	pixel = colYellow;
	// }
	
	// // draw a disk of which center is not at (0,0).
	// // Say the center is at c: (c.x, c.y). 
	// // The distance of any point r: (r.x, r.y) to c is 
	// // sqrt((r.x-c.x)^2+(r.y-c.y)^2)
	// // define a distance vector d: (r.x - c.x, r.y - c.y)
	// // in GLSL d can be calculated "d = r - c".
	// // Just as in division, substraction of two vectors is done
	// // component by component.
	// // Then, length(d) means sqrt(d.x^2+d.y^2)
	// // which is the distance formula we are looking for.
	// vec2 center = vec2(0.9, -0.4);
	// vec2 d = r - center;
	// if( length(d) < 0.6) {
	// 	pixel = colRed;
	// }
	// // This shifting of the center of the shape works for any
	// // kind of shape. If you have a formula in terms of r
	// // f(r) = 0, then f(r-c)=0 expresses the same geometric shape
	// // but its coordinate is shifted by c.
	
	// gl_FragColor = vec4(pixel, 1.0);



  // // 11 欠陥のある縦合わせ
	// vec2 r = vec2( gl_FragCoord.xy - 0.5*resolution.xy );
	// r = 2.0 * r.xy / resolution.y;
	// // instead of dividing r.x to resolution.x and r.y to resolution.y
	// // divide both of them to resolution.y.
	// // This way r.y will be in [-1.0, 1.0]
	// // and r.x will depend on the frame size. I guess the non-full screen
	// // mode rx will be in [-1.78, 1.78], and in full screen mode
	// // for my laptop, it will be in [-1.6, 1.6] (1440./900.=1.6)
	
	// vec3 backgroundColor = vec3(1.0);
	// vec3 axesColor = vec3(0.0, 0.0, 1.0);
	// vec3 gridColor = vec3(0.5);

	// vec3 pixel = backgroundColor;
	
	// // Draw grid lines
	// const float tickWidth = 0.1;
	// for(float i=-2.0; i<2.0; i+=tickWidth) {
	// 	// "i" is the line coordinate.
	// 	if(abs(r.x - i)<0.004) pixel = gridColor;
	// 	if(abs(r.y - i)<0.004) pixel = gridColor;
	// }
	// // Draw the axes
	// if( abs(r.x)<0.006 ) pixel = axesColor;
	// if( abs(r.y)<0.007 ) pixel = axesColor;
	
	// gl_FragColor = vec4(pixel, 1.0);



  // // 10 modを使ってグリッドを描く
	// vec2 r = vec2( gl_FragCoord.xy - 0.5 * resolution.xy );
	// // [0, resolution.x] -> [-0.5*resolution.x, 0.5*resolution.x]
	// // [0, resolution.y] -> [-0.5*resolution.y, 0.5*resolution.y]
  // // canvas width 700 - 0.5 * 1000 = 200
	// r = 2.0 * r.xy / resolution.xy;
	// // [-0.riResolution.x, 0.5*iResolution.x] -> [-1.0, 1.0]
  // // 2 * 200 / 1000 = .2

	// vec3 backgroundColor = vec3(1.0);
	// vec3 axesColor = vec3(0.0, 0.0, 1.0);
	// vec3 gridColor = vec3(0.5);

	// // start by setting the background color. If pixel's value
	// // is not overwritten later, this color will be displayed.
	// vec3 pixel = backgroundColor;
	
	// // Draw the grid lines
	// // This time instead of going over a loop for every pixel
  //   // we'll use mod operation to achieve the same result
  //   // with a single calculation (thanks to mikatalk)
	// const float tickWidth = 0.1;
	// if( mod(r.x, tickWidth) < 0.008 ) pixel = gridColor;
	// if( mod(r.y, tickWidth) < 0.008 ) pixel = gridColor;
  //   // Draw the axes
	// if( abs(r.x)<0.006 ) pixel = axesColor;
	// if( abs(r.y)<0.007 ) pixel = axesColor;
	
	// gl_FragColor = vec4(pixel, 1.0);



  // // 9 グリッドを引く
	// vec2 r = vec2( gl_FragCoord.xy / resolution.xy );
	
	// vec3 backgroundColor = vec3(1.0);
	// vec3 axesColor = vec3(0.0, 0.0, 1.0);
	// vec3 gridColor = vec3(0.5);

	// vec3 pixel = backgroundColor;
	
	// const float tickWidth = 0.1;
	// for(float i=0.0; i<1.0; i+=tickWidth) {
	// 	if(abs(r.x - i)<0.002) pixel = gridColor;
	// 	if(abs(r.y - i)<0.002) pixel = gridColor;
	// }
	// // Draw the axes
	// if( abs(r.x)<0.005 ) pixel = axesColor;
	// if( abs(r.y)<0.006 ) pixel = axesColor;
	
	// gl_FragColor = vec4(pixel, 1.0);



  // // 8 線を描く
	// vec2 r = vec2( gl_FragCoord.xy / resolution.xy );
	
	// vec3 backgroundColor = vec3(1.0);
	// vec3 color1 = vec3(0.216, 0.471, 0.698);
	// vec3 color2 = vec3(1.00, 0.329, 0.298);
	// vec3 color3 = vec3(0.867, 0.910, 0.247);

	// // 全部塗る
	// vec3 pixel = backgroundColor;
	
	// // 間を塗る1
	// float leftCoord = 0.54;
	// float rightCoord = 0.55;
	// if( r.x < rightCoord && r.x > leftCoord ) pixel = color1;
	
	// // 間を塗る2
	// float lineCoordinate = 0.4;
	// float lineThickness = 0.003;
	// if(abs(r.x - lineCoordinate) < lineThickness) pixel = color2;
	
	// // 垂直線
	// if(abs(r.y - 0.6) < 0.01) pixel = color3;

	// gl_FragColor = vec4(pixel, 1.0);



  // // 7
	// vec2 r = vec2(gl_FragCoord.x / resolution.x, gl_FragCoord.y / resolution.y);

	// vec3 color1 = vec3(0.841, 0.582, 0.594);
	// vec3 color2 = vec3(0.884, 0.850, 0.648);
	// vec3 color3 = vec3(0.348, 0.555, 0.641);
	// vec3 pixel;
	
	// if( r.x < 1.0 / 3.0) {
	// 	pixel = color1;
	// } else if( r.x < 2.0 / 3.0 ) {
	// 	pixel = color2;
	// } else {
	// 	pixel = color3;
	// }
	
	// gl_FragColor = vec4(pixel, 1.0);


  // // 6
	// vec3 color1 = vec3(0.886, 0.576, 0.898);
	// vec3 color2 = vec3(0.537, 0.741, 0.408);
	// vec3 pixel;
	
	// // 0 〜 1 = 塗るピクセル座標 / ウィンドウ座標
	// pixel = ( gl_FragCoord.x > resolution.x / 2.0 ) // Normalize
  //   ? color1
  //   : color2;
	
	// gl_FragColor = vec4(pixel, 1.0);


  // // 5
	// vec3 color1 = vec3(0.886, 0.576, 0.898);
	// vec3 color2 = vec3(0.537, 0.741, 0.408);
	// vec3 pixel;
	
	// float widthOfStrip = 100.0;
	// if( gl_FragCoord.x > widthOfStrip ) {
	// 	pixel = color2;
	// } else {
	// 	pixel = color1;
	// }
	
	// gl_FragColor = vec4(pixel, 1.0);
}


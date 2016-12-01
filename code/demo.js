'use strict';

/* global variables */

var FPS = 10;

var N;
var size;
var dt, diff, visc;
var force, source;
var dvel;

var u = [];
var v = [];
var u_prev = [];
var v_prev = [];

var dens;
var dens_prev = [];

var canvas;
var win_x;
var win_y;
var mouse_down = [0,0,0];

var omx;
var omy;
var mx;
var my;


/*
  ----------------------------------------------------------------------
   free/clear/allocate simulation data
  ----------------------------------------------------------------------
*/


function clear_data (){
	for (var i=0 ; i<size ; i++ ) {
		u[i]
			= v[i]
			= u_prev[i]
			= v_prev[i]
			= dens[i]
			= dens_prev[i]
			= 0.0
			;
	}
}

function allocate_data (){
	size = (N+2)*(N+2);
	
	u			= [];
	v			= [];
	u_prev		= [];
	v_prev		= [];
	dens		= [];
	dens_prev	= [];
	
	clear_data();
}


/**
 * 
 * 
 * https://bocoup.com/weblog/d3js-and-canvas
 */
function draw_velocity ()
{
	//var scale = d3.scale.linear()
	//	.range([1, win_x])
	//	.domain(d3.extent(data))
	//	;
	
	var dataBinding = canvas.selectAll("line")
		.data(v /*, function(d,i) { 
			let coord = XI(i);
			let rtn = {
				i : i,
				coord : coord,
				vel: d,
				x1: coord.i,
				y1: coord.j,
				x2: coord.i+u[i],
				y2: coord.j+d,
			};
			return rtn;
		}*/ )
		;
	
	dataBinding
		/*
		.attr("x2", function(d){return d.x2;})
		.attr("y2", function(d){return d.y2;})
		*/
		.attr("x2", function(d,i){return XI(i).j + u[i];})
		.attr("y2", function(d,i){return XI(i).i + v[i];})
		;
	
	// for new elements, create a 'custom' dom node, of class rect
	// with the appropriate rect attributes
	dataBinding.enter()
		.append("line")
		.attr("stroke-width", "1")
		.attr("stroke","white")
		.attr("x1", function(d,i){
			return XI(i).j;
			})
		.attr("y1", function(d,i){
			return XI(i).i;
			})
		.attr("x2", function(d,i){
			return XI(i).j + u[i];
			})
		.attr("y2", function(d,i){
			return XI(i).i + v[i];
			})
		;
	
	// for exiting elements, change the size to 5 and make them grey.
//	dataBinding.exit()
//		.remove()
//		;
}

function draw_density ()
{
	var h = "" + win_x/N;
	
	var dataBinding = canvas.selectAll("line").data(dens);
	
	dataBinding
		.attr("fill-opacity",function(d){
			return d;
		});
	
	// for new elements, create a 'custom' dom node, of class rect
	// with the appropriate rect attributes
	dataBinding.enter()
		.append("rect")
		.attr("fill","purple")
		.attr("fill-opacity","0")
		.attr("width" ,h)
		.attr("height",h)
		.attr("x", function(d,i){return XI(i).j;})
		.attr("y", function(d,i){return XI(i).i;})
		;
}

/**
 * relates mouse movements to forces sources
 * 
 * 
 * https://developer.mozilla.org/en/docs/Web/Events/mousemove
 */
function get_from_UI (e){
	var LEFT = 1==(1 & e.buttons);
	var RIGHT = 2==(2 & e.buttons);
	
	if( !LEFT && !RIGHT ) return;
	
	console.debug('Mouse Activity: ' + e.buttons);
	
	mx = e.clientX;
	my = e.clientY;
	omx = omx || mx;
	omy = omy || my;
	
	var i = Math.floor((       mx /(1.0*win_x))*N+1);
	var j = Math.floor(((win_y-my)/(1.0*win_y))*N+1);
	
	if ( i<1 || i>N || j<1 || j>N ) return;
	
	var index = IX(i,j);
	
	if (LEFT) {
		u[index] = force * (mx-omx);
		v[index] = force * (omy-my);
	}
	if (RIGHT) {
		dens[index] = source;
	}
	
	omx = mx;
	omy = my;
}


function reshape_func (){
	console.debug("Window Resized");
}

function MainLoop(){
	vel_step ( N, u, v, u_prev, v_prev, visc, dt );
	dens_step ( N, dens, dens_prev, u, v, diff, dt );
	
	draw_velocity();
	draw_density();
}

var loop = null;
function Start(){
	if(!loop){
		loop = setInterval(MainLoop, 1000/FPS);
	}
}

function Stop(){
	clearInterval(loop);
	loop = null;
}

function Reset(){
	clear_data();
}



function init(){
	GetFormValues(d3.select("form").node());
	
	allocate_data();
	
	win_x = 512;
	win_y = 512;
	canvas = d3.select("#vis")
		.append("svg")
		.attr("width", win_x)
		.attr("height", win_y)
		;
	var node = canvas.node();
	
	node.addEventListener("mousedown", function() {
		omx = null;
		omy = null;
		var up = function(){
			node.removeEventListener("mousemove",get_from_UI);
			node.removeEventListener("mouseup",up);
		};
		node.addEventListener("mousemove",get_from_UI);
		node.addEventListener("mouseup",up);
	});
	
	window.onresize = reshape_func;
	
}

function GetFormValues(form){
	N = +form.N.value;
	dt = +form.dt.value;
	diff = +form.diff.value;
	visc = +form.visc.value;
	force = +form.force.value;
	source = +form.source.value;
	dvel = (form.dvel.checked === true);
}

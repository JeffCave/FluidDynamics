'use strict';

/* global variables */

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
	for (let i=0 ; i<size ; i++ ) {
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

function draw_velocity ()
{
	let x, y, h;

	h = 1.0/N;

	glColor3f ( 1.0, 1.0, 1.0 );
	glLineWidth ( 1.0 );

	glBegin ( GL_LINES );

		for (let i=1 ; i<=N ; i++ ) {
			x = (i-0.5)*h;
			for (let j=1 ; j<=N ; j++ ) {
				y = (j-0.5)*h;

				glVertex2f ( x, y );
				glVertex2f ( x+u[IX(i,j)], y+v[IX(i,j)] );
			}
		}

	glEnd ();
}

function draw_density ()
{
	let x, y, h, d00, d01, d10, d11;
	
	h = 1.0/N;
	
	glBegin ( GL_QUADS );
		
		for (let i=0 ; i<=N ; i++ ) {
			x = (i-0.5)*h;
			for (let j=0 ; j<=N ; j++ ) {
				y = (j-0.5)*h;
				
				d00 = dens[IX(i,j)];
				d01 = dens[IX(i,j+1)];
				d10 = dens[IX(i+1,j)];
				d11 = dens[IX(i+1,j+1)];
				
				glColor3f ( d00, d00, d00 ); glVertex2f ( x, y );
				glColor3f ( d10, d10, d10 ); glVertex2f ( x+h, y );
				glColor3f ( d11, d11, d11 ); glVertex2f ( x+h, y+h );
				glColor3f ( d01, d01, d01 ); glVertex2f ( x, y+h );
			}
		}
		
	glEnd ();
}

/*
  ----------------------------------------------------------------------
   relates mouse movements to forces sources
  ----------------------------------------------------------------------
*/

function get_from_UI ( d, u, v )
{

	for (let i=0 ; i<size ; i++ ) {
		u[i] = v[i] = d[i] = 0.0;
	}
	
	if ( !mouse_down[0] && !mouse_down[2] ) return;
	
	i = Math.floor((       mx /(1.0*win_x))*N+1);
	j = Math.floor(((win_y-my)/(1.0*win_y))*N+1);
	
	if ( i<1 || i>N || j<1 || j>N ) return;
	
	if ( mouse_down[0] ) {
		u[IX(i,j)] = force * (mx-omx);
		v[IX(i,j)] = force * (omy-my);
	}
	
	if ( mouse_down[2] ) {
		d[IX(i,j)] = source;
	}
	
	omx = mx;
	omy = my;
}

/*
  ----------------------------------------------------------------------
   GLUT callback routines
  ----------------------------------------------------------------------
*/

function key_func ( key, x, y )
{
	switch ( key )
	{
		case 'c':
		case 'C':
			clear_data ();
			break;

		case 'q':
		case 'Q':
			free_data ();
			exit ( 0 );
			break;

		case 'v':
		case 'V':
			dvel = !dvel;
			break;
	}
}

function mouse_func ( button, state, x, y ){
	omx = mx = x;
	omx = my = y;

	mouse_down[button] = state == GLUT_DOWN;
}

function motion_func (x, y )
{
	mx = x;
	my = y;
}

function reshape_func (width, height )
{
	glutSetWindow ( canvas );
	glutReshapeWindow ( width, height );

	win_x = width;
	win_y = height;
}

function idle_func(){
	get_from_UI ( dens_prev, u_prev, v_prev );
	vel_step ( N, u, v, u_prev, v_prev, visc, dt );
	dens_step ( N, dens, dens_prev, u, v, diff, dt );
}

var loop = null;
function Start(){
	if(!loop){
		loop = setInterval(MainLoop, 10);
	}
}

function Stop(){
	clearInterval(loop);
	loop = null;
}

function Reset(){
	clear_data();
}


/*
  ----------------------------------------------------------------------
   main --- main routine
  ----------------------------------------------------------------------
*/

function MainLoop(){
}

function init(){
	dvel = 0;
	
	allocate_data();
	
	win_x = 512;
	win_y = 512;
	canvase= d3.select("#vis");
	
	var chart = base.append("canvas")
		.attr("width", win_x)
		.attr("height", win_y)
		;
	
	var context = chart.node().getContext("2d");
	
	// Create an in memory only element of type 'custom'
	var detachedContainer = document.createElement("custom");
	
	// Create a d3 selection for the detached container. We won't
	// actually be attaching it to the DOM.
	var dataContainer = d3.select(detachedContainer);

}

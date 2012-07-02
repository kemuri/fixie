/**
 * fixie.grid
 * http://github.com/gridurl
 *
 * A minimalistic CSS/HTML/PSD framework to fasten website development.
 * 
 * Written by Vince Pataky, k3 interactive
 * Based on Jon Gibbins #hashgrid (http://github.com/dotjay/hashgrid) & Joni Korpis Less framework (http://lessframework.com)
 * 
 *
 * Getting started
 * By default you will se the same grid as in the Photoshop files. 
 * The grids automagically change depending on the resolution.
 * Press g for the column grid, r for the rectangular grid, and b for baseline. Use the shift modifier to make them stick.
 * 
 * You can customize the grid with the following options :
 * 
 * var grid = new k3_grid({
 *     align: 'left',           		// optional 'left', 'center' or 'right'
 *     color: '#00a8ff',        		// grid color
 *     alpha: .4,       				// grid opacity
 *     baselines: '8px/red 12px/blue',	// set up custom baselines with baseline_height/color syntax. Seperate them with space
 *     baseline_alpha: .5,       		// baseline opacity
 *     rgrid: '60/#828282 6/#bfbfbf',	// gridline every 60px with 6 subdivisions
 *     rgrid_alpha: .4,       			// gridline opacity	
 *     controls: 'auto',      			// optional 'true','false' or 'auto'
 * });
 *
 * On touch based devices you will see a small toolbar show/hide the grid and the baseline. It can be turned on&off with the controls parameter.
 *
 * More info at fixie.k3i.hu
 */

//Check for jquery, alert if not found
if (typeof jQuery == "undefined") {
	alert("fixie.framework: Coulnd't find jQuery. You should have something like this inside your head tag : <script src='http://ajax.googleapis.com/ajax/libs/jquery/1.4.3/jquery.min.js'></script>");
}

//create the default grid object
$(window).load(function() { 
	var grid = new fixie_grid({controls:'auto'}); 
});


var fixie_grid = function(params) {
	
	//Default config
	var grid_align 		= 	'center';
	var grid_color 		=	'#00a8ff';
	var grid_alpha		=	.2;
	var grid_id 		= 	'k3_grid_container';
	
	var baseline_alpha  =	.4;
	var baseline_id		=	'k3_baseline_container';
	var baselines		= 	'12px/red'
	
	var rgrid_id		=	'k3_rectgrid_container';
	var rgrid_alpha		=	.4;
	var rgrid_setup		=	'60/#828282 6/#bfbfbf'; //gridline every 60px with 6 subdivisions
	
	var grid_hotkey 	=	'g';
	var grid_toggle		=	false;
	var baseline_hotkey =	'b';
	var baseline_toggle =	false;
	var rgrid_hotkey 	=	'r';
	var rgrid_toggle 	=	false;
	
	var controls		= 	'auto'
	
	
	//Init custom config
	if (params != null) {
		if (params.align != null) { grid_align = params.align; }
		if (params.color != null) { grid_color = params.color; }
		if (params.alpha != null) { grid_alpha = params.alpha; }
		if (params.baselines  != null) { baselines  = params.baselines; }
		if (params.baseline_alpha  != null) { baseline_alpha  = params.baseline_alpha; }
		if (params.rgrid  != null) { rgrid_setup  = params.rgrid; }
		if (params.rgrid_alpha  != null) { rgrid_alpha  = params.rgrid_alpha; }
		if (params.controls  != null) { controls  = params.controls; }
	}
	
	var grid;
	var active_grid;
	var controller;
	
	var grid_types 	= 	{
							'desktop' 			: { margin:20,	gutter:20,	columns:8,  column_width:100,	min_width: 980 },			//8 column
							//'desktop' 			: { margin:20,	gutter:20,	columns:8,  column_width:100,	min_width: 980 },		//16 column																						
							'tablet_landscape' 	: { margin:20,	gutter:20,	columns:8,  column_width:100,	min_width: 980 },
							//'tablet_portrait' 	: { margin:90,	gutter:20,	columns:5, 	column_width:100,	min_width: 768 },			//5 column
							'tablet_portrait' 	: { margin:35,	gutter:20,	columns:12, 	column_width:40,	min_width: 768 }, 	//12 column															
							'phone_landscape' 	: { margin:10,	gutter:20,	columns:4, 	column_width:100,	min_width: 480, max_width:767 },	//4 column
							//'phone_landscape' 	: { margin:10,	gutter:20,	columns:8, 	column_width:40,	min_width: 480, max_width:767 },//8 column
							
							'phone_portrait' 	: { margin:20,	gutter:20,	columns:5, 	column_width:40,	max_width: 479, min_width:320}	//5 column
						}
						
						
	init();
	draw_grid();
	draw_baseline();
	draw_rgrid();
	
					
	function init(){
		//Create empty canvas for grid, hide it, add it to the Dom
		var grid_canvas = $('<canvas></canvas>');
		grid_canvas.attr('id', grid_id).css({display: 'none','pointer-events': 'none', 'position':'fixed',left:'0',top:'0','opacity':grid_alpha,'z-index':10000 });

		$("body").prepend(grid_canvas);
		grid = $('#'+grid_id);
		
		//Create empty canvas for baseline, hide it, add it to the Dom
		var baseline_canvas = $('<canvas></canvas>');
		baseline_canvas.attr('id', baseline_id).css({display: 'none','pointer-events': 'none', 'position':'fixed',left:'0',top:'0','opacity':baseline_alpha, 'z-index':10001});

		$("body").prepend(baseline_canvas);
		baseline 	= $('#'+baseline_id);
		
		//Create empty canvas for rectangular grid, hide it, add it to the Dom
		var rgrid_canvas = $('<canvas></canvas>');
		rgrid_canvas.attr('id', rgrid_id).css({display: 'none','pointer-events': 'none', 'position':'fixed',left:'0',top:'0','opacity':rgrid_alpha, 'z-index':10002});

		$("body").prepend(rgrid_canvas);
		rgrid 	= $('#'+rgrid_id);
		
		//Redraw grind & baseline on page resize			
		$(window).resize(function() {
  			var grid_context = grid[0].getContext('2d'); 
			grid_context.clearRect(0, 0, grid[0].width, grid[0].height);
			draw_grid();
			
			var baseline_context = baseline[0].getContext('2d'); 
			baseline_context.clearRect(0, 0, baseline[0].width, baseline[0].height);
			draw_baseline();
			
			var rgrid_context = rgrid[0].getContext('2d'); 
			rgrid_context.clearRect(0, 0, rgrid[0].width, rgrid[0].height);
			draw_rgrid();
			
			
			 
			
			
		});
			
		//Listen for keyboard events
		$(document).bind('keyup', on_key_up);
		$(document).bind('keydown', on_key_down);
		
		//Show grid & baseline if they are toggled
		if (read_cookie('grid_toggle')) {
			grid.fadeIn('fast');
			grid_toggle = true;	
		} 
		
		if (read_cookie('baseline_toggle')) {
			baseline.fadeIn('fast');
			baseline_toggle = true;
		}
		
		if (read_cookie('rgrid_toggle')) {
			rgrid.fadeIn('fast');
			rgrid_toggle = true;
		}
	
		//Draw controls if site is viewed on a mobile device
		if (controls == 'auto') {
			if( navigator.userAgent.match(/(iPhone|iPod|iPad)/) ||
		 	navigator.userAgent.match(/BlackBerry/) ||
		 	navigator.userAgent.match(/Android/) ||
		 	navigator.userAgent.match(/WebOS/)
		 	){
		 		draw_controls();
			}
		} else if (controls) {
			draw_controls();
		}
		
	}
						
	
	function draw_grid(){
		
		var page_height = $(document).height();
		var page_width = $(window).width();
		
		//Determinate correct grid based on resolution	
		if (page_width > grid_types.desktop.min_width) 																		{ active_grid = grid_types.desktop;}
		else if (page_width > grid_types.tablet_landscape.min_width) 														{ active_grid = grid_types.tablet_landscape;}
		else if (page_width >= grid_types.tablet_portrait.min_width) 														{ active_grid = grid_types.tablet_portrait; }
		else if (page_width >= grid_types.phone_landscape.min_width && page_width < grid_types.phone_landscape.max_width ) 	{ active_grid = grid_types.phone_landscape;}
		else if (page_width < grid_types.phone_portrait.max_width) 															{ active_grid = grid_types.phone_portrait;}
		
		grid.attr('height', page_height);	
		grid.attr('width', active_grid.min_width);
		
		//Get canvas context to draw on
		var grid_context = grid[0].getContext('2d'); 
		
		//Set grid color
		grid_context.fillStyle = grid_color; 
		
		//Draw columns
		for (var i=0; i<active_grid.columns; i++){
			if (i == 0) {
				grid_context.fillRect(active_grid.margin, 0, active_grid.column_width, page_height);
			} else {
				grid_context.fillRect(active_grid.margin + active_grid.column_width*i + active_grid.gutter*i, 0, active_grid.column_width, page_height);
			}
		}
		
		//Draw margins
		grid_context.moveTo(0.5, 0); 
		grid_context.lineTo(0.5, page_height);
		grid_context.moveTo(active_grid.min_width-0.5, 0); 
		grid_context.lineTo(active_grid.min_width-0.5, page_height);
		grid_context.strokeStyle = grid_color; 
		grid_context.stroke();
		
		//Position grid
		switch (grid_align) {
			case 'left':
				grid.css({left:0,right:'auto'});
				break;
			case 'center':
				grid.css({'margin-left':'50%', left:0-(grid.attr('width')/2) });
				break;
			case 'right':
				grid.css({left:'auto',right:0});
				break;
		}
		
		if (grid.css("display") != "none") {
			grid.show();
		}
	
	}
	

	function draw_baseline(){
		
		var page_height = $(document).height();
		var page_width = $(window).width();
				
		baseline.attr('height', page_height);	
		baseline.attr('width', page_width);
		
		//Get canvas context to draw on
		var baseline_context = baseline[0].getContext('2d'); 
		
		//Set grid color
		baseline_context.fillStyle = '#'+grid_color; 
		
		//Determinate how many baselines do we need to draw
		var rows = baselines.replace(/px/g,'').split(' ');
		
		//var rgb_color = hex_to_rgb(baseline_color);
		//Draw rows
		for (var i=0; i<rows.length; i++){
			var space = rows[i].split('/')[0];
			var color = rows[i].split('/')[1];

			var row_count = Math.round(page_height/space);
			baseline_context.beginPath();
			for (var z=0; z<row_count; z++) {
				baseline_context.moveTo(0, (space*z)+.5); 
				baseline_context.lineTo(page_width, (space*z)+.5);
			}
			
			baseline_context.strokeStyle = color;
			baseline_context.stroke();
			baseline_context.closePath();
		}
		
				
		if (baseline.css("display") != "none") {
			baseline.show();
		}
	
	}
	
	function draw_rgrid(){
			
			var page_height = $(document).height();
			var page_width = $(window).width();
			
			var diff = Math.floor(Math.abs(($('body').width() - $(window).width()) /2));
			
			rgrid.attr('height', page_height);	
			rgrid.attr('width', page_width);
			
			
			//var rgrid_setup		=	'60/6'; //gridline every 60px with 6 subdivisions
			//var rgrid_color		= 	'#828282/#bfbfbf'; //Gridlinecolor / subdivision color
			
			var main_grid	= rgrid_setup.split(' ')[0].split('/');
			var subdiv_grid = rgrid_setup.split(' ')[1].split('/');
			
			var gridline		= parseInt(main_grid[0]);
			var subdiv			= gridline/parseInt(subdiv_grid[0]);
			
			var color_gridline	= main_grid[1];
			var color_subdiv	= subdiv_grid[1];
			
			//Get canvas context to draw on
			var rgrid_context = rgrid[0].getContext('2d'); 
			
			
		
			// Let's draw the sub lines
			rgrid_context.beginPath();
			var startx = 0;
			var starty = 0;
			
			if (grid_align == 'center') {
				startx = 0- ((Math.round(diff/gridline)*gridline)-diff);
			}
			
									
			for (var i=0; i<(page_width-startx)/subdiv; i++){	//vertical	
				rgrid_context.moveTo(startx+(subdiv*i)+.5,0); 
				rgrid_context.lineTo(startx+(subdiv*i)+.5,page_height);

			}
			
			for (var i=0; i<(page_height-starty)/subdiv; i++){ //horizontal
				rgrid_context.moveTo(0,starty+(subdiv*i)+.5); 
				rgrid_context.lineTo(page_width,starty+(subdiv*i)+.5);
			}

			rgrid_context.strokeStyle = color_subdiv;
			rgrid_context.stroke();
			rgrid_context.closePath();
			
			// Let's draw the main gridlines
			// Draw vertical
			
			rgrid_context.beginPath();
			for (var i=0; i<(page_width-startx)/gridline; i++){
				rgrid_context.moveTo(startx+(gridline*i)+.5, 0); 
				rgrid_context.lineTo(startx+(gridline*i)+.5, page_height);
			}
			
			// Draw horizontal
			for (var i=0; i<(page_height-starty)/gridline; i++){
				rgrid_context.moveTo(0,starty+(gridline*i)+.5); 
				rgrid_context.lineTo(page_width,starty+(gridline*i)+.5);
			}
			rgrid_context.strokeStyle = color_gridline;
			rgrid_context.stroke();
			rgrid_context.closePath();
			
			
			

			if (rgrid.css("display") != "none") {
				rgrid.show();
			}	
	}
		
	function on_key_down(e){
	
		var source = e.target.tagName.toLowerCase();
		if ((source == 'input') || (source == 'textarea') || (source == 'select')) return true;
		
		var key_name = get_key_name(e);
		//alert(key_name);
		switch(key_name) {
			case grid_hotkey :
				if (e.shiftKey){ 
					if (grid_toggle) {
						grid_toggle = false;
						erase_cookie("grid_toggle");
					} else {
						grid_toggle = true;
						create_cookie("grid_toggle", "true", 128);
					}
				}
				if (grid.css("display") != "block") {
					grid.fadeIn('fast');
				}
				break;
			case baseline_hotkey :
				if (e.shiftKey){ 
					if (baseline_toggle) {
						baseline_toggle = false;
						erase_cookie("baseline_toggle");
					} else {
						baseline_toggle = true;
						create_cookie("baseline_toggle", "true", 128);
					}
				}
				if (baseline.css("display") != "block") {
					baseline.fadeIn('fast');	
				}
				break;
			case rgrid_hotkey :
				if (e.shiftKey){ 
					if (rgrid_toggle) {
						rgrid_toggle = false;
						erase_cookie("rgrid_toggle");
					} else {
						rgrid_toggle = true;
						create_cookie("rgrid_toggle", "true", 128);
					}
				}
				if (rgrid.css("display") != "block") {
					rgrid.fadeIn('fast');	
				}
				break;
		
		}
	}
	
	function on_key_up(e){
		var key_name = get_key_name(e);
		switch(key_name) {
			
			case grid_hotkey :
				if (grid.css("display") == "block") {
					if (!grid_toggle) {
						grid.fadeOut('fast');
					}
				}
				break;
			case baseline_hotkey :
				if (baseline.css("display") == "block") {
					if (!baseline_toggle) {
						baseline.fadeOut('fast');
					}
				}
				break;
			case rgrid_hotkey :
				if (rgrid.css("display") == "block") {
					if (!rgrid_toggle) {
						rgrid.fadeOut('fast');
					}
				}
				break;
		}
	}
	
	function get_key_name(e){
		var key_code = e.which;
		return String.fromCharCode(key_code).toLowerCase();
	}
	
	function draw_controls() {
		var grid_controller = $("<div style=\"display:block;position:absolute;left:20px;top:20px;background-color: rgba(0,0,0,.6);width:115px;height:40px;border-radius:8px;z-index:10000\"><canvas id=\"btn_grid\" style=\"position:absolute;left:13px;top:10px;opacity:.6;\" width=\"20\" height=\"20\"></canvas><canvas id=\"btn_baseline\" style=\"position:absolute;left:46px;top:10px;opacity:.6\" width=\"20\" height=\"20\"></canvas><canvas id=\"btn_rgrid\" style=\"position:absolute;left:80px;top:10px;opacity:.6\" width=\"20\" height=\"20\"></canvas></div>");
		grid_controller.attr('id', 'grid_controller');
		
		$("body").prepend(grid_controller);
		if (grid_toggle) { $('#btn_grid').css({'opacity':1});}
		if (baseline_toggle) { $('#btn_baseline').css({'opacity':1});}
		if (rgrid_toggle) { $('#btn_rgrid').css({'opacity':1});}
		
		var btn_grid = $('#btn_grid');
			btn_grid.width = 20;
			btn_grid.height = 20;
		var btn_grid_context = btn_grid[0].getContext('2d'); 
			btn_grid_context.fillStyle = '#FFFFFF'; 
			btn_grid_context.fillRect(0, 0, 5, 20);
			btn_grid_context.fillRect(7, 0, 5, 20);
			btn_grid_context.fillRect(14, 0, 5, 20);
		
		var btn_baseline = $("#btn_baseline");
			btn_baseline.width = 20;
			btn_baseline.height = 20;
		var btn_baseline_context = btn_baseline[0].getContext('2d');
			btn_baseline_context.moveTo(0, .5); 
			btn_baseline_context.lineTo(20, .5);
			btn_baseline_context.moveTo(0, 2.5); 
			btn_baseline_context.lineTo(20, 2.5);
			btn_baseline_context.moveTo(0, 4.5); 
			btn_baseline_context.lineTo(20, 4.5);
			btn_baseline_context.moveTo(0, 6.5); 
			btn_baseline_context.lineTo(20, 6.5);
			btn_baseline_context.moveTo(0, 8.5); 
			btn_baseline_context.lineTo(20, 8.5);
			btn_baseline_context.moveTo(0, 10.5); 
			btn_baseline_context.lineTo(20, 10.5);
			btn_baseline_context.moveTo(0, 12.5); 
			btn_baseline_context.lineTo(20, 12.5);
			btn_baseline_context.moveTo(0, 14.5); 
			btn_baseline_context.lineTo(20, 14.5);
			btn_baseline_context.moveTo(0, 16.5); 
			btn_baseline_context.lineTo(20, 16.5);
			btn_baseline_context.moveTo(0, 18.5); 
			btn_baseline_context.lineTo(14, 18.5);
			btn_baseline_context.strokeStyle = '#FFFFFF'; 
			btn_baseline_context.stroke();
			
		var btn_rgrid = $("#btn_rgrid");
			btn_rgrid.width = 20;
			btn_rgrid.height = 20;
		var btn_rgrid_context = btn_rgrid[0].getContext('2d');
			btn_rgrid_context.moveTo(0, .5); 
			btn_rgrid_context.lineTo(20, .5);
			btn_rgrid_context.moveTo(20, 19.5); 
			btn_rgrid_context.lineTo(0, 19.5);
			btn_rgrid_context.moveTo(0, 0.5); 
			btn_rgrid_context.lineTo(0, 19.5);
			btn_rgrid_context.moveTo(20, 0); 
			btn_rgrid_context.lineTo(20, 19.5);
			btn_rgrid_context.moveTo(4.5, 0); 
			btn_rgrid_context.lineTo(4.5, 20);
			btn_rgrid_context.moveTo(9.5, 0); 
			btn_rgrid_context.lineTo(9.5, 20);
			btn_rgrid_context.moveTo(14.5, 0); 
			btn_rgrid_context.lineTo(14.5, 20);
			btn_rgrid_context.moveTo(0, 4.5); 
			btn_rgrid_context.lineTo(20, 4.5);
			btn_rgrid_context.moveTo(0, 9.5); 
			btn_rgrid_context.lineTo(20, 9.5);
			btn_rgrid_context.moveTo(0, 14.5); 
			btn_rgrid_context.lineTo(20, 14.5);
		
			btn_rgrid_context.strokeStyle = '#FFFFFF'; 
			btn_rgrid_context.stroke();
			
		btn_grid.click(function() {
			if ($(this).css("opacity") != 1) {
				$(this).fadeTo('fast', 1);
				grid_toggle = true;
				create_cookie("grid_toggle", "true", 128);
				grid.fadeIn('fast');
			} else {
				$(this).fadeTo('fast', .6);
				grid_toggle = false;
				erase_cookie("grid_toggle");
				grid.fadeOut('fast');
			}
		});
		
		btn_baseline.click(function() {
			if ($(this).css("opacity") != 1) {
				$(this).fadeTo('fast', 1);
				baseline_toggle = true;
				create_cookie("baseline_toggle", "true", 128);
				baseline.fadeIn('fast');
			} else {
				$(this).fadeTo('fast', .6);
				baseline_toggle = false;
				erase_cookie("baseline_toggle");
				baseline.fadeOut('fast');
			}
		});
		
		btn_rgrid.click(function() {
			if ($(this).css("opacity") != 1) {
				$(this).fadeTo('fast', 1);
				rgrid_toggle = true;
				create_cookie("rgrid_toggle", "true", 128);
				rgrid.fadeIn('fast');
			} else {
				$(this).fadeTo('fast', .6);
				rgrid_toggle = false;
				erase_cookie("rgrid_toggle");
				rgrid.fadeOut('fast');
			}
		});
		
		
		
	}
	
	//Functions to read & write cookies
	function create_cookie(name,value,hours) {
			if (hours) {
				var date = new Date();
				date.setTime(date.getTime()+(hours*60*60*1000));
				var expires = "; expires="+date.toGMTString();
			}
			else var expires = "";
			document.cookie = name+"="+value+expires+"; path=/";
		}

	function read_cookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}

	function erase_cookie(name) {
		create_cookie(name,"",-1);
	}
	

}






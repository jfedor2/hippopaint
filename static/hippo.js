
var color = [ 255, 0, 0 ];
var tool = 'bucket';
var prev_tool = 'bucket';
var brush_down = false;
var prev_xy = null;

var imageSearch;

var undo_data = null;
var data;

var img;

function getpixel(d, x, y) {
	if (x < 0 || x >= d.width || y < 0 || y > d.height) {
		throw 'out of bounds';
	}
	return [d.data[4*(y*d.width+x)], d.data[4*(y*d.width+x)+1], d.data[4*(y*d.width+x)+2]];
}

function putpixel(d, x, y, r, g, b) {
	d.data[4*(y*d.width+x)] = r;
	d.data[4*(y*d.width+x)+1] = g;
	d.data[4*(y*d.width+x)+2] = b;
}

function pixequal(p0, p1) {
	return (p0[0]-p1[0])*(p0[0]-p1[0]) + (p0[1]-p1[1])*(p0[1]-p1[1]) + (p0[2]-p1[2])*(p0[2]-p1[2]) < 600;
}

function fill(d, x, y, r, g, b) {
	if (x < 0 || x >= d.width || y < 0 || y > d.height) {
		return;
	}
	var dd = d.data;
	var w = d.width;
	var h = d.height;
	var c0 = getpixel(d, x, y);
	var c00 = c0[0];
	var c01 = c0[1];
	var c02 = c0[2];
	if (pixequal(c0, [ r, g, b ]) || pixequal(c0, [ 0, 0, 0 ])) {
		return;
	}
	var q = [];
	//putpixel(d, x, y, r, g, b);
	q.push(x);
	q.push(y);
	var x0, y0, neighbours, x1, x2, y1, n, c1, c10, c11, c12;
	//console.time('fill');
	var up, down, idx, idx2, idx3;
	while (q.length) {
		//x0 = q.shift();
		//y0 = q.shift();
		y0 = q.pop();
		x0 = q.pop();

		x1 = x0;
		idx = 4*(y0*w+x1-1);
		while (x1 > 0 && dd[idx]==c00 && dd[idx+1]==c01 && dd[idx+2]==c02) {
			x1--;
			idx -= 4;
		}
		up = down = false;
		idx = 4*(y0*w+x1);
		idx2 = 4*((y0-1)*w+x1);
		idx3 = 4*((y0+1)*w+x1);
		while (x1 < w && dd[idx]==c00 && dd[idx+1]==c01 && dd[idx+2]==c02) {
			dd[idx] = r;
			dd[idx+1] = g;
			dd[idx+2] = b;
			if (y0 > 0) {
				if (!up && dd[idx2]==c00 && dd[idx2+1]==c01 && dd[idx2+2]==c02) {
					q.push(x1);
					q.push(y0-1);
					up = true;
				} else if (up && !(dd[idx2]==c00 && dd[idx2+1]==c01 && dd[idx2+2]==c02)) {
					up = false;
				}
			}
			if (y0 < h-1) {
				if (!down && dd[idx3]==c00 && dd[idx3+1]==c01 && dd[idx3+2]==c02) {
					q.push(x1);
					q.push(y0+1);
					down = true;
				} else if (down && !(dd[idx3]==c00 && dd[idx3+1]==c01 && dd[idx3+2]==c02)) {
					down = false;
				}
			}
			x1++;
			idx += 4;
			idx2 += 4;
			idx3 += 4;
		}
	}
	//console.timeEnd('fill');

/*
		c10 = dd[4*(y0*w+x0)];
		c11 = dd[4*(y0*w+x0)+1];
		c12 = dd[4*(y0*w+x0)+2];

		if (c00==c10 && c01==c11 && c02==c12) {
			//dd[4*(y0*w+x0)] = r;
			//dd[4*(y0*w+x0)+1] = g;
			//dd[4*(y0*w+x0)+2] = b;
			x1 = x0;
			while (x1 >= 0 && dd[4*(y0*w+x1)]==c00 && dd[4*(y0*w+x1)+1]==c01 && dd[4*(y0*w+x1)+2]==c02) {
				dd[4*(y0*w+x1)] = r;
				dd[4*(y0*w+x1)+1] = g;
				dd[4*(y0*w+x1)+2] = b;
				if (y0 > 0 && dd[4*((y0-1)*w+x1)]==c00 && dd[4*((y0-1)*w+x1)+1]==c01 && dd[4*((y0-1)*w+x1)+2]==c02) {
					q.push(x1);
					q.push(y0-1);
				}
				if (y0 < (h-1) && dd[4*((y0+1)*w+x1)]==c00 && dd[4*((y0+1)*w+x1)+1]==c01 && dd[4*((y0+1)*w+x1)+2]==c02) {
					q.push(x1);
					q.push(y0+1);
				}
				x1--;
			}
			x1 = x0 + 1;
			while (x1 < w && dd[4*(y0*w+x1)]==c00 && dd[4*(y0*w+x1)+1]==c01 && dd[4*(y0*w+x1)+2]==c02) {
				dd[4*(y0*w+x1)] = r;
				dd[4*(y0*w+x1)+1] = g;
				dd[4*(y0*w+x1)+2] = b;
				if (y0 > 0 && dd[4*((y0-1)*w+x1)]==c00 && dd[4*((y0-1)*w+x1)+1]==c01 && dd[4*((y0-1)*w+x1)+2]==c02) {
					q.push(x1);
					q.push(y0-1);
				}
				if (y0 < (h-1) && dd[4*((y0+1)*w+x1)]==c00 && dd[4*((y0+1)*w+x1)+1]==c01 && dd[4*((y0+1)*w+x1)+2]==c02) {
					q.push(x1);
					q.push(y0+1);
				}
				x1++;
			}
		}

	}
	console.timeEnd('fill');
*/
/*
		neighbours = [ [x0-1, y0], [x0+1, y0], [x0, y0-1], [x0, y0+1] ];
		for (n in neighbours) {
			x1 = neighbours[n][0];
			y1 = neighbours[n][1];
			//var c1 = getpixel(d, x1, y1);
			c1 = [dd[4*(y1*w+x1)], dd[4*(y1*w+x1)+1], dd[4*(y1*w+x1)+2]];
			//if (pixequal(c0, c1)) {
			if (((c0[0]-c1[0])*(c0[0]-c1[0]) + (c0[1]-c1[1])*(c0[1]-c1[1]) + (c0[2]-c1[2])*(c0[2]-c1[2]) < 600) && !(x1 < 0 || x1 >= w || y1 < 0 || y1 > h)) {
				//putpixel(d, x1, y1, r, g, b);
				dd[4*(y1*w+x1)] = r;
				dd[4*(y1*w+x1)+1] = g;
				dd[4*(y1*w+x1)+2] = b;
				q.push(x1);
				q.push(y1);
			}
		}
*/

/*
			x1 = x0-1;
			y1 = y0;
			c10 = dd[4*(y1*w+x1)];
			c11 = dd[4*(y1*w+x1)+1];
			c12 = dd[4*(y1*w+x1)+2];
			if (x1 >= 0 && c00==c10 && c01==c11 && c02==c12) {
				dd[4*(y1*w+x1)] = r;
				dd[4*(y1*w+x1)+1] = g;
				dd[4*(y1*w+x1)+2] = b;
				q.push(x1);
				q.push(y1);
			}

			x1 = x0+1;
			c10 = dd[4*(y1*w+x1)];
			c11 = dd[4*(y1*w+x1)+1];
			c12 = dd[4*(y1*w+x1)+2];
			if (x1 < w && c00==c10 && c01==c11 && c02==c12) {
				dd[4*(y1*w+x1)] = r;
				dd[4*(y1*w+x1)+1] = g;
				dd[4*(y1*w+x1)+2] = b;
				q.push(x1);
				q.push(y1);
			}

			x1 = x0;
			y1 = y0-1;
			c10 = dd[4*(y1*w+x1)];
			c11 = dd[4*(y1*w+x1)+1];
			c12 = dd[4*(y1*w+x1)+2];
			if (y1 >= 0 && c00==c10 && c01==c11 && c02==c12) {
				dd[4*(y1*w+x1)] = r;
				dd[4*(y1*w+x1)+1] = g;
				dd[4*(y1*w+x1)+2] = b;
				q.push(x1);
				q.push(y1);
			}

			y1 = y0+1;
			c10 = dd[4*(y1*w+x1)];
			c11 = dd[4*(y1*w+x1)+1];
			c12 = dd[4*(y1*w+x1)+2];
			if (y1 < w && c00==c10 && c01==c11 && c02==c12) {
				dd[4*(y1*w+x1)] = r;
				dd[4*(y1*w+x1)+1] = g;
				dd[4*(y1*w+x1)+2] = b;
				q.push(x1);
				q.push(y1);
			}
	}
	//console.profileEnd();
	console.timeEnd('fill');
*/
}

function threshold(d) {
	for (var x = 0; x < d.width*d.height; x++) {
		if (d.data[4*x] + d.data[4*x+1] + d.data[4*x+2] > 512) {
			d.data[4*x] = d.data[4*x+1] = d.data[4*x+2] = 255;
		} else {
			d.data[4*x] = d.data[4*x+1] = d.data[4*x+2] = 0;
		}
		d.data[4*x+3] = 255;
	}
}

function do_search() {
	$('#logo').slideUp();
	$('#hint').hide();
	imageSearch.execute($('#q')[0].value);
}

function search_complete() {
	$('#coloring').hide();
	$('#results').empty();
	var results = imageSearch.results;
	var newContent = $('<table align="center"><tr><td class="sidebar"><div class="prev"><img src="/media/prev.png" alt="previous page" title="previous page" /></div></td><td id="results_inner"></td><td class="sidebar"><div class="next"><img src="/media/next.png" alt="next page" title="next page" /></div></td></tr></table>');
	var inner = newContent.find('#results_inner');
	for (var i = 0; i < results.length; i++) {
		var result = results[i];
		var newImg = $('<a href="#"><img class="result_thumb" /></a>');
		newImg.find('img')[0].src = result.tbUrl;
		newImg[0].onclick = function() {
			var s = result;
			return function() {
				result_clicked(s, this);
				return false;
			}
		} ();
		inner.append(newImg);
	}
	var next_page = newContent.find('div.next');
	var prev_page = newContent.find('div.prev');
	if (results.length == 0) {
		inner.append('<p id="no_results">no results</p>');
		next_page.hide();
		prev_page.hide();
	} else {
		var cursor = imageSearch.cursor;
		if (cursor.currentPageIndex < cursor.pages.length - 1) {
			next_page.click(function() { imageSearch.gotoPage(cursor.currentPageIndex + 1); return false; });
		} else {
			next_page.hide();
		}
		if (cursor.currentPageIndex > 0) {
			prev_page.click(function() { imageSearch.gotoPage(cursor.currentPageIndex - 1); return false; });
		} else {
			prev_page.hide();
		}
	}
	$('#results').append(newContent);
	if (results.length > 0) {
		$('#results').append($('<p id="choose_a_pic">choose a picture to paint</p>'));
	}
	$('#results').show();
}

function random_string(n) {
	var s = "";
	var repertoire = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for(var i=0; i < n; i++) {
		s += repertoire.charAt(Math.floor(Math.random() * repertoire.length));
	}

	return s;
}

function get_xy(o, e) {
	var obj = o;
	var curleft = 0;
	var curtop = 0;
	do {
		curleft += obj.offsetLeft;
		curtop += obj.offsetTop;
	} while (obj = obj.offsetParent);
	var ox = e.pageX-curleft;
	var oy = e.pageY-curtop;
	return [ox, oy];
}

function result_clicked(result, elt) {
	$('#results').hide();
	$('#loading').show();
	var canvas = $('#pic')[0];
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	img = new Image();
	img.onload = function() {
		var nw;
		var nh;
		if (img.height > img.width) {
			nh = canvas.height;
			nw = img.width/img.height * canvas.height;
		} else {
			nw = canvas.width;
			nh = img.height/img.width * canvas.width;
		}
		ctx.drawImage(img, canvas.width/2 - nw/2, canvas.height/2 - nh/2, nw, nh);
		undo_data = null;
		data = ctx.getImageData(0, 0, canvas.width, canvas.height);
		threshold(data);
		ctx.putImageData(data, 0, 0);
		canvas.onmousedown = function(e) {
			var xy = get_xy(this, e);
			if (tool == 'bucket') {
				undo_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
				fill(data, xy[0], xy[1], color[0], color[1], color[2]);
				ctx.putImageData(data, 0, 0);
			} else if ((tool == 'small_brush') || (tool == 'big_brush')) {
				undo_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
				prev_xy = xy.slice(0);
				ctx.strokeStyle = 'rgb('+color[0]+','+color[1]+','+color[2]+')';
				ctx.fillStyle = 'rgb('+color[0]+','+color[1]+','+color[2]+')';
				ctx.lineCap = 'round';
				if (tool == 'small_brush') {
					ctx.lineWidth=8;
				} else {
					ctx.lineWidth=30;
				}
				ctx.beginPath();
				ctx.arc(xy[0], xy[1], ctx.lineWidth/2, 0, 2*Math.PI, true);
				ctx.closePath();
				ctx.fill();
				data = ctx.getImageData(0, 0, canvas.width, canvas.height);
				brush_down = true;
			} else if (tool == 'picker') {
				color = getpixel(data, xy[0], xy[1]);
				$('.palette').removeClass('selected');
				set_tool(prev_tool);
			}
		}
		canvas.onmouseup = function (e) {
			if ((tool == 'small_brush') || (tool == 'big_brush')) {
				brush_down = false;
			}
		}
		canvas.onmousemove = function(e) {
			if (brush_down) {
				var xy = get_xy(this, e);
				ctx.beginPath();
				ctx.moveTo(prev_xy[0], prev_xy[1]);
				ctx.lineTo(xy[0], xy[1]);
				ctx.stroke();
				data = ctx.getImageData(0, 0, canvas.width, canvas.height);
				prev_xy = xy.slice(0);
			}
		}
		canvas.onmouseout = function(e) {
			brush_down = false;
		}
		randomize_colors();
		$($('.palette.random')[0]).trigger('click');
		set_tool('bucket');
		$('#loading').hide();
		$('#copyright_info').html('image comes from <a target="_blank" href="' + result.originalContextUrl + '">' + result.visibleUrl + '</a> and may be subject to copyright');
		$('#coloring').show();
	};
	img.onerror = function() {
		//console.log('error');
		var img = $(elt).find('img')[0];
		var h = img.height;
		var w = img.width;
		img.src = '/media/error.png';
		img.height = h;
		img.width = w;
		$('#loading').hide();
		$('#results').show();
	};
	//img.src = 'http://0.tqn.com/d/familycrafts/1/5/H/I/3/Triceratops-Coloring-Page.jpg';
	//img.src = 'Triceratops-Coloring-Page.jpg';
	/*
	$.ajax({
		'url': '/proxy',
		dataType: 'json',
		data: { 'url': url },
		success: function(imgdata) {
				console.log(imgdata);
				img.src = imgdata['data'];
			}
	});
	*/
	var rnd = random_string(16);
	document.cookie = 'rnd=' + rnd;
	img.src = '/proxy?url=' + result.url + '&rnd=' + rnd;
}

function set_color(e, r, g, b) {
	color = [ r, g, b ];
	$('.palette').removeClass('selected');
	$(e).addClass('selected');
}

function do_undo() {
	if (undo_data === null) {
		return;
	}
	var canvas = $('#pic')[0];
	var ctx = canvas.getContext('2d');
	var current_data = data;
	ctx.putImageData(undo_data, 0, 0);
	data = undo_data;
	undo_data = current_data;
}

function auto_search(s) {
	$('#q')[0].value = s;
	do_search();
}

function set_tool(t) {
	if (t == 'picker') {
		prev_tool = tool;
	}
	tool = t;
	$('.tool').removeClass('selected');
	$('#'+t).addClass('selected');
}

function randomize_colors() {
	$('.palette.random').each(function() {
		var r = Math.floor(Math.random()*256);
		var g = Math.floor(Math.random()*256);
		var b = Math.floor(Math.random()*256);
		this.style.backgroundColor = 'rgb('+r+','+g+','+b+')';
		this.onclick = function() {
			set_color(this, r, g, b);
		};
	});
	$('.palette').removeClass('selected');
}

function rotate(dir) {
	var canvas = $('#pic')[0];
	var ctx = canvas.getContext('2d');
	undo_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var cur_data = undo_data;
	var h = canvas.height;
	var h4 = 4*h;
	var w = canvas.width;
	var hw = 4*h*w;
	var cd = cur_data.data;
	var dd = data.data;
	// XXX
	if (dir == 'left') {
		for (var x = 0; x < w*4; x+=4) {
			for (var y = 0; y < h*4; y+=4) {
				dd[hw-x*w+y] = cd[y*w+x];
				dd[hw-x*w+y+1] = cd[y*w+x+1];
				dd[hw-x*w+y+2] = cd[y*w+x+2];
				dd[hw-x*w+y+3] = cd[y*w+x+3];
			}
		}
	} else {
		for (var x = 0; x < w*4; x+=4) {
			for (var y = 0; y < h*4; y+=4) {
				dd[x*w+h4-y] = cd[y*w+x];
				dd[x*w+h4-y+1] = cd[y*w+x+1];
				dd[x*w+h4-y+2] = cd[y*w+x+2];
				dd[x*w+h4-y+3] = cd[y*w+x+3];
			}
		}
	}
	ctx.putImageData(data, 0, 0);
}

$(function() {
/*
	if ((location.href != 'http://www.hippopaint.com/') && (location.href != 'http://localhost:8080/')) {
		location.href = 'http://www.hippopaint.com/';
	}
*/
	if (!document.createElement('canvas').getContext) {
		$('#search').hide();
		$('#hint').hide();
		$('#browser').show();
		return;
	}
	if (!("autofocus" in document.createElement("input"))) {
		$("#q")[0].focus();
	}
	imageSearch = new google.search.ImageSearch();
	imageSearch.setResultSetSize(8);
	imageSearch.setRestriction(google.search.ImageSearch.RESTRICT_IMAGETYPE, google.search.ImageSearch.IMAGETYPE_LINEART);
	imageSearch.setRestriction(google.search.Search.RESTRICT_SAFESEARCH, google.search.Search.SAFESEARCH_STRICT);
	imageSearch.setSearchCompleteCallback(this, search_complete, null);
	google.search.Search.getBranding('branding');
});


// entry point
function StartAMT() {

	console.time('startup');

	page = new page();
	parse_result = page.ParseURL();

	if (parse_result){
		
		setPageFormat();
		loadImages();
	   getLabels(page.video, page.frame_ids);
		//renderLabels();

	}else{
		return;
	}	
		
	console.timeEnd('startup');
};

// Using parameters in page var to set up the webpage format
function setPageFormat(){
	for (var i = 0; i < page.frame_names.length; i++){
	
		var frame_name = page.frame_names[i];
		frame_name = frame_name.substring(0, frame_name.length-4);
		$('#anno_region').append("<div id='" + frame_name + "-image'></div>");
		$('#' + frame_name + "-image").css({'float':'left'});
		$('#anno_region').append("<div id='" + frame_name + "-choice'></div>");
		$('#' + frame_name + "-choice").css({'float':'left'});
	}
};

function loadImages(){

	var frame_names = page.frame_names;
	var imagesLoaded = 0;

	for (var i = 0; i < frame_names.length; i++){
		var image = new Image();

		image.onload = (function(value) { // value is the var i value
			return function() {
				imagesLoaded += 1;
				renderImage(this, frame_names[value], value);
			}
		})(i);

		image.onerror = (function(value) { 
			return function() {
				loadFailure(frame_names[value]);
			}
		})(i);

		image.src = getImagePath(frame_names[i]);
	}
};

function loadFailure(frame_name) {

	console.log('loading image ' + page.video + '/' + frame_name + ' failed.');

};

function renderImage(e, frame_name, i){
	var image = e;
	
	console.log(e.width + ',' + frame_name + ',' + i);

	// determine image size	
	var im_ratio = 1;
	if (image.width > fixed_im_width){
		im_ratio = fixed_im_width/image.width;
	}
		
	image.width = Math.round(im_ratio * image.width);
	image.height = Math.round(im_ratio * image.height);

	// render image
	var div_id = frame_name.substring(0, frame_name.length-4) + '-image';
	var html_str =  '<img src="' + image.src + '" width="' + image.width + '" height="' + image.height +'"> </img>';
	$('#' + div_id).append(html_str);
	
	// diable loading image effect.
	document.getElementById('loading').style.visibility = 'hidden';
	document.getElementById('loading').style.display = 'none';
   document.getElementById('main_media').style.visibility = 'visible';

};


function getLabels(video_name, frame_ids){

	var http_req;
   var params = 'video_name=' + video_name + '&frame_ids=' + frame_ids.join(';');
	//console.log(params);

	// branch for native XMLHttpRequest object
   if (window.XMLHttpRequest) {

    	http_req = new XMLHttpRequest();
      http_req.open("GET", 'php/getlabels.php' + '?' + params , true);

		http_req.onreadystatechange = function() {//Call a function when the state changes.
			if(http_req.readyState == 4 && http_req.status == 200) {
				// responseText contains the results from php
				//console.log(http_req.responseText);
				anno_segs = http_req.responseText.split(label_delimiter);
				console.log(anno_segs);
			}
		}	
      http_req.send();
	}

};

function getImagePath(frame_name){
	return '../msr/' + page.video + '/' + frame_name;
};

function createJSONString(){
	
};

function onSubmit(event){

	alert(selection_list.join());
	
		
   if (window.XMLHttpRequest) {
      var xml_http = new XMLHttpRequest();
      xml_http.open("POST", 'php/postlabel.php', true);
		xml_http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
	
			
		xml_http.onreadystatechange = function() {//Call a function when the state changes.
			//console.log(xml_http);
			if(xml_http.readyState == 4 && xml_http.status == 200) {
				console.log(xml_http.responseText);
			}
		}
		var sd = '{"video": "asdf", "selection":"asdf"};{"video" : "123", "selection" : "asdf"} ';
		
      xml_http.send('json_str=' + sd);
	} 
   //onmousedown="javascript:document.getElementById(\'mt_comments\').value=document.getElementById(\'mt_comments_textbox\').value;" />'

};

/**
function getAnnoPath(){
	return 'annos/' + this.video + '/' + this.frame_name.substr(0, this.frame_name.length-4) + '.json';
}
**/

function onCheck(event){
	select_value = event.value	
	//console.log(select_value);
	// 
	if (event.checked) {

		/** for UI rendering **/	
		// select itself
		choices_dict[select_value]	= true;
		document.getElementById(select_value).checked = true;
		
		selection_list[selection_list.length] = select_value;

		// select all parents
		while (select_value in is_a_relation) {
					
			select_value = is_a_relation[select_value];
			p_idx = selection_list.indexOf(select_value);
			if (p_idx >= 0) {
				selection_list.splice(p_idx, 1);
			}
			choices_dict[select_value]	= true;
			document.getElementById(select_value).checked = true;
		}
		

	} else {
		
		// unselect itself		
		choices_dict[select_value]	= false;
		document.getElementById(select_value).checked = false;
		
		// add parent
		if (select_value in is_a_relation) {
			selection_list[selection_list.length] = is_a_relation[select_value];	
		}

		// unselect itself		
		m_idx = selection_list.indexOf(select_value);
		if (m_idx >= 0){
			selection_list.splice(m_idx, 1);
		}
		// unselect all children
		while (select_value in has_a_relation) {
			select_value = has_a_relation[select_value];
			c_idx = selection_list.indexOf(select_value);
			if (c_idx >= 0){
				selection_list.splice(c_idx, 1);
			}
			choices_dict[select_value] = false;
			document.getElementById(select_value).checked = false;
		}
	}

	if (select_value.indexOf("_none") >= 0 && event.checked) {
		// disable all other labels
		keys = Object.keys(choices_dict);
		for (i = 0 ; i < keys.length; i++){
			if (keys[i].indexOf('_none') < 0) {
				document.getElementById(keys[i]).disabled = true;
			}
		}
	} else if (select_value.indexOf("_none") >= 0 && event.checked == false ){
		// enable all other labels
		keys = Object.keys(choices_dict);
		for (i = 0 ; i < keys.length; i++){
			if (keys[i].indexOf('_none') < 0) {
				document.getElementById(keys[i]).disabled = false;
			}
		}
	
	}
	//console.log(selection_list);	
	// Set all the data structures
	// if selected more 1 make submit visible	
	n_checked = 0;	
	n_checked_wtnone = 0;
	keys = Object.keys(choices_dict);
	for (i = 0 ; i < keys.length; i++){
		if (choices_dict[keys[i]]) {
			n_checked += 1;
		}

		if (keys[i].indexOf('_none') < 0 && choices_dict[keys[i]]) {
	  		n_checked_wtnone += 1;
		}
	}

	document.getElementById("n_selections").value = n_checked;	
	if (n_checked > 0) {
			document.getElementById("mt_submit").disabled = false;
	}else {
			document.getElementById("mt_submit").disabled = true;
	}
	
	if (n_checked_wtnone > 0) {
			document.getElementById("_none").disabled = true;
	} else{
			document.getElementById("_none").disabled = false;
	}

	//console.log(selection_list);
	document.getElementById("selections").value = selection_list.join();
	
};





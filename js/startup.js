
// entry point
function StartAMT() {

	console.time('startup');

	page = new page();
	parse_result = page.ParseURL();

	if (parse_result){
		
		setPageFormat();
		loadImages();
	   getLabels(page.video, page.frame_ids);

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

		// Put image and choice side-by-side
		$('#anno_region').append("<div id='" + frame_name + "-region'>" +
									 	 "<div id='" + frame_name + "-image'></div>" + 
										 "<div id='" + frame_name + "-choice'></div>" +
										 "<br style='clear: left;' />" +
										 "<br> </br> " + 
										 "</div>");
			
		$('#' + frame_name + "-region").width('100%');
		$('#' + frame_name + "-image").css({'float':'left'});
		$('#' + frame_name + "-choice").css({'float':'left'});
	}

};

function loadImages(){

	var frame_names = page.frame_names;
	var imagesLoaded = 0;
	
	// Load multiple images
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
	
	//console.log(e.width + ',' + frame_name + ',' + i);

	// Determine image size. Compare with global var fixed_im_width
	var im_ratio = 1;
	if (image.width > fixed_im_width){
		im_ratio = fixed_im_width/image.width;
	}
		
	image.width = Math.round(im_ratio * image.width);
	image.height = Math.round(im_ratio * image.height);

	// Render image
	var image_div = frame_name.substring(0, frame_name.length-4) + '-image';
	var html_str =  '<img src="' + image.src + '" width="' + image.width + '" height="' + image.height +'"> </img>';
	$('#' + image_div).append(html_str);
	$('#' + image_div).width(image.width).height(image.height);

	// Diable loading image effect. And show images
	document.getElementById('loading').style.visibility = 'hidden';
	document.getElementById('loading').style.display = 'none';
   document.getElementById('main_media').style.visibility = 'visible';

};

// Send get label requests in one shot
function getLabels(video_name, frame_ids){

	var http_req;
   var params = 'video_name=' + video_name + '&frame_ids=' + frame_ids.join(';');

	// branch for native XMLHttpRequest object
   if (window.XMLHttpRequest) {

    	http_req = new XMLHttpRequest();
      http_req.open("GET", 'php/getlabels.php' + '?' + params , true);
		
		http_req.onreadystatechange = function() {//Call a function when the state changes.
			
			// 4 indicates done; 200 indicates success
			if(http_req.readyState == 4 && http_req.status == 200) {

				// responseText contains the results from php
				//console.log(http_req.responseText);
				label_segs = http_req.responseText.split(label_delimiter);
				console.log(label_segs);

				renderLabels(label_segs);

			}else if (http_req.status == 404){ //404
				alert('Error loading labels (label does not exist on the server?)');
			}
		}

      http_req.send();
	}

};

function getMaxCols(jsonObj, total_choice){
	
	var max_col = 0;
	for (i = 0; i < Math.min(n_choices, total_choice); i++) {

		choice = jsonObj.choices[i];
		segs = choice.split('->');	
		if (segs.length > max_col) {
			max_col = segs.length;
		}
	}	
	return max_col;
};

function renderLabel(frame_id, json_obj){

		var frame_key = page.frameId_key[frame_id];
		choices_dict[frame_key] = {};
		is_a_relation[frame_key] = {};
		has_a_relation[frame_key] = {};
		selection_list[frame_key] = [];

		var frame_choices = json_obj.choices;
		var total_choice = Object.keys(frame_choices).length;
		var max_col = getMaxCols(json_obj, total_choice);
		
		// render choices
	 	var checkbox_str = '<table class="choiceTable">';
		for (i = 0; i < Math.min(n_choices, total_choice); i++) { 

			// plot each row
			choice = json_obj.choices[i];
			segs = choice.split('->');	

			if ( i%2 == 0 ){	
				checkbox_str += '<tr class = "even">'; 
			}else{
				checkbox_str += '<tr class = "odd">'; 
			}

			if (segs.length == 1) { 
					
				seg_id = frame_id + '-' + i + '-' + segs[0];	
				choices_dict[frame_key][seg_id] = false;
				
				checkbox_str += '<td>';
				checkbox_str += '<input type="checkbox" onclick="onCheck(this);"' + ' name="' + seg_id + '" value="' + seg_id + '" id="' + seg_id + '">' + segs[0] + '<br>';
				checkbox_str += '</td>';	

			}else{ //hierarchy
					
				for (j = 0 ; j < segs.length; ++j) {
						
					seg_id = frame_id + '-' + i + '-' + segs[j];
					if (j != segs.length -1) {
						is_a_relation[frame_key][seg_id] = frame_id + '-' + i + '-' + segs[j+1];
					}
					if (j != 0){
						has_a_relation[frame_key][seg_id] = frame_id + '-' + i + '-' + segs[j-1];
					}

					choices_dict[frame_key][seg_id] = false;
					checkbox_str += '<td>';
					checkbox_str += '<input type="checkbox" onclick="onCheck(this);"' + ' name="' + seg_id + '" value="' + seg_id + '" id="' + seg_id + '">' + segs[j] + '<br>';
					checkbox_str += '</td>';	
				}
			}
			
			// fill in some dummy cols
			for ( j = 0; j < (max_col - segs.length); ++j ){
					checkbox_str += '<td></td>';	
			}
			checkbox_str += '</tr>'
		}

		// adding the none of the above option
		var none_id = frame_id + '-none';
		choices_dict[frame_key][none_id] = false;

		if ( Math.min(n_choices, total_choice) %2 == 0 ) {
			checkbox_str += '<tr class="even">';
		}else{
			checkbox_str += '<tr class="odd">';
		}

		checkbox_str += '<td><input type="checkbox" onclick="onCheck(this);"  name="' + none_id + '" value="' + none_id + '" id="' + none_id + '">None of the above <br></td>';
		
		for ( i = 0; i < (max_col - 1); ++i ){
			checkbox_str += '<td></td>';	
		}

		checkbox_str += '</tr>';
		checkbox_str += '</table>';

		$('#' + frame_id + '-choice').append(checkbox_str);
};



function renderLabels(label_segs){
		
		for (var i = 0; i < label_segs.length; i++){
			var json_str = label_segs[i];
			var json_obj = JSON.parse(json_str);
			var video_name = json_obj.video_name;
			var frame_name = json_obj.frame_name;
			var frame_id = frame_name.substring(0, frame_name.length-4);
			
			
			// intro word
	      var html_str = '<table>'
							+ '<tr><td> <font size="4"><b> Select all words that describe the contents in this image. </b></font> </tr></td>' 
							+ '</table>';

			$('#' + frame_id + '-choice').append(html_str);

			// render choices for each image
			renderLabel(frame_id, json_obj);
			
		}

		/** debugging **/
		console.log('choice_dict:');
		console.log(choices_dict);
		console.log('is_a_relation:');
		console.log(is_a_relation);
		console.log('has_a_realtion:');
		console.log( has_a_relation);
		/** end of debugging **/

		// render submit button
      var html_submit_str = '<table>'
				+ '<tr><td>'
       	   //+ '<form action="' + submitURL + '">'
				+ '<input type="hidden" id="assignmentId" name="assignmentId" value="'+ this.assignmentId +'" />'
				+ '<input type="hidden" id="turkSubmitTo" name="turkSubmitTo" value="'+ this.turkSubmitTo +'" />'
				+ '<input type="hidden" id="hitId" name="hitId" value="'+ this.hitId +'" />'
				+ '<input type="hidden" id="workerId" name="workerId" value="'+ this.workerId +'" />'
				+ '<input type="hidden" id="n_selections" name="n_selections" value="" />'
				+ '<input type="hidden" id="selections" name="selections" value="" />'
				+ '<input type="hidden" id="video" name="video" value="' + this.video + '" />'
				+ '<input type="hidden" id="frame_name" name="frame_name" value="' + this.frame_name + '" />'
				+ '<input type="hidden" id="mt_comments" name="mt_comments" value="" />'
				+ '<input disabled="true" type="submit" style="height:50px; width:1000px" id="mt_submit" name="Submit" value="Submit HIT" onclick="onSubmit(this);" />'
					//onmousedown="javascript:document.getElementById(\'mt_comments\').value=document.getElementById(\'mt_comments_textbox\').value;" />'
				+ '</form>'
				+ '</td></tr></table>';
			//console.log(html_submit_str);
		$('#anno_region').append(html_submit_str);

}


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


function onCheck(event){
	var select_value = event.value	

	var segs = select_value.split('-');
	var frame_id = segs[0];
	var frame_key = page.frameId_key[frame_id];
	//console.log('frame_id:' + frame_id + ' frame_key:' + frame_key);

	if (event.checked) {

		/** for UI rendering **/	
		// select itself
		choices_dict[frame_key][select_value] = true;
		document.getElementById(select_value).checked = true;
		
		selection_list[frame_key][selection_list[frame_key].length] = select_value;	

		// select all parents
		while (select_value in is_a_relation[frame_key]) {
			select_value = is_a_relation[frame_key][select_value];
	
			p_idx = selection_list[frame_key].indexOf(select_value);
			if (p_idx >= 0) { // removing parents
				selection_list[frame_key].splice(p_idx, 1);
			}

			choices_dict[frame_key][select_value] = true;
			console.log(document.getElementById(select_value));
			document.getElementById(select_value).checked = true;
		}
		

	} else {
		
		// unselect itself		
		choices_dict[frame_key][select_value]	= false;
		document.getElementById(select_value).checked = false;
		
		// add parent
		if (select_value in is_a_relation[frame_key]) {
			selection_list[frame_key][selection_list[frame_key].length] = is_a_relation[frame_key][select_value];	
		}

		// unselect itself		
		m_idx = selection_list[frame_key].indexOf(select_value);
		if (m_idx >= 0){
			selection_list[frame_key].splice(m_idx, 1);
		}
		// unselect all children
		while (select_value in has_a_relation[frame_key]) {
			select_value = has_a_relation[frame_key][select_value];
			c_idx = selection_list[frame_key].indexOf(select_value);
			if (c_idx >= 0){
				selection_list[frame_key].splice(c_idx, 1);
			}
			choices_dict[frame_key][select_value] = false;
			document.getElementById(select_value).checked = false;
		}
	}
	console.log(selection_list);	
	
	setSubmitButtonVisibility(choices_dict);
	setNoneButtonVisibility(frame_id, frame_key, select_value, event.checked, choices_dict);

	//console.log(selection_list);
	document.getElementById("selections").value = selection_list.join();
	
};

function setNoneButtonVisibility(frame_id, frame_key, select_value, is_checked, choices_dict){
	
	var keys = Object.keys(choices_dict[frame_key]);
	// Set the visibility of labels other than none
	if (select_value.indexOf("none") >= 0){

		if (is_checked) {

			// disable all other labels
			for (var i = 0; i < keys.length; i++) { 
				if (keys[i].indexOf("none") < 0) {
					document.getElementById(keys[i]).disabled = true;
				}
			}		
			
		} else if (is_checked == false) {
			// enable other labels	
			// disable all other labels
			for (var i = 0; i < keys.length; i++) { 
				if (keys[i].indexOf("none") < 0) {
					document.getElementById(keys[i]).disabled = false;
				}
			}
		}	
	}
	// Only check a particular image	
	// Set the visibility of none
	// None is visible only when all the other labels are not selected
	var n_checked_wtnone = 0;
	for (var i = 0; i < keys.length; i++) {
		console.log(keys[i])	;
		if (keys[i].indexOf("none") < 0 && choices_dict[frame_key][keys[i]]) {
			n_checked_wtnone += 1;
			break;
		}
	}	
	console.log(n_checked_wtnone);
	if (n_checked_wtnone > 0) {
		document.getElementById(frame_id + "-none").disabled = true;
	} else{
		document.getElementById(frame_id + "-none").disabled = false;
	}
	
};

function setSubmitButtonVisibility(choices_dict){
	
	var labeled_image_count = 0;
	for (var i = 0; i < Object.keys(choices_dict).length; ++i) {
		// for each image
		var keys = Object.keys(choices_dict[i]);
		for (var j = 0; j < keys.length; j++){
			// check if any key has been selected
			if (choices_dict[i][keys[j]]) {
				labeled_image_count += 1;
				break;
			}
		}
	}			
	//console.log("labeled_count:" + labeled_image_count);
	// check if all the images have been labeled
	if (labeled_image_count == Object.keys(choices_dict).length) {
			document.getElementById("mt_submit").disabled = false;
	}else{
			document.getElementById("mt_submit").disabled = true;
	}

};


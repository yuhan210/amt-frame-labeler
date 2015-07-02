
// entry point
function StartAMT() {

	console.time('startup');

	page = new page();
	
	parse_result = page.ParseURL();
	console.log(parse_result);
	if (parse_result){

		page.loadImage();
		page.setChoicePos();
		page.loadChoices();

	}else{

		return;
	}	
		
	console.timeEnd('startup');
};

function onSubmit(event){
	alert(event);
	alert(document.getElementById(select_value));
	//console.log(selection_list);	

};

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

	//console.log(selection_list);	

	// Set all the data structures
	// if selected more 1 make submit visible	
	n_checked = 0;	
	keys = Object.keys(choices_dict);
	for (i = 0 ; i < keys.length; i++){
		if (choices_dict[keys[i]]) {
			n_checked += 1;
		}
	}


	document.getElementById("n_selections").value = n_checked;	
	if (n_checked > 0) {
			document.getElementById("none").disabled = true;
			document.getElementById("mt_submit").disabled = false;
	}else {
			document.getElementById("mt_submit").disabled = true;
	}

	console.log(selection_list);
	document.getElementById("selections").value = selection_list.join();
	
};


function page(){
	
	this.assignmentId = null;	
	this.hitId = null;
	this.workerId = null;
	this.video = null;
	this.frame_name = null;
	this.image = null;
	this.turkSubmitTo = null;

	this.setChoicePos = function () {
		var d = document.getElementById('choice_region');
		d.style.float = "left";
	};

	this.loadChoices = function () {
   	var anno_req;

      // branch for native XMLHttpRequest object
      if (window.XMLHttpRequest) {
      	anno_req = new XMLHttpRequest();
			anno_req.overrideMimeType("application/json");
         anno_req.open("GET", this.getAnnoPath(), false);
         anno_req.send('');
      
		} else if (window.ActiveXObject) {
			anno_req = new ActiveXObject("Microsoft.XMLHTTP");
         if (anno_req) {
         	anno_req.open("GET", this.getAnnoPath(), false);
            anno_req.send('');
         }
		} 
		
		if (anno_req.status == 200) {
			
			var jsonObj = JSON.parse(anno_req.responseText);
			console.log(jsonObj.choices);
			total_choice = Object.keys(jsonObj.choices).length;

			// intro word
         var html_str = '<table>'
				+ '<tr><td>'
				+ '<tr><td> <font size="4"><b> Select all words that describe this image. </b></font> </tr></td>' 
				+ '</td></tr></table>';

			$('#choice_region').append(html_str);

			// render choices
			var checkbox_str = '<table>';
			for (i = 0; i < Math.min(n_choices, total_choice); i++)	{
				
				choice = jsonObj.choices[i];
				segs = choice.split('->');	
		
				checkbox_str += '<tr>';
				if (segs.length == 1) { 
					
					seg_id = i + '-' + segs[0];	
					
					choices_dict[seg_id] = false;
					checkbox_str += '<td>';
					checkbox_str += '<input type="checkbox" onclick="onCheck(this);"' + ' name="' + seg_id + '" value="' + seg_id + '" id="' + seg_id + '">' + segs[0] + '<br>';
					checkbox_str += '</td>';	

				}else{ //hierarchy
					
					for (j = 0 ; j < segs.length; ++j) {
					
						seg_id = i + '-' + segs[j];	
						if (j != segs.length -1) {
							is_a_relation[seg_id] = i + '-' + segs[j+1];
						}
						if (j != 0){
							has_a_relation[seg_id] = i + '-' + segs[j-1];
						}
						//console.log(is_a_relation);
						choices_dict[seg_id] = false;
						checkbox_str += '<td>';	
						checkbox_str += '<input type="checkbox" onclick="onCheck(this);"' + ' name="' + seg_id + '" value="' + seg_id + '" id="' + seg_id + '">' + segs[j] + '<br>';
						checkbox_str += '</td>';	
					}
				}

				checkbox_str += '</tr>'
			}
			// adding the none of the above option
			choices_dict["none"] = false;
			checkbox_str += '<tr>';
			checkbox_str += '<td><input type="checkbox" onclick="onCheck(this);"  name="none" value="none" id="none">None of the above <br></td>';
			checkbox_str += '</tr>';
			checkbox_str += '</table>';
			$('#choice_region').append(checkbox_str);
			
			// submit button
         var html_submit_str = '<table>'
				+ '<tr><td>'
       	   + '<form action="' + externalSubmitURLsandbox + '">'
				+ '<input type="hidden" id="assignmentId" name="assignmentId" value="'+ this.assignmentId +'" />'
				+ '<input type="hidden" id="turkSubmitTo" name="turkSubmitTo" value="'+ this.turkSubmitTo +'" />'
				+ '<input type="hidden" id="hitId" name="hitId" value="'+ this.hitId +'" />'
				+ '<input type="hidden" id="workerId" name="workerId" value="'+ this.workerId +'" />'
				+ '<input type="hidden" id="n_selections" name="n_selections" value="" />'
				+ '<input type="hidden" id="selections" name="selections" value="" />'
				+ '<input type="hidden" id="video" name="video" value="' + this.video + '" />'
				+ '<input type="hidden" id="frame_name" name="frame_name" value="' + this.frame_name + '" />'
				+ '<input type="hidden" id="mt_comments" name="mt_comments" value="" />'
				+ '<input disabled="true" type="submit" id="mt_submit" name="Submit" value="Submit HIT" onclieck="onSubmit(this);" />'
					//onmousedown="javascript:document.getElementById(\'mt_comments\').value=document.getElementById(\'mt_comments_textbox\').value;" />'
				+ '</form>'
				+ '</td></tr></table>';
			//console.log(html_submit_str);
			$('#choice_region').append(html_submit_str);
                
			//var html_str2 = '<font size="4"><b>Scroll up to see the entire image</b></font>&#160;&#160;&#160;<font size="3">(Optional) Do you wish to provide any feedback on this HIT?</font><br /><textarea id="mt_comments_textbox" name="mt_comments_texbox" cols="94" nrows="5" />';

			//$('#mt_feedback').append(html_str2);

		} else { // 404

			alert('Error: loading choices.')
		}

	};
	this.loadImage = function () {
			console.log('loading...');
			this.image = new Image();
			this.image.src = this.getImagePath();
			this.image.onload = function() {
				renderImage(this);
			
			}
			this.image.onerror = function() {
				loadFailure(); 
			}
		
	};

	function loadFailure() {
		console.log('loading image failed.');
	}

	function renderImage(e) {
			
			var image = e;	
			console.log(image);
			console.log('loaded. width:' + image.width + ', height:' + image.height );
			// determine image size
			var im_ratio = 1;
			if (image.width > fixed_im_width){
				im_ratio = fixed_im_width/image.width;
			}
		
			image.width = Math.round(im_ratio*image.width);
			image.height = Math.round(im_ratio*image.height);
			
			document.getElementById('image_region').style.float = 'left';
			var html_str =  '<img src="' + image.src + '" width="' + image.width + '" height="' + image.height +'"> </img>';
			console.log(html_str);
			$('#image_region').append(html_str);
			
			// diable loading image effect.
			document.getElementById('loading').style.visibility = 'hidden';
			document.getElementById('loading').style.display = 'none';
         //document.getElementById('main_media').style.visibility = 'visible';

	};

	this.ParseURL = function () {
		var url = document.URL;
		var idx = url.indexOf('?');
		if ( (idx != -1) ){ // there are parameters in the url

			var par_str = url.substring(idx + 1, url.length);

			do { // iterate through all the parameters
				idx = par_str.indexOf('&');
				var par_tag;

				if (idx == -1) par_tag = par_str;
				else par_tag = par_str.substring(0, idx);
				
				var par_field = this.getURLField(par_tag);
				var par_value = this.getURLValue(par_tag);
			
				if (par_field == 'assignmentId')	{
					this.assignmentId = par_value;
				}
				if (par_field == 'hitId') {
					this.hitId = par_value;	
				}
				
				if (par_field == 'workerId')	{
					this.workerId = par_value;	
				}
			
				if (par_field == 'video') {
					this.video = par_value;
				}
			
				if (par_field == 'frame_name') {
					this.frame_name = par_value;				
				}
			
				if (par_field == 'turkSubmitTo') {	
					this.turkSubmitTo = par_value;
				}

				console.log('field: ' + par_field + ' value:' + par_value);
				
				par_str = par_str.substring(idx+1, par_str.length);

			}while(idx != -1); // end of paring all parameters
			
			
			/** handle conditions **/
			if (this.assignmentId == 'ASSIGNMENT_ID_NOT_AVAILABLE'){
				document.getElementById('loading').style.visibility = 'hidden';
				document.getElementById('loading').style.display = 'none';
				window.location = "https://elmo.csail.mit.edu/amt/instruction.html";
				return false;	
			}

		}else{

			// URL contains no parameters

		}
		return true;
	};

	
	this.getAnnoPath = function () {
		return 'annos/' + this.video + '/' + this.frame_name.substr(0, this.frame_name.length-4) + '.json';
	};

	this.getImagePath = function () {		
		return '../msr/' + this.video + '/' + this.frame_name;
	};

	// ************'../msr/// private methods:
	// ******************

	this.getURLField = function (str) {
		var idx = str.indexOf('=');
		return str.substring(0, idx);	
	};

	this.getURLValue = function (str) {
		var idx = str.indexOf('=');
		return str.substring(idx+1, str.length);
	};

    //gets available width (6.14.06)
  	 function GetAvailWidth() {
		  //console.log('window-width:' + $(window).width() + ', main_media offset:'+ $("#main_media").offset().left);
        return $(window).width() - $("#main_media").offset().left -10 - 200;
        // we could include information about the size of the object box using $("#anno_list").offset().left
    };

    //gets available height (6.14.06)
    function GetAvailHeight() {
		  //console.log('window-height:' + $(window).height() + ', main_media offset:'+ $("#main_media").offset().height);
        return $(window).height() - $("#main_media").offset().top -75;
    };

}




// entry point
function StartAMT() {

	console.time('startup');

	page = new page();
	page.ParseURL();
	page.loadChoices();
	page.renderImage();

	console.timeEnd('startup');
};
function onSubmit(event){


};

function onCheck(event){
	select_value = event.value	
	// 
	if (event.checked) {
	
		// select itself
		choices_dict[select_value]	= true;
		document.getElementById(select_value).checked = true;
		
		// select all parents
		while (select_value in is_a_relation) {
			
			select_value = is_a_relation[select_value];
			choices_dict[select_value]	= true;
			document.getElementById(select_value).checked = true;
		}

	} else {
		
		// unselect itself		
		choices_dict[select_value]	= false;
		document.getElementById(select_value).checked = false;
		
		// unselect all children
		while (select_value in has_a_relation) {
			select_value = has_a_relation[select_value];
			choices_dict[select_value] = false;
			document.getElementById(select_value).checked = false;
		}
	}
	
	// if selected more 1 make submit visible	
	n_checked = 0;	
	keys = Object.keys(choices_dict);
	for (i = 0 ; i < keys.length; i++){
		if (choices_dict[keys[i]]) n_checked += 1;
	}
	
	if (n_checked > 0) {
			document.getElementById("mt_submit").disabled = false;
	}else {
			document.getElementById("mt_submit").disabled = true;
	}
};


function page(){
	
	this.assignmentId = null;	
	this.hitId = null;
	this.workerId = null;
	this.video = null;
	this.frameName = null;

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
			choices_dict = {};
			var checkbox_str = '';
			for (i = 0; i < Math.min(n_choices, total_choice); i++)	{
				
				choice = jsonObj.choices[i];
				segs = choice.split('->');	
		
				checkbox_str += '<tr>';
				if (segs.length == 1) { 
					
					choices_dict[segs[0]] = false;
					checkbox_str += '<td>';
					checkbox_str += '<input type="checkbox" onclick="onCheck(this);"' + ' name="' + segs[0] + '" value="' + segs[0] + '" id="' + segs[0]  + '">' + segs[0] + '<br>';
					checkbox_str += '</td>';	

				}else{ //hierarchy
					
					choices_dict[segs[0]] = [];
					for (j = 0 ; j < segs.length; ++j) {
						if (j != segs.length -1) {
							is_a_relation[segs[j]] = segs[j+1];
						}
						if (j != 0){
							has_a_relation[segs[j]] = segs[j-1];
						}
						choices_dict[segs[j]] = false;
						checkbox_str += '<td>';	
						checkbox_str += '<input type="checkbox" onclick="onCheck(this);"' + ' name="' + segs[j] + '" value="' + segs[j] + '" id="' + segs[j]  + '">' + segs[j] + '<br>';
						checkbox_str += '</td>';	
					}
				}

				checkbox_str += '</tr>'
			}
			console.log(choices_dict);
			// submit button
         var html_submit_str = '<table>'
				+ '<tr><td>'
       	   + '<form action="' + externalSubmitURLsandbox + '">'
				+ '<input type="hidden" id="assignmentId" name="assignmentId" value="'+ this.assignmentId +'" />'
				+ '<input type="hidden" id="number_objects" name="number_objects" value="" />'
				+ '<input type="hidden" id="object_name" name="object_name" value="" />'
				+ '<input type="hidden" id="LMurl" name="LMurl" value="" />'
				+ '<input type="hidden" id="mt_comments" name="mt_comments" value="" />'
				+ '<input disabled="true" type="submit" id="mt_submit" name="Submit" value="Submit HIT" onclieck="onSubmit(this);" />'
					//onmousedown="javascript:document.getElementById(\'mt_comments\').value=document.getElementById(\'mt_comments_textbox\').value;" />'
				+ '</form>'
				+ '</td></tr></table>';

			$('#choice_region').append(checkbox_str);
			$('#choice_region').append(html_submit_str);
                
			//var html_str2 = '<font size="4"><b>Scroll up to see the entire image</b></font>&#160;&#160;&#160;<font size="3">(Optional) Do you wish to provide any feedback on this HIT?</font><br /><textarea id="mt_comments_textbox" name="mt_comments_texbox" cols="94" nrows="5" />';

			//$('#mt_feedback').append(html_str2);

		} else { // 404

			alert('Error: loading choices.')
		}

	};
	this.renderImage = function () {

			var html_str =  '<img src="' + this.getImagePath() + '"> </img>'
			$('#image_region').append(html_str);

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
					this.frameName = par_value;				
				}

				console.log('field: ' + par_field + ' value:' + par_value);
				
				par_str = par_str.substring(idx+1, par_str.length);

			}while(idx != -1); // end of paring all parameters
			
			
			/** handle conditions **/
			if (this.assignmentId == 'ASSIGNMENT_ID_NOT_AVAILABLE'){
				//window.location = show instruction 
				// return false;	
			}

		}else{

			// URL contains no parameters

		}
	};

	
	this.getAnnoPath = function () {
		return 'annos/' + this.video + '/' + this.frameName.substr(0, this.frameName.length-4) + '.json';
	};

	this.getImagePath = function () {		
		return 'images/' + this.video + '/' + this.frameName;
	};

	// ******************
	// private methods:
	// ******************

	this.getURLField = function (str) {
		var idx = str.indexOf('=');
		return str.substring(0, idx);	
	};

	this.getURLValue = function (str) {
		var idx = str.indexOf('=');
		return str.substring(idx+1, str.length);
	};
}



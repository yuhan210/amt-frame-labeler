// Set up the parameters for the page

function page(){
	
	this.assignmentId = null;	
	this.hitId = null;
	this.workerId = null;
	this.video = null;
	this.frame_names = null;
	this.image = null;
	this.turkSubmitTo = null;
	this.frame_ids = [];
	this.frameId_key = {};

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
//			console.log(jsonObj.choices);
			total_choice = Object.keys(jsonObj.choices).length;
			max_col = getMaxCols(jsonObj, total_choice);
			// intro word
         var html_str = '<table>'
				+ '<tr><td>'
				+ '<tr><td> <font size="4"><b> Select all words that describe the contents in this image. </b></font> </tr></td>' 
				+ '</td></tr></table>';

			$('#choice_region').append(html_str);

			// render choices
		 	var checkbox_str = '<table class="choiceTable">';
			for (i = 0; i < Math.min(n_choices, total_choice); i++)	{
				
				choice = jsonObj.choices[i];
				segs = choice.split('->');	
	
				if ( i%2 == 0 ){	
					checkbox_str += '<tr class = "even">'; 
				}else{
					checkbox_str += '<tr class = "odd">'; 
				}
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
				// fill in some dummy cols
				for ( j = 0; j < (max_col - segs.length); ++j ){
						checkbox_str += '<td></td>';	
				}

				checkbox_str += '</tr>'
			}
			// adding the none of the above option
			choices_dict["_none"] = false;
			if (Math.min(n_choices, total_choice)%2 == 0) {
				checkbox_str += '<tr class="even">';
			}else{
				checkbox_str += '<tr class="odd">';
			}
			checkbox_str += '<td><input type="checkbox" onclick="onCheck(this);"  name="_none" value="_none" id="_none">None of the above <br></td>';

			for ( i = 0; i < (max_col - 1); ++i ){
					checkbox_str += '<td></td>';	
			}

			checkbox_str += '</tr>';
			checkbox_str += '</table>';
			$('#choice_region').append(checkbox_str);
			
			// submit button
         var html_submit_str = '<table>'
				+ '<tr><td>'
       	   //+ '<form action="' + submitURL + '">'
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
				+ '<input disabled="true" type="submit" style="height:50px; width:300px" id="mt_submit" name="Submit" value="Submit HIT" onclick="onSubmit(this);" />'
					//onmousedown="javascript:document.getElementById(\'mt_comments\').value=document.getElementById(\'mt_comments_textbox\').value;" />'
				+ '</form>'
				+ '</td></tr></table>';
			//console.log(html_submit_str);
			$('#choice_region').append(html_submit_str);
			/**
			var html_str2 = '(Optional) Do you wish to provide any feedback on this HIT?</font><br /><textarea id="mt_comments_textbox" name="mt_comments_texbox" cols="70" nrows="5" />';
			$('#mt_feedback').append(html_str2);
         **/    

		} else { // 404

			alert('Error: loading choices.')
		}

	};
	this.loadImage = function () {
			//console.log('loading...');
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
			
				if (par_field == 'frame_names') {
					frames = par_value.split(';');	
					this.frame_names = frames;

					for (var i = 0; i < frames.length; i++){
						this.frame_ids[i] = frames[i].substring(0, frames[i].length-4);
						this.frameId_key[this.frame_ids[i]] = i;
					}
	
				}
			
				if (par_field == 'turkSubmitTo') {	
					if (par_value.indexOf("sandbox") >= 0) {
						submitURL = externalSubmitURLsandbox;
					}else{
						submitURL = externalSubmitURL;
					}
					this.turkSubmitTo = par_value;
				}

				//console.log('field: ' + par_field + ' value:' + par_value);
				
				par_str = par_str.substring(idx+1, par_str.length);

			}while(idx != -1); // end of parsing all parameters
			
			
			/** handle conditions **/
			if (this.assignmentId == 'ASSIGNMENT_ID_NOT_AVAILABLE'){

				document.getElementById('loading').style.visibility = 'hidden';
				document.getElementById('loading').style.display = 'none';
				window.location = "https://elmo.csail.mit.edu/amt/instruction.html";
				return false;	
			}

		}else{ // URL contains no parameters

			// Use a default example
			this.frame_names = ['9.jpg', '5.jpg', '14.jpg'];
			var frames = this.frame_names;
			for (var i = 0; i < frames.length; i++){
				this.frame_ids[i] = frames[i].substring(0, frames[i].length-4);
				
				this.frameId_key[this.frame_ids[i]] = i;
			}
			
			this.video = 'thoroughbred_horse_through_googleglass_IbXdHo9CN1I';
		}
		return true;
	};

	
	this.getAnnoPath = function () {
		
		return 'annos/' + this.video + '/' + this.frame_name.substr(0, this.frame_name.length-4) + '.json';
	};

	this.getImagePath = function () {		
		return '../msr/' + this.video + '/' + this.frame_name;
	};

	// *****************
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


}



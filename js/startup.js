
// entry point
function StartAMT() {

	console.time('startup');

	image = new image();
	image.ParseURL();
	image.loadChoices();
	image.renderImage();
	console.timeEnd('startup');
}

function image(){
	
	this.assignmentId = null;	
	this.hitId = null;
	this.workerId = null;
	this.video = null;
	this.frameName = null;
	this.annoText = null;	

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
			
			this.annoText = anno_req.responseText;
			var obj = jQuery.parseJSON(this.annoText);
			console.log(obj.choices);

			for (i = 0; i < 20; ++i) {
				console.log(obj.choices[i]);
			}

         var html_str = '<table><tr><td><font size="4"><b>'+ 'Select all words that describe this image. </b></font></td><td><form action="' + externalSubmitURLsandbox + '"><input type="hidden" id="assignmentId" name="assignmentId" value="'+ this.assignmentId +'" /><input type="hidden" id="number_objects" name="number_objects" value="" /><input type="hidden" id="object_name" name="object_name" value="" /><input type="hidden" id="LMurl" name="LMurl" value="" /><input type="hidden" id="mt_comments" name="mt_comments" value="" /><input disabled="true" type="submit" id="mt_submit" name="Submit" value="Submit HIT" onmousedown="javascript:document.getElementById(\'mt_comments\').value=document.getElementById(\'mt_comments_textbox\').value;" /></form></td></tr></table>';
			$('#choice_region').append(html_str);
                
			var html_str2 = '<font size="4"><b>Scroll up to see the entire image</b></font>&#160;&#160;&#160;<font size="3">(Optional) Do you wish to provide any feedback on this HIT?</font><br /><textarea id="mt_comments_textbox" name="mt_comments_texbox" cols="94" nrows="5" />';

			$('#mt_feedback').append(html_str2);

		} else{ // 404

			alert('Error: loading choices.')
		}

	};
	this.renderImage = function () {
		
			var html_str =  '<img src="' + this.getImagePath() + '"> </img>'
			$('#image_region').append(html_str);

	};

	this.getAnnoPath = function () {
		return 'annos/' + this.video + '/' + this.frameName.substr(0, this.frameName.length-4) + '.json';
	};

	this.getImagePath = function () {		
		return 'images/' + this.video + '/' + this.frameName;
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

				console.log(par_field);
				console.log(par_value);
				
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



// Set up the parameters for the page

function page(){
	
	this.assignmentId = null;	
	this.hitId = null;
	this.workerId = null;
	this.video = null;
	this.frame_names = null;
	this.image = null;
	this.turkSubmitTo = null;
	this.frame_ids = []; // image name without extension
	this.frameId_key = {}; // key-value pair. key: frame_id, value: array index (0 ~ n_frames)


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


}



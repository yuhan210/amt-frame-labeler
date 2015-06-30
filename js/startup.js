
// entry point
function StartAMT() {

	console.time('startup');

	image = new image();
	image.ParseURL();


	console.timeEnd('startup');
}

// Image
function image(){
	
	this.assignmentId = null;	
	this.hitId = null;
	this.workerId = null;
	this.imageUrl = null;

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
			
				if (par_field == 'image-url') {
					this.imageUrl = par_value;
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
			var html_str =  '<img src="http://elmo.csail.mit.edu/msr/Hercules_playing_on_the_beach/0.jpg"> </img>'
			$('#mt_submit_form').append(html_str);
	}


	// ******************
	// private methods:
	// ******************

	this.getURLField = function (str) {
		var idx = str.indexOf('=');
		return str.substring(0, idx);	
	}

	this.getURLValue = function (str) {
		var idx = str.indexOf('=');
		return str.substring(idx+1, str.length);
	}
}



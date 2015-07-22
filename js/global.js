var externalSubmitURL = 'https://www.mturk.com/mturk/externalSubmit';
var externalSubmitURLsandbox = 'https://workersandbox.mturk.com/mturk/externalSubmit';
var submitURL = externalSubmitURLsandbox; 

var n_choices = 15;

var fixed_im_width = 580;

var choices_dict = []; // key-value pair. key: all label; value: true/false
var selection_list = []; // only logs the selected row (closest to the children)  
var is_a_relation = {};  // fixed
var has_a_relation = {}; // fixed

var n_checked = 0;
var n_checked_wtnone = 0;
var choices_dict = {};


// global var shared with php
var label_delimiter = '<br>';

// 
var submit_dict = [];

// 
var pre_populate_past_notations = true;

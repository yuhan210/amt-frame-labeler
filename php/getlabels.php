<?php

$video_name = $_GET['video_name'];
$frame_names_str = $_GET['frame_ids'];

/**
// Debugging
$video_name = 'thoroughbred_horse_through_googleglass_IbXdHo9CN1I';
$frame_names_str = '9;5;14';
**/

$frame_names = explode(';', $frame_names_str);

for ($i = 0; $i < count($frame_names); $i++){

	$frame_name = $frame_names[$i];
	$file_path = '../annos/'.$video_name.'/'.$frame_name.'.json';
	$file_str = file_get_contents($file_path);
	
	$json_obj = get_object_vars(json_decode($file_str));

	
	if (isset($json_obj['video_name']) == false) {
		$json_obj['video_name'] = $video_name;
	}	
	
	if (isset($json_obj['frame_name']) == false) {
		$json_obj['frame_name'] = $frame_name.'.jpg';
	}	

	if ($i == 0) {
		echo json_encode($json_obj);
	} else{
		echo '<br>';
		echo json_encode($json_obj);
	}
}


?>

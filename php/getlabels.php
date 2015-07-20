<?php

$video_name = $_GET['video_name'];
$frame_names_str = $_GET['frame_ids'];


$frame_names = explode(';', $frame_names_str);


for ($i = 0; $i < count($frame_names); $i++){

	$frame_name = $frame_names[$i];
	$file_path = '../annos/'.$video_name.'/'.$frame_name.'.json';
	$file = file_get_contents($file_path);
	
	if ($i == 0) {

		echo $file;

	} else{

		echo '<br>';
		echo $file;

	}
}


?>

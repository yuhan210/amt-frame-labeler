<?php

//$video_name = $_GET['video_name'];
$video_name =  '100_mile_wilderness_sled_dog_race_Qv4I_MDX7ws';
$files = scandir('../labels/'.$video_name);
$n_files = count($files);


$counter = 0;
for ($i = 0; $i < count($files); $i++) {

	if ($files[$i] != '.' && $files[$i] != '..') {	
		// load json file
		$json_path = '../labels/'.$video_name.'/'.$files[$i];
		$json_str = file_get_contents($json_path);
		$json_obj = get_object_vars(json_decode($json_str));

		
		if ($counter== 0){
			echo json_encode($json_obj);
		}else{
			echo '<br>';
			echo json_encode($json_obj);
		}				
		$counter++;
	}

}

?>

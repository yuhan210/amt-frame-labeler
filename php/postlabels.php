<?php

$LABEL_FOLDER = '../labels';

$str_json = $_POST['json_str'];
$segs = explode(';', $str_json);

for ($i = 0; $i < count($segs); $i++) {

	$json = json_decode($segs[$i], true);
	$video_name = $json['video_name'];
	$frame_name = $json['frame_name'];
	
	//echo var_dump($json);
	if (!file_exists($LABEL_FOLDER.'/'.$video_name)) {
		mkdir($LABEL_FOLDER.'/'.$video_name, 0777, true);
	}	
	
	$frame_name_segs = explode('.', $frame_name);
	$fh = fopen($LABEL_FOLDER.'/'.$video_name.'/'.$frame_name_segs[0].'.json', 'w');	
	fwrite($fh, $segs[$i]);
	fclose($fh);
}

?>

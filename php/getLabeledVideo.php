<?php

$vid = intval($_GET['vid']);
// List all labeled videos, get the video (vid)
$label_path = '../labels';


$folders = scandir($label_path);
$n_folders = count($folders);

$video = '';
$counter = 0;
for ($i = 0; $i < $n_folders; $i++) {
	
	if ($folders[$i] != '.' && $folders[$i] != '..' && $folders[$i] != 'README') {

		$video = $folders[$i];
		
		if ($counter == $vid) {
			break;
		}
		$counter++;
	}
}


// $video is the one

// List all files

$images = array();


if ($video != '') {

	$files = scandir('../images/'.$video);
	$n_files = count($files);

	$counter = 0;
	for ($i = 0; $i < $n_files; $i++) {

		if ($files[$i] != '.' && $files[$i] != '..') {
			$images[] = $files[$i];
			$counter++;
		}
	}
}

if ($video != ''){
	echo $video.':'.implode(',', $images);
}else{
	echo 'null';
}

?>

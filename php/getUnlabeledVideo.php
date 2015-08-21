<?php

$vid = intval($_GET['vid']);

// List all unlabeled videos, get the video (vid)

// get all videos
$folders = scandir('../images');
$n_folders = count($folders);

$all_videos = array();
for ($i = 0; $i < $n_folders; $i++) {
	
	if ($folders[$i] != '.' && $folders[$i] != '..' && $folders[$i] != 'README') {
		$all_videos[] = $folders[$i];	
	}
}

// get labeled
$folders = scandir('../labels');
$n_folders = count($folders);

$labeled_videos = array();
for ($i = 0; $i < $n_folders; $i++) {

	if ($folders[$i] != '.' && $folders[$i] != '..' && $folders[$i] != 'README') {
		$labeled_videos[] = $folders[$i];
	}
}

$unlabeled_videos = array();

for ($i = 0; $i < count($all_videos); $i++) {
	$video = $all_videos[$i];

	$found = 0;
	for ($j = 0; $j < count($labeled_videos); $j++) {
		if ($video == $labeled_videos[$j]){
			$found = 1;
			break;
		}
	}
	if ($found == 0) {	
		$unlabeled_videos[] = $video;
	}
}

// List all files
$video = $unlabeled_videos[$vid];

$images = array();


if ($video != '') {

	$files = scandir('../images/'.$video);
	$n_files = count($files);

	$counter = 0;
	for ($i = 0; $i < $n_files; $i++) {

		if ($files[$i] != '.' && $files[$i] != '..') {
			$images[$counter] = $files[$i];
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

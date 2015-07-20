<?php

$str_json = $_POST['json_str'];
$segs = explode(';', $str_json);

//for
$json = json_decode($segs[0], true);
echo var_dump($json);
echo $json;


?>

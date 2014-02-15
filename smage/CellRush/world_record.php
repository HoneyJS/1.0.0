<?php

$record_file = "world_record.txt";
$world_record = file_get_contents($record_file);
if ($world_record) $world_record = (int)$world_record;
else $world_record = 0;

$record = (int)$_GET['record'];
if ($record > $world_record) {
	$world_record = $record;
	file_put_contents($record_file, (string)$world_record);
}
echo "Honey.data=".$world_record;
?>
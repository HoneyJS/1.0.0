<?php

$config = array(

'honey' => array(
	'list' => array(
		"core/Define.js",
		"core/Util.js",
		"core/Honey.js",
		"core/Storage.js",
		"core/Resource.js",
		"core/Graphics.js",
		"core/Matrix.js",
		"core/Style.js",
		"core/Events.js",
		"core/Action.js",
		"core/Element.js",
		"core/Node.js",
		"core/BasicElement.js",
		"core/Sprite.js",
		"core/DirtyRect.js",
		"core/Body.js",
		"core/Audio.js",
		"core/KeyMouseTouchEvent.js",
	),
	'js' => "honey.full.js",
),

'game' => array(
	'list' => array(
		"config.js",
		"game/Define.js",
		"styles.js",
		"game/Dialog.js",
		"game/Component.js",
		"game/Figure.js",
		"game/Character.js",
		"game/Role.js",
		"game/NPC.js",
		"game/Creep.js",
		"game/Thing.js",
		"game/Actor.js",
		"game/Map.js",
		"game/MainMap.js",
	),
	'js' => "game.full.js",
),

'smage' => array(
	'list' => array(
		"smage/Smage.js",
		"smage/styles.js",
		"smage/Home.js",
		"smage/CellRush/Define.js",
		"smage/CellRush/Config.js",
		"smage/CellRush/styles.js",
		"smage/CellRush/Game.js",
		"smage/CellRush/Cell.js",
		"smage/CellRush/Rule.js",
		"smage/CellRush/Stage.js",
		"smage/FruitHit/Define.js",
		"smage/FruitHit/Config.js",
		"smage/FruitHit/styles.js",
		"smage/FruitHit/Game.js",
		"smage/FruitHit/Cell.js",
		"smage/FruitHit/Rule.js",
		"smage/FruitHit/Stage.js",
	),
	'js' => "smage.full.js",
),

);

foreach ($config as $files) {
	echo "=======<br/>";
	echo "merge to ".$files['js']."<br/>";
	file_put_contents($files['js'], '');
	foreach ($files['list'] as $file) {
		$code = file_get_contents("../".$file);
		file_put_contents($files['js'], $code, FILE_APPEND);
		echo $file."<br/>";
	}
	echo "=======<br/>";
}

?>
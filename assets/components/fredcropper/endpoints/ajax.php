<?php

require_once 'init.php';

$ajax = new \FredCropper\Endpoint\Ajax($fred,$fredCropper);
$ajax->run();
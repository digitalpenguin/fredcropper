<?php
/**
 * @package fredcropper
 */
require_once (strtr(realpath(dirname(dirname(__FILE__))), '\\', '/') . '/fccrop.class.php');
class FCCrop_mysql extends FCCrop {}
?>
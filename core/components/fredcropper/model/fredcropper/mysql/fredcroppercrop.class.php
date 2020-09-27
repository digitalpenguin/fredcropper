<?php
/**
 * @package fredcropper
 */
require_once (strtr(realpath(dirname(dirname(__FILE__))), '\\', '/') . '/fredcroppercrop.class.php');
class FredCropperCrop_mysql extends FredCropperCrop {}
?>
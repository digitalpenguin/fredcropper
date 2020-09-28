<?php
$corePath = $modx->getOption('fredcropper.core_path', null, $modx->getOption('core_path', null, MODX_CORE_PATH) . 'components/fredcropper/');
/** @var FredCropper $fredCropper */
$fredCropper = $modx->getService(
    'fredcropper',
    'FredCropper',
    $corePath . 'model/fredcropper/',
    [
        'core_path' => $corePath
    ]
);

$eventName = $modx->event->name;
switch($eventName) {
    case 'FredBeforeRender':

        $includes = '
<link rel="stylesheet" href="' . $fredCropper->getOption('assetsUrl') . 'css/web/cropper.min.css" type="text/css">
<link rel="stylesheet" href="' . $fredCropper->getOption('assetsUrl') . 'css/web/fred-cropper.css" type="text/css">
<script type="text/javascript" src="' . $fredCropper->getOption('assetsUrl') . 'js/web/cropper.min.js"></script>
<script type="text/javascript" src="' . $fredCropper->getOption('assetsUrl') . 'js/web/fred-cropper.js"></script>
<script>var fredCropperAssetsUrl = "'.$fredCropper->getOption('assetsUrl').'";</script>';

        $beforeRender = '
            this.registerEditor("FredCropper", FredCropperInit);
        ';

        $modifyPermissions = '';

        $modx->event->_output = [
            'includes' => $includes,
            'beforeRender' => $beforeRender,
            'lexicons' => ['fredcropper:default']
        ];

        break;

    case 'FredOnFredResourceSave':

        $fredCropper->cleanupOrphanedCrops($resource);

        break;
}


return true;
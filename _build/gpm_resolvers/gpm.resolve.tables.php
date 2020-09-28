<?php
/**
 * Resolve creating db tables
 *
 * THIS RESOLVER IS AUTOMATICALLY GENERATED, NO CHANGES WILL APPLY
 *
 * @package fredcropper
 * @subpackage build
 *
 * @var mixed $object
 * @var modX $modx
 * @var array $options
 */

if ($object->xpdo) {
    $modx =& $object->xpdo;
    switch ($options[xPDOTransport::PACKAGE_ACTION]) {
        case xPDOTransport::ACTION_INSTALL:
        case xPDOTransport::ACTION_UPGRADE:
            $modelPath = $modx->getOption('fredcropper.core_path', null, $modx->getOption('core_path') . 'components/fredcropper/') . 'model/';
            
            $modx->addPackage('fredcropper', $modelPath, null);


            $manager = $modx->getManager();

            $manager->createObjectContainer('FredCropperCrop');

            break;
    }
}

return true;
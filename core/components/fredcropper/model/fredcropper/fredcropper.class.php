<?php

/**
 * The main FredCropper service class.
 *
 * @package fredcropper
 */
class FredCropper {
    public $modx = null;
    public $namespace = 'fredcropper';
    public $cache = null;
    public $options = array();

    public function __construct(modX &$modx, array $options = array()) {
        $this->modx =& $modx;
        $this->namespace = $this->getOption('namespace', $options, 'fredcropper');

        $corePath = $this->getOption('core_path', $options, $this->modx->getOption('core_path', null, MODX_CORE_PATH) . 'components/fredcropper/');
        $assetsPath = $this->getOption('assets_path', $options, $this->modx->getOption('assets_path', null, MODX_ASSETS_PATH) . 'components/fredcropper/');
        $assetsUrl = $this->getOption('assets_url', $options, $this->modx->getOption('assets_url', null, MODX_ASSETS_URL) . 'components/fredcropper/');

        /* loads some default paths for easier management */
        $this->options = array_merge(array(
            'namespace' => $this->namespace,
            'corePath' => $corePath,
            'modelPath' => $corePath . 'model/',
            'chunksPath' => $corePath . 'elements/chunks/',
            'snippetsPath' => $corePath . 'elements/snippets/',
            'templatesPath' => $corePath . 'templates/',
            'assetsPath' => $assetsPath,
            'assetsUrl' => $assetsUrl,
            'jsUrl' => $assetsUrl . 'js/',
            'cssUrl' => $assetsUrl . 'css/',
            'connectorUrl' => $assetsUrl . 'connector.php'
        ), $options);

        $this->modx->addPackage('fredcropper', $this->getOption('modelPath'));
        $this->modx->lexicon->load('fredcropper:default');
        $this->autoload();
    }

    protected function autoload() {
        require_once $this->getOption('modelPath') . 'vendor/autoload.php';
    }

    /**
     * Get a local configuration option or a namespaced system setting by key.
     *
     * @param string $key The option key to search for.
     * @param array $options An array of options that override local options.
     * @param mixed $default The default value returned if the option is not found locally or as a
     * namespaced system setting; by default this value is null.
     * @return mixed The option value or the default value specified.
     */
    public function getOption($key, $options = array(), $default = null) {
        $option = $default;
        if (!empty($key) && is_string($key)) {
            if ($options != null && array_key_exists($key, $options)) {
                $option = $options[$key];
            } elseif (array_key_exists($key, $this->options)) {
                $option = $this->options[$key];
            } elseif (array_key_exists("{$this->namespace}.{$key}", $this->modx->config)) {
                $option = $this->modx->getOption("{$this->namespace}.{$key}");
            }
        }
        return $option;
    }

    public function cleanupOrphanedCrops($resource) {
        $rootPath = $this->modx->getOption('fredcropper.crops_path');
        $resourceId = $resource->get('id');
        $elements = $resource->get('properties')['fred']['data']['content'];

        if(!$rootPath || !$resourceId || empty($elements)) return false;

        $dirs = glob($rootPath . $resourceId . '/*', GLOB_ONLYDIR);

        $elementIds = [];
        foreach($dirs as $dir) {
            $dirArr = explode('/',$dir);
            $dirArr = array_reverse($dirArr);
            $elementIds[] = $dirArr[0];
        }
        foreach($elements as $element) {
            // If an element dir exists but it's not saved to the resource data, delete it and the files within.
            $key = array_search($element['elId'],$elementIds);
            if($key !== '' && $key !== null) {
                // Match was found so remove from element ids that are up for deletion.
                unset($elementIds[$key]);
            }
        }

        // Now that all element ids we want to keep have been removed from the array, delete the dirs with keys still in the array.
        foreach($elementIds as $elementId) {
            $dirname = $rootPath . $resourceId . '/' . $elementId;
            array_map('unlink', glob($dirname.'/*.*'));
            rmdir($dirname);
        }

        // Also remove db records for deleted files.
        if(!empty($elementIds)) {
            $result = $this->modx->removeCollection('FredCropperCrop', [
                'element_id:IN' => $elementIds
            ]);
            if (!$result) {
                $this->modx->log(MODX_LOG_LEVEL_ERROR, 'Unable to remove orphaned FredCropper elements for resource: ' . $resourceId);
            }
        }

        return true;
    }


}
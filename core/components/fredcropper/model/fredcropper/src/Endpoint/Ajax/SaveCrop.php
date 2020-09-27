<?php
namespace FredCropper\Endpoint\Ajax;

class SaveCrop extends Endpoint {
    protected $originalImage = null;
    protected $originalImageType = null;

    protected $originalWidth = 0;
    protected $originalHeight = 0;
    protected $newWidth = 0;
    protected $newHeight = 0;

    protected $rootDir = '';
    protected $elementDir = '';

    protected $cropName = '';
    protected $resourceId = 0;
    protected $elementId = '';

    protected $fileHash = '';
    protected $filename = '';
    protected $oldFilename = '';
    protected $fileCreateTime = '';


    /**
     * @return bool
     */
    protected function initialize() {
        if ($_FILES['cropped_image']['error']) {
            return false;
        }

        list($this->originalWidth, $this->originalHeight, $this->originalImageType) = getimagesize($_FILES['cropped_image']['tmp_name']);
        switch ($this->originalImageType) {
            case IMAGETYPE_JPEG:
                $this->originalImage = @imagecreatefromjpeg($_FILES['cropped_image']['tmp_name']);
                break;
            case IMAGETYPE_PNG:
                $this->originalImage = @imagecreatefrompng($_FILES['cropped_image']['tmp_name']);
                break;
            case IMAGETYPE_WEBP:
                $this->originalImage = @imagecreatefromwebp($_FILES['cropped_image']['tmp_name']);
                break;
            default:
                return false;
        }

        if(!$this->originalImage) {
            return false;
        }

        // Get current resource id
        $this->resourceId = filter_input(INPUT_POST,'resource_id',FILTER_SANITIZE_NUMBER_INT);
        if(!$this->resourceId) {
            return false;
        }
        // Get current Fred element instance id
        $this->elementId = filter_input(INPUT_POST,'element_id',FILTER_SANITIZE_STRING);
        if(!$this->elementId) {
            return false;
        }
        // Get name of crop being saved
        $this->cropName = filter_input(INPUT_POST,'crop_name',FILTER_SANITIZE_STRING);
        if(!$this->cropName) {
            return false;
        }
        // Get new crop width
        $newWidth = round($_POST['width']);
        $this->newWidth = filter_var($newWidth,FILTER_SANITIZE_NUMBER_INT);
        if(!$this->newWidth) {
            return false;
        }
        // Get new crop height
        $newHeight = round($_POST['height']);
        $this->newHeight = filter_var($newHeight,FILTER_SANITIZE_NUMBER_INT);
        if(!$this->newHeight) {
            return false;
        }

        $this->prepareCropDirectory();

        return true;
    }

    /**
     * @return string
     */
    public function process() {
        if(!$this->initialize() ) {
            return $this->failure('Crop Failed');
        }

        if(!$this->resizeCrop()) {
            return $this->failure('Crop Failed');
        }

        if(!$this->editDatabase()) {
            return $this->failure('Crop Failed');
        }

        $this->deleteOldCrop();

        // Create test response
        return $this->success([
            'crop'          =>  $this->modx->getOption('fredcropper.crops_url') . $this->resourceId . '/' . $this->elementId . '/' . $this->filename,
            'name'          =>  $this->cropName,
            'create_time'   =>  $this->fileCreateTime,
            'width'         =>  $this->newWidth,
            'height'        =>  $this->newHeight,
            'type'          =>  $this->originalImageType
        ]);
    }

    /**
     * @return bool
     */
    protected function editDatabase() {
        $crop = $this->modx->getObject('FredCropperCrop',[
            'crop_name'     =>  $this->cropName,
            'resource_id'   =>  $this->resourceId,
            'element_id'    =>  $this->elementId
        ]);

        if($crop instanceof \FredCropperCrop) {
            // Get old filename so the old crop can be deleted.
            $this->oldFilename = $crop->get('filename');

            $crop->set('filename',$this->filename);
            $crop->set('create_time',$this->fileCreateTime);
        } else {
            $cropProps = [
                'crop_name'     =>  $this->cropName,
                'resource_id'   =>  $this->resourceId,
                'element_id'    =>  $this->elementId,
                'filename'      =>  $this->filename,
                'create_time'   =>  $this->fileCreateTime
            ];
            $crop = $this->modx->newObject('FredCropperCrop',$cropProps);
        }

        $crop->save();

        return true;
    }

    protected function deleteOldCrop() {
        if (file_exists($this->elementDir.$this->oldFilename)) {
            unlink($this->elementDir.$this->oldFilename);
        }

    }

    /**
     * @return bool
     */
    protected function resizeCrop() {
        $newImage = imagecreatetruecolor($this->newWidth, $this->newHeight);
        imagecopyresampled(
            $newImage,
            $this->originalImage,
            0,
            0,
            0,
            0,
            $this->newWidth,
            $this->newHeight,
            $this->originalWidth,
            $this->originalHeight
        );

        $hash = $this->createHash();

        switch ($this->originalImageType) {
        case IMAGETYPE_JPEG:
            $this->filename = 'crop-'. $this->cropName . '-' . $hash. '.jpg';
            imagejpeg($newImage, $this->elementDir.$this->filename, 1);
            $this->fileCreateTime = filemtime($this->elementDir.$this->filename);
            break;
        case IMAGETYPE_PNG:
            $this->filename = 'crop-'. $this->cropName . '-' . $hash. '.png';
            imagepng($newImage, $this->elementDir.$this->filename, 1);
            $this->fileCreateTime = filemtime($this->elementDir.$this->filename);
            break;
        case IMAGETYPE_WEBP:
            $this->filename = 'crop-'. $this->cropName . '-' . $hash. '.webp';
            imagewebp($newImage, $this->elementDir.$this->filename, 1);
            $this->fileCreateTime = filemtime($this->elementDir.$this->filename);
            break;
        default:
            return false;
        }

        return true;
    }

    /**
     *
     */
    protected function prepareCropDirectory() {
        // Grab crop directory path from system setting
        $this->rootDir = $this->modx->getOption('fredcropper.crops_path');
        $this->elementDir = $this->rootDir . $this->resourceId . '/' . $this->elementId . '/';
        if (!file_exists($this->elementDir)) {
            mkdir($this->elementDir, 0755,true);
        }
    }

    protected function createHash() {
        return hash('crc32b', time().rand());
    }

}
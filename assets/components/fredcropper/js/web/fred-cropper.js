const FredCropperInit = function(fred, Editor, pluginTools) {
    const { fredConfig, Finder, Modal, valueParser } = pluginTools;
    const { div, label, input, a, img, button } = pluginTools.ui.els;
    const { image } = pluginTools.ui.ins;

    class FredCropper {
        static title = 'Crop Image';

        constructor(el) {
            this.el = el;
            this.state = {
                _attributes: {}
            };
            this.pluginTools = pluginTools;
            this.setStateValue = this.setStateValue.bind(this);
            this.setStateAttribute = this.setStateAttribute.bind(this);
            this.init();
            const title = fredConfig.lngExists(this.constructor.title) ? fredConfig.lng(this.constructor.title) : this.constructor.title;
            let wrapper,modal;

            if(pluginTools.fredConfig.getPluginsData('fredcropper'+this.el.fredEl.elId, 'activated') === 'true') {
                this.el.dataset.crop = 'true';
            }

            // "FredCropper" needs to be present in the element options otherwise the standard image editor will load.
            if(typeof this.el.fredEl.options.FredCropper !== 'undefined' &&
                this.el.fredEl.options.FredCropper.length > 0 )
            {
                // Load the crop sizes from options and set the first one as active
                this.crops = [];
                let i = 0;
                this.el.fredEl.options.FredCropper.forEach(function(option) {
                    if(option.crops) {
                        option.crops.forEach(function (crop) {
                            crop.active = (i === 0) ?? true;
                            this.crops.push(crop);
                            i++;
                        }.bind(this));
                    }
                }.bind(this));

                this.srcSetManager = new SrcSetManager(this);

                wrapper = this.renderCropper();
                modal = new Modal(title, wrapper, this.onSave.bind(this), {width: '1200px'});
                modal.render();

                this.cropper = null;

                // Change Save to Done on modal - less confusing since we're also saving crops.
                modal.saveButton.innerHTML = 'Done';
                modal.body.parentElement.classList.add('fredcropper--modal');

                // Add info button to header
                let infoButton = button('<img src="'+fredCropperAssetsUrl+'icons/info-bold.svg">');
                infoButton.classList.add('fredcropper--info-btn');

                infoButton.addEventListener('click', function(e) {
                    let infoWrapper = this.renderInfoModal();
                    let infoModal = new Modal('Information', infoWrapper, this.onSave.bind(this), {width: '700px'});
                    infoModal.render();
                    infoModal.saveButton.innerHTML = 'Done';
                }.bind(this));

                let modalTitle = modal.wrapper.firstElementChild.firstElementChild.querySelector('h1');
                modal.wrapper.firstElementChild.firstElementChild.insertBefore(infoButton,modalTitle);

                let editTextButton = button('<img src="'+fredCropperAssetsUrl+'icons/file-text.svg">');
                editTextButton.classList.add('fredcropper--edit-text-btn');
                modal.wrapper.firstElementChild.firstElementChild.insertBefore(editTextButton,modalTitle);

            } else {

                // Load a clone of the standard Fred image editor if FredCropper was not specified.
                wrapper = this.renderStandard();
                modal = new Modal(title, wrapper, this.onSave.bind(this));
                modal.render();
            }

        }

        init() {
            this.state = {
                ...(this.state),
                src: (this.el.fredEl.constructor.getElValue(this.el) || '')
            }
        }

        renderInfoModal() {
            const wrapper = div();
            //wrapper.appendChild(this.buildAttributesFields());
            let content = div('info-content');
            content.innerHTML = '<p>This is intended to display the contents of a MODX chunk where the developer can leave instructions for' +
                ' the end user about cropping for this particular element.</p>';
            wrapper.appendChild(content);
            return wrapper;
        }

        renderPreviewModal() {
            const wrapper = div('fredcropper--modal-preview-inner');
            //wrapper.appendChild(this.buildAttributesFields());
            return wrapper;
        }

        /**
         * Renders the standard Fred image modal with preview
         * @returns {*}
         */
        renderStandard() {
            const wrapper = div();
            wrapper.appendChild(this.buildAttributesFields());
            wrapper.appendChild(image({
                name: 'src',
                label: 'fred.fe.editor.image_uri',
                ...(Finder.getFinderOptionsFromElement(this.el, true))
            }, this.state.src, this.setStateValue));
            return wrapper;
        }

        /**
         * Renders the FredCropper modal
         * @returns {*}
         */
        renderCropper() {
            const wrapper = div();
            wrapper.appendChild(this.buildModal({
                name: 'src',
                label: 'fred.fe.editor.image_uri',
                ...(Finder.getFinderOptionsFromElement(this.el, true))
            }, this.state.src, this.setStateValue));
            //wrapper.appendChild(this.buildAttributesFields());
            return wrapper;
        }

        onStateUpdate() {

        }

        onSave() {
            Editor.prototype.onSave.call(this);
            this.el.fredEl.setElValue(this.el, this.state.src);
        }

        setStateAttribute(attr, value) {
            this.state._attributes[attr] = value;
            this.onStateUpdate();
        }

        setStateValue(name, value) {
            this.state[name] = value;
            this.onStateUpdate();
        }

        /**
         * Initialises cropper.js and returns the control panel
         */
        initCropper(image,controlPanel = null) {
            let size = this.activeCrop.size.split('x');
            let width = Math.round(parseInt(size[0]));
            let height = Math.round(parseInt(size[1]));

            // Aspect ratio is worked out by dividing the width and then the height by the greatest common denominator.
            function gcd (a, b) { // recursive
                return (b === 0) ? a : gcd (b, a%b);
            }
            let r = gcd (width, height);
            //console.log( (size[0] / r) + ' / ' + (size[1] / r));

            let cropper = new Cropper(image, {
                viewMode: 1,
                dragMode: 'move',
                aspectRatio: (width / r) / (height / r),
                autoCropArea: 1
            });
            image.addEventListener('ready', function (e) {
                this.cropper = cropper;
                image.parentNode.style.visibility = 'visible';
                if(controlPanel !== null) {
                    this.buildControlPanel(controlPanel);
                }
            }.bind(this));
        }



        destroyCropPanel() {

        }

        updateCropPanel() {

        }

        /**
         * Builds the FredCropper modal
         *
         * @param setting
         * @param defaultValue
         * @param onChange
         * @param onInit
         * @returns {*}
         */
        buildModal(setting, defaultValue = '', onChange, onInit) {

            const mainWrapper = div('fredcropper--main-wrapper');
            const inputWrapper = div(['fred--input-group', 'fred--browse']);
            const topRow = div('fredcropper--top-row');
            const contentRow = div('fredcropper--content-row');
            const controlPanel = div('fredcropper--control-panel');
            const cropPanel = div('fredcropper--crop-panel');
            const thumbPanel = div('fredcropper--thumb-panel');
            const thumbPanelTitle = div('fredcropper--thumb-panel-title');

            const labelEl = label(setting.label || setting.name);
            setting.showPreview = (setting.showPreview === undefined) ? true : setting.showPreview;
            let preview = img('');

            const openFinderButton = a('', 'fred.fe.browse', '', 'fred--browse-small');
            const finderOptions = {};

            const inputEl = input(defaultValue);
            labelEl.inputEl = inputEl;
            let previewAdded = false;

            if (setting.mediaSource && (setting.mediaSource !== '')) {
                finderOptions.mediaSource = setting.mediaSource;
            }

            const openFinder = function(e) {
                e.preventDefault();
                const finder = new Finder(function(file, fm) {
                    let value = file.url;

                    if (value.indexOf(fredConfig.config.themeDir) === 0) {
                        value = value.replace(fredConfig.config.themeDir, '{{theme_dir}}');
                    }

                    if (typeof onChange === 'function') {
                        onChange(setting.name, value, inputEl, setting);
                    }

                    inputEl.value = value;
                    preview = new img('');
                    preview.src = valueParser(value);

                    if ((setting.showPreview === true)) {
                        cropPanel.innerHTML = '';
                        cropPanel.appendChild(preview);
                        this.initCropper(preview);
                        previewAdded = true;
                    }
                }.bind(this), 'fred.fe.browse_images', finderOptions);

                finder.render();
            }.bind(this);
            openFinderButton.addEventListener('click', openFinder);
            inputWrapper.appendChild(inputEl);
            inputWrapper.appendChild(openFinderButton);

            if(inputEl.value) {
                preview.src = valueParser(inputEl.value);
            }

            // Join layout panels
            topRow.appendChild(labelEl);
            topRow.appendChild(inputWrapper);

            thumbPanelTitle.innerHTML = 'Select a Crop';
            thumbPanel.appendChild(thumbPanelTitle);

            // Create a thumbnail for each crop in the Fred options JSON
            let i = 0;
            this.activeCrop = null;
            this.crops.forEach(function(crop) {
                let width = crop.size.substr(0, crop.size.lastIndexOf("x"));

                let thumb = div(['fredcropper--thumb']);
                let thumbInner = i === 0 ? div(['fredcropper--thumb-inner','active']) : div('fredcropper--thumb-inner');
                let thumbTitle = div('fredcropper--thumb-title');

                let thumbImg;
                //console.log(this.el.dataset.crop);
                if(this.el.dataset.crop === 'true') {
                    let srcValue = this.srcSetManager.getSrcSetValueByName(crop.name);
                    thumbImg = img(srcValue.url);
                } else {
                    thumbImg = div('test');
                }


                thumbInner.appendChild(thumbImg);

                //console.log(this.elementCrops);
                thumbTitle.innerHTML = crop.label;
                thumbInner.appendChild(thumbTitle);
                thumb.appendChild(thumbInner);

                thumb.addEventListener('click', function(e) {
                    if(crop.active !== true) {
                        let image = img(preview.src);
                        cropPanel.style.visibility = 'hidden';
                        cropPanel.innerHTML = '';
                        cropPanel.appendChild(image);
                        this.updateCropsOnClick(crop,image);
                    }
                }.bind(this));

                thumbPanel.appendChild(thumb);
                crop.el = thumb;
                if(crop.active === true) {
                    this.activeCrop = crop;
                }
                i++;
            }.bind(this));

            contentRow.appendChild(controlPanel);
            contentRow.appendChild(cropPanel);
            contentRow.appendChild(thumbPanel);

            mainWrapper.appendChild(topRow);
            mainWrapper.appendChild(contentRow);
            mainWrapper.appendChild(this.buildDetailPanel());

            // When image element is clicked, open editor modal
            if ((setting.showPreview === true) && preview.src) {
                let image = img(preview.src);
                cropPanel.appendChild(image);
                this.initCropper(image,controlPanel);
                previewAdded = true;
            }

            if (typeof onInit === 'function') {
                onInit(setting, labelEl, inputEl);
            }

            return mainWrapper;
        }


        /**
         *
         * @param clickedCrop
         * @param image
         */
        updateCropsOnClick(clickedCrop,image) {
            this.activeCrop = clickedCrop;

            this.crops.forEach(function(crop) {
                if(crop.name === clickedCrop.name) {
                    crop.el.querySelector('.fredcropper--thumb-inner').classList.add('active');
                    crop.active = true;
                } else {
                    crop.el.querySelector('.fredcropper--thumb-inner').classList.remove('active');
                    crop.active = false;
                }
            });

            // update crop panel
            this.initCropper(image);

        }

        /**
         * Builds the detail panel along the bottom of the window.
         * @returns {*}
         */
        buildDetailPanel() {
            const detailPanel = div('fredcropper--detail-panel');
            const leftDetailPanel = div('fredcropper--detail-panel-left')
            const rightDetailPanel = div('fredcropper--detail-panel-right')

            const thumbButtons = div('fredcropper--thumb-buttons');

            const saveCropBtn = button('Save Crop');
            saveCropBtn.classList.add('fredcropper--save-crop-btn');
            saveCropBtn.classList.add('fred--btn-small');

            saveCropBtn.addEventListener('click', function(e) {
                let width = this.activeCrop.size.substr(0, this.activeCrop.size.lastIndexOf("x"));
                let height = this.activeCrop.size.substr(this.activeCrop.size.lastIndexOf("x")+1);

                this.cropper.getCroppedCanvas().toBlob((blob) => {
                    const formData = new FormData();
                    formData.append('cropped_image', blob);
                    formData.append('resource_id',fredConfig._resource.id);
                    formData.append('element_id',this.el.fredEl.elId);
                    formData.append('width',width);
                    formData.append('height',height);
                    formData.append('crop_name',this.activeCrop.name);

                    pluginTools.fetch(fredCropperAssetsUrl+'endpoints/ajax.php?action=save-crop', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(result => {
                        // Check there's already an img on the crop thumb. If not, create it.
                        let imgEl = this.activeCrop.el.querySelector('img');
                        if(imgEl === null) {
                            imgEl = img(result.crop);
                            this.activeCrop.el.firstElementChild.appendChild(imgEl);
                        } else {
                            this.activeCrop.el.querySelector('img').src = result.crop;
                        }

                        //console.log(result);
                        let newSrc = {
                            name    : result.name,
                            width   : result.width,
                            url     : result.crop
                        }
                        this.srcSetManager.updateSrcSet(newSrc);
                        this.setStateAttribute('sizes','1920px');
                        //this.setStateAttribute('alt','This is alt text');

                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                }/*,'image/webp'*/); // TODO: Set image type depending on type of file originally used.
            }.bind(this));

            const deleteCropBtn = button('Delete Crop');
            deleteCropBtn.classList.add('fredcropper--delete-crop-btn');
            deleteCropBtn.classList.add('fred--btn-small');

            thumbButtons.appendChild(deleteCropBtn);
            thumbButtons.appendChild(saveCropBtn);

            detailPanel.appendChild(leftDetailPanel);
            detailPanel.appendChild(thumbButtons);
            detailPanel.appendChild(rightDetailPanel);

            return detailPanel;
        }


        updateDetailPanel() {

        }

        /**
         * Adds all the buttons to the control panel on the left side.
         * @returns {*}
         */
        buildControlPanel(controlPanel) {

            // Creates the crop preview button and modal
            const previewBtn = img(fredCropperAssetsUrl+'icons/monitor.svg');
            previewBtn.classList.add('fredcropper--preview-btn');
            previewBtn.setAttribute('title','Preview Crop');
            previewBtn.addEventListener('click', function(e) {
                // Open modal with current crop preview
                let previewWrapper = this.renderPreviewModal();
                let previewModal = new Modal('Crop Preview', previewWrapper, this.onSave.bind(this), {width: 'auto'});
                previewModal.render();
                previewModal.saveButton.innerHTML = 'Close';

                let image = this.cropper.getCroppedCanvas();
                previewWrapper.appendChild(image);

                let newTabButton = button('<img src="'+fredCropperAssetsUrl+'icons/external-link-bold.svg">');
                newTabButton.classList.add('fredcropper--link-btn');

                let modalTitle = previewModal.wrapper.firstElementChild.firstElementChild.querySelector('h1');
                previewModal.wrapper.firstElementChild.firstElementChild.insertBefore(newTabButton,modalTitle);

                let data = this.cropper.getData();
                console.log(data);

                newTabButton.addEventListener('click',function() {
                    //create a new canvas
                    let newCanvas = document.createElement('canvas');
                    let context = newCanvas.getContext('2d');
                    //set dimensions
                    newCanvas.width = image.width;
                    newCanvas.height = image.height;
                    //apply the old canvas to the new one
                    context.drawImage(image, 0, 0);
                    let newTab = window.open();
                    newTab.document.body.appendChild(newCanvas);
                }.bind(this));
                //previewModal.wrapper.appendChild(newTabButton)

            }.bind(this));

            // Zoom In Button
            const zoomInBtn = img(fredCropperAssetsUrl+'icons/zoom-in.svg');
            zoomInBtn.classList.add('fredcropper--zoom-in-btn');
            zoomInBtn.setAttribute('title','Zoom In');
            zoomInBtn.addEventListener('click', function(e) {
                this.cropper.zoom(0.1);
            }.bind(this));

            // Zoom Out Button
            const zoomOutBtn = img(fredCropperAssetsUrl+'icons/zoom-out.svg');
            zoomOutBtn.classList.add('fredcropper--zoom-out-btn');
            zoomOutBtn.setAttribute('title','Zoom Out');
            zoomOutBtn.addEventListener('click', function(e) {
                this.cropper.zoom(-0.1);
            }.bind(this));

            // Rotate Clockwise Button
            const rotateCwBtn = img(fredCropperAssetsUrl+'icons/rotate-cw.svg');
            rotateCwBtn.classList.add('fredcropper--rotate-cw-btn');
            rotateCwBtn.setAttribute('title','Rotate Clockwise');
            rotateCwBtn.addEventListener('click', function(e) {
                this.cropper.rotate(90);
                let data = this.cropper.getCropBoxData();
                this.cropper.setCanvasData({
                    width:data.width,
                    height:data.height
                });
            }.bind(this));

            // Rotate Counter-Clockwise Button
            const rotateCcwBtn = img(fredCropperAssetsUrl+'icons/rotate-ccw.svg');
            rotateCcwBtn.classList.add('fredcropper--rotate-ccw-btn');
            rotateCcwBtn.setAttribute('title','Rotate Anti-Clockwise');
            rotateCcwBtn.addEventListener('click', function(e) {
                this.cropper.rotate(-90);
                let data = this.cropper.getCropBoxData();
                this.cropper.setCanvasData({
                    width:data.width,
                    height:data.height
                });
            }.bind(this));

            // Flip Vertically Button
            const arrowUpBtn = img(fredCropperAssetsUrl+'icons/arrow-up.svg');
            arrowUpBtn.classList.add('fredcropper--arrow-up-btn');
            arrowUpBtn.setAttribute('title','Flip Vertically');
            arrowUpBtn.addEventListener('click', function(e) {
            if (this.cropper.getData().rotate === 90 || this.cropper.getData().rotate === 270) {
                this.cropper.scaleX(-this.cropper.getData().scaleX);
            } else {
                this.cropper.scaleY(-this.cropper.getData().scaleY);
            }
            }.bind(this));

            // Flip Horizontally Button
            const arrowRightBtn = img(fredCropperAssetsUrl+'icons/arrow-right.svg');
            arrowRightBtn.classList.add('fredcropper--arrow-right-btn');
            arrowRightBtn.setAttribute('title','Flip Horizontally');
            arrowRightBtn.addEventListener('click', function(e) {
                if (this.cropper.getData().rotate === 90 || this.cropper.getData().rotate === 270) {
                    this.cropper.scaleY(-this.cropper.getData().scaleY);
                } else {
                    this.cropper.scaleX(-this.cropper.getData().scaleX);
                }
            }.bind(this));

            // Reset Button
            const resetBtn = img(fredCropperAssetsUrl+'icons/refresh-cw.svg');
            resetBtn.classList.add('fredcropper--reset-btn');
            resetBtn.setAttribute('title','Reset Cropping Panel');
            resetBtn.addEventListener('click', function(e) {
                this.cropper.reset();
            }.bind(this));

            controlPanel.appendChild(previewBtn);
            controlPanel.appendChild(zoomInBtn);
            controlPanel.appendChild(zoomOutBtn);
            controlPanel.appendChild(rotateCwBtn);
            controlPanel.appendChild(rotateCcwBtn);
            controlPanel.appendChild(arrowUpBtn);
            controlPanel.appendChild(arrowRightBtn);
            controlPanel.appendChild(resetBtn);
        }


        buildAttributesFields() {
            const wrapper = div();
            if (this.el.dataset.fredAttrs) {
                const attrs = this.el.dataset.fredAttrs.split(',');
                attrs.forEach(attr => {
                    this.state._attributes[attr] = this.el.getAttribute(attr || '');
                    wrapper.appendChild(pluginTools.ui.ins.text({name: attr, label: attr}, this.state._attributes[attr], this.setStateAttribute));
                });
            }

            return wrapper;
        }
    }

    return FredCropper;
};


/*******************************************************************
 * SrcSetManager
 * Manages loading, saving and updating of the srcset attribute.
 ******************************************************************/
class SrcSetManager {
    constructor(fredCropper) {
        this.fredCropper = fredCropper;
        this.srcSet = '';
        this.srcCount = 0;
        this.srcValues = [];

        this.init(fredCropper);
    }

    init(fredCropper) {
        fredCropper.crops.forEach((crop) => {
            let width = crop.size.substr(0, crop.size.lastIndexOf("x"));
            let src = {
                name: crop.name,
                width: width,
                url: ''
            }
            this.srcValues.push(src);
        });

        this.loadSrcSet();
    }

    /**
     * Parses the srcset attribute from the element and loads the src values.
     */
    loadSrcSet() {
        if(this.fredCropper.el.attributes.srcset.value === "null") {
            console.log('correctly null');
            return false;
        }
        let srcset = this.fredCropper.el.attributes.srcset.value.split(',');

        srcset.forEach(function(t){
            let width = t.substr(t.lastIndexOf(" ") + 1);
            let url = t.substr(0, t.lastIndexOf(" "));

            if(this.srcValues.length > 0) {
                this.srcValues.forEach((src) => {
                    if (parseInt(src.width) === parseInt(width)) {
                        src.url = url;
                    }
                });
            }
        }.bind(this));

        let count = 0;
        this.srcValues.forEach(function(src) {
            if(src.url.length > 0) {
                count++;
            }
        });
        this.srcCount = count;
        //console.log(this.srcValues);
    }

    /**
     * Takes the src values and constructs a string which overwrites the element srcset attribute.
     */
    saveSrcSet() {
        let i = 0;
        this.srcSet = '';
        if(this.srcValues.length > 0) {
            this.srcValues.forEach(function(src) {
                if(src.url.length > 0) {
                    i++;
                    this.srcSet += src.url + ' ' + src.width + 'w';
                    if (i <= this.srcCount) {
                        this.srcSet += ', ';
                    }
                }
            }.bind(this));
            // Save the srcset value to the element attribute
            this.fredCropper.setStateAttribute('srcset',this.srcSet);
        }
        this.srcCount++;
        //console.log(this.srcSet);
    }

    /**
     * Updates the element srcset attribute with new values.
     */
    updateSrcSet(newSrc) {
        if (this.srcValues.length > 0) {
            this.srcValues.forEach(function (src) {
                if (src.name === newSrc.name) {
                    src.url = newSrc.url;
                }
            }.bind(this));
        }

        this.saveSrcSet();
        this.fredCropper.el.dataset.crop = 'true';
        this.fredCropper.pluginTools.fredConfig.setPluginsData('fredcropper'+this.fredCropper.el.fredEl.elId, 'activated', 'true');
    }

    /**
     * Returns array of all src values
     * @returns {[]}
     */
    getSrcSetValues() {
        return this.srcValues;
    }

    /**
     * Returns a src value object defined by it's name
     * @param name
     * @returns {boolean|*}
     */
    getSrcSetValueByName(name) {
        let srcValue;
        if(this.srcValues.length > 0) {
            this.srcValues.forEach(function(src) {
                if(src.name === name) {
                    srcValue = src;
                }
            });
        }

        if(typeof srcValue !== 'undefined') {
            return srcValue;
        }

        return false;
    }

    /**
     * Returns a src value object defined by it's width
     * @param width
     * @returns {boolean|*}
     */
    getSrcSetValueByWidth(width) {
        let srcValue;
        if(this.srcValues.length > 0) {
            this.srcValues.forEach(function(src) {
                if(src.width === width) {
                    srcValue = src;
                }
            });
        }

        if(typeof srcValue !== 'undefined') {
            return srcValue;
        }

        return false;
    }

}
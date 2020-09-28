-----------------------------------------------
FredCropper
-----------------------------------------------
Version: 1.0.0-alpha1
Author: Murray Wood @ Digital Penguin Hong Kong
-----------------------------------------------

FredCropper is a plugin for the Fred (Front-end Editor) extra, which runs on MODX CMS.

ALPHA
FredCropper is currently in an alpha state and is not recommended for a production environment.
It is currently the minimum viable product.


FEATURES
========
- Modal editor window allowing easy cropping, rotating, flipping, zooming and resizing of multiple images.

- Works with Fred's implementation of the elFinder file browser.

- Provides previews of crops in both a preview modal window, as well as a new tab in the browser.

- Crops are all saved to a user-specified directory on the server and indexed in a custom database table.

- Information window (icon is top right next to close button). This opens a modal with any information the developer
  wants the editor to see for this modal. Helpful for adding instructions for different crop sizes.
  (Still need to workout the best way for a developer to easily add html to the modal. Options are a bit awkward.)

- Old crop clean-up functionality. Uses the MODX event "FredOnFredResourceSave" to check if the user deleted any
  FredCropper elements from a resource and if so removes associated crop image files from the server.

- Swap out the source image for crops of different images within the same element.


PLANNED EXTRA FEATURES
======================
- Convert all text to lexicon entries to allow for translations.

- Display live image data (width, height, position etc.) while cropping.

- Allow developer to set the quality of crop output. Currently is hard-coded at 100%.

- Have a modal with fields for the user to add content for the alt and title tags.

- Display warnings if a selected source image is smaller than the largest crop size.

- Display warnings on the crop preview if the cropped area is smaller than the specified crop size.

- Enable output of crops as either jpg, png or webp depending on the original file format.


KNOWN ISSUES
============
- Currently if a user creates a crop, but doesn't save the resource afterwards, the url to the new crop file is not saved locally within
  the Fred element and will display as a broken image. This is easily fixed by creating another crop and then saving the resource.
  Have yet to find a foolproof solution. (browser caching of images prevents us using a standard filename for each crop size)

- (Only kind of an issue) If a user duplicates a FredCropper element, the source image is also duplicated but the crops
  are not. This means that after duplicating, the user would then need to make new crops for the new element.

- Currently only saving crops as PNG.

- Previews not showing full size of images if the original was smaller.

- Does not currently support resolution switching. i.e. using 2x instead of pixel width.


USAGE
=====
After installing FredCropper via the MODX package manager, create a Fred element which contains an "img" tag, and give
it some extra attributes. We need src, srcset, data-fred-name and data-fred-attrs. See the following example:

<img src="/assets/images/my-default-image.jpg"
    srcset="/assets/images/my-default-image.jpg"
    data-fred-attrs="srcset,sizes,data-crop,alt,title"
    data-fred-name="something-unique"
>

- "src" and "srcset" should have the same value.

- FredCropper will manipulate the srcset attribute automatically but it needs an initial value so that when you drop the
element in a dropzone, it will show an image you can click on to open the cropping window.

- data-fred-attrs is the attribute that controls what Fred will save. Make sure you include srcset, sizes, data-crop, alt and title as values.
(alt and title aren't being used yet but they will be in the next update)

- data-fred-name is the same as any other editable Fred element. Give it a unique value.

OPTIONS

After setting up the attributes above, next switch to the options tab. We need to enter the crop sizes we want for this element,
as well as the value you want for the "sizes" attribute.

See the following example:

{
  "FredCropper": [
    {
      "crops": [
        {
          "name": "desktop",
          "label": "Desktop",
          "size": "1920x400"
        },
        {
          "name": "mobile",
          "label": "Mobile",
          "size": "768x600"
        },
        {
          "name": "tiny",
          "label": "Tiny",
          "size": "300x150"
        }
      ]
    },
    {
      "sizes": "(min-width: 1200px) 1920w, 768w"
    }
  ]
}

As you can see above, everything is under the "FredCropper" name. Just like your other options might be under "settings".
https://modxcms.github.io/fred/themer/options/settings/

The two main options here are "crops" and "sizes". Each crop needs a "name, a "label" and a "size" value.

The "sizes" value can be anything you like to control how the images appear on different screen widths.
e.g. https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images


Once you've finished, save, and you can start to use it.
Drop the element into a dropzone and click on the image to open the cropper.
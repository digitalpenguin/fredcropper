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


PLANNED EXTRA FEATURES
======================
- Convert all text to lexicon entries to allow for translations.

- Display live image data (width, height, position etc.) while cropping.

- Allow developer to set the quality of crop output. Currently is hard-coded at 100%.

- Swap out the source image for a single or many crops. This will allow you to have different images for different screen sizes if desired.
  Currently all crops within the same Fred element come from the same source image.

- Have a modal with fields for the user to add content for the alt and title tags.

- Display warnings if a selected source image is smaller than the largest crop size.

- Display warnings on the crop preview if the cropped area is smaller than the specified crop size.


KNOWN ISSUES
============
- Currently if a user creates a crop, but doesn't save the resource afterwards, the url to the new crop file is not saved locally within
  the Fred element and will display as a broken image. This is easily fixed by creating another crop and then saving the resource.
  Have yet to find a foolproof solution. (browser caching of images prevents us using a standard filename for each crop size)

- (Only kind of an issue) If a user duplicates a FredCropper element, the source image is also duplicated but the crops
  are not. This means that after duplicating, the user would then need to make new crops for the new element.

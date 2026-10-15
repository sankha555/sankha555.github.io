// Crop the sidebar profile photo around the head instead of blindly centering it.
// The frame size changes with the screen (the fixed sidebar gives the photo
// whatever height is left), so the crop is recomputed on load and on resize.
(function () {
    // Position of the head in the photo, as fractions of the image height.
    // Update these if the photo changes.
    var HEAD_TOP = 0.14;     // top of the hair
    var CHIN = 0.52;         // bottom of the chin
    var HEADROOM = 0.12;     // share of the frame kept empty above the hair

    // Smallest share of the image height the frame may show: the whole head
    // plus the headroom above it and a little space below the chin.
    var MIN_VISIBLE = (CHIN - HEAD_TOP) / (1 - 2 * HEADROOM);

    function crop(img) {
        var nw = img.naturalWidth, nh = img.naturalHeight;
        if (!nw || !nh) return;

        // Let the stylesheet size the frame first, then measure it.
        img.style.width = '';
        var w = img.clientWidth, h = img.clientHeight;
        if (!w || !h) return;

        // If the frame is too short and wide to fit the whole head, narrow it.
        // The sidebar still sets the height, since the narrower photo is taller
        // than the space left for it and shrinks to fit.
        var visible = (h * nw) / (w * nh);
        if (visible < MIN_VISIBLE) {
            img.style.width = Math.round((h * nw) / (MIN_VISIBLE * nh)) + 'px';
            visible = MIN_VISIBLE;
        }

        if (visible >= 1) {
            img.style.objectPosition = '50% 0';
            return;
        }

        // Put the top of the frame a little above the hair.
        var top = Math.max(0, Math.min(HEAD_TOP - HEADROOM * visible, 1 - visible));
        img.style.objectPosition = '50% ' + (100 * top / (1 - visible)).toFixed(2) + '%';
    }

    function cropAll() {
        var imgs = document.querySelectorAll('.profile-img');
        for (var i = 0; i < imgs.length; i++) crop(imgs[i]);
    }

    var imgs = document.querySelectorAll('.profile-img');
    for (var i = 0; i < imgs.length; i++) {
        if (imgs[i].complete) crop(imgs[i]);
        else imgs[i].addEventListener('load', function () { crop(this); });
    }
    window.addEventListener('resize', cropAll);
    window.addEventListener('load', cropAll);
    if (document.fonts) document.fonts.ready.then(cropAll);

    // Icon fonts and web fonts can load late and change the height of the
    // name and links, which changes the space left for the photo.
    if (window.ResizeObserver) {
        var observer = new ResizeObserver(cropAll);
        for (var j = 0; j < imgs.length; j++) {
            var siblings = imgs[j].parentNode.children;
            for (var k = 0; k < siblings.length; k++) {
                if (siblings[k] !== imgs[j]) observer.observe(siblings[k]);
            }
        }
    }
})();

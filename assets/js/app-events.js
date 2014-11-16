(function(app, $, undefined) {
    app.onMouseDown = function(e) {
        app.handlePointInputStart({
            x: e.pageX - $(this).offset().left,
            y: e.pageY - $(this).offset().top
            });
    };

    app.onMouseUp = function(e) {

    };

    app.onMouseMove = function(e) {

    };

    app.onKeyDown = function(e) {
        console.info("onKeyDown e.which=" + e.which);

        var SPACE = 32;

        switch(e.which) {
            case SPACE:
                app.isPlaying = !app.isPlaying;
                
                break;
        }
    };
}(window.app = window.app || {}, jQuery));
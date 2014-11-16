(function(app, $, undefined){
    /**
     *
     */
    app.handlePointInputStart = function(point) {
        var dot = app.dotFromPoint(point);
        if (dot) {
            console.info("dot is here!");

            app.tracks[0].grid[dot.row][dot.col] = !app.tracks[0].grid[dot.row][dot.col];
            app.lastDotChange[0] = dot;
            // app.draw();
        } else {
            // Point input is not interacting with grid
        }
    };

    /**
     *
     */
    app.dotFromPoint = function(point) {
        // if (point.x < app.tracks[0].offsetX + app.DOT_PADDING)
        //     return null;
        
        for (var dotCol = 0; dotCol < app.COLS_PER_TRACK; dotCol++) {
            for (var dotRow = 0; dotRow < app.DOTS_PER_COL; dotRow++) {
                // Be bruteful, for now.  Optimize later.
                if (app.pointIsOverDot(point, dotRow, dotCol)) {
                    return {row: dotRow, col: dotCol};
                }
            }
        }

        return null;
    };

    app.pointIsOverDot = function(point, dotRow, dotCol) {
        var dotLeft = app.EDITOR_OFFSET_X + app.DOT_PADDING * (dotCol + 1) + app.DOT_SIZE * dotCol;
        var dotTop = app.EDITOR_OFFSET_Y + app.DOT_PADDING * (dotRow + 1) + app.DOT_SIZE * dotRow;

        return (
                point.x >= dotLeft &&
                point.x < dotLeft + app.DOT_SIZE &&
                point.y >= dotTop &&
                point.y < dotTop + app.DOT_SIZE
                );
    };
}(window.app = window.app || {}, jQuery));
(function(app, $, undefined){
    app.DOTS_PER_COL = 16;
    app.COLS_PER_TRACK = 16;
    app.DOT_SIZE = 36; // px
    app.DOT_PADDING = 4; // px
    app.MILLIS_PER_FRAME = 1000 / 60;
    app.TEMPO = 5; // frames (interim unit for tempo speed)
    //app.DOT_ON_COLOR = "0, 200, 200";
    app.DOT_ON_COLOR = "0, 92, 148";
    app.DOT_OFF_COLOR = "0, 0, 0";
    app.INITIAL_IMPACT = .5;
    app.IMPACT_FADE_STEP = .025;
    app.IMPACT_RADIUS = 4;
    // app.MAX_IMPACT = 5;

    app.EDITOR_OFFSET_X = 0;
    app.EDITOR_OFFSET_Y = 0;

    app.canvas = null;
    app.ctx = null;
    app.stepTimeoutID;
    app.tempoFrame = 0;
    app.currentCol = -1; // Value of -1 will force first column to play
    app.lastDotChange = [];
    app.lastDotChange[0] = null;
    app.isPlaying = true;
    // Setup to hold one track, for now
    app.tracks = [
                    []
                    ];
    app.tracks[0].grid = [];
    app.tracks[0].impactGrid = [];

    /**
     * Registers @var{canvas} with @var{app}.
     */
    app.registerCanvas = function(canvas) {
        console.info("registerCanvas");

        app.canvas = canvas;
        app.ctx = canvas.getContext('2d');

        var availableWidth = $(window).width();
        var availableHeight = $(window).height();
        canvas.width = availableWidth;
        canvas.height = availableHeight;
        // app.DOT_SIZE = availableHeight / (app.DOTS_PER_COL) - app.DOT_PADDING;

        app.EDITOR_OFFSET_X = 0.5 * (availableWidth - app.DOT_SIZE * app.DOTS_PER_COL - app.DOT_PADDING * (app.DOTS_PER_COL + 1));
        app.EDITOR_OFFSET_Y = 0.5 * (availableHeight - app.DOT_SIZE * app.COLS_PER_TRACK - app.DOT_PADDING * (app.COLS_PER_TRACK + 1));
    };

    /**
     * Set up event listeners for various mouse, touch, and keyboard inputs.
     * 
     * Precondition:  @var{app} already has a canvas registered to it.
     */
    app.setupEventListeners = function() {
        console.info("setupEventListeners");

        $(app.canvas).mousedown(app.onMouseDown);
        $(app.canvas).mouseup(app.onMouseUp);
        $(app.canvas).mousemove(app.onMouseMove);
        $("body").keydown(app.onKeyDown);
    };

    /**
     * Draw frame of editor.
     */
    app.draw = function() {
        // console.info("draw");

        app.ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);
        
        for (var col = 0; col < app.COLS_PER_TRACK; col++) {
            // Draw column of dots
            for (var row = 0; row < app.DOTS_PER_COL; row++) {
                app.drawDot(row, col);
            }
        }

        
        for (var col = 0; col < app.COLS_PER_TRACK; col++) {
            // Draw column of dots
            for (var row = 0; row < app.DOTS_PER_COL; row++) {
                // app.drawDot(row, col);
                if (app.tracks[0].impactGrid[row][col] > 0) {
                    app.tracks[0].impactGrid[row][col] -= app.IMPACT_FADE_STEP;

                    if (app.tracks[0].impactGrid[row][col] <= 0) {
                        app.tracks[0].impactGrid[row][col] = 0;
                    } else {
                        for (var impactRow = row - 1; impactRow <= row + 1; impactRow++) {
                            for (var impactCol = col - 1; impactCol <= col + 1; impactCol++) {
                                if (impactRow >= 0 && impactRow < app.COLS_PER_TRACK && impactCol >= 0 && impactCol < app.DOTS_PER_COL && !app.tracks[0].grid[impactRow][impactCol] && impactCol != app.currentCol) {
                                    app.drawImpact(impactRow, impactCol, app.tracks[0].impactGrid[row][col]);
                                }
                            }
                        }
                    }
                }
            }
        }
        // TODO Remain commented until complete
        // if (app.lastDotChange[0]) {
        //     app.drawLastChange(app.lastDotChange[0].row, app.lastDotChange[0].col);
        // }
    };

    /**
     *
     */
    app.drawImpact = function(row, col, impact) {
        var alpha = impact;

        // if (app.tracks[0].grid[row][col]) {
        //     app.ctx.fillStyle = "rgba(" + app.DOT_ON_COLOR +  ", " + alpha + ")";
        // } else {
        //     app.ctx.fillStyle = "rgba(" + app.DOT_OFF_COLOR + ", " + alpha + ")";
        // }

        app.ctx.fillStyle = "rgba(240, 240, 240, " + alpha + ")";

        // Draw dot
        app.ctx.fillRect(
            app.EDITOR_OFFSET_X + app.DOT_PADDING * (col + 1) + app.DOT_SIZE * col,
            app.EDITOR_OFFSET_Y + app.DOT_PADDING * (row + 1) + app.DOT_SIZE * row,
            app.DOT_SIZE,
            app.DOT_SIZE
            );        
    };

    /**
     * TODO Finish me
     */
    app.drawLastChange = function(row, col) {
        var alpha = 0.25;
        if (app.currentCol == col) {
            alpha = 0.4;
        }

        app.ctx.lineWidth = 10;

        if (app.tracks[0].grid[row][col]) {
            // app.ctx.fillStyle = "rgba(" + app.DOT_ON_COLOR +  ", " + alpha + ")";
            app.ctx.strokeStyle = "rgba(" + app.DOT_ON_COLOR +  ", " + alpha + ")";
        } else {
            //app.ctx.fillStyle = "rgba(" + app.DOT_OFF_COLOR + ", " + alpha + ")";
            app.ctx.strokeStyle = "rgba(" + app.DOT_OFF_COLOR + ", " + alpha + ")";
        }

        // Draw dot
        app.ctx.strokeRect(
            app.EDITOR_OFFSET_X + app.DOT_PADDING * (col + 1) + app.DOT_SIZE * col,
            app.EDITOR_OFFSET_Y + app.DOT_PADDING * (row + 1) + app.DOT_SIZE * row,
            app.DOT_SIZE,
            app.DOT_SIZE
            );
    }

    /**
     *
     */
    app.drawDot = function(row, col) {
        // console.info("drawDot row=" + row + ", col=" + col);

        //app.ctx.strokeStyle = "rgba(100, 0, 0, 0.5)";
        var alpha = 0.5;
        if (app.currentCol == col) {
            alpha = 1.0;
        }

        if (app.tracks[0].grid[row][col]) {
            app.ctx.fillStyle = "rgba(" + app.DOT_ON_COLOR +  ", " + alpha + ")";
        } else {
            app.ctx.fillStyle = "rgba(" + app.DOT_OFF_COLOR + ", " + alpha + ")";
        }

        // Draw dot
        app.ctx.fillRect(
            app.EDITOR_OFFSET_X + app.DOT_PADDING * (col + 1) + app.DOT_SIZE * col,
            app.EDITOR_OFFSET_Y + app.DOT_PADDING * (row + 1) + app.DOT_SIZE * row,
            app.DOT_SIZE,
            app.DOT_SIZE
            );
    };

    app.step = function() {
        clearInterval(app.stepTimeoutID);

        if (app.isPlaying) {
            app.tempoFrame++;
            if (app.tempoFrame >= app.TEMPO) {
                app.currentCol++;
                app.currentCol = app.currentCol % app.COLS_PER_TRACK;

                app.playColumn(0, app.currentCol);

                app.tempoFrame = 0;
            }
        }

        app.draw();

        app.stepTimeoutID = window.setTimeout(app.step, app.MILLIS_PER_FRAME);
    };

    app.playColumn = function(trackID, col) {
        // console.info("playColumn trackID=" + trackID + ", col=" + col);

        var notes = [];
        // notes[0] = MIDI.keyToNote["C4"];
        // notes[1] = MIDI.keyToNote["A4"];
        // notes[2] = MIDI.keyToNote["F4"];
        // notes[3] = MIDI.keyToNote["G3"];
        // notes[4] = MIDI.keyToNote["D4"];
        // notes[5] = MIDI.keyToNote["C5"];
        // notes[6] = MIDI.keyToNote["A3"];
        // notes[7] = MIDI.keyToNote["G4"];

        notes[0] = MIDI.keyToNote["C4"];
        notes[1] = MIDI.keyToNote["A3"];
        notes[2] = MIDI.keyToNote["G3"];
        notes[3] = MIDI.keyToNote["F3"];
        notes[4] = MIDI.keyToNote["D3"];
        notes[5] = MIDI.keyToNote["C3"];
        notes[6] = MIDI.keyToNote["A2"];
        notes[7] = MIDI.keyToNote["G2"];
        notes[8] = MIDI.keyToNote["F2"];
        notes[9] = MIDI.keyToNote["D2"];
        notes[10] = MIDI.keyToNote["C2"];
        notes[11] = MIDI.keyToNote["A1"];
        notes[12] = MIDI.keyToNote["G1"];
        notes[13] = MIDI.keyToNote["F1"];
        notes[14] = MIDI.keyToNote["D1"];
        notes[15] = MIDI.keyToNote["C1"];

        // notes[0] = MIDI.keyToNote["C5"];
        // notes[1] = MIDI.keyToNote["A4"];
        // notes[2] = MIDI.keyToNote["G4"];
        // notes[3] = MIDI.keyToNote["F4"];
        // notes[4] = MIDI.keyToNote["D4"];
        // notes[5] = MIDI.keyToNote["C4"];
        // notes[6] = MIDI.keyToNote["A3"];
        // notes[7] = MIDI.keyToNote["G3"];
        // notes[8] = MIDI.keyToNote["F3"];
        // notes[9] = MIDI.keyToNote["D3"];
        // notes[10] = MIDI.keyToNote["C3"];
        // notes[11] = MIDI.keyToNote["A2"];
        // notes[12] = MIDI.keyToNote["G2"];
        // notes[13] = MIDI.keyToNote["F2"];
        // notes[14] = MIDI.keyToNote["D2"];
        // notes[15] = MIDI.keyToNote["C2"];

        // notes[0] = MIDI.keyToNote["C6"];
        // notes[1] = MIDI.keyToNote["A5"];
        // notes[2] = MIDI.keyToNote["G5"];
        // notes[3] = MIDI.keyToNote["F5"];
        // notes[4] = MIDI.keyToNote["D5"];
        // notes[5] = MIDI.keyToNote["C5"];
        // notes[6] = MIDI.keyToNote["A4"];
        // notes[7] = MIDI.keyToNote["G4"];
        // notes[8] = MIDI.keyToNote["F4"];
        // notes[9] = MIDI.keyToNote["D4"];
        // notes[10] = MIDI.keyToNote["C4"];
        // notes[11] = MIDI.keyToNote["A3"];
        // notes[12] = MIDI.keyToNote["G3"];
        // notes[13] = MIDI.keyToNote["F3"];
        // notes[14] = MIDI.keyToNote["D3"];
        // notes[15] = MIDI.keyToNote["C3"];

        for (var row = 0; row < app.DOTS_PER_COL; row++) {
            if (app.tracks[0].grid[row][col]) {
                app.tracks[0].impactGrid[row][col] = app.INITIAL_IMPACT;

                var delay = 0.00;
                var velocity = 50;
                MIDI.setVolume(0, 130);
                // MIDI.programChange(0, 32); 
                MIDI.noteOn(0, notes[row], velocity, delay);
                // MIDI.noteOff(0, notes[row], velocity, delay + .5);
            }
        }
        // TODO Play music notes
    };

    /**
     *
     */
    app.musicTest = function() {
        var delay = 0.00;
        var note1 = MIDI.keyToNote["C3"];
        var note2 = MIDI.keyToNote["A3"];
        var note3 = MIDI.keyToNote["F3"];
        var note4 = MIDI.keyToNote["G2"];
        var note5 = MIDI.keyToNote["D3"];
        var note6 = MIDI.keyToNote["C4"];
        var note7 = MIDI.keyToNote["A2"];
        var note8 = MIDI.keyToNote["G3"];

        var velocity = 100;
        MIDI.setVolume(0, 130);
        MIDI.noteOn(0, note1, velocity, delay);
        MIDI.noteOn(0, note2, velocity, delay+1);
        MIDI.noteOn(0, note3, velocity, delay+2);
        MIDI.noteOn(0, note4, velocity, delay+3);   
        MIDI.noteOn(0, note5, velocity, delay+4);
        MIDI.noteOn(0, note6, velocity, delay+5);
        MIDI.noteOn(0, note7, velocity, delay+6);
        MIDI.noteOn(0, note8, velocity, delay+7);
    };

    /**
     * 
     */
    app.init = function() {
        console.info("init");

        for (var row = 0; row < app.DOTS_PER_COL; row++) {
            var dots = [];
            var impacts = [];

            for (var col = 0; col < app.COLS_PER_TRACK; col++) {
                dots.push(false);
                impacts.push(0);
            }

            app.tracks[0].grid.push(dots);
            app.tracks[0].impactGrid.push(impacts);
        }

	/*
        // dispatcher.bind('event_name', function(data) {
        //   console.log(data.message); // would output 'this is a message'
        // });


        var success = function(response) {
          console.log("You are awesome because: "+response.message);
        }

        var failure = function(response) {
          console.log("You are not very awesome because: "+response.message);
        }

        var dispatcher = new WebSocketRails('104.200.18.11:3000/websocket');
        var message = { awesomeness: 4 }
        dispatcher.trigger('awesomeness_approval', message, success, failure); 
	*/

        app.stepTimeoutID = window.setTimeout(app.step, app.MILLIS_PER_FRAME);
    };
}(window.app = window.app || {}, jQuery));

$(document).ready(function() {
    console.info("Document Ready");
    var canvas = document.getElementById('editor');

    if (canvas.getContext) {
        app.registerCanvas(canvas);
        app.setupEventListeners();
        // MIDI.programChange(0, 88); 
        /**
         * Instruments
         * -----------
         * 79   ocarina
         * 88   pad_1_new_age
         * 96   fx_1_rain
         * 98   fx_3_crystal        works well #2
         * 100  fx_5_brightness
         * 102  fx_7_echoes         
         * 103  fx_8_scifi          works well #3
         * 108  kalimba             works well #1
         * 
         * 
         */
        MIDI.loadPlugin({
            soundfontUrl: "/soundfonts/",
            instrument: "kalimba", //instrument: "acoustic_grand_piano",
            callback: function() {
                MIDI.programChange(0, 108);
                app.init();
                }
            });

        $('#chat').scrollTop(
            $('#chat')[0].scrollHeight
            );
    } else {
        console.error("Canvas context could not be obtained.");
    }
});

/**
*   jQuery Mapz v1.0
*
*   by Danny van Kooten - http://dannyvankooten.com
*
*   For more information, visit:
*   http://dannyvankooten.com/jquery-plugins/mapz/
*
*   Licensed under the Creative Commons Attribution 2.5 License - http://creativecommons.org/licenses/by/2.5/
*    Free for use in both personal and commercial projects
*    Attribution requires leaving author name, author link, and the license info intact.
*
* mlindros notes:
*
* map-viewport is a class that is getting the div based off of the currently active element. This allows the code
* to work with multiple image maps, each which uses a separate id to distinguish, and to turn some images off while
* turning others on. this provides us with our nested diagram capability.
*
* The map-viewport div also has an ID that is based on the name of the diagram in order to control which
* image map is displayed.
*
* The map variable is the currently selected element. This will always have a unique id so we can distinguish
* image maps, but will all use the same CSS class: .draggable_map so we can set its appearance at will universally
*/
var count = 0;
var mapzdebug = "none";

/**
 * I changed the mapzdebug variable so we can control which console log messages are displayed based on the setting.
 * This makes it easier to isolate issues in certain areas.
 *
 * Possible debug levels:
 * none     - Do not debug
 * all      - Turn on all debugging. Likely to be very verbose
 * clicks   - Used to debug mouse events related to dragging maps and clicking on hotspots
 * callback - Used to debug the mapz callback function that allows outside JavaScript to call into the plug-in
 */

(function( $ ){
    var _map;

    //This is our internal class that we use to create the initial mapz functionality and
    //to expose functions to external JS files
    var mapz_control = function(options) {
        var settings = {
            'zoom':false,
            'createmaps':false,
            'mousewheel':false
        };

        if ( options ) {
            $.extend( settings, options );
        }

        var oldSpot = null;                           //Used to save the currently highlighted hotspot
        var DELAY = 250, clicks = 0, timer = null;    //Used for double-click management
        var timeout;                                  //Used for scrolling map with arrows
        var interval = 50;                            //Used for scrolling map with arrows
        var viewport = _map.parent('.map-viewport');  //The parent div tag used throughout plug-in code
        var map = _map;                               //The draggable map div used throughout plug-in code
        var constraint = $(document.createElement('div')).addClass('mapz-constraint').css('position','absolute').appendTo(viewport);

        //mlindros: Variables for dragging through hotspots
        var mouse_x_orig = 0;   //Mouse original x coordinate position when mousedown occurs on a hotspot
        var mouse_y_orig = 0;   //Mouse original y coordinate position when mousedown occurs on a hotspot
        var hotspotclickstate = "NONE"; //Possible states are NONE, MOUSEDOWN, OUTSIDEVIEWPORT
        var mousemoved = false; //Used to determine if a click is associated with mouse movement or not
        var movethreshold = 3;  //If mouse moves more than this many pixels it is a move, not a click
        var topOffset = 0;      //The distance between the map Y and mouse Y when button is pressed
        var leftOffset = 0;     //The distance between the map X and mouse X when button is pressed

        return createApi();

        function createApi() {
            init_mapz();            //Initialize all CSS and other properties properly for this image
            init_mapz_events();     //Initialize all Mapz events that are not tied closely to an init function
            return {
                mapz_control : mapz_callback
            }
        }

        ////////////////////////////////////////////////////////////////////////////
        //BEGIN EXPOSED PLUG-IN FUNCTIONS HERE
        ////////////////////////////////////////////////////////////////////////////
        function mapz_callback(command){
            if (viewport.is(':hidden')) return; //Only work on visible elements
            if (isDebugOn("all|callback")) console.log("DEBUG(callback): Mapz mapz_callback() was called!!!! " + command);

            if (command == "getName") return viewport;
            set_mapz_dimensions();
            positionArrows();
            createConstraint();
            return false;
        }

        function init_mapz_events() {
            //mlindros code: Handle hotspot click events to allow dragging through hotspots
            $('.hotspot').live("mousedown", function(e) {
                e.preventDefault();
                if (viewport.is(':hidden')) return; //Only work on visible elements
                if (isDebugOn("all|clicks")) console.log('------------------------------------------------');
                if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): START hotspot mousedown hotspotclickstate=' + hotspotclickstate + ' mousemoved=' + mousemoved);
                //Just set up the vars to show that the hotspot mousedown event occurred
                hotspotclickstate = "MOUSEDOWN"; mouse_x_orig = e.pageX; mouse_y_orig = e.pageY;
                //Map the map's coords to the coords of the original mouse position
                topOffset = mouse_y_orig - map.position().top;
                leftOffset = mouse_x_orig - map.position().left;
                //NOTE: breadcrumbs is the class used to track nested diagrams and to display categories/subsystems
                //that are related to them. Also add a unique class name that represents your interactive to
                //ensure different behavior for each. You need to update the initialize and update nested diagrams
                //methods. This also allows the CurrentSubsystem() method to work for multiple interactive types
                getCurrentSubsystem();
                if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): END hotspot mousedown hotspotclickstate=' + hotspotclickstate + ' mousemoved=' + mousemoved);
                return false;
            });

            //Bind the document mousedown event in case a user clicks on the map outside of a hotspot
            //and moves the mouse pointer to a hotspot and does a mouseup. This should cause our map handling routine
            //to recognize that the map has moved and to not trigger displaying hotspot data.
            $(document).bind("mousedown", function(e) {
                if ($(e.currentTarget).data('default')) return;
                //e.preventDefault(); DO NOT UNCOMMENT. I left this here to let us know it is required for regular browser activity
                if (viewport.is(':hidden')) return; //Only work on visible elements
                if (isDebugOn("all|clicks")) console.log('------------------------------------------------');
                if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): START document mousedown hotspotclickstate=' + hotspotclickstate + ' mousemoved=' + mousemoved);

                //We still set these values so we can track mouse movement to avoid a mouseup event showing data
                hotspotclickstate = "MOUSEDOWN"; mouse_x_orig = e.pageX; mouse_y_orig = e.pageY;

                //Check to make sure initial mouse click occurs within viewport. This ensures that only
                //deliberate clicks within the viewport allow the diagram to move.
                var viewoffset = viewport.offset();
                var viewX = viewoffset.left;
                var viewY = viewoffset.top;
                var viewW = viewport.width();
                var viewH = viewport.height();

                //If mouse click point is within the viewport, and the DBAViews mask
                //is not showing, then proceed as usual
                if ( (e.pageX > viewX ) && (e.pageX < viewX + viewW + 2) &&
                     (e.pageY > viewY ) && (e.pageY < viewY + viewH + 2) &&
                     ($('#mask').length == 0) ) {
                    //Map the map's coords to the coords of the original mouse position
                    topOffset = mouse_y_orig - map.position().top;
                    leftOffset = mouse_x_orig - map.position().left;

                    if (isDebugOn("all|clicks")) {
                        console.log("=======================================");
                        console.log("viewX=" + viewX);
                        console.log("viewY=" + viewY);
                        console.log("viewW=" + viewW);
                        console.log("viewH=" + viewH);
                    }
                } else {
                    if (isDebugOn("all|clicks")) console.log("DOCUMENT mousedown setting OUTSIDEVIEWPORT");
                    hotspotclickstate = "OUTSIDEVIEWPORT";
                }

                if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): END document mousedown hotspotclickstate=' + hotspotclickstate + ' mousemoved=' + mousemoved);               
            });

            //Bind the mouse movement events to the entire document so users can drag beyond the viewport
            //This function manages the actual moving of the map image
            $(document).bind("mousemove mouseenter", function(e) {
                e.preventDefault();
                if (viewport.is(':hidden')) return; //Only work on visible elements
                if (isDebugOn("all|clicks")) console.log('------------------------------------------------');
                if (hotspotclickstate == "MOUSEDOWN" || hotspotclickstate == "OUTSIDEVIEWPORT") {
                    //Determine if this is a click or a move
                    if ( (e.pageX < mouse_x_orig - movethreshold) ||
                        (e.pageX > mouse_x_orig + movethreshold) ||
                        (e.pageY < mouse_y_orig - movethreshold) ||
                        (e.pageY > mouse_y_orig + movethreshold) ) {
                        mousemoved = true;
                        if (hotspotclickstate != "OUTSIDEVIEWPORT")
                            handleMouseMapMove(e.pageX, e.pageY); //Move map
                    }
                }
                if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): document mousemove mouseenter hotspotclickstate=' + hotspotclickstate + ' mousemoved=' + mousemoved + ' X=' + e.pageX + ' Y=' + e.pageY);
                return false;
            });

            //Based on if we are moving the map or clicking a hotspot, do the right thing
            $('.hotspot').live("mouseup", function(e) {
                e.preventDefault();
                //This prevents situations where the mouse drags from somewhere and enters a hotspot. We want to avoid
                //displaying hotspot info if the mouse moved at all. This stops events from non-visible diagrams from
                //changing mouse state.
                if ( (($(this).hasClass('diagram')) || ($(this).hasClass('dba')) || ($(this).hasClass('arch')))
                     && (viewport.is(':hidden')) ) return; //Only work on visible elements
                //This causes the event handler to only work once. Big performance gain
                if(e.handled === true) return false;
                e.handled = true;

                var thisspot = this; //Need to make a variable because 'this' is lost in the code below

                if (isDebugOn("all|clicks")) console.log('------------------------------------------------');
                if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): START hotspot mouseup event handler called id=' + thisspot.id);
                if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): hotspotclickstate=' + hotspotclickstate + ' mousemoved=' + mousemoved);

                hotspotclickstate = "NONE"; //Make sure we know the mouse is not pressed

                //Only display hotspot data or switch diagrams if this is a click (not a map move)
                if (mousemoved == false) {
                    //Either way, toggle the hotspot highlight
                    if (usecaseclicked == false) toggleHotspotHighlight(oldSpot, false); //Turn off highlight for previous hotspot
                    oldSpot = thisspot;
                    toggleHotspotHighlight(thisspot, true); //Turn on highlight for this hotspot

                    //Manage if this is a single click or a double-click
                    clicks++;
                    if (clicks === 1) {
                        if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): if clicks=1 mousemoved=' + mousemoved);
                        timer = setTimeout(function() {
                            if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): setTimeout(hotspot triggered) mousemoved=' + mousemoved);
                            //This code is executed when the timer runs out (i.e. for a single click)
                            clicks = 0;
                            triggerDisplayHotSpot(thisspot);
                        }, DELAY);
                    } else {
                        //This is a double-click!
                        if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): Double-click mousemoved=' + mousemoved);

                        //Display hotspot to set up subsystem stuff. Required to ensure the subsystem is set up properly
                        //and only trigger the switch if the hotspot leads to a nested diagram. If it doesn't, then
                        //we do not clear the timer and let the single click happen instead
                        if (hasNestedDiagram(thisspot.id, false) == true) {
                            clearTimeout(timer); //Ensures single click code does not execute
						    clicks = 0;
                            toggleHotspotHighlight(oldSpot, false); //Turn off highlight for previous hotspot
                            toggleHotspotHighlight(thisspot, false); //Turn off highlight for current hotspot
                            oldSpot = null;
                            $(this).mouseout();
                            hasNestedDiagram(thisspot.id, true); //Sets the subsystem and tab properly
							$('.subsystem').trigger('click'); //Navigate to nested diagram
						}
                    } //clicks != 1
                } //mousemove == false

                if (mousemoved == true) mousemoved = false;

                if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): END hotspot mouseup hotspotclickstate=' + hotspotclickstate + ' mousemoved=' + mousemoved);
                return false;
            });

            //Make sure we unset the mouse so returning to the image doesn't move it
            $(document).bind("mouseup", function(e) {
                if (viewport.is(':hidden')) return; //Only work on visible elements
                if (isDebugOn("all|clicks")) console.log('------------------------------------------------');
                if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): START document mouseup hotspotclickstate=' + hotspotclickstate + ' mousemoved=' + mousemoved);
                hotspotclickstate = "NONE"; //Make sure we know the mouse is not pressed
                if (mousemoved == true) mousemoved = false;
                if (isDebugOn("all|clicks")) console.log('DEBUG(clicks): END document mouseup hotspotclickstate=' + hotspotclickstate + ' mousemoved=' + mousemoved);
                return true;
            });

            $(document).live('dblclick', function(e) {e.preventDefault(); }); //Do not handle regular double-click

            //Is zooming enabled? If so (which is the default), then set up event handlers, etc
            if(settings.zoom) {

                $(document).keydown(function(e){
                    // Pressed UP or DOWN key? -> zoom in or out accordingly
                    if (e.keyCode == 38) { zoom('in'); return false; } else if(e.keyCode == 40) { zoom('out'); return false; }
                });

                if(settings.mousewheel) {
                    function handleZoom(event, delta) {
                        var dir = delta > 0 ? 'in' : 'out';
                        zoom(dir);
                        return false;
                    }
                    map.bind('mousewheel', function(event, delta) {
                        handleZoom(event, delta); return false;
                    });
                    $(document).bind('mousewheel', function(event, delta) {
                        handleZoom(event, delta); return false;
                    });
                }

                //mlindros code:
                //Add handlers for when users click our plus and minus icons
                $('.plus').click(function() { zoom('in'); return false; });
                $('.minus').click(function() { zoom('out'); return false; });

                //Create HTML maps for zoomed levels?
                if(settings.createmaps) createMaps();
            }
        }

        //Function that calculates (scales) the image map hotspots for the zoomed in image
        function createMaps(){
            var htmlmap = viewport.children('map');
            var scale = 1;
            var i = 0;

            if (isDebugOn("all"))  console.log("Mapz createMaps() called!");

            //Loop through zoom levels
            map.children('.level').each(function() {
                i++;

                //If current map level, return. This one should have a map already.
                if($(this).hasClass('current-level')) return;

                //Get scales for map to create
                scale = $(this).width() / map.width();

                //Create new map element
                var newmap = $(document.createElement('map')).attr('name',map.attr('id') + '-map-' + i);

                //Calculate new coords for each area element. noinspection JSCheckFunctionSignatures
                htmlmap.children('area').each(function() {
                    var newArea = $(this).clone();
                    var coords = $(this).attr('coords').split(',');

                    for (var c in coords) {
                        coords[c] = Math.ceil(coords[c] * scale);
                    }

                    newArea.attr('coords',coords).appendTo(newmap);
                });

                // Append new map to viewport and hook to zoom level
                newmap.appendTo(viewport);
                $(this).attr('usemap','#' + map.attr('id') + '-map-' + i);
            });
        }

        //Create a constraint div so map can't be dragged out of view.
        function createConstraint()
        {
            if (isDebugOn("all")) console.log("Mapz createConstraint() called!");
            constraint.css({
                left : -(map.width()) + viewport.width(),
                top : -(map.height()) + viewport.height(),
                width : 2 * map.width() - viewport.width(),
                height : 2 * map.height() - viewport.height()
            });

            // Check if map is currently out of bounds, revert to closest position if so
            if(map.position().left < constraint.position().left) map.css('left',constraint.position().left);
            if(map.position().top < constraint.position().top) map.css('top',constraint.position().top);
        }

        //Perform image zooming and scale hotspots
        function zoom(direction) {
            //mlindros code: NOTE: This function is called by the keyboard handler for each image. This code makes sure
            //that it only affects the image map that is showing. If this map is hidden simply return.
            //This preserves the zoom level of all hidden maps and alters only the showing map.
            //Also, all maps maintain their position and zoom levels as they are only hidden and shown.
            if (viewport.is(':hidden')) return;

            if (isDebugOn("all")) console.log("Mapz zoom() called on non-hidden viewport!");

            var currentlvl = map.find('img.current-level');
            var targetlvl = null;

            //jQuery was limited here after we added the maphilight plug-in because
            //the plug-in wraps the img tag with a div and does class wrapping.
            //This caused the original jQuery code to not work. It turned out that we
            //needed to do a brute force search here ourselves to manage these elements
            //that are not as uniform as jQuery expects. Be careful changing this code.
            var currentIndex = 0;
            var arrayImgs = map.find('img.level').get();
            for (var yy = 0; yy < arrayImgs.length; yy++) {
                if ($(map.find('img.level').get(yy)).hasClass('current-level')) {
                    currentIndex = yy;
                    break;
                }
            }

            //Set direction and check if there is a deeper level to zoom to.
            switch(direction) {
            case 'in':
                if ((currentIndex + 1) == arrayImgs.length) return;
                targetlvl = $((map).find('img.level').get(currentIndex+1));
                break;
            case 'out':
                if (currentIndex == 0) return;
                targetlvl = $((map).find('img.level').get(currentIndex-1));
                break;
            }

            targetlvl.parent('div').show(); //Show target so sizes are available

            //IMPORTANT! These current-level changes must occur here before
            //window calculations based on viewport size take place because we
            //automatically resize the viewport based on the size of the target
            //image and the available screen real estate
            currentlvl.removeClass('current-level');
            currentlvl.parent('div').removeClass('current-level');
            targetlvl.addClass('current-level');
            targetlvl.parent('div').addClass('current-level');
            $(window).trigger('resize');  //<-Causes automatic viewport resize

            //mlindros calcs for scaling and centering zoomed images
            var winWidth = viewport.width();
            var winHeight = viewport.height();
            var currentWidth = currentlvl.width();
            var currentHeight = currentlvl.height();
            var targetWidth = targetlvl.width();
            var targetHeight = targetlvl.height();
            var viewport_offset = viewport.offset();
            var offset = map.offset();
            offset = {
                top: viewport_offset.top - offset.top + winHeight / 2 + 4,
                left: viewport_offset.left - offset.left + winWidth / 2 + 4
            };

            // Relative offsets, relative to the center!
            offset.top = offset.top / currentHeight;
            offset.left = offset.left / currentWidth;
            offset = {
                top: -offset.top * targetHeight + winHeight / 2,
                left: -offset.left * targetWidth + winWidth / 2
            };
            //Set constraints to ensure we don't zoom to a point where the image x or y is > 0
            //This ensures that zooming out doesn't cause the image to display too deep in the viewport
            if (offset.top > 0) offset.top = 0;
            if (offset.left > 0) offset.left = 0;

			//Only highlight if not already highlighted
            if (!targetlvl.hasClass('maphilighted')) {
                targetlvl.maphilight();
            }
            currentlvl.parent('div').hide();  //Hide the maphilight wrapped div so image shows properly

            //Set new zoomed in map position aligning the current and target level maps
            //at the center point displayed in the map view port
            var pos = map.position();
            map.css({
                left : offset.left,
                top : offset.top,
                width : targetlvl.width(),
                height : targetlvl.height()
            });

            // Since we zoomed to another level we need to recreate constraint div and adjust buttons
            createConstraint();
            positionArrows();
        }

        /*
         * mlindros code
         * This function manages highlighting the matching hotspot on a new zoom level. When the user
         * changes the zoom level, this function is called and it finds the same hotspot id (area tag) then scales its
         * coordinates to the size of the new zoom level. Then it finds which hotspot id (because there can be dups)
         * has the coords that match the scaled up coords of the originally selected hotspot.
         */
        function highlightTargetImageHotspot(currentlvl, targetlvl) {
            if (oldSpot == null) return; //nothing to do

            var thisspot = oldSpot;

            //Get current spot's info
            var coords = $(thisspot).attr('coords');
            var spotid = '#' + thisspot.id;

            //Find target map and scale target spot coords
            var targetmap = '#' + $(targetlvl).attr('usemap');
            var scale = $(targetlvl).width() / $(currentlvl).width();
            var targetcoords = coords.split(',');

            for (var c in targetcoords) {
                targetcoords[c] = Math.ceil(targetcoords[c] * scale);
            }

            //First, isolate the zoomed image map to the matching id of the original hotspot, then
            //loop through that finite set to see if any of them matches the scaled coords of the
            //currently selected hotspot. If we have a match, then highlight it on the zoomed level.
            $(targetmap).find(spotid).each(function() {
                if ($(this).attr('coords') == targetcoords) {
                    //We have a match
                    toggleHotspotHighlight($(this), true);
                }
            });
        }

        /**
         * mlindros code
         * This function will set CSS width and height for all styles that use images
         * to keep constraints and visuals in control. By automatically calculating these
         * settings the poster developers do not need to manually alter CSS files for this.
         * Additionally, nested image support requires supporting different image sizes for
         * each diagram but they all use the same CSS classes. This allows us to dynamically
         * adjust CSS to the correct settings for each image based on the image's actual size.
         */ //TODO: FInd a way to consolidate the code for sizing here and in set_mapz_dimensions()
        function init_mapz() {
            var MIN = 300;
            var MAXWIDTH = 5000;
            var MAXHEIGHT = 5000;

            if (isDebugOn("all")) console.log("Mapz init_mapz() called!");

            //See if any already have current-level
            //otherwise set first one
            if (map.find("img.current-level").length === 0) {
              map.find("img.level:first").addClass('current-level');
            }

            //Set map CSS based on current image size obtained from HTML map
            //var currentmap = map.children(".current-level");
			var currentmap = map.find("img.current-level");
            map.css({
                width : currentmap.width(),
                height : currentmap.height()
            });

            //Set viewport CSS to ensure min and max sizes dynamically. Keeping these out of CSS file on purpose
            //Must be same as original image size or less!!! Can't show more than original size.
            viewport.css({"min-width" :MIN});           /* Makes sure that browser resizing doesn't over shrink image */
            viewport.css({"min-height":MIN});           /* Makes sure that browser resizing doesn't over shrink image */
            $('.hotspot-data').css({"min-height":MIN}); /* Must be same as .map-viewport size. Keeps it aligned. */
            if (currentmap.width() < MAXWIDTH) {
                viewport.css({"max-width":currentmap.width()});
            } else {
                viewport.css({"max-width":MAXWIDTH});
            }

            if (currentmap.height() < MAXHEIGHT) {
                viewport.css({"max-height":currentmap.height()});
            } else {
                viewport.css({"max-height":MAXHEIGHT});
                $('.hotspot-data').css({"max-height":MAXHEIGHT}); /* Must be same as .map-viewport size. Keeps it aligned. */
            }

            createConstraint();   //Create constraint for current level.
            initControls();       //Initialize user controls

            //JQuery makes the map div draggable using the calculated constraint
            map.draggable({
                containment : constraint
            });
        }

        function set_mapz_dimensions() {
            var MIN = 300;
            var HSMAXWIDTH = 400;
            var MAXWIDTH = 5000;
            var MAXHEIGHT = 5000;

            if (isDebugOn("all")) console.log("Mapz set_mapz_dimensions() called!");

            getHotspotDataWindow(); //If we don't do this multiple tabs with diagrams get weird
            if (hotspotdata == null) return;
            if ( (!viewport.hasClass('dba')) && (!viewport.hasClass('arch')) ) MAXWIDTH = hotspotdata.position().left - 20;

            //Set map CSS based on current image size obtained from HTML map
            var currentmap = map.find("img.current-level");

            //Set viewport CSS to ensure min and max sizes dynamically. Keeping these out of CSS file on purpose
            //Must be same as original image size or less!!! Can't show more than original size.
            viewport.css({"min-width" :MIN});           /* Makes sure that browser resizing doesn't over shrink image */
            viewport.css({"min-height":MIN});           /* Makes sure that browser resizing doesn't over shrink image */
            $('.hotspot-data').css({"min-height":MIN}); /* Must be same as .map-viewport size. Keeps it aligned. */
            $('.hotspot-data').css({"max-width":HSMAXWIDTH}); /* Must be same as .map-viewport size. Keeps it aligned. */
            if (currentmap.width() < MAXWIDTH) {
                viewport.css({"max-width":currentmap.width()});
            } else {
                viewport.css({"max-width":MAXWIDTH});
            }

            if (currentmap.height() < MAXHEIGHT) {
                viewport.css({"max-height":currentmap.height()});
            } else {
                viewport.css({"max-height":MAXHEIGHT});
                $('.hotspot-data').css({"max-height":MAXHEIGHT}); /* Must be same as .map-viewport size. Keeps it aligned. */
            }
        }

        /**
         * mlindros code
         * Manage the arrows and zoom controls for the poster
         */
        function initControls() {
            if (isDebugOn("all")) console.log("Mapz initControls() called!");
            var up = viewport.find('.arrow-up');
            var down = viewport.find('.arrow-down');
            var left = viewport.find('.arrow-left');
            var right = viewport.find('.arrow-right');

            var agent = navigator.userAgent;
            if ( (agent.match(/iPhone/i)) || (agent.match(/iPad/i)) || (agent.match(/iPod/i)) ) {
                interval = 5; //iOS devices are slower so less pausing is better
                //Set listeners for each arrow.. bind on click or mousedown
                $(up).bind("mousedown", function() { handleMapMove('up'); return false; });
                $(down).bind("mousedown", function() { handleMapMove('down'); return false; });
                $(left).bind("mousedown", function() { handleMapMove('left'); return false; });
                $(right).bind("mousedown", function() { handleMapMove('right'); return false; });
            } else {
                interval = 50; //need to slow PCs down so scroll looks better
                //PC: Set listeners for each arrow.. bind on mouseover
                $(up).bind("mouseover", function() { handleMapMove('up'); return false; });
                $(down).bind("mouseover", function() { handleMapMove('down'); return false; });
                $(left).bind("mouseover", function() { handleMapMove('left'); return false; });
                $(right).bind("mouseover", function() { handleMapMove('right'); return false; });
            }

            //Stop scrolling if mouse is up or leaves arrow
            $('.arrow').bind("mouseout", function() { clearInterval(timeout); return false; });
        }

        /**
         * mlindros code
         * This function is called whenever the browser moves and during initialization to keep
         * all buttons in the proper position. This also occurs when a new image is displayed based on
         * a tab, breadcrumb, or other click.
         */
        function positionArrows() {
            if (viewport.is(':hidden')) return;

            if (isDebugOn("all")) console.log("positionArrows called and element is visible");
            var up = viewport.find('.arrow-up');
            var down = viewport.find('.arrow-down');
            var left = viewport.find('.arrow-left');
            var right = viewport.find('.arrow-right');
            var plus = viewport.find('.plus');
            var minus = viewport.find('.minus');

            // The current zoom level is at its lowest point: Do not show minus button
            if ($(viewport).find("img.level:first").hasClass("current-level")) { minus.hide(); } else {	minus.show(); }

            // The current zoom level is at its highest point: Do not show plus button
            var currentIndex = 0;
            var arrayImgs = map.find('img.level').get();
            for (var yy = 0; yy < arrayImgs.length; yy++) {
                if ($(map.find('img.level').get(yy)).hasClass('current-level')) {
                    currentIndex = yy;
                    break;
                }
            }
            if ((currentIndex + 1) == arrayImgs.length) { plus.hide(); } else {	plus.show(); }

            // The image file x is not larger than the viewport x: Do not show left/right arrow buttons
            if (map.width() <= viewport.width()) { left.hide();	right.hide(); } else { left.show();	right.show(); }

            // The image file y is not larger than the viewport y: Do not show up/down arrow buttons
            if (map.height() <= viewport.height()) { up.hide(); down.hide(); } else { up.show(); down.show(); }
        }

        /**
         * mlindros code
         * This function is called by all of the handlers to move the map. The only difference
         * is that each calls with a different direction. This way we know which way to scroll the map.
         */
        function handleMapMove(direction) {
            var scrollPix = 25;

            //setInterval allows us to respond to the mouse button being held down for scrolling
            timeout = setInterval(function() {
                var newTop = map.position().top; //Get orig x/y in case direction is not set properly
                var newLeft = map.position().left; //Get orig x/y in case direction is not set properly
                switch(direction) {
                    case 'up':
                        newTop += scrollPix;
                        break;
                    case 'down':
                        newTop -= scrollPix;
                        break;
                    case 'left':
                        newLeft += scrollPix;
                        break;
                    case 'right':
                        newLeft -= scrollPix;
                        break;
                }

                //Make sure map is within proper constraints so we don't allow over scrolling
                if (newTop < constraint.position().top) newTop=constraint.position().top;
                if (newLeft < constraint.position().left) newLeft=constraint.position().left;
                if (newLeft > 0) newLeft=0;
                if (newTop > 0) newTop=0;

                //Set map position manually using x.y coords
                map.css({
                    top: newTop+"px",
                    left: newLeft+"px"
                });
            }, interval);
        }

        /**
         * mlindros code
         * This function is called when a user clicks through a hot spot to move the map.
         */
        function handleMouseMapMove(currX, currY) {
            //Calculate current map coords by taking current mouse coords and factoring in the offset
            var newTop = currY - topOffset;
            var newLeft = currX - leftOffset;

            //These little two lines of code prevent a most annoying bug whereby
            //dragging through a hotspot in one image causes the x/y coords of all
            //related nested images to reset to 0,0
            var mapName = subsystem + "-map";
            if (map.attr('id') != mapName.replace("#", "")) {return};

            if (newTop < constraint.position().top) newTop=constraint.position().top;
            if (newLeft < constraint.position().left) newLeft=constraint.position().left;
            if (newLeft > 0) newLeft=0;
            if (newTop > 0) newTop=0;

            //Set map position manually using x.y coords
            map.css({
                top: newTop+"px",
                left: newLeft+"px"
            });
        }

        function triggerDisplayHotSpot(thisspot) {
            if ($(thisspot).hasClass('diagram')) {
                displayHotSpot(thisspot, thisspot.id); //Causes poster.js to display hotspot data
            }

            if ($(thisspot).hasClass('dba')) {
                var type = "dba"
                displayDBAHotSpot(thisspot.id, type, $(thisspot).attr('title')); //Causes poster to display DBA hotspot data
            }

            if ($(thisspot).hasClass('arch')) {
                var type = "arch"
                displayDBAHotSpot(thisspot.id, type, $(thisspot).attr('title')); //Causes poster to display arch hotspot data
            }

            if ($(thisspot).hasClass('dbaperf')) {
                var type = "dbaperf"
                var spot = null;
                writePerfDBAViewFieldData(thisspot.id, type, $(thisspot).attr('title')); //Causes poster to display Perf DBA view fields
                spot = "#" + thisspot.id.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
                $(spot).addClass('current').parent('td').parent('tr').siblings('tr').find('td a.current').removeClass('current');
                $(spot).parent('td').addClass('current').parent('tr').siblings('tr').find('td.current').removeClass('current');
                var rowpos = $(spot).parent('td').parent('tr').position();
                $('.generictbody1').scrollTop(rowpos.top);
            }

            if ($(thisspot).hasClass('bgprocs')) {
                $(thisspot).addClass('current'); //Works for direct click but not search
                writeBackgroundProcess(thisspot.id);
            }

            return false;
        }

        /**
         * This function checks the passed in levels against the current setting of the mapzdebug variable to
         * determine if this particular console log should be written.
         */
        function isDebugOn(levels) {
            //console.log('isDebugOn() returns ' + ((levels.indexOf(mapzdebug) == -1) ? false : true));
            return (levels.indexOf(mapzdebug) == -1) ? false : true;
        }
    }  //End of mapz_control class

    //This is called for every .draggable_map contained in the poster
    $.fn.mapz = function(options) {
        //Create an instance of our internal class and return from the function
        _map = this;
        return new mapz_control(options);
    }
})( jQuery );

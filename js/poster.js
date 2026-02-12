/**
/**
*	Interactive Poster Utilities 1.0
*
*	Mark Lindros, Oracle Corporation
*
*/

/**
 *    Global handler to initialize poster items
 *    Using window.load instead of document.ready because document.ready doesn't allow all images to load
 *    initially before executing all our code. This causes all image calculations and layouts to fail miserably.
 */
$(window).load(function() {
    //Initialize nested image management
    //This must be called before initializing tabs because that function
    //hides some HTML elements. Hidden HTML elements do not respond properly to jQuery script
    init_nested_images();
    init_dbaperfcategories(); //This must be done before init_tabs()
    init_bgprocesses(); //This must be done before init_tabs()
    init_tabs();
    init_home();
    init_dbacategories();
    init_search();
    init_poster_events();

    //Ensure all auto sizing takes place before unveiling poster
	resetCurrentMap();

    //Remove intro mask
    $('#posterintro').fadeOut(300, function() {
        $('#posterintro').remove();
    });
});

function init_poster_events() {
    //Listen for click on links for subsystem breadcrumbs
    $('ul.breadcrumbs a').click(function() {
        $('.subsystem').hide(); //To automatically not show the View Subsystem button when going into the nested diagram
        update_nested_images(this);
        return false;
    });

    /*
     * Handle hotspot hover events outside of maphilight plugin
     * These two functions are used for highlighting hotspots in a special color that indicates
     * it leads to another diagram (even if located on another tab).
     */
    //TBD need to enhance mouseenter and mouseout events for area.hotspot to include special handling for usecases
    $('area.hotspot').mouseenter(function() {
        if ($(this).is(':hidden')) return; //Only work on visible elements
        if (hasNestedDiagram(this.id, false) == true ) {
            var data = $(this).data('maphilight') || {};
            if (data.strokeColor == CLICKED || data.strokeColor == USECASE_CLICKED) return false; //Do nothing if already clicked and is $CLICKED or $USECASE_CLICKED color
            data.alwaysOn = true;
            data.strokeColor = HIGHLIGHTED;
            data.strokeWidth = 5;
            $(this).data('maphilight', data).trigger('alwaysOn.maphilight');
        } else {
            if (usecaseclicked == true) {
                //TBD handle usecase highlighting management here for hovering  doing nothing now which is good
            }
        }
    });

    $('area.hotspot').mouseout(function() {
        if ($(this).is(':hidden')) return; //Only work on visible elements
        var data = $(this).data('maphilight') || {};
        if (data.strokeColor != HIGHLIGHTED) return false; //Do nothing if not already highlighted as $HIGHLIGHT
        data.alwaysOn = false;
        data.strokeColor = NONE;
        data.strokeWidth = 1;
        $(this).data('maphilight', data).trigger('alwaysOn.maphilight');
    });

    //Listen for click on subsystem links in hotspot data and map to breadcrumb
    $('.subsystem').live("click", function() {
        $('.subsystem').hide(); //To automatically not show the View Subsystem button when going into the nested diagram
        //Find matching breadcrumb with same href as subsystem name and pass to nested image update function
        var nestedImage = $(subsystemTab).find($('ul.breadcrumbs a[href="' + subsystem + '"]'));
		if (subsystemTab != currentTab)
			$("ul.tabs a[href='#"+$(subsystemTab).attr("id")+"']").click();
        update_nested_images(nestedImage);
        this.blur();
        return false;
    });
}

/*
 * This function iterates through all tabs, then shows the first image and hides the rest of the siblings,
 * and manages initializing the breadcrumb list for each interactive that uses the Mapz plug-in. Then it
 * initializes all existing hotspot data windows (for right-hand data windows) with the initially displayed
 * instructions for how to use the diagram interactive
 */
function init_nested_images() {
    //Initialize subsystem variable to first .map-viewport element
    subsystem = "#" + $('div.map-viewport:first').attr("id");

    var i = 0;
    //Initialize Mapz plug-in for all draggable images
    $('div.map-viewport').each(function() {
        mapz_maps[i] = new Object();
        mapz_maps[i].name = $(this).attr("id");
        $(this).children('.draggable_map').each(function(){
            mapz_maps[i].mapz_callback = $(this).mapz({ zoom : true, createmaps : true, mousewheel : true });
            i += 1;
        });
    });

    //Initialize image map highlight plug-in
    $('.current-level').maphilight();

    $('.subsystem').hide();
    //Reveal initial Mapz image and hide the rest
    $('div.tab_content').each(function() {
        $(this).find('div.map-viewport:first').show().siblings('div.map-viewport').hide();
        $(this).find('div.movielink:first').show().siblings('div.movielink').hide();
        $(this).find('ul.breadcrumbs').find('a:first').addClass('current');
        //Show all breadcrumbs (categories) for dba based interactives
        if ( ($(this).find('div.map-viewport').hasClass("dba")) ||
            ($(this).find('div.tablecontent').hasClass("dbaperf")) )
            $(this).find('ul.breadcrumbs').children('li').show();
        else //Otherwise only show first breadcrumb
            $(this).find('ul.breadcrumbs').find('li:first').show().siblings('li').hide();
    });

    //Init all initial hotspot data windows with instructions
    //TBD this breaks new stuff 
	//and isn't really right
	//Remove if poster is working
	//$('div.hotspot-data').each(function() {
    //    getCurrentSubsystem();
    //    var pdfFileName = "pdf/" + subsystem.replace("#", "").replace(/-/g, ' ') + ".pdf";
    //    writeHotSpotInstructions($(this));
    //});
}

/*
 * This function manages hotspot highlights when they are clicked.
 * - When a tab or breadcrumb is clicked, the currently highlighted hotspot must be toggled off
 * - When switching to a nested diagram, the currently highlighted hotspot must be toggled off
 * - When a map is zoomed in or out, the matching hotspot must be found and highlighted on that zoom level
 * - When a highlight is toggled off, it must be toggled off on all zoom levels
 */
var lastSpot = null;
function toggleHotspotHighlight(thisspot, toggleOn) {
    var thisid = null;

    //Make sure we don't let any bad params through
    if (thisspot == null && lastSpot == null) return;

    //If a null thisspot is sent in and lastSpot is something, then we are turning all highlights off
    if (thisspot == null) {
        thisspot = lastSpot;
        lastSpot = null;
        toggleOn = false; //Force it regardless of what is passed in
    } else {
        //Check if this is a search and allow thisspot to be an object or a string id
        if (typeof thisspot == "string") {
            thisid = '#' + escapeChars(thisspot);
            thisspot = $(subsystem).find(thisid); //This works for views because there are no dups in a single map
        } else {
            if ($(thisspot).parent('.map-viewport').length == 0) {
                thisid = '#' + escapeChars(thisspot.id);
                thisspot = $(subsystem).find(thisid); //This works for views because there are no dups in a single map
            }
        }
        lastSpot = thisspot;
    }

    var data = $(thisspot).data('maphilight') || {};

    if (toggleOn == true) {
        data.alwaysOn = true;
        data.strokeColor = CLICKED;
        data.strokeWidth = 3;
    }

    if (toggleOn == false) {
        data.alwaysOn = false;
        data.strokeColor = NONE;
        data.strokeWidth = 1;
    }

    $(thisspot).data('maphilight', data).trigger('alwaysOn.maphilight');

    //Highlight any related hotspots in usecase scenarios (all logic handled within)
    highlightUsecaseHotSpots(thisspot, toggleOn); //Works on and off
}


/**
 * Purposely made this a separate function rather than inline so that it can
 * be called either by a click handler, or by other functions directly when needed
 * for more control. This function manages nested image & breadcrumb display and usage.
 * Currently, this function is only called when a breadcrumb (aka category) is clicked,
 * and when drilling down into a subsystem.
 */
function update_nested_images(breadcrumb) {
    //Reworked this function to work with tables as well as images. So the name will now be misleading
    //however, it is the only way to make the breadcrumbs work for each type. May change the name to something
    //more suitable after I get everything working, like update_content or update_targets, update_breadcrumb_content, etc

    // If not current image or category already
    if (!$(breadcrumb).hasClass('current')) {
        //Hide any highlighted hotspots
        toggleHotspotHighlight(null, false);

        //Determine the subsystem of the currently clicked breadcrumb
        subsystem = $(breadcrumb).attr('href');

        if (typeof subsystem !== 'undefined') {
            //DO NOT REMOVE NEXT LINE! THIS MAKES IT WORK... DON'T KNOW WHY!!!
            if (debug == true) console.log('update_nested_images() We have a subsystem! ' + subsystem.toString());
            // Change the current breadcrumb indicator.
            $(breadcrumb).addClass('current').parent('li').siblings('li').find('a.current').removeClass('current');

            //Get tab here so we can check the classes of the breadcrumbs to ensure we behave properly
            getCurrentTab();

            //If decides to either update image or table data
            if ($(currentTab).find('ul.breadcrumbs').hasClass('dbaperfcategories')) {
                //Write views for this category (each view row is a table hotspot for displaying view fields)
                writePerfDBAViewData(subsystem, "dbaperf");
            } else {
                // Show target image map, hide others.
                $($(breadcrumb).attr('href')).show().siblings('div.map-viewport').hide();

                //Swap movielinks
                var movielink = subsystem.replace('#', '') + '-movielink';
                $(currentTab).find('div.movielink a').each(function(){
                   if ($(this).attr("id") == movielink) {
                       $(this).parent('div.movielink').show();
                   } else {
                       $(this).parent('div.movielink').hide();
                   }
                });
            }

            if (debug == true) console.log("update_nested_images() Breadcrumb href=" + $(breadcrumb).attr('href'));

            //Resize maps here because we want it to work for all breadcrumb clicks regardless of type
            resetCurrentMap();
            posterresize();

            //Do not do this breadcrumb handling below if the element also has dbacategories class
            if ($(currentTab).find('ul.breadcrumbs').hasClass('dbacategories')) return false;
            if ($(currentTab).find('ul.breadcrumbs').hasClass('archcategories')) return false;
            if ($(currentTab).find('ul.breadcrumbs').hasClass('dbaperfcategories')) return false;

            //THE CODE BELOW IS SPECIFICALLY FOR HIDING BREADCRUMBS NOT SHOWN ATM
            //Only show top layer through current layer breadcrumbs
            $(breadcrumb).parent('li').show();

            //Loop through current breadcrumb list and hide the ones after the "current" crumb
            var trigger = 0;
            $(currentTab).find('ul.breadcrumbs a').each(function() {
                if (trigger == 1) {
                    $(this).parent('li').hide();
                }
                if ($(this).hasClass('current')) {
                    trigger = 1;
                }
            });

            writeHotSpotInstructions($(hotspotdata));
        }
    }

    // No follow.
    this.blur();
    return false;
}

/*
 * This function tests to see if the current hotspot (clicked or hovered) leads to another diagram.
 * If it leads to another diagram, it returns true, otherwise false.
 * This function can potentially change the global subsystem variable, which is used to control much of the poster.
 * The first variable is the hotspot id (clicked or hovered)
 * The second variable indicates if the function should change the subsystem variable in preparation for
 * switching to another diagram:
 *    -In the event of a single click, this is set to true so that clicking the "View Subsystem"
 *     button can properly switch diagrams (even if it is in another tab).
 *    -In the event of a double-click, this is also set to true so the same event handler can properly
 *     switch diagrams (even if it is in another tab).
 *    -In the event of a mouseenter event (hover), this is set to false because we need the subsystem to stay
 *     the same for hover events.
 *  This function has helped clean up the code because now a double-click no longer requires displaying hotspot
 *  data to set the proper subsystem for diagram switching.
 */
function hasNestedDiagram(id, change) {
    //First, get current interactive name (should be the same as map-viewport id with - for spaces)
    //FYI: getCurrentSubsystem() implicitly calls getCurrentTab() which sets global currentTab
    var saved = subsystem;
    var savedtab = subsystemTab;
    getCurrentSubsystem();
    var nested = false; //Default
    var interactiveName = subsystem.replace(/-/g, " ").replace("#", "");
	var interactive = $.grep(posterData.interactives, function(e){ return e['-name'] == interactiveName; })[0];
    var hotspot = $.grep(interactive.hotspots, function(e){ return e['-name'] == id; })[0];

	/* If there is a subsystem diagram:
	 * - Set var to subsystem name (id) for mapping
	 * - Key off of JSON hotspot attribute: subsystem which we will map to the breadcrumb href
	 * - Not nested if already in that subsystem or if subsystem tab doesn't change
	 */
    subsystem = "#" + $(hotspot).attr("-subsystem").replace(/ /g, "-"); //From JSON data
	getSubsystemTabAndSubsystem();
    var hasNested = $(subsystemTab).find('ul.breadcrumbs a[href="' + subsystem + '"]');
    if (($(hasNested).length > 0) &&
        (!$(hasNested).hasClass('current') || (subsystemTab !== currentTab))) {
        nested = true;
    } else {
        nested = false;
	}

    if (change == false) {
        subsystem = saved;
        subsystemTab = savedtab;
    }

    return nested;
}

/**
 * This function writes the instructions for all hotspot data windows. It is called
 * in different ways in the script so it takes an argument to make sure the proper
 * data window is written to. The first time it is called is in a loop where all hotspot data
 * windows in the poster are initialized. Subsequent times this function is called is whenever
 * a subsystem is viewed or a tab/breadcrumb are clicked.
 */
function writeHotSpotInstructions(hsdatawindow) {
    getCurrentSubsystem();
    var pdfFileName = "pdf/" + subsystem.replace("#", "").replace(/-/g, ' ') + ".pdf";
    var mapid = subsystem + '-map';
    var mapimageid = subsystem + '-image-map';

	//If the current map isn't for an architectural diagram, then bail out
	if (! $(mapimageid).find('area:first').hasClass('diagram')) return;
	
    var instructions = '<div class="instructions">' +
        '  <h2 align="center">INSTRUCTIONS</h2>' +
        '  <p>Use the mouse to drag or arrows to move the image on the left.</p>';

    if ($(mapid).find('img').length > 1) {
        instructions += '  <p>Use the mouse wheel, arrow up and down keys, or  <img src="img/plus.png" class="plusimg"/>' +
                        ' and <img src="img/minus.png" class="minusimg"/> icons to zoom the image in or out.</p>';
    }

    if ($(mapimageid).find('area').length > 0) {
        instructions += '  <p>Click a hotspot on the image to see more details related to that feature.</p>';
    }

    //Print double-click instructions if any hotspots lead to other diagrams (including on other tabs)
    $(mapimageid).find('area').each(function() {
        if (hasNestedDiagram($(this).attr('id'), false)) {
            instructions +=
                '  <p style="color:red">If a hotspot leads to another diagram, then double-click the hotspot to navigate to the diagram.</p>' +
                '</div><p align="center">';
            return false; //Breaks the loop after finding the first nested diagram
        }
    });

    //PDF Link
    instructions += '<div class="pdflink">' +
                    '  <a href="' + pdfFileName + '"><img src="img/pdf.jpg" alt=""/></a>' +
                    '</div><br/><br/>';

    $(hsdatawindow).html(instructions);
}

/**
*    This function will read the JSON source data file and find the
*    hotspot element with the name that matches the id.
*/
function displayHotSpot(thisspot, id){
	//First, get current interactive name (should be the same as map-viewport id with - for spaces)
    //FYI: getCurrentSubsystem() implicitly calls getCurrentTab() which sets global currentTab
    getCurrentSubsystem();
    var interactiveName = subsystem.replace(/-/g, " ").replace("#", "");
    var output = "";
	var interactive = $.grep(posterData.interactives, function(e){ return e['-name'] == interactiveName; })[0];
    var hotspot = $.grep(interactive.hotspots, function(e){ return e['-name'] == id; })[0];

    //Check if there is a nested diagram (even if in another tab)
    if (hasNestedDiagram(id, true) == true) {
		$('.subsystem').show();
    } else {
	    $('.subsystem').hide();
	}

	getHotspotDataWindow(); //Get/Set the correct hotspot window for this tab
	$(hotspotdata).scrollTop(0);
    output = '<h2 class="hotspot-title">' + $(hotspot).attr("-name") + '</h2>';

    //Check to see if this is a usecase related hotspot and if we are in usecase mode
    if (isUsecaseRelatedHotSpot(thisspot) == true && usecaseclicked == true) {
        //Show the usecase description instead of the regular description
        if (hotspot['usecases'] != null) {
            var usecase = $.grep(hotspot.usecases, function(e){ return e['-name'] == currentusecase; })[0];
            output += '<p>' + $(usecase).attr('-desc') + '</p>';
        }
    } else {
        //Show the regular description
        output += '<p>' + $(hotspot).attr("-desc") + '</p>';
    }

    //Show links for either description type
    if (hotspot['doc-refs'] != null) {
        output += '<p><em>See the following links for more information:</em></p>';
        $.each(hotspot['doc-refs'], function (i,e) {
            output += '<p><img src="img/bullet.jpg"/>&nbsp;<a href='
                + e["-url"] + ' target="_blank">' + e["-title"] + '</a></p>';
        });
    }

	$(hotspotdata).html(output);
}


/**
 * This code ensures that the hotspot-data div and map-viewport div are the same height. They
 * can be different because both are based on % of screen size and we use a padding on the hotspot-data
 * div to create a margin for text displayed for hotspots. This code is called when the browser first
 * loads the page, and when the user resizes the browser. Also when the user switches between diagrams.
 */
function adjustHotSpotHeight(){
    /* We must get the current subsystem of the diagram currently showing. We can't use getCurrentSubsystem
     * directly because it changes the global subsystem variable which may currently be set for a particular
     * selected hotspot. This subsystem may not have an image associated with it, or have a different image size
     * associated with it and cause the hotspot size to calculate incorrectly. This wouldn't be important except
     * for cases where the user resizes or maximizes/minimizes the browser after selecting a hotspot.
     * For this reason, we must avoid setting the global variable.
     */
    var sub;
    getCurrentTab();
    $(currentTab).find('ul.breadcrumbs a').each(function() {
        if ($(this).hasClass('current')) { sub = $(this).attr('href'); }
    });

    //Only adjust hotspot and other items if they exist on the current tab
    if (sub) {
        if (debug == true) console.log("AdjustHotSpotHeight() called. Sub=" + sub);
        var curhs = $(currentTab).find('.hotspot-data');
        if (curhs.position() !== null) { //Only adjust if there is a hotspot data window in the first place
            if (debug == true) console.log("AdjustHotSpotHeight(curhs not null)");
            var vp_height = parseInt($(sub).height());
            var pad = parseInt($('.hotspot-data').css("padding-bottom").replace("px", ""));
            var newheight = vp_height - pad;
            $('.hotspot-data').css({"max-height":newheight});
            $('.hotspot-data').height(newheight);

            //Let's also properly calculate the location of the "View Subsystem" button while we're at it
            var x = curhs.position().left;
            var y = curhs.position().top;
            var hswidth = curhs.width();
            var imgwidth = 143; //$('.subsystem img').width();
            $('.subsystem').css({
                top: y - 12 +"px",
                left: x + (hswidth / 2) - (imgwidth / 2) + 15 +"px"
            });
        }
    }
}

/*
 * This is a very important function that iterates through the list of mapz-related objects
 * associated with this poster. We compare the name of our object that holds a function pointer to
 * make a call directly within the mapz jQuery plugin in order to set that one singular map's
 * sizes properly. This is the main way that we avoided using a ton of events.
 */
function resetCurrentMap() {
    //Find currently displayed map and set sizing
    if (debug == true) console.log("resetCurrentMap() called!");
    getCurrentSubsystem();
    if (subsystem == null) return;
    var currsys=subsystem.replace("#", "");
    for (var i = 0; i < mapz_maps.length; i++) {
        if (mapz_maps[i].name == currsys) {
            mapz_maps[i].mapz_callback.mapz_control(currsys);
            //Intentionally do not break out of loop in case there are multiple diagrams with the same name
			//They all must have a chance to set their sizes properly
        }
    }
}


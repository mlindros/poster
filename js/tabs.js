/**
/**
*	Interactive Poster Utilities 1.0
*
*	Mark Lindros, Oracle Corporation
*
*/

/**
 * This function initializes all the tabs rendered by the poster. It should ensure
 * that the first tab is displayed as the current tab, and all other tabs are hidden.
 */
function init_tabs() {
	//Does element exist?
	if (!$('ul.tabs').length) {
		//If not, exit.
		alert("POSTER ERROR: There are no tabs defined. See poster.js: init_tabs()");
		return;
	}

	//If there is only one interactive defined, then don't show tabs
	if ($('ul.tabs').children().length == 1) {
        $('ul.tabs').hide();
    }

    //Reveal initial content area(s).
    $('div.tab_content:first').show().siblings('div.tab_content').hide();
    $('ul.tabs').find('a:first').addClass('current');

    init_tabs_events();
}

function init_tabs_events() {
    //Listen for click on tabs.
    $('ul.tabs a').click(function(e) {
        if(e.handled === true) return false;
        e.handled = true;

        //If not current tab.
        if (!$(this).hasClass('current')) {
            //Hide any highlighted hotspots
            toggleHotspotHighlight(null, false);

            //Change the current indicator.
            $(this).addClass('current').parent('li').siblings('li').find('a.current').removeClass('current');

            //Show target, hide others.
            $($(this).attr('href')).show().siblings('div.tab_content').hide();

            //Set subsystem based on current tab, then id of currently showing image
            //and adjust hotspot height and instructions
            getCurrentSubsystem();
            $('.subsystem').hide(); //Hide view subsystem button because new instructions are displayed
            getHotspotDataWindow();
            writeHotSpotInstructions($(hotspotdata));
            resetCurrentMap();
            posterresize();
        }

        // No follow.
        this.blur();
        return false;
    });
}



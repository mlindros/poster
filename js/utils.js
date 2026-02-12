/**
*	Interactive Poster Utilities 1.0
*
*	Mark Lindros, Oracle Corporation
*
*/

//Global variables for convenience functions
var mapz_maps = [];
var hotspotdata = null;
var subsystem = null;
var currentTab = null;
var debug = false;
var subsystemTab = null;

//Global variables for map highlighting
var HIGHLIGHTED="ff9900";          //orange
var CLICKED="0000cc";              //blue
var USECASE_CLICKED="FF0000";      //red
var USECASE_NOTCLICKED="FFFF99";   //yellow
var NONE="ff0000";
//TBD Figure out USECASE colors and impl


//This function is always called by the main Mapz $(window).resize event handler
//Just put: $(window).trigger('resize'); in the code to call this function
//If user resizes browser window, then adjust hotspot window height
function posterresize() {
    if (debug == true) console.log("posterresize() was called");
    adjustHotSpotHeight();
    resetPerfDBTables();
    resetDBAViewTables();
    resetBGProcsTables();
    return false;
}

$(window).resize(function() {
    resetCurrentMap(); //Reset map first because everything else depends on its settings
    posterresize();
});

function getHotspotDataWindow() {
    $('ul.tabs').find('a').each(function() {
		if ($(this).hasClass('current')) {
			hotspotdata = $($(this).attr('href')).find("div.hotspot-data");
            return hotspotdata;
		}
	});
    return null;
}

function getCurrentTab() {
    $('ul.tabs').find('a').each(function() {
        if ($(this).hasClass('current')) {
            currentTab = $($(this).attr('href'));
        }
    });
}

function getCurrentSubsystem() {
    getCurrentTab();
    $(currentTab).find('ul.breadcrumbs a').each(function() {
        if ($(this).hasClass('current')) { subsystem = $(this).attr('href'); }
    });
}

function escapeChars(inputStr) {
    return inputStr.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g,'\\$1');
}

function getSubsystemTab() {
  var colonIndex = subsystem.indexOf(':');
  if (colonIndex == -1) {
    getCurrentTab();
    subsystemTab = currentTab;
  } else {
    $('ul.tabs').find('a').each(function() {
      if (($(this).text).trim().replace(/ /g, "-") == subsystem.substring(1,colonIndex)) {
        subsystemTab = $($(this).attr('href'));
      }
    });
  }
}

//New for navigating to diagram in another tab
function getSubsystemTabAndSubsystem() {
  var colonIndex = subsystem.indexOf(':');
  if (colonIndex == -1) {
    getCurrentTab();
    subsystemTab = currentTab;
  } else {
    $('ul.tabs').find('a').each(function() {
      if ( $(this).text().trim().replace(/ /g, "-") == subsystem.substring(1,colonIndex) ) {
        subsystemTab = $($(this).attr('href'));
      }
    });
    subsystem = subsystem.charAt(0)+subsystem.substring(colonIndex+1);
  }
}
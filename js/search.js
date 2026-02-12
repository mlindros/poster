/**
*	Interactive Poster DBA Views 1.0
*
*	Mark Lindros, Oracle Corporation
*
*/

/*
 * Initialize the search feature for poster interactives
 */
function init_search() {
    init_search_events();
}

function init_search_events() {
    //Clear search box when focus is lost
    $('#dbasearchform, #archsearchform, #dbaperfsearchform, #bgprocssearchform').focusout(function(e) {
        $('#dbasuggestions').fadeOut(); // Hide the suggestions box
        $('#archsuggestions').fadeOut(); // Hide the suggestions box
        $('#dbaperfsuggestions').fadeOut(); // Hide the suggestions box
        $('#bgprocssuggestions').fadeOut(); // Hide the suggestions box
        $('#dbasearch').val('');
        $('#archsearch').val('');
        $('#dbaperfsearch').val('');
        $('#bgprocssearch').val('');
    });

    //DO NOT DELETE THIS LINE OF CODE
    //This doesn't work, but somehow it allows the code below to work properly
    window.onbeforeunload = function() {
    }

    //This isn't working unless the onbeforeunload() function is used above
    //It stops the browser from refreshing when enter is pressed
    $(document).keydown(function(e) {
        if(e.keyCode == 13) {
            e.preventDefault();
            return false;
        }
    });
}

/*
 * Handle search box input and provide suggestion links for matching views
 */
function lookupSuggestions(e, input) {
    //debug=true;
    var inputString = input.value.replace(/\$/g, '\\$');
    if (debug == true) console.log("inputString=" + inputString);

    if (debug == true) console.log("key=" + e.keyCode);
    //These keys are ignored by our handler so the suggestions box doesn't
    //flash unnecessarily. This does not cause these keys to not function properly.
    switch (e.keyCode) {
        case 13: //Enter
        case 16: //Shift
        case 17: //Control
        case 18: //Alt
        case 20: //Caps Lock
        case 27: //Esc
        case 33: //Page Up
        case 34: //Page Down
        case 37: //Left Arrow
        case 38: //Up Arrow
        case 39: //Right Arrow
        case 40: //Down Arrow
        case 91: //Windows key
        case 192: //`/~
            return false;
    }

    var type = null;
    var suggest = null;
    var search = null;
    var style = null;
    var element = null;
    var suggestlist = "";

    if (input.id == "dbasearch") {
        type = "dba";
        suggest = '#dbasuggestions';
        search = '#dbasearch';
        style = "dba_views";
        element = "views";
    }
    if (input.id == "archsearch") {
        type = "arch";
        suggest = '#archsuggestions';
        search = '#archsearch';
        style = "arch_views";
        element = "views";
    }
    if (input.id == "dbaperfsearch") {
        type = "dbaperf";
        suggest = '#dbaperfsuggestions';
        search = '#dbaperfsearch';
        style = "dbaperf_views";
        element = "perfviews";
    }
    if (input.id == "bgprocssearch") {
        type = "bgprocs";
        suggest = '#bgprocssuggestions';
        search = '#bgprocssearch';
        style = "background_processes";
        element = "processes";
    }
    if (debug == true) console.log("SEARCH input.id = " + input.id + " type=" + type);

    //Set top height so it appears in correct location
    $(suggest).css({
        top: $(search).position().top + $(search).height + 5 + "px"
    });

    if(inputString.length == 0) {
        $(suggest).fadeOut(); // Hide the suggestions box
    } else {
         //BGProcs needs case insensitive, all others use uppercase
        if (type != "bgprocs") inputString = inputString.toUpperCase();

        //Do poster-data.js JSON lookup here and populate display with info. Make them clickable links that popup the info
		var interactive = $.grep(posterData.interactives, function(e){ return e['-style'] == style })[0];

        //Populate suggestions div with matching names. Do fadein here
		//Multiple sets of results may appear in suggestions box if they belong to more than one category
		$(suggest).fadeIn(); //Show the suggestions box
		$($.grep(interactive[element], function(e){ return e['-name'].search(new RegExp(inputString, 'i')) >= 0; })).each(function() {
			// Fill the suggestions box                                                   ^^ case insensitive search here
			suggestlist += '<a href="#" class="' + type + ' hotspot" id="' + $(this).attr("-name") +
                           '" title="' +$(this).attr("-category") + '">' + $(this).attr("-name") + '</a><BR/>@DELIM@';
        });                                             //custom delimiter that won't appear in data by chance ^^

        ///////////////////// S T A R T  H A C K !!!!!!! //////////////////////////////////////////////////////////
        //TBD: mlindros: The below is a hack because we can't figure out how to get .grep or other
        //commands to just simply do this for us because our data is multi dimensional
        var suggestArray = suggestlist.split('@DELIM@'); //Split string into an array so we can ensure unique entries
        suggestArray = $.unique(suggestArray);           //Ensure unique entries
        suggestlist = "";                                //Clear list for repopulation
        //Now we must loop through the array and manually put our string back together
        for (var loop = 0; loop < suggestArray.length; loop++) {
            suggestlist += suggestArray[loop];
        }
        /////////////////////// E N D  H A C K !!!!!!! ////////////////////////////////////////////////////////////

        $(suggest).html(suggestlist);  //Now that we straightened out the uniqueness of each entry, we can display it
		$(suggest).scrollTop(0); //Show from the top

        if ($(suggest).find('a').length <= 0) $(suggest).append('No matches found<br/>'); //If there are no suggestions
        if (debug == true) console.log("suggest length=" + $(suggest).find('a').length);
    }
    return false;
}

function stringToArray(string) {

}

function ArrayToString(array) {

}


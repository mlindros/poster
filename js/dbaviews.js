/**
*	Interactive Poster DBA Views 1.0
*
*	Mark Lindros, Oracle Corporation
*
*/

/*
 * Initialize all JS for the DBA Views Interactive (and Arch views)
 * This function initializes all the categories of dba views rendered by the poster.
 */
function init_dbacategories() {
    // Does element exist?
    if (!$('ul.dbacategories').length) {
        //If not, exit.
        return;
    }

	$('ul.dbacategories').scrollTop(0);
    $('ul.archcategories').scrollTop(0);

    init_dbacategories_events();
}

function init_dbacategories_events() {
    //Link to print ERD PDF diagrams
    $('.acrobat').live('click', function() {
        getCurrentSubsystem();
        window.open('pdf/' + subsystem.replace('#','').replace(/-/g, ' ') + '.pdf');
        return false;
    });

    //When clicking on the button close or the mask layer close the popup
    $('a.close, #mask').live('click', function() {
        $('#mask , #dba-hotspot-data').fadeOut(300, function() {
            $('#mask').remove();
        });
        return false;
    });
}

/*
 * This function is called when a breadcrumb (in DBA view cases, a category) is clicked on a
 * DBA View based interactive hotspot. It then calls the function to get the hotspot's related
 * data from the poster-data.js JSON in-memory variable for display. This is called by the Mapz plug-in.
 */
function displayDBAHotSpot(hsID, type, spotcat) {
    //Make suggestions go away
    $('#dbasearchform').trigger('focusout');
    $('#archsearchform').trigger('focusout');

    var popup = $('#dba-hotspot-data');

    //Fade in the Popup and add close button
    $(popup).fadeIn(300);

    // Add the mask to body
    $('body').append('<div id="mask"></div>');
    $('#mask').fadeIn(300);
    writeDBAViewData(hsID, type, spotcat); // Write JSON data into popup */
    this.blur;
    return false;
}

var dbaviewinteractive = null;
var archviewinteractive = null;

/*
 * This function performs queries against the DBA and Architecture Views interactive data
 * in the poster-data.js data loaded into memory, and displays that information in a popup window. This popup window
 * incorporates the use of an opaque mask that covers the rest of the screen to force focus
 * upon the popup window.
 */
function writeDBAViewData(viewid, type, spotcat) {
    //Write DBA view data fields
    var hstable = $('.dba-hotspot-table');
    $(hstable).scrollTop(0);
    $(hstable).html(''); //Clear the window for new content

    //var style = null;
    var view = null;
    var viewquery = null;
    var category = null;

    if (spotcat != null) {
        //This was a search, so the category is set explicitly
        category = spotcat;
    } else {
        //This was not a search so set correct category based on current subsystem
        category = subsystem.replace("#","");
    }

    //Lazy load and cache initial selector objects
    var interactive = null;
    if (type == "dba") {
        if (dbaviewinteractive == null) {
            interactive = $.grep(posterData.interactives, function(e){ return e['-style'] == 'dba_views'; })[0];
            dbaviewinteractive = interactive;
        } else {
            interactive = dbaviewinteractive;
        }
    }
    if (type == "arch") {
        if (archviewinteractive == null) {
            interactive = $.grep(posterData.interactives, function(e){ return e['-style'] == 'arch_views'; })[0];
            archviewinteractive = interactive;
        } else {
            interactive = archviewinteractive;
        }
    }

    //Get specific view and its category from the interactive
    view = $.grep(interactive.views, function(e){ return e['-name'] == viewid && e['-category'] == category.replace(/-/g, " "); })[0];

    //Quick trick to also switch nested diagrams if a view was clicked and belongs to a different category
    if (subsystem.replace('#','') != category)
        update_nested_images($(currentTab).find($('ul.breadcrumbs a[href="#' + category.replace(/ /g, "-") + '"]')));
    toggleHotspotHighlight(viewid, true); //Turn highlighting on in case this was a search

    //Set title bar
    $('.dbaviewtitleleft').html('<p align="" style="font-size:14pt;"><strong>&nbsp;' + viewid + '</strong></p>');
    $('.dbaviewtitleright').html('<p style="font-size:16pt;"><strong>' + category + '&nbsp;</strong></p>');

    $('.viewwrapper').show();  //Show the table initially
    $('.viewdesc').html('<p>' + $(view).attr('-desc') + '</p>');

    //Display any fields for this hotspot
    if (view.fields != null && view.fields.length > 0) {
        $(hstable).html();
        $(view.fields).each(function() {
            var jRow = $(document.createElement("tr"));
            var rowStr = '    <td class="">' + $(this).attr("-name") + '</td>';
                rowStr += '    <td class="">' + $(this).attr("-null") + '</td>';
                rowStr += '    <td class="">' + $(this).attr("-type") + '</td>';
            jRow.append(rowStr);
            $(hstable).append(jRow);
        });
    }

    //Only show the fields table if the hotspot has field data
    if (view.fields != null && view.fields.length > 0) {
        $(hstable).parent().fixedHeaderTable('show');
        $(hstable).parent().fixedHeaderTable({altClass: 'odd'});
    } else {
        $(hstable).parent().fixedHeaderTable('hide');
    }
}


function resetDBAViewTables() {
    var dbawin = $('.dba-hotspot-table').parent();
    if ($(dbawin).is(':hidden')) return;
    $(dbawin).fixedHeaderTable('destroy');
    $(dbawin).fixedHeaderTable({altClass: 'odd'});
}



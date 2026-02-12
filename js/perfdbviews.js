/**
 *	Interactive Poster Performance DBA Views 1.0
 *
 *	Mark Lindros, Oracle Corporation
 *
 */

function init_dbaperfcategories() {
    // Does element exist?
    if (!$('ul.dbaperfcategories').length) {
        //If not, exit.
        return;
    }

    $('ul.dbaperfcategories').scrollTop(0);

    init_dbaperfcategories_events();

    if (debug == true) console.log('first category text is: ' + $('ul.dbaperfcategories a:first').text());
    //Initialize the window with the first category's processes
    writePerfDBAViewData($('ul.dbaperfcategories a:first').text(), "dbaperf");
}

function init_dbaperfcategories_events() {
    return;
}

var dbainteractive = null;
var dbaperfinteractive = null;

/*
 * This function performs queries against the DBA Performance Views interactive data
 * in the poster-data.js file, and displays that information in a dynamic table.
 * This function displays the category list in the first table.
 */
function writePerfDBAViewData(category, type) {
    //Write DBA view data fields
    $('.generictbody1').scrollTop(0);
    $('.generictbody1').html(''); //Clear the window for new content
    $('.generictbody2').html(''); //Clear the fields window because it is no longer valid

    //The old code showed only one view. This code now takes the category and loops through all
    //matching views and fields to display

    category = category.replace("#", "").replace(/-/g, " ");

    if (debug == true) {
        console.log("DEBUG: category=" + category);
        console.log("DEBUG: type=" + type);
    }

	var interactive = null;
	var views = null;

	//Set jQuery selectors based on the type of data getting displayed (not used but left for future purposes)
	if (type == "dba") {
		if (dbainteractive == null)
            dbainteractive = $.grep(posterData.interactives, function(e){ return e['-style'] == 'dba_views'; })[0];
		interactive = dbainteractive;
		views = $.grep(interactive.views, function(e){ return e['-name'] == viewid; });
	}
	if (type == "dbaperf") {
		if (dbaperfinteractive == null)
            dbaperfinteractive = $.grep(posterData.interactives, function(e){ return e['-style'] == 'dbaperf_views'; })[0];
		interactive = dbaperfinteractive;
		views = $.grep(interactive.perfviews, function(e){ return e['-category'] == category; });
	}
	
	//Set title bar
	$('.tabletitleleft').html('<p align="" style="font-size:14pt;"><strong>&nbsp;' + category + '</strong></p>');
	$('.tabletitleright').html('<p style="font-size:16pt;"><strong>Performance Views&nbsp;</strong></p>');

	//Loop through all views in category and list name / description (Left Table)
	$(views).each(function() {
		var name = $(this).attr('-name');
		var jRow = $(document.createElement("tr"));
		var rowStr = '    <td><a href="#" id="' + name + '" class="dbaperf hotspot">';
			rowStr += '      ' + name + '<br/>';
			rowStr += '      <span>' + $(this).attr('-desc') + '</span>';
			rowStr += '    </a></td>';
		jRow.append(rowStr);
		$('.generictbody1').append(jRow);
	});

    $('.generictable1').fixedHeaderTable({altClass: 'odd'});
}


/*
 * This function performs queries against the DBA Performance Views interactive data
 * in the poster-data.js file, and displays that information in a dynamic table.
 * This function displays the fields list in the second table. This is called as a hotspot
 * click either via the first table of views or via the search suggestions.
 */
 function writePerfDBAViewFieldData(viewid, type, spotcat) {
    //Make suggestions go away
    $('#dbaperfsearchform').trigger('focusout');

    //Write DBA view data fields
    $('.generictbody2').scrollTop(0);
    $('.generictbody2').html(''); //Clear the window for new content

    var style = null;
    var view = null;
    var currentSubsystem = subsystem;
    var category = null;
    var tab = currentTab;
    var interactive = null;

    if (debug == true) console.log("current subsystem is " + subsystem);

    if (spotcat != null) {
        //This was a search, so the category is set explicitly
        category = spotcat;
    } else {
        //This was not a search so set correct category based on current subsystem
        category = subsystem.replace("#","");
    }

	if (type == "dba") {
		interactive = $.grep(posterData.interactives, function(e){ return e['-style'] == 'dba_views'; })[0];
		view = $.grep(interactive.views, function(e){ return e['-name'] == viewid && e['-category'] == category.replace(/-/g, " "); })[0];
    }        
	if (type == "dbaperf") {
		interactive = $.grep(posterData.interactives, function(e){ return e['-style'] == 'dbaperf_views'; })[0];
		view = $.grep(interactive.perfviews, function(e){ return e['-name'] == viewid && e['-category'] == category.replace(/-/g, " "); })[0];
    }        

	 if (debug == true) console.log("Write Searched PerfView: category=" + category + " Subsystem=" + currentSubsystem);

	 //Quick trick to also switch category if a view was clicked and belongs to a different category
	 if (currentSubsystem.replace('#','') != category)
         update_nested_images($(tab).find($('ul.breadcrumbs a[href="#' + category.replace(/ /g, "-") + '"]')));

	 if (view.fields != null && view.fields.length > 0) {
		 $('.generictbody2').html();
		 $(view.fields).each(function() {
			 var jRow = $(document.createElement("tr"));
			 var rowStr = '    <td class="">' + $(this).attr("-name") + '</td>';
				 rowStr += '    <td class="">' + $(this).attr("-null") + '</td>';
				 rowStr += '    <td class="">' + $(this).attr("-type") + '</td>';
			 jRow.append(rowStr);
			 $('.generictbody2').append(jRow);
		 });
	 }

	 $('.generictable2').fixedHeaderTable();
}

function resetPerfDBTables() {
    var gentbl1 = $('.generictable1');
    var gentbl2 = $('.generictable2');
    if ($(gentbl1).is(':hidden')) return;
    $(gentbl1).fixedHeaderTable('destroy');
    $(gentbl2).fixedHeaderTable('destroy');
    $(gentbl1).fixedHeaderTable({altClass: 'odd'});
    $(gentbl2).fixedHeaderTable();
}

/**
*	Interactive Poster Background Processes 1.0
*
*	Mark Lindros, Oracle Corporation
*
*/

/*
 * Initialize all JS for the Background Processes Interactive
 * This function initializes all the categories of bg processes rendered by the poster.
 */
function init_bgprocesses() {
    // Does element exist?
    if (!$('ul.bgcategories').length) {
        //If not, exit.
        return;
    }

    // Listen for click on categories
    $('ul.bgcategories a').click(function() {
        if (!$(this).hasClass('current')) {
            // Change the current indicator.
            $(this).addClass('current').parent('li').siblings('li').find('a.current').removeClass('current');
        }

        writeBackgroundProcesses($(this).text());
        this.blur();
        return false;
    });

    //Initialize the window with the first category's processes
    writeBackgroundProcesses($('ul.bgcategories a:first').text());
    $('ul.bgcategories a:first').addClass('current');
}

var bginteractive = null;

function writeBackgroundProcesses(category) {
    //Write background processes information
    $('.bgwindow').scrollTop(0);
    $('.bgwindow').html(''); //Clear the window for new content

	if (bginteractive == null)
		bginteractive = $.grep(posterData.interactives, function(e){ return e['-style'] == "background_processes"; })[0];
		
	//Set title bar
	$('.bgtitleleft').html('<p align="" style="font-size:14pt;"><strong>&nbsp;' + category + '</strong></p>');
	$('.bgtitleright').html('<p style="font-size:16pt;"><strong>' + $(bginteractive).attr("-name") + ' Background Processes&nbsp;</strong></p>');

	$($.grep(bginteractive.processes, function(e){ return e['-category'] == category; })).each(function() {
		var jRow = $(document.createElement("tr"));
		jRow.append('    <td class="bgacronym">' + $(this).attr("-acronym") + '</td>');
		jRow.append('    <td class="bgname">' + $(this).attr("-name") + '</td>');
		jRow.append('    <td class="bgdesc">' + $(this).attr("-desc") + '</td>');
		jRow.append('    <td class="bgrequired" align="center">' + $(this).attr("-required") + '</td>');
		jRow.append('    <td class="bgstart_by_default" align="center">' + $(this).attr("-start_by_default") + '</td>');
		jRow.append('    <td class="bgnew_this_release" align="center">' + $(this).attr("-new_this_release") + '</td>');
		$('.bgwindow').append(jRow);
	});

	$('.bgwindow').parent().fixedHeaderTable({altClass: 'odd'});
}

function writeBackgroundProcess(pid) {
    //Write background processes information
    $('.bgwindow').scrollTop(0);
    $('.bgwindow').html(''); //Clear the window for new content

    //Make suggestions go away
    $('#bgprocssearchform').trigger('focusout');

    //TBD: mlindros note for improved search: Instead of trying to differentiate between two instances with a
    //      matching id and category, let's just show them all. That is more accurate anyway and easier to implement.
    //      we should also change the search suggestions box so that it only lists the entry a single time so
    //      it is less confusing to people visually and it is more accurate because the single entry returns all
    //      results within a single category. Mind you that this 'uniq' application should be only for matches
    //      that share the same category.
	if (bginteractive == null)
		bginteractive = $.grep(posterData.interactives, function(e){ return e['-style'] == "background_processes"; })[0];
	var process = $.grep(bginteractive.processes, function(e){ return e['-name'] == pid; });

	//Set title bar
	$('.bgtitleleft').html('<p align="" style="font-size:14pt;"><strong>&nbsp;' + $(process).first().attr("-category") + '</strong></p>');
	$('.bgtitleright').html('<p style="font-size:16pt;"><strong>' + $(bginteractive).attr("-name") + ' Background Processes&nbsp;</strong></p>');

    $(process).each(function(){
	var jRow = $(document.createElement("tr"));
        jRow.append('    <td class="bgacronym">' + $(this).attr("-acronym") + '</td>');
        jRow.append('    <td class="bgname">' + $(this).attr("-name") + '</td>');
        jRow.append('    <td class="bgdesc">' + $(this).attr("-desc") + '</td>');
        jRow.append('    <td class="bgrequired" align="center">' + $(this).attr("-required") + '</td>');
        jRow.append('    <td class="bgstart_by_default" align="center">' + $(this).attr("-start_by_default") + '</td>');
        jRow.append('    <td class="bgnew_this_release" align="center">' + $(this).attr("-new_this_release") + '</td>');
        $('.bgwindow').append(jRow);
        $('.bgwindow').parent().fixedHeaderTable({});
    });
   
    //Set the current category for this searched ID
    $('ul.bgcategories a').each(function() {
        if ($(this).text() == category) {
            // Change the current indicator.
            $(this).addClass('current').parent('li').siblings('li').find('a.current').removeClass('current');
        }
    });
}

//re-build the fixedHeaderTable on resize
function resetBGProcsTables() {
    var bgwin = $('.bgwindow').parent();
    if ($(bgwin).is(':hidden')) return;
    $(bgwin).fixedHeaderTable('destroy');
    $(bgwin).fixedHeaderTable({altClass: 'odd'});
}


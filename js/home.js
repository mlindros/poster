/**
*	Interactive Poster Home Tab 1.0
*
*	Mark Lindros, Oracle Corporation
*
*/

/*
 * Initialize all JS for the Home tab
 * This function initializes all the categories of the home tab rendered by the poster.
 */
function init_home() {
    writeIntroBox();
    init_home_events();
}

function init_home_events() {
    //Listen for click on home page red boxes (sort of like tabs but we don't track the current one
    $('ul.homelinks a,ul.homedesc a').click(function() {
        var clicked = $(this).attr('href');
        //Find the matching tab and act just like the tab was clicked by triggering its routine
        //This causes the content to display, and the tabs to function properly
        $('ul.tabs').find('a').each(function() {
            if ($(this).attr('href') == clicked) {
                $(this).trigger('click');
            }
        });
        // No follow.
        this.blur();
        return false;
    });

    //Display credits popup
    $('img.credits').bind("click", function(e) {
        var popup = $('#home-credits');

        //Fade in the Popup and add close button
        $(popup).fadeIn(300);

        //Set the center alignment padding + border
        var popMargTop = ($(popup).height() + 24) / 2;
        var popMargLeft = ($(popup).width() + 24) / 2;

        $(popup).css({
            'margin-top' : -popMargTop,
            'margin-left' : -popMargLeft
        });

        // Add the mask to body
        $('body').append('<div id="light-mask"></div>');
        $('#light-mask').fadeIn(300);

        writeCredits(); // Write JSON data into popup */

        this.blur;
        return false;
    });

    //Display faq in popup
    $('a.credits-faq').bind("click", function(e) {

        writeFAQ(); // Write static about data into popup */

        this.blur;
        return false;
    });

    // When clicking on the button close or the mask layer close the popup
    $('a.credits-close, #light-mask').live('click', function() {
        $('#light-mask, #home-credits').fadeOut(300, function() {
            $('#light-mask').remove();
        });
        return false;
    });
}

//Write intro data from JSON file
function writeIntroBox() {
    var hit = false;
    var info = '<p>This quick reference tool includes:</p>' + '<ul>';
  
	if ($.grep(posterData.interactives, function(e){ return e['-style'] == "dba_views"; }).length > 0) {
		hit = true;
		info += "<li><span>Key DBA and dynamic performance views</span></li>" +
				"<li><span>Entity-relationship diagrams (ERDs) illustrating the referential connections between views</span></li>";
	}

	if ($.grep(posterData.interactives, function(e){ return e['-style'] == "diagram"; }).length > 0) {
		hit = true;
		info += "<li><span>Architecture diagrams with hotspots that allow you to drill down into more details</span></li>";
	}

	if ($.grep(posterData.interactives, function(e){ return e['-style'] == "background_processes"; }).length > 0) {
		hit = true;
		info += "<li><span>Categorized list of background processes, with additional information about each</span></li>";
	}

	$('.box').html(info);
}

//Write credit data from JASON file
function writeCredits() {
    
	var interactive = $.grep(posterData.interactives, function(e){ return e['-style'] == "credits"; })[0];
	var creditData = interactive.credits;
	var credits = '<p class="credit-title">' + creditData.title + '</p>' +
				  '<p class="credit-desc">' + creditData.desc + '</p>' +
				  '<p class="credit-reg">IQR Design and Development:</p>' +
				  '<p class="credit-people">' + creditData.development + '</p>' +
				  '<p class="credit-reg">Infrastructure Design and Development:</p>' +
				  '<p class="credit-people">' + creditData.infrastructure + '</p>' +
				  '<p class="credit-reg">Development Support:</p>' +
				  '<p class="credit-people">' + creditData.devsupport + '</p>' +
				  '<div id="faq">';

	if (creditData.builtons != null && creditData.builtons.length > 0) {
		credits += '<hr/>' +
				  '<p class="credit-reg">This tool was built using the following:</p>';
		$(creditData.builtons).each(function() {
			credits += '<p>' + this.split(";")[0] + '<br/>' +
					   '<a href="' + this.split(";")[1] + '" target="_blank">' + this.split(";")[1] + '</a><br/>' +
					   '' + this.split(";")[2] + '<p/>';
		});
	}

	credits += '<div>';

	$('.credits-content').scrollTop(0);
	$('.credits-content').html(credits);
        
}


//Write FAQ into popup TODO: Need to properly update browser versions
function writeFAQ() {
    var about = '<hr/>' +
                '<p class="credit-title">About Oracle Interactive Quick Reference</p>' +
                '<p/><br/>' +
                '<span style="font-weight: bold">Browser Support:</span>' +
                '<ul>' +
                '  <li>Firefox v22 or later is the recommended browser. Earlier versions may work as well.</li>' +
                '  <li>Internet Explorer 9 or later. Version 8.0 may work.</li>' +
                '  <li>Chrome</li>' +
                '  <li>Safari</li>' +
                '</ul>' +
                '<p/>' +
                '<span style="font-weight: bold">Pervasive Devices:</span>' +
                '<ul>' +
                '  <li>iPad</li>' +
                '  <li>Android 4+</li>' +
                '</ul>' +
                '<p/>' +
                '<span style="font-weight: bold">Mobile Devices:</span>' +
                '<ul>' +
                '  <li>Due to the limited screen size of accessing this tool is not recommended for mobile devices.</li>' +
                '</ul>' +
                '<p/>' +
                '<span style="font-weight: bold; color: #ff0000; text-align: center;">Browser / device support varies from device to device. We welcome your feedback to help us improve this tool.</span>' +
                '<p/>' +
                '<p class="credit-reg">Poster Framework v 1.0</p>';
    $('div#faq').html(about);
    $('.credits-content').animate({ scrollTop: $('.credits-content')[0].scrollHeight }, 2000);
}



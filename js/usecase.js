/**
 *	Interactive Poster Use Case Features
 *
 *	Mark Lindros, Oracle Corporation
 *
 */

//Used to capture when a usecase hotspot is clicked. Cleared when a non-usecase hotspot is clicked and
//doesn't set again until the user clicks the usecase hotspot again.
var usecaseclicked = false;
var currentusecase = '';

function isUsecaseHotSpot(thisspot) {
    //Make sure we don't let any bad params through
    if (thisspot == null) { console.log('isUsecaseHotSpot: thisspot is null'); return; }

    var thisid = $(thisspot).attr('id');
    var usecasespots = $('[data-usecases*="' + thisid + '"]');

    if (usecasespots != null && usecasespots.length <= 0) usecasespots = null;
    return !(usecasespots == null);
}

function isUsecaseRelatedHotSpot(thisspot) {
    //Make sure we don't let any bad params through
    if (thisspot == null) { console.log('isUsecaseRelatedHotSpot: thisspot is null'); return; }

    var relatedattr = $(thisspot).attr('data-usecases');      //TBD might have to do $(thisspot).id

    return !(relatedattr == null);
}

function getUsecaseHotSpots(thisspot) {
    //Make sure we don't let any bad params through
    if (thisspot == null) { console.log('getUsecaseHotSpots: thisspot is null'); return; }

    var thisid = $(thisspot).attr('id');
    var usecasespots = $('[data-usecases*="' + thisid + '"]');

    //Check that the currently passed in hotspot is a usecase hotspot
    if (usecasespots != null && usecasespots.length > 0) {
        currentusecase = thisid;
        return usecasespots;
    } else {
        return null;
    }
}

function highlightUsecaseHotSpots(thisspot, toggleOn) {
    //Make sure we don't let any bad params through
    if (thisspot == null) { console.log('highlightUsecaseHotSpots: thisspot is null'); return; }

    //Get any associated hotspots for the usecase
    var usecasespots = getUsecaseHotSpots(thisspot);

    if (usecaseclicked == true) { usecasespots = $('[data-usecases*="' + currentusecase + '"]'); }

    //If usecase spots is not null, it means:
    //-The current thisspot is the usecase button, we highlight it normally (done by calling function),
    // we highlight all related usecase buttons, we set usecase mode to true, and that's it
    if (usecasespots != null) {
        if (toggleOn == true) {
            usecaseclicked = true;

            //Highlight those spots (if any)
            usecasespots.each(function(){
                var data = $(this).data('maphilight') || {};
                data.alwaysOn = true;
                data.strokeColor = USECASE_NOTCLICKED;
                data.strokeWidth = 5;
                $(this).data('maphilight', data).trigger('alwaysOn.maphilight');
            });
        }
    }

    //If it is null, then all that means is that the currently clicked button is not the usecase button. Now
    //we have to check to see if it was one of the related hotspot buttons and also make sure usecase mode is true. If
    //it is true and a related button, then we hightlight it special (red) and hopefully our usecase mode of true can
    //help us display the correct message in the window.

    //If this is a special usecase-related hotspot and we are in usecase mode, then highlight it special
    if (isUsecaseRelatedHotSpot(thisspot) == true && usecaseclicked == true) {
        var data = $(thisspot).data('maphilight') || {};
        data.alwaysOn = true;
        data.strokeColor = USECASE_CLICKED;
        data.strokeWidth = 5;
        $(thisspot).data('maphilight', data).trigger('alwaysOn.maphilight');
    }

    //Shut it all down if hotspot has nothing to do with usecases and we are in usecase mode
    if (isUsecaseHotSpot(thisspot) == false && isUsecaseRelatedHotSpot(thisspot) == false && usecaseclicked == true) {
        usecaseclicked = false;
        currentusecase = '';
        $(subsystem + ' area').each(function(){
            var data = $(this).data('maphilight') || {};
            data.alwaysOn = false;
            data.strokeColor = NONE;
            data.strokeWidth = 1;
            $(this).data('maphilight', data).trigger('alwaysOn.maphilight');
        });
        //The above removed all highlighting so we should ensure the recently clicked hotspot is highlighted as clicked
        var data = $(thisspot).data('maphilight') || {};
            data.alwaysOn = true;
            data.strokeColor = CLICKED;
            data.strokeWidth = 3;
        $(thisspot).data('maphilight', data).trigger('alwaysOn.maphilight');
    }
}
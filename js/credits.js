/**
*	Interactive Poster Credits Data
*
*	Mark Lindros, Oracle Corporation
*
*/


//There is no variable for the Development field because that is always going to be a per-poster field


/* This variable is used to define all of the people who have developed something in the poster framework.
 * Whether they leave Oracle or move to another department, if they developed something they get the credit and
 * it stays in here.
 */
var infrastructure_dev_team = [
    'Mark Lindros', 'Al Saganich', 'Glenn Stokol', 'Mike Williams', 'Iris Li', 'Vijaya Karothi',
    'Lachlan Williams', 'Diganta Choudhury'
];

/* This variable is used to define all the people who supported the development of all posters in one way or another.
 * One-off people that fit into this category should be entered in the spreadsheet in the Credits worksheet in the
 * field entitled Development Support.
 */
var development_support_team = [
   'Jenny Tsai-Smith', 'Valli Patabala', 'Rebecca Sly', 'Linda Ross', 'Al Loper'
];


var built_on_products = [
    {'product':'<span style="color:#A31919">Mapz jQuery Plug-in</span> by Dannu van Kooten',
     'url':'http://dannyvankooten.com/jquery-plugins/mapz',
     'desc':'We used Danny\'s base open source offering, then extended it to serve our purposes.'},
    {'product':'<span style="color:#A31919">Maphilight jQuery Plug-in</span> by David Lynch',
     'url':'http://davidlynch.org/projects/maphilight/docs',
     'desc':'We used David\'s base open source offering, then set some options to make it work with our poster. This plug-in initially made the Mapz plug-in stop working properly, especially when trying to zoom in on images, but some creative coding got around those issues.'},
    {'product':'<span style="color:#A31919">Mousewheel jQuery Plug-in</span> by Brandon Aaron',
     'url':'http://brandonaaron.net/code/mousewheel/docs',
     'desc':'The Mapz plug-in uses Brandon\'s open source mousewheel plug-in to allow users to use the mouse to zoom in and out of images.'},
    {'product':'<span style="color:#A31919">Touch-Punch jQuery Plug-in</span> by David Furfero',
     'url':'http://touchpunch.furf.com',
     'desc':'We used David\'s open source plug-in to map touch events of certain devices, such as iPads and iPhones, to regular mouse events that are handled by our code. This allows us to support touch devices.'},
    {'product':'<span style="color:#A31919">.FixedHeaderTable() jquery Plug-in</span> by Mark Malek',
     'url':'http://fixedheadertable.com',
     'desc':'We used Mark\'s open source plug-in to format all of our tables in a consistent and polished way. '}
    /*,
    {'product':'',
     'url':'',
     'desc':''},
    {'product':'',
     'url':'',
     'desc':''}*/
];



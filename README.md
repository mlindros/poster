# Oracle 12c Interactive Poster - Logic Sample

**[Live Demo: View the Interactive Poster Online](https://www.oracle.com/webfolder/technetwork/tutorials/obe/db/12c/r1/poster/output_poster/poster.html)**

### Overview

This repository contains the core JavaScript, jQuery, and CSS for the Oracle Database 12c Interactive Poster.

### Technical Context

Developed in 2012-2013, this project demonstrates high-density data visualization and complex state management using **Vanilla JavaScript and jQuery**.

### Architectural Decisions

At the time of development, early frameworks (like AngularJS) were evaluated but bypassed in favor of a custom-built, lightweight architecture. This decision was made to ensure:

- Precise DOM control for hundreds of interactive elements
- Maximum performance and low memory footprint in the browser
- Seamless state transitions without framework-induced latency

### File Descriptions

Some of these files are plug-ins or other code I leveraged. I did not author them, although I did fix or modify them to work for my needs.

## CSS

- advisor.css: Styles for advisor and decision tree logic
- bgprocesses.css: Styles for background processes tab
- breadcrumbs.css: Styles for managing breadcrumbs
- dbaviews.css: Styles for DBA views tab
- fhtTheme.css: Not mine. Styles used for fixedHeaderTable plug-in
- home.css:Styles for the home tab
- perfdbviews.css: Styles for performance views tab
- poster.css: Global layout for the entire poster
- search.css: Styles for search feature and suggestions box
- tabs.css: Styles for shaping and managing tabs

## JavaScript / jQuery

- bgprocesses.js: JS/jQuery for managing background processes tab events and displaying data
- credits.js: Formats popup screen for crediting people who worked on this poster
- dbaviews.js: JS/jQuery for managing DBA views tab events and displaying data
- home.js: JS/jQuery for managing home tab events and displaying data
- jquery.1.6.1.min.js: Not mine. jQuery library
- jquery.fixedheadertable.min.js: Not mine. Fixed Header Table jQuery plug-in to keep table header in place during scrolling
- jquery.maphilight.js: Not mine. MapHilight jQuery plug-in used to highlight interactive elements
- jquery.mapz.js: Not mine. Mapz jQuery plug-in for mapping hotspots in an image for user interaction
- jquery.mousewheel.min.js: Not mine. Mousewheel jQuery plug-in for using mouse to zoom in and out of images
- jquery.ui.touch-punch.js: Not mine. Touch-Punch jQuery plug-in used for adding touch event handling for touch screens
- jqueryui.1.8.13.min.js: Not mine. jQuery UI library
- perfdbviews.js: JS/jQuery for managing performance views tab events and displaying data
- poster.js: Heart of the code. Loads everything, sets up all event handling, and manages responsive layout scaling
- search.js: Logic for the real-time search engine, suggestion filtering, and keyboard event handling
- tabs.js: Controller for module switching that manages tab visibility and content synchronization
- usecase.js: Manages complex state for scenario-based highlighting and "use case" relationship mapping
- utils.js:Shared utility library for global variables, coordinate calculations, and map highlighting constants

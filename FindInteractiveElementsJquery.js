

 //Add all parsers
 parsers = [];


//jQuery 1.5,1.6
parsers.push( function () {
	var version = jQuery.fn.jquery.substr(0,3)*1;

	if ( !jQuery || version < 1.5 || version >= 1.7 ) {
		return [];
	}

	var elements = [];
	for ( j in jQuery.cache ) {
		jQueryGeneric( elements, jQuery.cache[j] );
	}

	return elements;
} );

// jQuery 1.4, 1.7
parsers.push( function () {
	var version = jQuery.fn.jquery.substr(0,3)*1;

	if ( !jQuery || version < 1.4 ) {
		return [];
	}

	var elements = [];
	jQueryGeneric( elements, jQuery.cache );

	return elements;
} );



function jQueryGeneric (elements, cache)
{
	for ( i in cache ) {
		if ( typeof cache[i].events == 'object' ) {
			var eventAttachedNode = cache[i].handle.elem;
			var func;

			for ( type in cache[i].events ) {
				/* Ignore live event object - live events are listed as normal events as well */
				if ( type == 'live' ) {
					continue;
				}

				var oEvents = cache[i].events[type];

				for ( j in oEvents ) {
					var aNodes = [];
					var sjQuery = "jQuery "+jQuery.fn.jquery;

					if ( typeof oEvents[j].selector != 'undefined' && oEvents[j].selector !== null ) {
						aNodes = $(oEvents[j].selector, cache[i].handle.elem);
						sjQuery += " (live event)";
					}
					else {
						aNodes.push( eventAttachedNode );
					}

					for ( var k=0, kLen=aNodes.length ; k<kLen ; k++ ) {
						elements.push( {
							"node": aNodes[k],
							"listeners": []
						} );

						if ( typeof oEvents[j].origHandler != 'undefined' ) {
							func = oEvents[j].origHandler.toString();
						}
						else if ( typeof oEvents[j].handler != 'undefined' ) {
							func = oEvents[j].handler.toString();
						}
						else {
							func = oEvents[j].toString();
						}

						/* We use jQuery for the Visual Event events... don't really want to display them */
						if ( oEvents[j] && oEvents[j].namespace != "VisualEvent" && func != "0" )
						{
							elements[ elements.length-1 ].listeners.push( {
								"type": type,
								"func": func,
								"removed": false,
								"source": sjQuery
							} );
						}
					}

					// Remove elements that didn't have any listeners (i.e. might be a Visual Event node)
					if ( elements[ elements.length-1 ].listeners.length === 0 ) {
						elements.splice( elements.length-1, 1 );
					}
				}
			}
		}
	}
};



// jQuery 1.3
parsers.push( function () {
	if ( !jQuery || jQuery.fn.jquery.substr(0,3)*1 > 1.3 ) {
		return [];
	}

	var elements = [];
	var cache = jQuery.cache;

	for ( i in cache ) {
		if ( typeof cache[i].events == 'object' ) {
			var nEventNode = cache[i].handle.elem;

			elements.push( {
				"node": nEventNode,
				"listeners": []
			} );

			for ( type in cache[i].events )
			{
				var oEvent = cache[i].events[type];
				var iFunctionIndex;
				for (iFunctionIndex in oEvent) break;

				/* We use jQuery for the Visual Event events... don't really want to display them */
				var func = oEvent[ iFunctionIndex ].toString();
				if ( !func.match(/VisualEvent/) && !func.match(/EventLoader/) )
				{
					elements[ elements.length-1 ].listeners.push( {
						"type": type,
						"func": func,
						"removed": false,
						"source": 'jQuery'
					} );
				}
			}
		}
	}

	return elements;
} );


// jQuery 1.3 live events
parsers.push( function () {
	if ( !jQuery || jQuery.fn.live != 'undefined' || 
		typeof jQuery.data == 'undefined' ||
		typeof jQuery.data(document, "events") == 'undefined' ||
		typeof jQuery.data(document, "events").live == 'undefined' )
	{
		return [];
	}

	var elements = [];
	var cache = jQuery.cache;

	jQuery.each( jQuery.data(document, "events").live || [], function(i, fn) {
		var event = fn.type.split('.');
		event = event[0];
		var selector = fn.data;

		$(selector).each( function(i) {
			elements.push( {
				node: this,
				listeners: [],
			} );

			elements[elements.length - 1].listeners.push({
				type: event,
				func: 'Unable to obtain function from live() bound event.',
				removed: false,
				source: "jQuery 1.3 live"
			} )
		} );
	} );

	return elements;
} );

var i, iLen;
var elements=[], libraryListeners;

/* Gather the events from the supported libraries */
console.log("Number of parsers = " + parsers.length);
for ( i=0, iLen=parsers.length ; i<iLen ; i++ ) {
	// Given the millions of environments that the parsers will run in, it is quite possible one
	// will hit an error - if it does, just ignore it and pass on.
	try {
		libraryListeners = parsers[i]();
		elements = elements.concat( libraryListeners );
	} catch (e) {}
}
console.log("Number of elements = " + elements.length);
for ( j=0 ; j<elements.length ; j++ ) {
	jQuery(elements[j].node).attr("isInteractive","true");
	//elements[j].node.setAttribute("isInteractive","true");
}
try{
	jQuery("*:visible").attr("isVisible","true");
	}catch(e){}
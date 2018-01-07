

 //Add all parsers
 parsers = [];

//Extjs parser

parsers.push( function () {
	if ( typeof Ext == "undefined" || Ext.versions.core.version.indexOf('4.0') !== 0 ) return [];

	var elements = [];

	for ( var j in Ext.cache ) {
		var cache = Ext.cache[j];
		if ( typeof cache.events == 'object' ) {

			var events = cache.events;
			if ( !$.isEmptyObject( events ) ) {

				var listeners = [];

				for ( var event in events ) {
					// there is an array of handlers for each event
					if (events[event].length > 0) {
						for (var k=0; k<events[event].length; ++k) {
							listeners.push( {
								"type": event,
								"func": events[event][k].fn.toString(),
								"removed": false,
								"source": 'ExtJS '+Ext.versions.core.version
							} );
						}
					}
				}

				if (listeners.length > 0) {
					elements.push( {
						"node": cache.el.dom,
						"listeners": listeners
					} );
				}
			}
		}
	}
	
	return elements;
} );

//Glow parser
parsers.push( function () {
	if ( typeof glow == 'undefined' || typeof glow.events.listenersByObjId == 'undefined' ) {
		return [];
	}

	var listeners = glow.events.listenersByObjId;
	var globalGlow = "__eventId"+glow.UID;
	var elements = [];
	var all = document.getElementsByTagName('*');
	var i, iLen, j, jLen;
	var eventIndex, eventType, typeEvents;

	for ( i=0, iLen=all.length ; i<iLen ; i++ ) {
		/* If the element has a "__eventId"+glow.UID parameter, then it has glow events */
		if ( typeof all[i][globalGlow] != 'undefined' ) {
			eventIndex = all[i][globalGlow];

			elements.push( {
				"node": all[i],
				"listeners": []
			} );

			for ( eventType in listeners[eventIndex] ) {
				typeEvents = listeners[eventIndex][eventType];

				/* There is a sub array for each event type in Glow, so we loop over that */
				for ( j=0, jLen=typeEvents.length ; j<jLen ; j++ ) {
					elements[ elements.length-1 ].listeners.push( {
						"type": eventType,
						"func": typeEvents[j][2].toString(),
						"removed": false,
						"source": "Glow"
					} );
				}
			}
		}
	}

	return elements;
} );


//jsBase
parsers.push( function () {
	if ( typeof jsBase == 'undefined' ) {
		return [];
	}

	var elements = [];
	var a = jsBase.aEventCache;
	var i, iLen;

	for ( i=0, iLen=a.length ; i<iLen ; i++ )
	{
		elements.push( {
			"node": a[i].nElement,
			"listeners": [ {
				"type": a[i].type,
				"func": a[i].fn.toString(),
				"removed": false,
				"source": 'jsBase'
			} ]
		} );
	}

	return elements;
} );

//mooTools
parsers.push( function () {
	if ( typeof MooTools == 'undefined' ) {
		return [];
	}

	var elements = [];
	var all = document.getElementsByTagName('*');
	var i, iLen;
	var events, mooEvent;

	for ( i=0, iLen=all.length ; i<iLen ; i++ ) {
		events = all[i].retrieve('events', {});

		if ( !$.isEmptyObject( events ) ) {
			elements.push( {
				"node": all[i],
				"listeners": []
			} );

			for ( mooEvent in events ) {
				elements[ elements.length-1 ].listeners.push( {
					"type": mooEvent,
					"func": events[mooEvent].keys.toString(),
					"removed": false,
					"source": 'MooTools'
				} );
			}
		}
	}

	return elements;
} );


//prototype
parsers.push( function () {
	if ( typeof Prototype == 'undefined' ) {
		return [];
	}

	var elements = [];
	var all = document.getElementsByTagName('*');
	var i, iLen;
	var eventType;

	for ( i=0, iLen=all.length ; i<iLen ; i++ ) {
		if ( typeof all[i]._prototypeEventID != 'undefined' ) {
			elements.push( {
				"node": all[i],
				"listeners": []
			} );

			for ( eventType in Event.cache[ all[i]._prototypeEventID ] ) {
				elements[ elements.length-1 ].listeners.push( {
					"type": eventType,
					"func": Event.cache[ all[i]._prototypeEventID ][eventType][0].handler.toString(),
					"removed": false,
					"source": 'Prototype'
				} );
			}
		}
	}

	return elements;
} );

//yui2
parsers.push( function () {
	if ( typeof YAHOO == 'undefined' || typeof YAHOO.util == 'undefined' ||
	 	typeof YAHOO.util.Event == 'undefined' )
	{
		return [];
	}

	/*
	 * Since the YUI cache is a private variable - we need to use the getListeners function on
	 * all nodes in the document
	 */
	var all = document.getElementsByTagName('*');
	var i, iLen, j, jLen;
	var elements = [], events;

	for ( i=0, iLen=all.length ; i<iLen ; i++ )
	{
		events = YAHOO.util.Event.getListeners( all[i] );
		if ( events != null && events.length != 0 )
		{
			elements.push( {
				"node": events[0].scope,
				"listeners": []
			} );

			for ( j=0, jLen=events.length ; j<jLen ; j++ )
			{
				elements[ elements.length-1 ].listeners.push( {
					"type": events[j].type,
					"func": events[j].fn.toString(),
					"removed": false,
					"source": 'YUI 2'
				} );
			}
		}
	}

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
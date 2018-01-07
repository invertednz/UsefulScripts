

 //Add all parsers
 parsers = [];
 
 //Dom parser
 parsers.push( function () {
	var
		elements = [], n,
		all = document.getElementsByTagName('*'),
		types = [ 'click', 'dblclick', 'mousedown', 'mousemove', 'mouseout', 'mouseover', 
			'mouseup', 'change', 'focus', 'blur', 'scroll', 'select', 'submit', 'keydown', 'keypress', 
			'keyup', 'load', 'unload' ],
		i, iLen, j, jLen = types.length;
	for ( i=0, iLen=all.length ; i<iLen ; i++ ) {
		for ( j=0 ; j<jLen ; j++ ) {
			if ( typeof all[i]['on'+types[j]] == 'function' ) {
				elements.push( {
					"node": all[i],
					"listeners": [ {
						"type": types[j],
						"func": all[i]['on'+types[j]].toString(),
						"removed": false,
						"source": 'DOM 0 event'
					} ]
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
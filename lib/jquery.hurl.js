/*!
 * hURL (hash URL) v1.2
 * by Makis Tracend (makis@makesit.es)
 *
 * Parses the hash URL and attaches an object to the body tag
 * with its properties for easy retrieval/update
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * 
 * TIPS:
 * 
 * Initiate hURL just by adding 
 * $.hurl();
 * 
 * Update the hash URL with data queries, ex.
 * $.hurl("update", {"id": 15765});
 * 
 * Get the latest link by requesting 
 * $("body").data("hurl").link
 * 
 * Update your page when the hash gets updated by using monitor:true 
 * and setting up an event listener, like this: 
 * $("body").bind('hurl', function(event) {
 *   // do something...
 * });
 * 
 */
 
(function( $ ){
		  
	$.hurl = function( method, options ){
		$('body').hurl( method, options );
	};
	
  //var hash = location.hash;
  
  var methods = {
     init : function( options ) {
    	
		var settings = {
		  'delimiter' 		: "/", 
		  'initiator' 		: "!", 
		  'pair' 			: true, 
		  'monitor' 		: false, 
		  'meta' 			: false, 
		  'meta-content' 	: { 
								'url': document.location.href, 
								'title' : document.title
							} 
		};
		
		return this.each(function() {

		var $this = $(this),
			data = $this.data('hurl');
			
			// stop all operations if location.hash is not available in the browser
			if( typeof location.hash != "undefined" ){
				
				// merging custom options with default settings
				if ( options ) { 
					$.extend( settings, options );
				}
				// save settings
				$this.data('hurl', {settings: settings, link: {}, meta: {}});
				
				// parse hash uri
				$this.hurl("parse");
				
				if( settings.monitor ){ 
					// start monitoring the hash events
					$this.hurl("monitor");
				}
				
				if( settings.meta ){ 
					$("body").bind('hurl', function(event) {
						$this.hurl("meta");
					});
				}
				
			} else {
				return false;
			}
			
    	});
	
	},
	
	// pase the URL on page load
	parse : function( options ) { 
		return this.each(function(){

		var $this = $(this), 
			data = $this.data('hurl'), 
			settings = data.settings;
			
			var link = {};
			var hash = location.hash;
			
			// see if there is an initiator (default: !)
			if( hash.indexOf(settings.initiator) ){ 
				// get the pure URI
				var uri = hash.substr( hash.indexOf(settings.initiator)+1 );
				var uri_parts = uri.split(settings.delimiter);
			} 
			
			// FIX -- Remove first element if blank
			if(uri_parts[0]=="") { uri_parts.shift() }
			
			// parse in key-value pairs
			if( settings.pair ){
				for(i in uri_parts){ 
					//link[i] = uri_parts[i];
					// odd numbers are keys, values are even numbers
					if( i%2 ){ 
						// register the value to the previous key
						link[uri_parts[i-1]] = uri_parts[i];
					} else {
						// register the key
						link[uri_parts[i]] = 1;
					}
				}
			} else {
				for(i in uri_parts){ 
					link[i] = uri_parts[i];
				}
			}
			
			// merge with the existing link object
			$.extend(data.link, link);
			
			// save url for future reference
			$this.data('hurl', data);
			
			
		});
	},
	
	monitor : function( options ) { 
		return this.each(function(){

		var $this = $(this), 
			data = $this.data('hurl');
			
			// save the current link
			var url = methods.create( $this );
			
			// get the new link
			if ( url != location.hash ) { 
				$this.hurl("parse");
				// trigger the update for all scripts listening
				$this.trigger("hurl", "auto");
			}
			
			// use settimeout for now...
			setTimeout( function(){ $this.hurl("monitor") }, 500);

		});
	},
	
	request : function( link, meta ) { 
		return this.each(function(){

		var $this = $(this),
			data = $this.data('hurl');
			
			if ( link ) { 
				data.link = link;
			}
			
			if ( meta ) { 
				$.extend( data.meta, meta );
			}
			
			// save data
			$this.data('hurl', data);
			
			// further actions
			if ( link ) { 
				
				// register click
				$this.hurl("register");
				
				// trigger the update for all scripts listening
				$this.trigger("hurl", "request");
			}
				
		});
	},
	
	update : function( link, meta ) { 
		return this.each(function(){

		var $this = $(this),
			data = $this.data('hurl');
			
			if ( link ) { 
				$.extend( data.link, link );
			}
			
			if ( meta ) { 
				$.extend( data.meta, meta );
			}
			
			// save data
			$this.data('hurl', data);
			
			// further actions
			if ( link ) { 
				
				// register click
				$this.hurl("register");
				
				// trigger the update for all scripts listening
				$this.trigger("hurl", "update");
			}
			
		});
	},
	
	register : function( ) { 
		return this.each(function(){

		var $this = $(this), 
			data = $this.data('hurl');
			
			// stingify link
			var url = methods.create( $this );
			// register the click in the browser's history
			$a = $('<a><!-- --></a>').attr("href", url).css({
				position:'absolute',
				top: $(window).scrollTop(),
				left: $(window).scrollLeft()
			});
			$('body').prepend($a);
			location = url;
			$a.remove();
						
		});
	},
	
	meta : function( ) { 
		return this.each(function(){

		var $this = $(this),
             data = $this.data('hurl'),
			 meta = data.settings['meta-content'];
			
			$("meta[property='og:title']").attr("content", document.title);
			$("meta[property='og:url']").attr("content", document.location.href);
			if( typeof meta.description != "undefined" ){ 
				// in sequence: get the text from the element, remove whitespace and concatenate the to the first 200 chars
				var description = $(meta.description).text().replace(/$\s|\s^/, "").replace(/\s{2,}/, " ").substr(0,200);
				// FIX - don't update if we come with an empty string
				if(description != ""){
					$("meta[property='og:description']").attr("content", description + "...");
					$("meta[name='description']").attr("content", description + "...");
				}
			} 
		});
	},
	
	destroy : function( ) { 
		return this.each(function(){

		var $this = $(this),
             data = $this.data('hurl');
			// unbind the mouse scroll
			// * condition? 
			data.hurl.remove();
         	$this.removeData('hurl');

		});
	},
	// helper functions
	create : function( $this ) { 
		
		var data = $this.data('hurl'),
			settings = data.settings;
			
			var url = "#"+settings.initiator;
			
			// parse in key-value pairs
			if( settings.pair ){
				for(i in data.link){
					url += settings.delimiter + i + settings.delimiter + data.link[i];
				}	
			} else {
				for(i in data.link){
					url += settings.delimiter + data.link[i];
				}
			}
			
		return url;
	}
	
  };

  $.fn.hurl = function( method ) {
    
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.hurl' );
    }    
  
  };

})( jQuery );

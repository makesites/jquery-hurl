# hURL
## jQuery plugin that helps AJAX apps interact with hash URLs

 * Initiate hURL just by adding 
` $.hurl();
`
 * Update the hash URL with data queries, ex.
` $.hurl("update", {"id": 15765});
` 
 * Get the latest link by requesting 
` $("body").data("hurl").link
` 
 * Update your page when the hash gets updated by using _monitor:true_ and setting up an event listener, like this: 
` $("body").bind('hurl', function(event) {
`   // do something...
` });
`
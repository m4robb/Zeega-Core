/*

	ux.js
	
	the stuff in here should primarily be jQuery stuff that needs to be done after the dom is loaded
	Creating buttons, hovers, tabs, and other stuff here


*/

//	stuff that has to happen after the js fully loads

function initUX()
{
	initHeaderUX();
	
	var visualSearch = VS.init({
		container : $('.visual_search'),
		query     : '',
		callbacks : {
			search : function(query, searchCollection)
			{
				console.log('	search')
				var s = { q:null, content:'all' };
				var filtered = false;
				_.each( _.toArray( searchCollection ), function(facet){
					console.log(facet)
					
					if( facet.get('category') == 'filter' )
					{
						if(filtered) facet.destroy();
						else s.content = facet.get('value');
						filtered = true;
					}
					if( facet.get('category') == 'text' ) s.q = facet.get('value');
				})
				visualSearch.searchBox.renderFacets();
				zeegaBrowser.app.searchDatabase( s , true );
			},
			facetMatches : function(callback)
			{
				callback([ 'filter',
				
					{ label: 'all', category: 'Media Type' },
					{ label: 'audio', category: 'Media Type' },
					{ label: 'image', category: 'Media Type' },
					{ label: 'video', category: 'Media Type' }
				
				 ]);
			},
			valueMatches : function(facet, searchTerm, callback)
			{
				switch (facet)
				{
					case 'filter':
						callback(['all', 'audio', 'image', 'video']);
						break;
				}
			}
		}
	});
	
	
	$('.VS-icon.VS-icon-search').click(function(){
		$('.filter-list').show('fast');
	})
	//when a filter is selected via dropdown
	$('.filter-list a').click(function(e){
		
		var model = new VS.model.SearchFacet({
	      category : 'filter',
	      value    : $(this).data('searchFilter'),
	      app      : visualSearch.searchBox.app
		});
		visualSearch.searchQuery.add(model, {at:0});
		visualSearch.options.callbacks.search( null, visualSearch.searchQuery);
		
		$('.filter-list').hide();
		e.stopPropagation();
		return false;
	})
}



$(document).ready(function() {


	// menu stuff
	$('.menu-toggle').click(function(){
		var menu = $(this).next();
		if( menu.hasClass('open') ) menu.removeClass('open');
		else menu.addClass('open');
		
		event.stopPropagation();
	});
	//clear menus on click
	$('html').bind("click", clearMenus);
	
	function clearMenus()
	{
		$('.menu-items').removeClass('open');
	}

	// filter database by type
	$('#search-filter li a').click(function(){
		
		zeegaBrowser.app.items.collection.search.set({ 
							content:$(this).data('search-filter')
						});
		zeegaBrowser.app.resetPageCount();
		zeegaBrowser.app.doSearch();
		
		clearMenus();
		return false;
	});

	//Click event for collection filter
	$('#browser-collection-filter-tab').click(function(){
		
		zeegaBrowser.app.doCollectionSearch(zeegaBrowser.app.clickedCollectionID);
		zeegaBrowser.app.showCollectionFilter();
		return false;
	});

	//Sets variable for Fancybox "more" view to false each time the page is reloaded
	sessionStorage.setItem('moreFancy', false);

	//set up fancybox lightbox plugin
	$(".fancymedia").fancybox({
		openEffect : 'fade',
    	closeEffect	: 'fade',
    	openSpeed : 'fast',
    	closeSpeed : 'fast',
		closeClick:false,
		nextClick:false,
		mouseWheel:false,
		fitToView:false,
		arrows:false,
		closeBtn:false,
		aspectRatio:true,
		scroll:'none',
				// Changing next gallery item
			nextEffect: 'none', // 'elastic', 'fade' or 'none'
			nextSpeed: 700,
			nextEasing: 'none',
			nextMethod: 'changeIn',

			// Changing previous gallery item
			prevEffect: 'none', // 'elastic', 'fade' or 'none'
			prevSpeed: 700,
			prevEasing: 'none',
			prevMethod: 'changeOut',
		keys: {
				next: [ 34, 39, 40], //  page down, right arrow, down arrow
				prev: [ 33, 37, 38], //  page up, left arrow, up arrow
				close: [27] // escape key
		},
		
    	helpers : {
    		title : false
    	},
    	
		/* This is where we decide which kind of content to put in the fancybox */    
    	beforeLoad : function()
		{
			$('#fancybox-document-cloud').remove();

			var elementID = $(this.element).attr('id');
			var itemsCollection = zeegaBrowser.app.items.collection;
			var thisModel = itemsCollection.get(elementID);
			this.fancyView = null;

			var Fancybox = zeegaBrowser.module('fancybox');

			console.log(thisModel);
			if (thisModel.get("archive") == 'SoundCloud')
			{
				this.fancyView = new Fancybox.Views.SoundCloud({ model : thisModel });
				this.fancyView.render(this);
			} 
			else
			{
				switch( thisModel.get("layer_type") )
				{
					case 'Image':
						this.fancyView = new Fancybox.Views.Image({ model : thisModel });
						this.fancyView.render(this);
						break;
					case 'Video':
						this.fancyView =  new Fancybox.Views.Video({model:thisModel});
						this.fancyView.render(this);
						break;
					case 'Audio':
						this.fancyView = new Fancybox.Views.Audio({model:thisModel});
						this.fancyView.render(this);
						break;
					case 'Youtube':
						this.fancyView =  new Fancybox.Views.Video({model:thisModel});
						this.fancyView.render(this);
						break;
					case 'Vimeo':
						this.fancyView =  new Fancybox.Views.Video({model:thisModel});
						this.fancyView.render(this);
						break;
					case 'Mapbox':
						this.fancyView =  new Fancybox.Views.Mapbox({model:thisModel});
						this.fancyView.render(this);
						break;
					default:
						this.fancyView =new Fancybox.Views.Default({model:thisModel});
						this.fancyView.render(this);
						break;
				}
			}
        },
        
		afterShow : function(){
        	this.fancyView.afterShow();
       	},
        beforeClose : function()
		{
			if (this.fancyView !=null) this.fancyView.beforeClose();
    	},
	});
	
	//Collection playback and editor connection
	$('#collection-player-button').click(function(){
		zeegaBrowser.app.showShareButton(zeegaBrowser.app.items.collection.search.get("collection"));
		return false;
	
	}); 

	$('#collection-to-editor-button, #browser-open-in-editor').click(function(){
		zeegaBrowser.app.goToEditor(zeegaBrowser.app.items.collection.search.get("collection"), zeegaBrowser.app.clickedCollectionTitle);
		return false;
	});
	
	
	/*
	$( '#database-search-text' ).bind('focus', function(e){
	   
	     $(this).val('');
	   
	 });
	$( '#database-search-text' ).bind('keypress', function(e){
	   if ( e.keyCode == 13 ) {
	     e.preventDefault();
	     zeegaBrowser.app.resetPageCount();
	     zeegaBrowser.app.doSearch();
	   }
	 });
	 $( '#database-search-filter' ).bind('change', function(e){
	 	zeegaBrowser.app.resetPageCount();
	     zeegaBrowser.app.doSearch();
	 });
*/
	
	$('#browser-open-timeline').click( function(){
		$('#browser-right-sidebar').show();		
		$(this).hide();
		$('#browser-close-timeline').show();
		
		
		//Reset page count & Do initial search
		zeegaBrowser.app.resetPageCount();
		zeegaBrowser.app.doSearch();
		
		return false;
	});
	$('#browser-close-timeline').click( function(){
		$('#browser-right-sidebar').hide();		
		$(this).hide();
		$('#browser-open-timeline').show();
		

		//Do full search to reset
		zeegaBrowser.app.resetPageCount();
		zeegaBrowser.app.doSearch();

		return false;
	});

	//Switches the results drawer between items and collections
	$('#browser-toggle-items-vs-collections span').click(function(){

		$(this).closest('span').removeClass('active');
		$(this).closest('span').addClass('active');
		$(this).siblings().removeClass('active');
		$(this).siblings().addClass('active');

		
		if ($(this).attr('id') == 'browser-collection-count')
		{
			$('#browser-results-collections').show();
			$('#browser-results-items').hide();
		}
		else
		{
			$('#browser-results-collections').hide();
			$('#browser-results-items').show();
		}
		zeegaBrowser.app.renderResults();
		return false;
	});
	
	$('#browser-toggles .nav li a').click(function(){
		$('#browser-toggles .nav li.active').removeClass('active');
		$(this).parent('li').addClass('active');
		
		if ($(this).data('media') == "mine")
		{
			zeegaBrowser.app.items.collection.search.set({user:-1});
			$('#database-search-text').val("search my stuff");
		}
		else if ($(this).data('media') == "all")
		{
			$('#database-search-text').val("search the library");
			zeegaBrowser.app.items.collection.search.set({user:-2});
		} 

		//Clear any collection filter on page
		zeegaBrowser.app.removeCollectionFilter();
		zeegaBrowser.app.doSearch();
	})


	$('#browser-collection-filter-tab-edit-icon, #browser-collection-filter-edit-menu').hover(
		function(){
			//calculate position dynamically based on text position
			$('#browser-collection-filter-edit-menu').css("left", $('#browser-collection-filter-tab-text').width() + 15);
			$('#browser-collection-filter-edit-menu').show();
		}, 
		function(){
			$('#browser-collection-filter-edit-menu').hide();
		}
	);
	
	

	$('#browser-create-new-collection').droppable({
			accept : '.browser-results-image, .browser-results-collection',
			hoverClass : 'browser-create-new-collection-hover',
			tolerance : 'pointer',

			//this happens when you drop an item onto a collection
			drop : function( event, ui )
			{
				
				ui.draggable.draggable('option','revert',false);
				
				$(this).effect("highlight", {}, 3000);

				if(zeegaBrowser.app.draggedItem.id)
				{
					//var newGuy = new BrowserCollection();
					var Collection = zeegaBrowser.module('collection');
					var newGuy = new Collection.Model()
					newGuy.addNewItemID(zeegaBrowser.app.draggedItem.id);
				
				
					newGuy.save({
						title:'New collection ' + Math.floor(Math.random()*1000)}, 
						{
							success: function(model, response)
							{ 
								zeegaBrowser.app.draggedItem = null;
					
								//Update newGuy


								model.set({id:response.items[0].id});
								model.set({thumbnail_url:response.items[0].thumbnail_url});
								model.set({child_items_count:response.items[0].child_items_count});

								zeegaBrowser.app.myCollections.collection.add(model, {at: 0});
		 					},
			 				error: function(model, response)
							{
			 					zeegaBrowser.app.draggedItem = null;
			 					console.log("Error creating a new collection.");
			 					console.log(response);
			 				}
		 			});
				
				}
				else
				{
					console.log('Error: failure to recognize dragged item');
					console.log(zeegaBrowser.app);
				}
			}
	});
		
	$('#browser-delete-collection').click(function() {
		zeegaBrowser.app.deleteCollection(zeegaBrowser.app.items.collection.search.get("collection"));
		return false;
	});
	$('#browser-rename-collection').click(function() {
		alert('implement in modal window');//Commenting out
		//using jeditable framework - pretend like user clicked on the title element
		//see zeegaBrowser.app.showCollectionFilter for definition of behavior
		//$('#browser-collection-filter-tab-text').trigger('click');
	});
	
	//Load the next page of results into the results drawer
	$('#browser-view-more-item-results, #browser-view-more-collection-results').click(function(){
	 	zeegaBrowser.app.items.collection.search.set({page: zeegaBrowser.app.items.collection.search.get("page")++ });
	 	zeegaBrowser.app.doSearch();
	 	return false;
	 });
	 
	//Infinite Scroll
	  zeegaBrowser.app.killScroll = false; 
	  $('#browser-results-items').scroll(function(){

	  	var totalHeight = $('#browser-results-items')[0].scrollHeight;
	  	var viewportHeight = $('#browser-results-items').height();
	  	var proximityToBottom = 100;
	  	var scrollTop = $('#browser-results-items').scrollTop();

	  	var left = scrollTop + 2 * viewportHeight;
	    //don't excecute if the app is loading, if it's too far down, or if the viewing the map event view
	    if  ( left >= totalHeight )
	    { 
	    	if(zeegaBrowser.app.items.collection.length < zeegaBrowser.app.items.collection.totalItemsCount) //make sure there are more items to, indeed, get
	    	{
		      if (zeegaBrowser.app.killScroll == false) // Keeps the loader from fetching more than once.
		      {
		        zeegaBrowser.app.killScroll = true; // IMPORTANT - Set killScroll to true, to make sure we do not trigger this code again before it's done running.
		        zeegaBrowser.app.items.collection.search.set( {"page": zeegaBrowser.app.items.collection.search.get("page") + 1 }); //set page +1 
		        zeegaBrowser.app.doSearch(true);
		      }
	      }
	    }
	  });
	 
	 
	
	 window.addEventListener('focus', function(){
		zeegaBrowser.app.refreshItems();
		//console.log('infocus refresh database')
	});
	
	
	
});
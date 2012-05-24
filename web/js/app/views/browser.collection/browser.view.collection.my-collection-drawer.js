(function(Collection) {

	//var BrowserCollectionView = BrowserItemView.extend({
	Collection.Views.Collection = Backbone.View.extend({

		tagName:"li",

		initialize : function()
		{
			this.model.bind('change',  this.render, this);
		},
		render: function()
		{
			$(this.el).empty();
			var blanks = {
				src : this.model.get('thumbnail_url'),
				title : this.model.get('title'),
				count : this.model.get('child_items_count'),

			};

			//use template to clone the database items into
			var template = _.template( this.getTemplate() );

			$(this.el).append( template( blanks ) );
			$(this.el).addClass('browser-results-collection');

			//Only show collections drop down menu if user owns collection
			var collectionID = this.model.id;
			var collectionTitle = this.model.get("title");
			var thisCollection = zeegaBrowser.app.myCollections.collection.get( collectionID );
			if (thisCollection == null)
			{
				$(this.el).find('.corner-triangle-for-menu').remove();
			}
			else
			{
				var theElement = this.el;
				var theModel = this.model;
			}

			var thisView = this;

			var modelID = this.model.id;
			var modelTitle = this.model.get('title');
			$(this.el).click(function(){
				zeegaBrowser.app.clickedCollectionTitle = modelTitle;
				zeegaBrowser.app.clickedCollectionID = modelID;
				zeegaBrowser.app.doCollectionSearch(modelID);
				zeegaBrowser.app.showCollectionFilter();


			});

			/*
				Collections are both draggable and droppable. You can drag a collection into
				another collection.

				TODO: Add permissions to this so that you can only add collections to your own collections??
			*/

			$(this.el).draggable({
				distance : 10,
				cursor : 'crosshair',
				appendTo : 'body',
				cursorAt : { 
					top : -5,
					left : -5
				},
				opacity : .75,
				//helper : 'clone',
				helper : function(){
					var drag = $(this).find('.browser-img-large')
						.clone()
						.css({
							'overflow':'hidden',
							'background':'white'
						});
					return drag;
				},

				//init the dragged item variable
				start : function(){
					$(this).draggable('option','revert',true);
					zeegaBrowser.app.draggedItem = thisView.model;
				},

				/**	stuff that happens when the user drags the item into a frame **/	

				stop : function(){
					zeegaBrowser.app.draggedItem = null;
				}

			});

			$(this.el).droppable({
				accept : '.browser-results-image, .browser-results-collection',
				hoverClass : 'browser-add-item-to-collection-hover',
				tolerance : 'pointer',

				//this happens when you drop an item onto a collection
				drop : function( event, ui )
				{
					ui.draggable.draggable('option','revert',false);

					var theElement = this;
					var oldThumbnail = $(theElement).find('img').attr("src");
					var oldCount = parseInt(thisView.model.get('child_items_count'));
					console.log("old count" + oldCount);
					$(theElement).find('img').attr("src", zeegaBrowser.app.draggedItem.get("thumbnail_url")).hide().fadeIn('slow');
					$(theElement).find('.browser-item-count').text('Adding item...');

					if(zeegaBrowser.app.draggedItem.id)
					{
						thisView.model.addNewItemID( zeegaBrowser.app.draggedItem.id );
						thisView.model.save({}, 
							{
								success: function(model, response)
								{ 
									$(theElement).find('img').attr("src", oldThumbnail).hide().fadeIn('slow');
								
									//Alert user they added an item that's already in the collection
									if (oldCount == response.items[0].child_items_count)
										$(theElement).find('.duplicate-item').show().fadeOut(3000, function() {
										    	$(thisView.el).find('.browser-item-count').text(model.get('child_items_count') + " items");
										  });

									model.set({'child_items_count':response.items[0].child_items_count});
									//
									zeegaBrowser.app.draggedItem = null;

								},
								error: function(model, response)
								{
									zeegaBrowser.app.draggedItem = null;
									console.log("Error updating a collection with a new item.");
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

			return this;
		},

		events : {

			"mouseenter .corner-triangle-for-menu, .menu-items"   : "openMenu",
			'click .nav a' : 'menuItemClicked'
	  		//"mouseleave .corner-triangle-for-menu, .menu-items"   : "closeMenu"
		},

		openMenu : function()
		{
			var _this = this;
			
			this.$el.find('.menu').toggleClass('show');
			
			$('body').click(function(){ _this.closeMenu() });
			
		},
		closeMenu : function()
		{
			$('.browser-results-collection .menu').removeClass('show')
		},
		
		menuItemClicked : function( e )
		{
			var _this = this;
			console.log(this)
			console.log( $(e.target).data('action'))
		/*
		
		var collectionTitle = this.model.get("title");
		var thisCollection = zeegaBrowser.app.myCollections.collection.get( collectionID );
		
		*/
			switch( $(e.target).data('action') )
			{
				case 'settings':

					$('#collection-settings-modal').find('.collection-modal-title').text(this.model.get('title'));

					$('#collection-settings-modal').find('#close-modal').click(function(){
						$('#collection-settings-modal').modal('hide');
					});
					
					var _this=this;
					
					$('#collection-settings-modal').find('#collection-modal-delete').click(function(){
						//need to unbind or else previous events are still attached and data gets messed up
						$(this).unbind();
						zeegaBrowser.app.deleteCollection(_this.model.id);
						$('#collection-settings-modal').modal('hide');
						return false;
					});

					$('#collection-settings-modal').find('.collection-modal-title').editable(
						function(value, settings)
						{ 
							return zeegaBrowser.app.editCollectionTitle( value, settings, _this.model.id );
						},
						{
							indicator : 'Saving...',
							tooltip   : 'Click to edit...',
							indicator : '<img src="images/loading.gif">',
							select : true,
							onblur : 'submit',
							width: '250px',
							cssclass : 'modal-form'
					}).click(function(e){
						e.stopPropagation();
			     	});
			
					$('#collection-settings-modal').find('#collection-modal-rename-link').click(function(e) {
						$(this).unbind();
						//using jeditable framework - pretend like user clicked on the title element
						$('#collection-settings-modal').find('.collection-modal-title').trigger('click');
						//stop from selecting the collection filter at the same click
						e.stopPropagation();
					});
					
					$('#collection-settings-modal').modal('show');
					break;
					
				case 'open-in-editor' :
					zeegaBrowser.app.goToEditor(collectionID, collectionTitle);
					break
			}

			event.stopPropagation();
			return false;
		},

		getTemplate : function()
		{
			var html =	
						'<a href="#">'+
							'<img class="browser-img-large" src="<%= src %>" alt="<%= title %> -- <%= count %> items" title="<%= title %> -- <%= count %> items">'+
						'</a>'+
						'<a href="#" class="corner-triangle-for-menu"></a>'+
						'<div class="well menu">'+
							'<ul class="nav nav-list">'+
								'<li><a href="#" data-action="settings">settings</a></li>'+
							'</ul>'+
						'</div>'+
						'<div class="collections-title-overlay">'+
							'<div class="title"><%= title %></div>'+
							'<div class="browser-item-count"><%= count %> items</div>'+
						'</div>';

			return html;
		},

	});
	

})(zeegaBrowser.module("collection"));

/************************************

	IMAGE LAYER CHILD CLASS
	
	
	TODO:
		
		Features: 
			-fullscreen bleed?

************************************/

var ImageLayer = ProtoLayer.extend({
	
	layerType : 'visual',

	defaultAttributes : {
		'title' : 'Image Layer',
		'url' : 'none',
		'x' : 0,
		'y' : 0,
		'h' : 100,
		'w' : 100,
		'opacity':1,
		'aspect':1.33
	},

	controls : {
		
		draw : function()
		{
			var _this  = this.parent;
			console.log( _this );

			var opacityArgs = {
				min : 0,
				max : 1,
				value : _this.attr.opacity,
				step : 0.01,
				layer_id : _this.model.id,
				label : 'Opacity',
				css : 'opacity',
				suffix : '',
			};
			var widthArgs = {
				min : 0,
				max : 100,
				value : _this.attr.w,
				step : 1,
				layer_id : _this.model.id,
				label : 'Width',
				css : 'width',
				suffix : '%',
			};

			var controls = $('<div>');
			controls.append( makeCSSLayerSlider(widthArgs) );
			controls.append( makeCSSLayerSlider(opacityArgs) );

			controls.find('.layer-slider')
				.bind( "slidestop", function(event, ui) {
					_this.editor.onAttributeUpdate();
				});

			controls.append( makeFullscreenButton() );
			controls.find('.fullscreen-submit')
				.click(function(){
					$('#layer-preview-'+that.model.id ).css( {'top':'0px','left':'0px','width':'100%'});
					$('#layer-edit-'+that.model.id).find('#Width-slider').slider("option", "value", 100 );
					that.updateAttr();
				});

			return(controls);
		},
		
		onOpen : function()
		{
			
		},
		
		onClose : function()
		{
			
		}
	}, // controls
	
	editor : {
				
		visual : {
			
			draw : function()
			{
				var _this = this.parent;
				console.log('inside editor.visual.draw');
				console.log( _this );
				//console.log(this._this.model);

				//make dom object
				//maybe these should all be wrapped in divs?
				var div = $('<div>');
				//div.data('layer-id',this.model.id);
				var cssObj = {
					'position' : 'absolute',
					'top' : _this.attr.y  +'%',
					'left' : _this.attr.x  +'%',
					'z-index' : _this.zIndex,
					'width' : _this.attr.w+'%',
					'opacity' : _this.attr.opacity
				};


				div.addClass('media editable draggable')
					.attr({
						'id' : 'layer-preview-'+ _this.model.id,
						'data-layer-id' : _this.model.id
					})
					.css(cssObj);

				div.draggable({
					//when the image stops being dragged
					stop : function(){
						_this.editor.onAttributeUpdate();
					}
				});

				var img=$('<img>')
					.attr({'src': _this.attr.url,'id':'layer-image-' + _this.model.id})
					.css({'width':'100%'});
				
				//set for access later
				_this.dom = div;
				
				div.append(img);
				//add to dom
				return(div);
			
			}
		}, // visual
		
		interaction : {
			
			draw : function()
			{
				// not needed
			}
		},
		
		onAttributeUpdate : function()
		{
			var _this = this.parent;
			console.log( _this );
			
			
			/*
			//get a copy of the old attributes into a variable
			var newAttr = _this.attr;
			//set the new x/y coords into the attributes
			newAttr.x = Math.floor( _this.dom.position().left/6);
			newAttr.y = Math.floor( _this.dom.position().top/4);

			newAttr.opacity = $('#layer-edit-'+_this.model.id).find('#Opacity-slider').slider('value');
			newAttr.w = $('#layer-edit-'+_this.model.id).find('#Width-slider').slider('value');
*/
			var newAttr = {
				x : Math.floor( _this.dom.position().left/6),
				y : Math.floor( _this.dom.position().top/4),
				opacity : $('#layer-edit-'+_this.model.id).find('#Opacity-slider').slider('value'),
				w : $('#layer-edit-'+_this.model.id).find('#Width-slider').slider('value'),
			}



			//set the attributes into the layer
//			_this.util.setAttributes(newAttr);
			_this.util.setAttributes(newAttr);
			//save the layer back to the database
			//_this.util.save();
		},

		onExit : function()
		{
			//	not needed
		}
		
	}, // editor
	
	player : {
		
		preload : function()
		{
			//make dom object
			//maybe these should all be wrapped in divs?
			var div = $('<div>');

			var cssObj = {
				'position' : 'absolute',
				'top' : '-100%',
				'left' : '-100%',
				'z-index' : this.zIndex,
				'width' : this.attr.w+'%',
				'opacity' : this.attr.opacity
			};

			div.css(cssObj);

			$(div).attr('data-layer',this.model.id);

			var img=$('<img>')
				.attr({'src':this.attr.url,'id':'layer-image-'+this.model.id})
				.css({'width':'100%'});

			this.dom = div;

			//make dom
			$(this.dom).append(img);
			//add to dom

			$('#zeega-player').find('#preview-media')
				.append(this.dom)
				.trigger('ready',{'id':this.model.id});
			
		},
		
		play : function()
		{
			console.log('image player.play');
			this.dom.css({'z-index':z,'top':this.attr.y+"%",'left':this.attr.x+"%"});
		},
		
		pause : function()
		{
			// not needed
		},
		
		stash : function()
		{
			console.log('image player.stash');
			this.dom.css({'top':"-100%",'left':"-100%"});
		},
		
		playUnsupported : function()
		{
			// not needed
		},
		
		onExit : function()
		{
			// not needed
		}
		
	} // player
		
});
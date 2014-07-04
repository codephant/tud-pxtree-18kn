
namespace("PXTree.AchtzehnKnoten", function (AzK)
{ "use strict";
	AzK.Sea = function Sea (parent)
	{
		this.parent = parent;
		this.top = parent.top;
		this.game = parent.game;
		this.ship = new AzK.Ship(this);
		this.spots = new AzK.Spots(this);
		this.currentSpotNr = null;
		this.currentLevel = null;
	};
	
	AzK.Sea.prototype = 
			{ preload : function ()
				{
					this.game.load.image('water', 'assets/textures/water.png');
					this.spots.preload();
					this.ship.preload();
				}
			, create: function ()
				{
					this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'water');
					this.spots.create();
					this.ship.create();
					
				}
			, update: function ()
				{
					this.spots.update();
					this.ship.update();
				}
			
			, loadLevel: function (levelnr, enteringFrom)
				{
					if (null !== this.currentLevel)
					{	
						this.unloadLevel(function () { this.loadLevel(levelnr, enteringFrom); }, this);
					}
					else
					{
						//propagate data
						this.top.currentLevel = levelnr;
						this.top.enteringFrom = enteringFrom;

						//store progresss
						this.top.storeSaveData();

						// real loading
						var leveldat = AzK.Data.Levels[levelnr];
						this.spots.loadLevel(leveldat, this.events);
						this.currentLevel = levelnr;
						this.ship.move(
								this.spots.start[enteringFrom].peripheral.port,
								true);
						this.ship.move(
								this.spots.start[enteringFrom].port);
						this.currentSpotNr = this.spots.spot.indexOf(this.spots.start[enteringFrom]);
					}
				}
			
			, unloadLevel: function (instantOrCompleteCallback, completeContext, callingBack)
				{
					if (!callingBack && 'end' in this.currentSpot())
					{
						this.ship.move(this.currentSpot().peripheral.port,
								function () { this.unloadLevel(instantOrCompleteCallback, completeContext, true); }, this);
						return;
					}
					else
					{
						this.ship.move({x:-100,y:-100}, true);
						this.spots.removeAll();
						this.currentLevel = null;
						if (instantOrCompleteCallback instanceof Function)
							instantOrCompleteCallback.call(completeContext);
					}
				}
			
			, moveShip: function (port, onComplete, onCompleteContext)
				{
					this.ship.move(port, onComplete, onCompleteContext);
				}
			
			, moveShipToSpot: function (spotNr)
				{
				if (!this.ship.idling) return; //don't allow a course change will moving
					var spot = this.spots.spot[spotNr];
					if (this.spots.spotIsReachable(spotNr,
							this.currentSpotNr))
					{
						this.currentSpotNr = spotNr;
						if ('event' in spot)
						{
							this.moveShip(spot.port, function ()
							{
								var leveldat = AzK.Data.Levels[this.currentLevel]
									, spotEventDat = spot.event
									;
								// rewrite spot event data, if there are tags to merge
								if ('tags' in spot.event && 'tags' in leveldat)
								{
									spotEventDat = { tags: spot.event.tags.concat(leveldat.tags) };
								}
								
								this.parent.startEvent(spotEventDat);
							}, this);
						}
						else
						{
							this.moveShip(spot.port);
						}
					}
				}
			
			, currentSpot: function ()
				{
					return this.spots.spot[this.currentSpotNr];
				}
			};
});

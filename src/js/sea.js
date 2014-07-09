
namespace("PXTree.AchtzehnKnoten", function (AzK)
{ "use strict";

	var Config = AzK.Config
		, __dirToAngle =
				{ "west": 0
				, "sout-west": 45
				, "south": 90
				, "south-east": 135
				, "east": 180
				, "north-east": 225
				, "north": 270
				, "north-west": 315
				}
		;

	function Sea (parent)
	{
		this.parent = parent;
		this.top = parent.top;
		this.game = parent.game;
		this.ship = new AzK.Ship(this);
		this.spots = new AzK.Spots(this);
		this.currentSpotNr = null;
		this.currentLevel = null;

		this._coastSprite = null;
		this._bgGroup = null;
	};
	AzK.Sea = Sea;


	Sea.toRealAngle = function (dirOrNum)
	{
		return typeof(dirOrNum) === 'string'
				? __dirToAngle[dirOrNum]
				: dirOrNum
				;
	};
	
	AzK.Sea.prototype = 
			{ preload : function ()
				{
					this.game.load
						.image('water', 'assets/textures/water.png')
						.image('coast-normal', 'assets/islands/normal-coast.png')
						;
					this.spots.preload();
					this.ship.preload();
				}
			, create: function ()
				{
					this._bgGroup = this.game.add.group();
					this._bgGroup.add(this.game.make.tileSprite(0, 0, this.game.width, this.game.height, 'water'));
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

						//coast
						if ('coast' in leveldat)
						{
							this._coastSprite = this.game.make.sprite(288, 288, 'coast-normal');
							this._coastSprite.anchor.set(.7 + (leveldat.coastIndent || 0), .5);
							this._coastSprite.angle = Sea.toRealAngle(leveldat.coast);
							this._bgGroup.add(this._coastSprite);
						}
						
						this.spots.loadLevel(leveldat, this.events);
						this.currentLevel = levelnr;
						this.ship.move(
								this.spots.start[enteringFrom].peripheral.port,
								true);
						this.ship.move(
								this.spots.start[enteringFrom].port);
						this.currentSpotNr = this.spots.spot.indexOf(this.spots.start[enteringFrom]);
						this.top.taskLog.startLevel();
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
						if (this._coastSprite)
						{
							this._coastSprite.destroy();
							this._coastSprite = null;
						}
						this.currentLevel = null;
						this.top.taskLog.completeLevel();
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
								if ('tags' in spot.event)
								{
									spotEventDat = { tags: spot.event.tags };
									spotEventDat.tags.push.apply(spotEventDat.tags, this.getDifficultyTags());
									if ('tags' in leveldat)
										spotEventDat.tags.push.apply(spotEventDat.tags, leveldat.tags);
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

			, getDifficultyTags: function ()
				{
					return ["difficulty"
							+ Math.min(Math.floor(this.top.taskLog.countCompletedLevels()
									* Config.LevelDifficulty.Factor) + Config.LevelDifficulty.Offset,
									Config.LevelDifficulty.Maximum
								)];
				}
			};
});

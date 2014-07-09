
namespace("PXTree.AchtzehnKnoten", function (AK)
{
	Play = function Play (parent)
	{
		var self = Object.create(Play.prototype);
		Phaser.State.call(self);
		return self;
	};
	
	Play.key = 'play';
	

	Play.prototype = derive(Phaser.State,
			{ init : function (parentCtrl)
				{
					this.parent = parentCtrl;
					this.top = this.parent.top;
					this.events = new AK.Events(this); //TODO make extra event layer
					this.sea = new AK.Sea(this);
					this.desk = new AK.Desk(this);
					this.almanach = new AK.Almanach(this);
					this.tutorial = new AK.Tutorial(this);
					this.first_start_flag = true;
					}
				
			, preload : function preload ()
				{
				this.preloadBar = this.add.sprite(500, 250, 'preloaderBar');
				this.load.setPreloadSprite(this.preloadBar);
					this.sea.preload();
					this.desk.preload();
					this.events.preload();
					this.almanach.preload();
					this.tutorial.preload();
				}
			, create: function create ()
				{
					this.sea.create();
					this.desk.create();
					this.events.create();
					this.sea.loadLevel(this.top.currentLevel, this.top.enteringFrom);
					this.almanach.create();
					this.tutorial.create();
					if(this.first_start_flag==true) this.tutorial.openTutorial(0);
				}
			, update: function create ()
				{
					this.sea.update();
					this.desk.update();
					this.events.update();
				}
			
			, startEvent: function startEvent (opts)
				{
					this.events.startEvent(opts);
				}
			, openAlmanach: function openAlmanach() {this.almanach.openAlmanach(); }
			, openTutorial: function openTutorial() {this.tutorial.openTutorial(0); }
			});
	
	AK.Play = Play;
});

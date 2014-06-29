namespace("PXTree.AchtzehnKnoten", function (AK)
{
	var Config = AK.Config.MainMenu;
	
	function MainMenu ()
	{
		var self = Object.create(MainMenu.prototype);
		Phaser.State.call(self);
		return self;
	}
	
	MainMenu.key = "mainmenu";
	
	MainMenu.prototype = on(Object.create(Phaser.State.prototype), function (def)
	{
		def.init = function (parentCtrl)
	{
			this.parent = parentCtrl;
			this.top = this.parent.top;
	};
	
	def.preload = function ()
	{
		this.game.load
		.image('mainmenu-bg', 'assets/textures/mm-bg.png')
		.image('button', 'assets/ui/ui-board-decorated.png')
		.image('logo', 'assets/textures/mm-logo.png');
	;
	};
	
	def.create = function ()
	{
		var btnFactory = TextButtonFactory(this.game,
					{ key: 'button'
						, normalStyle: Config.TextStyle
						, overStyle: { fill: 'gold'}
						, textAlign: [.5,.5]
					})
		, start = btnFactory.create("neues spiel")
		, fortsetzen = btnFactory.create("fortsetzen")
		, credits = btnFactory.create("credits")
		;
		this.game.add.sprite(0, 0, 'mainmenu-bg');
		var logo = this.game.add.sprite(700,90,'logo');
		logo.anchor.set(0.5);
		logo.scale.set(1.2);
	
		start.position.set(570, 205);
		start.onInputUp.add(function()
				{
			if(confirm('Hierbei werden alle vorhanden Daten gelöscht! \n Sind Sie sicher, dass Sie ein neues Spiel starten wollen?') == false) return;
			localStorage.removeItem('Stats');
			localStorage.removeItem('currentLevel');
			localStorage.removeItem('enteringFrom');
			this.top.stats = new AK.Stats(
				{ player:
					{ name: "Paddington"
					, morale: 11
					, nationality: 'portuguese'
					, gold: 20000
					, food: 500
					, crewCount: 31
					, strength: 23
					}
				, ship:
					{ speed: 0.2
					, crewCapacity: 60
					}
				});
			this.top.currentLevel = 0;
			this.top.enteringFrom = 'west';
			this.game.state.start(AK.Play.key, true, false, this.top);
				}, this);
		this.game.world.add(start);
		
		fortsetzen.position.set(570, 295);
		fortsetzen.onInputUp.add(function()
				{
			this.game.state.start(AK.Play.key, true, false, this.top);
				}, this);
		this.game.world.add(fortsetzen);
	
		credits.position.set(570, 385);
		credits.onInputUp.add(function()
				{
				this.game.state.start(AK.Credits.key, true, false, this.top);
				},		 this);
			this.game.world.add(credits);
			};
		
			return def;
		});

	AK.MainMenu = MainMenu;
});
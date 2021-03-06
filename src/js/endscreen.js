
namespace("PXTree.AchtzehnKnoten", function (AK)
{ "use strict";

	var Config = AK.Config.Endscreen
		, GameWidth = AK.Config.Game.Width
		;
	
	function Endscreen (parentCtrl)
	{
		var self = Object.create(Endscreen.prototype)
			;
		Phaser.State.call(self);
		self.parent = parentCtrl;
		self.top = parentCtrl.top;
		self.failed = null;
		self._Data = null;
		self.reasonOrFound = null;
		
		return self;
	}
	AK.Endscreen = Endscreen;

	Endscreen.key = "endscreen";

	Endscreen.prototype = derive(Phaser.State,
	{ preload: function ()
		{
			this.game.load
			//.image('endscreen-logo', 'assets/textures/mm-logo.png')
			.image('endscreen-fail-bg', 'assets/textures/endscreen-fail-bg.png')
			.image('endscreen-success-bg', 'assets/textures/endscreen-success-bg.png')
			.image('endscreen-fail-btn', 'assets/ui/ui-board-broken.png')
			.image('endscreen-success-btn', 'assets/ui/ui-board-decorated.png')
			.audio('audio_fail','assets/audio/small/529570_DT-Sunset.mp3')
			.audio('audio_win','assets/audio/small/323835_PiratesThemeEastWes.mp3')
			;
		}

	, init: function (failed, reasonOrFound)
		{
			this.failed = failed;
			this.reasonOrFound = reasonOrFound;
			this._Data = Config[this.failed ? 'fail' : 'success']
		}

	, create: function ()
		{
			var tbf = TextButtonFactory(this.game,
						{ key: 'endscreen-' + (this.failed ? 'fail' : 'success') + '-btn'
						, normalStyle: this._Data.Button.TextStyle
						, overStyle: this._Data.Button.HoverTextStyle
						, textAlign: [.5, .5]
						})
				;
			this.game.add.sprite(0, 0,
					'endscreen-' + (this.failed ? 'fail' : 'success') + '-bg');
			//this.game.add.sprite(0, 0, 'endscreen-logo')
			//		.position.copyFrom(Config.LogoPosition);
			on(tbf.create(Config.Button.Text, function()
			{
				this.game.sound.stopAll();
				this.top.startState(AK.MainMenu.key);
			}, this), function()
			{
				this.game.world.add(this);
				this.position.copyFrom(Config.Button.Position);
			});

			on(this.game.add.text(0, 0,
					Config.Heading.Text, Object.create(Config.Heading.Style)),
					function (heading)
					{
						heading.position.copyFrom(Config.Heading.Position);
						heading.anchor.set(0, .5);
						this.game.add.text(
								heading.x + heading.width,
								Config.Heading.Position.y,
								this._Data.HeadingEnd.Text,
								derive(Config.Heading.Style, this._Data.HeadingEnd.Style))
							.anchor.set(0, .5)
							;
					}, this);

			this.game.add.text(0, 0,
					this._Data.Descriptions[this.reasonOrFound],
					Config.Description.Style)
				.position.copyFrom(Config.Description.Position)
				;

			this.game.add.text(0, 0, Config.Suggestion.Text, Config.Suggestion.Style)
				.position.copyFrom(Config.Suggestion.Position);
				
			//Play Endscreen Music
			if (this.failed) {
				var music = this.game.sound.play('audio_fail', 0.5, true);
			} else if (!this.failed){
				var music = this.game.sound.play('audio_win', 0.5, true);
			}
				
		}
	}); // Endscreen.prototype
});


namespace("PXTree.AchtzehnKnoten", function (AK)
{
	var Config = AK.Config.PopText
		;

	/**
	 * This interface element is a specially highlighted text, that performs a
	 * slide-and-fade animation once shown. These can be chained together to
	 * achieve multiple messages popping up one after another.
	 *
	 * After the animation is complete and the text faded, it destroys itself.
	 *
	 * Note, that this is a factory constructor, which must be called without 'new'.
	 * @param game:Phaser.Game
	 * @param x:number start x coordinate
	 * @param y:number start y coordinate
	 * @param text:string
	 * @param style:object Text style.
	 * @return self:PopText The newly created PopText instance.
	 */
	function PopText (game, x, y, text, style)
	{
		var self = Object.create(PopText.prototype);
		Phaser.Text.call(self, game, x, y, text, style);

		/**
		 * The next PopText in the chain.
		 * @property _next:PopText=null
		 */
		self._next = null;
		/**
		 * A reference to the last chained PopText for easy access.
		 */
		self._last = null;

		//make it invisible until popped.
		self.visible = false;
		return self;
	};

	PopText.prototype = derive(Phaser.Text,
	/**
	 * Start the pop animation and the pop chain. Once this is called, no further
	 * chaining to this is allowed.
	 * @returns this:PopText
	 */
	{ pop: function ()
		{
			this._last = null;
			this.visible = true;
			this.game.add.tween(this)
					.to(
						{ y: this.y - Config.Difference, alpha: 0 },
						Config.Duration,
						Config.Easing)
					.start()
					.onComplete.add(this.destroy, this);
			if (this._next)
			{
				var timer = this.game.time.create(true);
				timer.add(Config.SingleDelay, this._popNext, this);
				timer.start();
			}
			return this;
		}
	/**
	 * Creates and appends a new pop-text to the end of the chain. However, this
	 * will not be possible, once the popping on the chain is started.
	 * @param text:string Same as the contructors text parameter. @see PopText
	 * @param style:object Same as the contructors style parameter. If this is not
	 *		given, the style of this pop-text is used. @see PopText
	 * @returns this:PopText
	 */
	, chain: function (text, style)
		{
			var popt = PopText(
						this.game, this.position.x, this.position.y,
						 text, style || this.style)
				;
			if (this._last)
			{
				this._last._next = popt;
				this._last = popt;
			}
			else if (!this._next)
			{
				this._last = this._next = popt;
			}
			
			return this;
		}

	/**
	 * Append the next pop-text in chain to the same parent and trigger the popping.
	 */
	, _popNext: function ()
		{
			this.parent.add(this._next);
			this._next.pop();
		}
	});

	//patch the Phaser factories
	Phaser.GameObjectCreator.prototype.popText = function (x, y, text, style)
	{
		return PopText(this.game, x, y, text, style);
	};
	
	Phaser.GameObjectFactory.prototype.popText = function (x, y, text, style, group)
	{
		if (typeof group === 'undefined') { group = this.world; }
		return group.add(PopText(this.game, x, y, text, style));
	};

	//publish
	AK.PopText = PopText;
	
});

namespace("PXTree.AchtzehnKnoten", function (AK)
{
	
	var Config = AK.Config.Events;
	
	/**
	 * 
	 */
	AK.Events = function Events (parentCtrl, dialogParent)
	{
		this.parent = parentCtrl;
		this.top = parentCtrl.top;
		this.game = parentCtrl.game;

		this._dialogQueue = [];
		this._dialogParent = null;
	};
	
	AK.Events.prototype.preload = function preload ()
	{
		this.game.load
				.image('wood', 'assets/textures/wood.jpg')
				.image('eventbox-bg', 'assets/ui/ui-eventbox.png')
				.image('eventbox-btn', 'assets/ui/ui-eventbox-button.png')
				.spritesheet(
					'dialog-button', 'assets/ui/ui-eventbox-button.png', 4, 16, 3)
				;
	};
	
	AK.Events.prototype.create = function create ()
	{
		this._dialogParent = this.game.add.group();
	};
	
	AK.Events.prototype.update = function update ()
	{};
	
	/**
	 * Run an event depending on the given information. When given tags the event
	 * is randomly picked among the events satisfying all tags.
	 * @param opts:Object This can either contain a specific event name as 'name'
	 * 		property or an series of tags given via 'tags' in form of an array or
	 * 		whitespace separated list.
	 */
	AK.Events.prototype.startEvent = function startEvent (opts)
	{
		var evt = null
			;
		if ('name' in opts)
			evt = this._selectEventByName(opts.name);
		else if ('tags' in opts)
			evt = this._selectEventByTags(opts.tags);
		else
			evt = opts;
		this._makeDialogFromTask(evt).show();
	};
	
	
	
	/**
	 * Generates a dialog according to the tasks 'type' property.
	 * 
	 * @todo This currently only generates 'SingleSelectDialog's.
	 */
	AK.Events.prototype._makeDialogFromTask = function _makeDialogFromTask (task)
	{
		var dial = null
			;
		if ('choices' in task) //SingleSelection
		{
			dial = new AK.Events.SingleSelectDialog(this.game, this._dialogParent);
			dial.description(task.description);
			task.choices.forEach(function (choice, idx)
			{
				dial.choice(choice.label,
						(function () { this._resolveTask(task, idx); }).bind(this));
			}, this);
		}
		else if ('description' in task) //Message
		{
			dial = new AK.Events.MessageDialog(this.game, this._dialogParent);
			dial.message(task.description);
		}
		return dial;
	};
	
	/**
	 * 
	 */
	AK.Events.prototype._resolveTask = function _resolveTask (task, idx)
	{
		var choice = task.choices[idx]
			, dial = null
			;

		if (choice.hasOwnProperty('outcome'))
			this._processOutcome(choice.outcome);

		
		dial = this._makeDialogFromTask(choice);
		if (dial) dial.show();
	};
	
	/**
	 * 
	 */
	AK.Events.prototype._processOutcome = function _processOutcome (outcome)
	{
		var stat, newVal
			;
		for (stat in outcome) if (outcome.hasOwnProperty(stat))
		{
			newVal = this.top.stats.get(stat) + outcome[stat];
			this.top.stats.set(stat, newVal);
		}
	};
	
	/**
	 * @todo Implement proper Event selecting structures and algorithms
	 */
	AK.Events.prototype._selectEventByName = function _selectEventByName (name)
	{
		var found = null
			, i = -1
			, ev = null
			;
		while (!found && AK.Data.Events.length > ++i)
		{
			ev = AK.Data.Events[i];
			if (name === ev.name)
				found = ev;
		}
		return found;
	};
	
	/**
	 * @todo Implement proper Event selecting structures and algorithms
	 */
	AK.Events.prototype._selectEventByTags = function _selectEventByTags (tags)
	{
		var matching = []
			, selected = null
			, testTags = function (ev)
					{ return tags.every(function (t) { return ev.tags.indexOf(t) >= 0; }); }
			;
		AK.Data.Events.forEach(function(ev)
		{
			
			if (testTags(ev))
				matching.push(ev);
		}, this);
		if (0 < matching.length)
			selected = matching[Math.floor(matching.length * Math.random())];
		
		return selected;
	};



	/**
	 * This is the base class for any dialog, that provides exercises to the player.
	 */
	AK.Events.TaskDialog = function TaskDialog (game, parent)
	{
		this.game = game;
		this.content = this.game.make.group();
		this.displayObject = this.game.make.group();
		this._parent = parent;
		
		this.displayObject.visible = false;

		this.displayObject.position.set(Config.Dialog.Margin[0], Config.Dialog.Margin[1]);
		this.displayObject.add(this.game.make.sprite(0, 0, 'eventbox-bg'));
		
		this.content.position.set(0, 0);
		this.displayObject.add(this.content);
		
		this._parent.add(this.displayObject);
	};
	
	AK.Events.TaskDialog.prototype.show = function show ()
	{
		this.displayObject.visible = true;
	};
	
	AK.Events.TaskDialog.prototype.hide = function hide ()
	{
		this.displayObject.visible = false;
	};
	
	AK.Events.TaskDialog.prototype.destroy = function destroy ()
	{
		this.hide();
//		this._parent.removeChild(this.displayObject);
		this.displayObject.destroy();
	};
	
	AK.Events.TaskDialog.prototype.makeButton = function makeButton (labelText, clickHandler)
	{
		var btn = this.game.make.group()
			, bg = this.game.make.sprite(0, 0, "eventbox-btn")
			, label = this.game.make.text(
					Config.Button.LabelOffset[0], Config.Button.LabelOffset[1],
					labelText, Object.create(Config.Button.TextStyle))
			, mouseInHandler = function ()
					{
						label.fill = Config.Button.HoverTextStyle.fill;
						bg.frame = 1;
					}
			, mouseOutHandler = function ()
					{
						label.fill = Config.Button.TextStyle.fill;
						bg.frame = 0;
					}
			;

			//setup input handlers
			label.inputEnabled = true;
			label.events.onInputOver.add(mouseInHandler);
			label.events.onInputOut.add(mouseOutHandler);
			if (clickHandler) label.events.onInputDown.add(clickHandler);
			
			bg.inputEnabled = true;
			if (clickHandler) bg.events.onInputDown.add(clickHandler);
			bg.events.onInputOver.add(mouseInHandler);
			bg.events.onInputOut.add(mouseOutHandler);
			
			//put all in place
			bg.y = .5 * (Config.Button.Height - bg.height);
			btn.add(bg);

			label.y = .5 * (Config.Button.Height - label.height);
			btn.add(label);
			
			btn.bg = bg;
			btn.label = label;
			return btn;
	};



	/**
	 * This Dialog type allows the user to select one of a range of choices.
	 * To this end it displays a descriptive text concerning the object of the choice
	 * and lists the options at the lower end of the dialog.
	 */
	AK.Events.SingleSelectDialog = function SingleSelectDialog (game, parent)
	{
		AK.Events.TaskDialog.call(this, game, parent);
		this._buttons = [];
		this.buttonPanel = this.game.make.group();
		this.descriptionPanel = this.game.make.group();
		
		this.content.add(this.descriptionPanel);
		this.content.add(this.buttonPanel);
		
		this.buttonPanel.position.set(
				Config.Button.PanelOffset[0], Config.Button.PanelOffset[1]);
	};
	
	AK.Events.SingleSelectDialog.prototype =
			on(Object.create(AK.Events.TaskDialog.prototype), function (def)
			{
				/**
				 * Adds a new choice/button to the dialog.
				 * @param label:string Descriptive text for the choice.
				 * @param callback:Function Called when the corresponding choice is selected.
				 * @returns this For chaining.
				 */
				def.choice = function choice (label, callback)
				{
					var dialog = this
						, clickHandler = function () { dialog.destroy(); callback(); }
						, btn = this.makeButton(label, clickHandler)
						;

					btn.position.set(
							0, this._buttons.length * (Config.Button.Height + Config.Button.Spacing));
					this.buttonPanel.add(btn);
					this._buttons.push(btn);
					return this;
				};
				
				/**
				 * Sets the descriptions text to the given content.
				 * @param description:string The text shown in the selection dialog.
				 * @returns this
				 */
				def.description = function description (desc)
				{
					var text = this.game.make.text(
								0, 0, desc, Config.Description.TextStyle)
						, c
						;
					text.position.set(Config.Description.Offset[0], Config.Description.Offset[1]);
					text.x = Math.floor((Config.Dialog.Width - text.width) / 2);
					if ((c = this.descriptionPanel.getAt(0)) !== -1)
							this.descriptionPanel.remove(c, true);
					this.descriptionPanel.add(text);
					
					return this;
				};
				
				return def;
			});
	
	/**
	 * Shows a message to the user and provides an OK-button to close.
	 */
	AK.Events.MessageDialog = function MessageDialog (game, parent)
	{
		AK.Events.TaskDialog.call(this, game, parent);
		this._okBtn = this.makeButton(Config.Button.DefaultLabel, this.destroy.bind(this));
		this._message = this.game.make.text(
				Config.Description.Offset[0], Config.Description.Offset[1],
				"", Config.Description.TextStyle);
		this._okBtn.position.set(
				Config.Button.PanelOffset[0], Config.Button.PanelOffset[1]);
		
		this.content.add(this._message);
		this.content.add(this._okBtn);
	};
	
	AK.Events.MessageDialog.prototype =
			on(Object.create(AK.Events.TaskDialog.prototype), function (def)
			{
				def.message = function message (newText)
				{
					this._message.text = newText;
					
					return this;
				};
				
				def.ok = function ok (okHandler)
				{
					this._okBtn.label.events.onInputDown.add(okHandler);
					this._okBtn.marker.events.onInputDown.add(okHandler);
					
					return this;
				};
				
				return def;
			});
});
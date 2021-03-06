namespace("PXTree.AchtzehnKnoten", function(AK)
{
	var Config = AK.Config.Desk;
	var data_almanach = AK.Data.Almanach;
	var alm_view;
	var paper = null;
	var exit = null;
	var txtGrp;
	var temp_title; 
	var temp_page = 0;
	var self;
	var page_flag = 0;
	var is_open = false;
	var current_title = null;
	var current_line = null; 
	
	AK.Almanach = function Almanach (parentCtrl) {
		this.parent = parentCtrl;
		this.top = parentCtrl.top;
		this.play = parentCtrl;
		this.game = parentCtrl.game;
		this.self = this;
		this.preload();
		this.create();

	};
	
	AK.Almanach.prototype.preload = function preload() {
		this.game.load.image('background','assets/ui/ui-almanach.png');
		this.game.load.spritesheet('exit','assets/icons/almanach-back.png', 32, 32);
		
	};
	
	AK.Almanach.prototype.create = function create(){
		data_almanach = AK.Data.Almanach;
		this.makeBackground();
		alm_view = this.game.add.group();
		txtGrp = this.game.add.group();


		
	};
	
	AK.Almanach.prototype.update = function update(){};

	
	AK.Almanach.prototype.openAlmanach = function openAlmanach(startLine){
		paper.visible = true;
		exit.visible = true;
		txtGrp.removeAll();
    	alm_view.removeAll();
		page_flag = 0;
		if(!startLine) startLine=0;
		if(current_title != null && current_line != null && is_open == false){
			this.openPage(current_title, current_line);
			return;
			}
		else{
			var titles = [];
			var count = 0;
			var title, text_im, titletext;
			var text = "Keine gültigen Daten gefunden";
			
			var textstyle = Object.create(Config.StatPaper.TextStyle);
			var headline = this.game.add.text(Config.Left + 150, 35+count, 'Almanach des Schiffes', textstyle);
			txtGrp.add(headline);
			count = 50;
			var upto = (data_almanach.length>startLine+14)? startLine+14 : data_almanach.length;
			for(var i=startLine; i<upto;i++) {
				count+=30;
				if(titletext == null) text = "Keine gültigen Daten gefunden";
				title = data_almanach[i].title;
				titletext = this.game.make.text(Config.Left + 50, count, data_almanach[i].title, textstyle);
				txtGrp.add(titletext);
				this.createButton(title, 0, Config.Left + 50, count, title.length, titletext);
			};
			if(startLine+14<data_almanach.length){
				var next_link = this.game.add.text(Config.Left + 330, 530, 'Nächste Seite', textstyle);
				txtGrp.add(next_link);
				this.createIndexButton(title, startLine+14, Config.Left + 330, 530, title.length, next_link);
			}
			if(startLine-14>=0){
				var prev_link = this.game.add.text(Config.Left + 80, 530, 'Vorherige Seite', textstyle);
				txtGrp.add(prev_link);
				this.createIndexButton(title, startLine-14, Config.Left + 80, 530, title.length, prev_link);
			}
		}
		txtGrp.setAll('visible','true');
		

		

	};
	
	
	AK.Almanach.prototype.makeBackground = function (){
		paper = this.game.add.sprite(Config.Left, 0, 'background');
		paper.visible = false;
		exit = this.game.add.button(Config.Left + 55, 530, 'exit', this.closeAlmanach, this, 1, 0);
	    exit.anchor.set(0.5);
	    exit.scale.set(1);
	    exit.visible = false;
	};
	
	
	AK.Almanach.prototype.openPage = function (title, line) {
    	txtGrp.removeAll();
    	alm_view.removeAll();
    	page_flag = 1;
    	current_title = title;
    	current_line = line;
    	var self = this;
		var page_data = data_almanach[0].content;
		for(var i=0;i<data_almanach.length;i++){
			if(data_almanach[i].title==title) {page_data = data_almanach[i].content; break; }
		}
		var count = 0;
		var line_number = line;
		var textstyle = Object.create(Config.StatPaper.TextStyle);
		var content_text;
		var content_lines = [];
		var headline = this.game.add.text(Config.Left + 150, 50+count, title, textstyle);
		headline.fill='black';
		txtGrp.add(headline);
		for(var i=0;i<page_data.length;i++){
			if(page_data[i].type == 'paragraph') {
				content_text = page_data[i].text;
				if(content_lines.length <= 0 || typeof content_lines == 'undefined') content_lines = self.splitText(content_text);
				else {
					content_lines.push.apply(content_lines, self.splitText(content_text));
				}
				
			}
		}
		upto = (line_number+20>content_lines.length)? content_lines.length : line_number+20;
		
		for(var j=line_number;j<upto;j++){
				var contenttext = this.game.make.text(Config.Left + 50, 100+count, content_lines[j], textstyle);
				contenttext.fill = 'black';
				txtGrp.add(contenttext);
				count+=20;
			}
		if(content_lines.length>line_number+20){
			var next_link = this.game.add.text(Config.Left + 330, 530, 'Nächste Seite', textstyle);
			txtGrp.add(next_link);
			this.createButton(title, line_number+20, Config.Left + 330, 530, title.length, next_link);
		}
		if(line_number-20>=0){
			var prev_link = this.game.add.text(Config.Left + 80, 530, 'Vorherige Seite', textstyle);
			txtGrp.add(prev_link);
			this.createButton(title, line_number-20, Config.Left + 80, 530, title.length, prev_link);
		}
		return;
		
	};
	
	AK.Almanach.prototype.closeAlmanach = function(){
    	txtGrp.removeAll();
    	alm_view.removeAll();
		if(page_flag == 0){
			paper.visible = false;
	    	exit.visible = false; 
	    	is_open = false;
	    	txtGrp.setAll('visible','false'); 
	    	temp_page=0; }
		else{ 
			is_open = true;
			page_flag = 0;
			this.openAlmanach(0);}
    	
    }
	
	AK.Almanach.prototype.createButton = function(title, line, x, y, textlength, obj) {
		var textbutton = this.game.add.tileSprite(x-5,y-9,textlength*6.5, 30, null);
		alm_view.add(textbutton);
		var self = this;
		textbutton.inputEnabled = true;
		textbutton.events.onInputDown.add(function() {
			self.openPage(title, line);
				});
		textbutton.events.onInputOver.add(function() {
			obj.fill='#ff774b';
		});
		textbutton.events.onInputOut.add(function() {
			obj.fill='black';
		});
	};
	
	AK.Almanach.prototype.createIndexButton = function(title, line, x, y, textlength, obj) {
		var textbutton = this.game.add.tileSprite(x-5,y-9,textlength*6.5, 30, null);
		alm_view.add(textbutton);
		var self = this;
		textbutton.inputEnabled = true;
		textbutton.events.onInputDown.add(function() {
			self.openAlmanach(line);
				});
		textbutton.events.onInputOver.add(function() {
			obj.fill='#ff774b';
		});
		textbutton.events.onInputOut.add(function() {
			obj.fill='black';
		});
	};
	
	AK.Almanach.prototype.splitText = function (text){
		var lines = [];
		var txt = text.split(" ");
		var line = "";
		for(var i=0;i<txt.length;i++){
			if(txt[i].length>40) {
				var longtxt = txt[i].match(/[\s\S]{1,40}/g) || [];
				for(var j=0;j<longtxt.length;j++) {lines.push(longtxt[j]);}
			}
			else{
				var temp_line=line;
				temp_line+=txt[i]+' ';
				if(temp_line.length>50){
					lines.push(line);
					line = "";
				}
				line+=txt[i]+' ';
			}
		}
		if(line!="") lines.push(line);
		lines.push('');
		return lines;
	}

	
});

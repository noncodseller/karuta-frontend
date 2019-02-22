/* =======================================================
	Copyright 2018 - ePortfolium - Licensed under the
	Educational Community License, Version 2.0 (the "License"); you may
	not use this file except in compliance with the License. You may
	obtain a copy of the License at

	http://opensource.org/licenses/ECL-2.0

	Unless required by applicable law or agreed to in writing,
	software distributed under the License is distributed on an "AS IS"
	BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
	or implied. See the License for the specific language governing
	permissions and limitations under the License.
   ======================================================= */

/// Check namespace existence
if( UIFactory === undefined )
{
  var UIFactory = {};
}

//==================================
UIFactory["Calendar"] = function( node )
//==================================
{
	this.id = $(node).attr('id');
	this.node = node;
	this.type = 'Calendar';
	//--------------------
	if ($("lastmodified",$("asmResource[xsi_type='Calendar']",node)).length==0){  // for backward compatibility
		var newelement = createXmlElement("lastmodified");
		$("asmResource[xsi_type='Calendar']",node)[0].appendChild(newelement);
	}
	this.lastmodified_node = $("lastmodified",$("asmResource[xsi_type='Calendar']",node));
	//--------------------
	this.minViewMode_node = $("minViewMode",$("asmResource[xsi_type='Calendar']",node));
	this.text_node = [];
	for (var i=0; i<languages.length;i++){
		this.text_node[i] = $("text[lang='"+languages[i]+"']",$("asmResource[xsi_type='Calendar']",node));
		if (this.text_node[i].length==0) {
			if (i==0 && $("text",$("asmResource[xsi_type='Calendar']",node)).length==1) { // for WAD6 imported portfolio
				this.text_node[i] = $("text",$("asmResource[xsi_type='Calendar']",node));
			} else {
				var newelement = createXmlElement("text");
				$(newelement).attr('lang', languages[i]);
				$("asmResource[xsi_type='Calendar']",node)[0].appendChild(newelement);
				this.text_node[i] = $("text[lang='"+languages[i]+"']",$("asmResource[xsi_type='Calendar']",node));
			}
		}
	}
	this.format_node = [];
	for (var i=0; i<languages.length;i++){
		this.format_node[i] = $("format[lang='"+languages[i]+"']",$("asmResource[xsi_type='Calendar']",node));
		if (this.format_node[i].length==0) {
			if (i==0 && $("format",$("asmResource[xsi_type='Calendar']",node)).length==1) { // for WAD6 imported portfolio
				this.format_node[i] = $("format",$("asmResource[xsi_type='Calendar']",node));
			} else {
				var newelement = createXmlElement("format");
				$(newelement).attr('lang', languages[i]);
				$("asmResource[xsi_type='Calendar']",node)[0].appendChild(newelement);
				this.format_node[i] = $("format[lang='"+languages[i]+"']",$("asmResource[xsi_type='Calendar']",node));
			}
		}
	}
	this.multilingual = ($("metadata",node).attr('multilingual-resource')=='Y') ? true : false;
	this.display = {};
};

//==================================
UIFactory["Calendar"].prototype.getAttributes = function(type,langcode)
//==================================
{
	var result = {};
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	if (this.multilingual!=undefined && !this.multilingual)
		langcode = 0;
	//---------------------
	if (dest!=null) {
		this.display[dest]=langcode;
	}
	//---------------------
	if (type==null)
		type = 'default';
	//---------------------
	if (type=='default') {
		result['restype'] = this.type;
		result['minViewMode'] = this.minViewMode_node[langcode].text();
		result['text'] = this.text_node[langcode].text();
		result['format'] = this.format_node[langcode].text();
	}
	return result;
}

/// Display
//==================================
UIFactory["Calendar"].prototype.getView = function(dest,langcode)
//==================================
{
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	//---------------------
	this.multilingual = ($("metadata",this.node).attr('multilingual-resource')=='Y') ? true : false;
	if (!this.multilingual)
		langcode = NONMULTILANGCODE;
	//---------------------
	if (dest!=null) {
		this.display[dest] = langcode;
	}
	return $(this.text_node[langcode]).text();
};

//==================================
UIFactory["Calendar"].prototype.displayView = function(dest,langcode)
//==================================
{
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	//---------------------
	this.multilingual = ($("metadata",this.node).attr('multilingual-resource')=='Y') ? true : false;
	if (!this.multilingual)
		langcode = NONMULTILANGCODE;
	//---------------------
	if (dest!=null) {
		this.display[dest] = langcode;
	}
	var html = $(this.text_node[langcode]).text();
	$("#"+dest).html(html);
};

/// Editor
//==================================
UIFactory["Calendar"].update = function(itself,langcode)
//==================================
{
	$(itself.lastmodified_node).text(new Date().toLocaleString());
	itself.save();
};

//==================================
UIFactory["Calendar"].prototype.displayEditor = function(dest,type,langcode,disabled)
//==================================
{
	//---------------------
	if (langcode==null)
		langcode = LANGCODE;
	//---------------------
	this.multilingual = ($("metadata",this.node).attr('multilingual-resource')=='Y') ? true : false;
	if (!this.multilingual)
		langcode = NONMULTILANGCODE;
	if (disabled==null)
		disabled = false;
	//---------------------
	var html = "<form class='form-horizontal' role='form'></form>";
	var form = $(html);
	//------
	html = "<input type='text' name='datepicker' class='datepicker form-control' style='width:150px;' ";
	if (disabled)
		html += "disabled='disabled' ";
	html += "value=\""+$(this.text_node[langcode]).text()+"\" >";
	var input1 = $(html);
	var self = this;
	$(input1).change(function (){
		$(self.text_node[langcode]).text($(this).val());
		UIFactory["Calendar"].update(self,langcode);
	});
	var format = $(this.format_node[langcode]).text();
	if (format.length<2)
		format = "yyyy/mm/dd";
	var minViewMode = $(this.minViewMode_node).text();
	if (minViewMode.length==0)
		minViewMode = "days";
	$(input1).datepicker({minViewMode:minViewMode,format:format,language:LANG});
	$(form).append(input1);
	//------
	if (g_userroles[0]=='designer' || USER.admin){
		var group2 = $("<div class='form-group calendar-format'><label class='col-sm-3 control-label'>Diplay Format</label></div>");
		var div2 = $("<div class='col-sm-9'></div>");
		html = "<input type='text' class='form-control' style='width:150px;' ";
		if (disabled)
			html += "disabled='disabled' ";
		html += "value=\""+$(this.format_node[langcode]).text()+"\" >";
		var input2 = $(html);
		var self = this;
		$(input2).change(function (){
			$(self.format_node[langcode]).text($(this).val());
			UIFactory["Calendar"].update(self,langcode);
		});
		$(div2).append(input2);
		$(group2).append(div2);
		$(form).append(group2);
		//---
		var group3 = $("<div class='form-group calendar-format'><label class='col-sm-3 control-label'>Pick Format</label></div>");
		var div3 = $("<div class='col-sm-9'></div>");
		html = "<input type='radio' name='radio"+this.id+"' ";
		if (disabled)
			html += "disabled='disabled' ";
		if ($(this.minViewMode_node).text()=='days')
			html += "checked='true' ";
		html += "value='days'  > Days </input>";
		var input3_1 = $(html);
		$(input3_1).click(function (){
			$(self.minViewMode_node).text($(this).val());
			UIFactory["Calendar"].update(self,langcode);
		});
		$(div3).append(input3_1);
		html = "<input type='radio' name='radio"+this.id+"' ";
		if (disabled)
			html += "disabled='disabled' ";
		if ($(this.minViewMode_node).text()=='months')
			html += "checked='true' ";
		html += "value='months' > Months </input>";
		var input3_2 = $(html);
		$(input3_2).click(function (){
			$(self.minViewMode_node).text($(this).val());
			UIFactory["Calendar"].update(self,langcode);
		});
		$(div3).append(input3_2);
		html = "<input type='radio' name='radio"+this.id+"' ";
		if (disabled)
			html += "disabled='disabled' ";
		if ($(this.minViewMode_node).text()=='years')
			html += "checked='true' ";
		html += "value='years' > Years </input>";
		var input3_3 = $(html);
		$(input3_3).click(function (){
			$(self.minViewMode_node).text($(this).val());
			UIFactory["Calendar"].update(self,langcode);
		});
		$(div3).append(input3_3);
		$(group3).append(div3);
		$(form).append(group3);
		}
	//-----
	$("#"+dest).append(form);
};

//==================================
UIFactory["Calendar"].prototype.save = function()
//==================================
{
	UICom.UpdateResource(this.id,writeSaved);
	this.refresh();
};

//==================================
UIFactory["Calendar"].prototype.refresh = function()
//==================================
{
	for (dest in this.display) {
		this.displayView(dest,null,this.display[dest])
	};

};



//----------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
//-------------------- RIGHTS ------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------

var roles_by_role = {};

//==================================
var RoleRights = function(node,uuid)
//==================================
{
	this.node = node;
	this.uuid = uuid;
	this.name = $(node).attr('name');
	this.rights = {};
	this.rights['RD'] = $("right",node).attr("RD");
	this.rights['WR'] = $("right",node).attr("WR");
	this.rights['DL'] = $("right",node).attr("DL");
	this.rights['SB'] = $("right",node).attr("SB");
};

//==================================
RoleRights.update = function(rolename,attribute,value,checked)
//==================================
{
	var role = roles_by_role[rolename];
	if (checked!=undefined && !checked)
		value = "N";
	role.rights[attribute] = value;
	RoleRights.save(rolename);
};

//==================================
RoleRights.save = function(rolename)
//==================================
{
	var role = roles_by_role[rolename];
	var xml = "";
	xml += "<node>";
	xml += "<role name='"+role.name+"'>";
	xml += "<right RD='"+role.rights['RD']+"' WR='"+role.rights['WR']+"' DL='"+role.rights['DL']+"' SB='"+role.rights['SB']+"' />";
	xml += "</role>";
	xml += "</node>";
	$.ajax({
		type : "POST",
		dataType : "xml",
		contentType: "application/xml",
		data:xml,
		url : serverBCK_API+"/nodes/node/"+role.uuid+"/rights"
	});
};


//==================================
RoleRights.prototype.getEditor = function()
//==================================
{
	var html = "";
	html+= "<tr>";
	html+= "<td>"+this.name+"</td>";
	html+= "<td style='text-align:center'><input type='checkbox' onchange=\"javascript:RoleRights.update('"+this.name+"','RD',this.value,this.checked)\" value='Y'";
	if (this.rights['RD']=='Y')
		html += " checked=true' ";
	html+= "></td>";
	html+= "<td style='text-align:center'><input type='checkbox' onchange=\"javascript:RoleRights.update('"+this.name+"','WR',this.value,this.checked)\" value='Y'";
	if (this.rights['WR']=='Y')
		html += " checked=true' ";
	html+= "></td>";
	html+= "<td style='text-align:center'><input type='checkbox' onchange=\"javascript:RoleRights.update('"+this.name+"','DL',this.value,this.checked)\" value='Y'";
	if (this.rights['DL']=='Y')
		html += " checked=true' ";
	html+= "></td>";
	html+= "<td style='text-align:center'><input type='checkbox' onchange=\"javascript:RoleRights.update('"+this.name+"','SB',this.value,this.checked)\" value='Y'";
	if (this.rights['SB']=='Y')
		html += " checked=true' ";
	html+= "></td>";
	html+= "</tr>";
	return html;
};

//==================================
UIFactory["Node"].prototype.getRights = function()
//==================================
{
	var rights = null;
	$.ajaxSetup({async: false});
	$.ajax({
		type : "GET",
		dataType : "xml",
		url : serverBCK_API+"/nodes/node/"+this.id+"/rights",
		success : function(data) {
			rights = data;
		}
	});
	$.ajaxSetup({async: true});
	return rights;
}


//==================================
UIFactory["Node"].prototype.displayRights = function(destid)
//==================================
{
	var html = "";
	roles_by_role = {};
	var rights = this.getRights(this.id);
	var roles = $("role",rights);
	html += "<table id='rights'>";
	html+= "<tr><td></td><td> Read </td><td> Write </td><td> Delete </td><td> Submit </td>";
	for (var i=0;i<roles.length;i++){
		var rolename = $(roles[i]).attr("name");
		roles_by_role[rolename] = new RoleRights(roles[i],uuid);
	}
	for (role in roles_by_role) {
		html += roles_by_role[role].getEditor();
	}
	html += "<table>";
	$("#"+destid).append($(html));
}


//----------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
//-------------------- METADATA ----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------
//--------- styles getters to display nodes ---------------
//---------------------------------------------------------

//==================================================
UIFactory["Node"].getMetadataEpm = function(data,attribute,number)
//==================================================
{
	var html = "";
	if (data.getAttribute(attribute)!=undefined && data.getAttribute(attribute)!="") {
		var value = data.getAttribute(attribute);
		if (attribute.indexOf("inparent-othercss")>-1)
			html += attribute.substring(17) + value;
		else if (attribute.indexOf("node-othercss")>-1)
			html += attribute.substring(13) + value;
		else if (attribute.indexOf("othercss")>-1)
			html += attribute.substring(8) + value;
		else if (attribute.indexOf("node-")>-1)
			html += attribute.substring(5) + ":" + value;
		else if (attribute.indexOf("inparent-")>-1)
			html += attribute.substring(9) + ":" + value;
		else
			html += attribute + ":" + value;
		if (attribute.indexOf("font-size")>-1 && number && value.indexOf('%')<0 && value.indexOf('px')<0 && value.indexOf('pt')<0)
			html += 'px';			
		else if (number && value.indexOf('%')<0 && value.indexOf('px')<0 && value.indexOf('pt')<0)
			html += 'px';
		html += ';';
	}	return html;
};

//==================================================
UIFactory["Node"].getOtherMetadataEpm = function(data,attribute)
//==================================================
{
	var html = "";
	if (data.getAttribute(attribute)!=undefined && data.getAttribute(attribute)!="") {
		var value = data.getAttribute(attribute);
		html += value;
	}	return html;
};

//---------------------------------------------------------
//--------------------- display metainfo ------------------
//---------------------------------------------------------

//==================================================
UIFactory["Node"].getMetadataInfo = function(data,attribute)
//==================================================
{
	var html = "";
	if (data.getAttribute(attribute)!=undefined && data.getAttribute(attribute)!="")
		html += "<span>"+attribute+":"+data.getAttribute(attribute)+"| </span>";
	return html;
};

//==================================================
UIFactory["Node"].getMetadataEpmInfo = function(data,attribute)
//==================================================
{
	var html = "";
	if ($("metadata-epm",data).attr(attribute)!=undefined && $("metadata-epm",data).attr(attribute)!="")
		html += "<span>"+attribute+":"+$("metadata-epm",data).attr(attribute)+"| </span>";
	return html;
};

//==================================================
UIFactory["Node"].prototype.displayMetainfo = function(destid)
//==================================================
{
	var data = this.node;
	var html = "";
	var type = $(data).prop("nodeName");
	if (type=='asmContext') {
		var asmResources = $("asmResource",data);
		type = $(asmResources[2]).attr('xsi_type');
	}
	html += "<span>"+karutaStr[languages[LANGCODE]][type]+" - </span>";
	var metadata = data.querySelector("metadata");
	var metadatawad = data.querySelector("metadata-wad");
	if (metadata.getAttribute('semantictag')!=undefined && metadata.getAttribute('semantictag')!="")
		html += "<span>semantictag:"+metadata.getAttribute('semantictag')+"| </span>";
	html += UIFactory.Node.getMetadataInfo(metadatawad,'seenoderoles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'editresroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'delnoderoles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'commentnoderoles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'submitroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'editnoderoles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'duplicateroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'incrementroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'query');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'display');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'menuroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'notifyroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'graphicerroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'resizeroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'edittargetroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'showroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'showtoroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'moveroles');
	html += UIFactory.Node.getMetadataInfo(metadatawad,'inline');
	$("#"+destid).html(html);
};

//==================================================
UIFactory["Node"].displayMetainfo = function(destid,data)  // for backward compatibiliy
//==================================================
{
	var uuid = data.getAttribute("id");
	UICom.structure["ui"][uuid].displayMetainfo(destid);
};

//==================================================
UIFactory["Node"].prototype.displayMetaEpmInfos = function(destid,data)
//==================================================
{
	var html = "";
	html += UIFactory["Node"].getMetadataEpmInfo(data,'node-font-weight');
	html += UIFactory["Node"].getMetadataEpmInfo(data,'node-font-style');
	html += UIFactory["Node"].getMetadataEpmInfo(data,'node-text-align');
	html += UIFactory["Node"].getMetadataEpmInfo(data,'node-font-size');
	html += UIFactory["Node"].getMetadataEpmInfo(data,'node-font-weight');
	html += UIFactory["Node"].getMetadataEpmInfo(data,'node-color');
	html += UIFactory["Node"].getMetadataEpmInfo(data,'node-padding-top');
	html += UIFactory["Node"].getMetadataEpmInfo(data,'node-background-color');
	html += UIFactory["Node"].getMetadataEpmInfo(data,'node-othercss');
	$("#"+destid).html(html);
};


//---------------------------------------------------------
//-------------metadata-wad editors -----------------------
//---------------------------------------------------------

//==================================================
UIFactory["Node"].prototype.displayMetadataDisplayTypeAttributeEditor = function(destid,attribute,yes_no,disabled)
//==================================================
{
	var display_types = ['standard','basic','model'];
	var value = $(this.metadata).attr('display-type');
	var langcode = LANGCODE;
	if (value==null || value==undefined || value=='undefined')
		value = "";
	var html = "";
	html += "<div class='form-group form-row'>";
	html += "  <label class='col-4 control-label'>"+karutaStr[languages[langcode]][attribute]+"</label>";
		html += "  <div class='col-8'><select class='form-control form-control-sm' onchange=\"javascript:UIFactory.Node.updateMetadataSelectAttribute('"+this.id+"','"+attribute+"',this)\"";
		if(disabled!=null && disabled)
			html+= " disabled='disabled' ";			
		html+= ">";
		for (var i=0; i<display_types.length; i++) {
			html += "<option value='"+display_types[i]+"'";
			if (value==display_types[i])
				html += " selected ";
			html += ">"+display_types[i]+"</option>";
		}
		html+= "</select>";
		html+= "</div>";
	html += "</div>";
	$("#"+destid).append($(html));
};

//==================================================
UIFactory["Node"].prototype.displayMetadataMenuTypeAttributeEditor = function(destid,attribute,yes_no,disabled)
//==================================================
{
	var menu_types = ['vertical','horizontal'];
	var value = $(this.metadata).attr('menu-type');
	var langcode = LANGCODE;
	if (value==null || value==undefined || value=='undefined')
		value = "";
	var html = "";
	html += "<div class='form-group form-row'>";
	html += "  <label class='col-4 control-label'>"+karutaStr[languages[langcode]][attribute]+"</label>";
		html += "  <div class='col-8'><select class='form-control form-control-sm' onchange=\"javascript:UIFactory.Node.updateMetadataSelectAttribute('"+this.id+"','"+attribute+"',this)\"";
		if(disabled!=null && disabled)
			html+= " disabled='disabled' ";			
		html+= ">";
		for (var i=0; i<menu_types.length; i++) {
			html += "<option value='"+menu_types[i]+"'";
			if (value==menu_types[i])
				html += " selected ";
			html += ">"+menu_types[i]+"</option>";
		}
		html+= "</select>";
		html+= "</div>";
	html += "</div>";
	$("#"+destid).append($(html));
};


//==================================================
UIFactory["Node"].prototype.displayMetadataAttributeEditor = function(destid,attribute,yes_no,disabled)
//==================================================
{
	var value = $(this.metadata).attr(attribute);
	var langcode = LANGCODE;
	if (value==null || value==undefined || value=='undefined')
		value = "";
	var html = "";
	if (yes_no!=null && yes_no) {
		html += "<div class='input-group '>";
		html += "	<div class='input-group-prepend'>";
		html += "		<div class='input-group-text' id='"+attribute+this.id+"'>"+karutaStr[languages[langcode]][attribute]+"</div>";
		html += "	</div>";
		html += "  <input class='form-control' type='checkbox' onchange=\"javascript:UIFactory['Node'].updateMetadataAttribute('"+this.id+"','"+attribute+"',this.value,this.checked)\" value='Y'";		
		if(disabled!=null && disabled)
			html+= " disabled='disabled' ";			
		if (value=='Y')
			html+= " checked ";
		html+= "></div>";
	}
	else {
		html += "<div class='input-group '>";
		html += "	<div class='input-group-prepend'>";
		html += "		<span class='input-group-text' id='"+attribute+this.id+"'>"+karutaStr[languages[langcode]][attribute]+"</span>";
		html += "	</div>";
		html += "<input type='text' class='form-control' aria-label='"+karutaStr[languages[langcode]][attribute]+"' aria-describedby='"+attribute+this.id+"' onchange=\"javascript:UIFactory['Node'].updateMetadataAttribute('"+this.id+"','"+attribute+"',this.value)\" value=\""+value+"\"";
		if (disabled!=null && disabled)
			html+= " disabled='disabled'";
		html+= ">";
		html += "</div>";
	}
	$("#"+destid).append($(html));
};

//==================================================
UIFactory["Node"].prototype.displayMetadataWadAttributeEditor = function(destid,attribute,yes_no,disabled)
//==================================================
{
	var value = $(this.metadatawad).attr(attribute);
	var langcode = LANGCODE;
	if ((value==null || value==undefined || value=='undefined') && attribute=='display')
		value = "Y";
	if (value==null || value==undefined || value=='undefined')
		value = "";
	var html = "";
	if (yes_no!=null && yes_no) {
		html += "<div class='input-group '>";
		html += "	<div class='input-group-prepend'>";
		html += "		<div class='input-group-text' id='"+attribute+this.id+"'>"+karutaStr[languages[langcode]][attribute]+"</div>";
		html += "	</div>";
		html += "  <input class='form-control' type='checkbox' onchange=\"javascript:UIFactory['Node'].updateMetadataWadAttribute('"+this.id+"','"+attribute+"',this.value,this.checked)\" value='Y'";		
		if(disabled!=null && disabled)
			html+= " disabled='disabled' ";			
		if (value=='Y')
			html+= " checked ";
		html+= "></div>";
	}
	else if (attribute.indexOf('seltype')>-1){
		var choices = [{code:'select',label:'Select'},{code:'radio',label:'Radio'},{code:'click',label:'click'},{code:'completion',label:'Auto-complete'}];
		html += "<div class='input-group '>";
		html += "	<div class='input-group-prepend' style='margin-right:5px'>";
		html += "		<span class='input-group-text' id='"+attribute+this.id+"'>"+karutaStr[languages[langcode]][attribute]+"</span>";
		html += "	</div>";
		for (var i=0; i<choices.length; i++){
			html +="	<div class='form-check form-check-inline'>";
			html += "		<input class='form-check-input' type='radio' name='"+attribute+this.id+"' onchange=\"javascript:UIFactory.Node.updateMetadataWadAttribute('"+this.id+"','"+attribute+"',this.value)\" value='"+choices[i].code+"' ";
			if (value==choices[i].code)
				html +=" checked";
			html +=">";
			html +="		<label class='form-check-label'>"+choices[i].label+"</label>";
			html += "	</div>";
		}
		html += "</div>";
	} else if (attribute.indexOf('roles')>-1){
		this.displaySelectRole(destid,attribute,yes_no,disabled);
	} else {
		html += "<div class='input-group '>";
		html += "	<div class='input-group-prepend'>";
		html += "		<span class='input-group-text' id='"+attribute+this.id+"'>"+karutaStr[languages[langcode]][attribute]+"</span>";
		html += "	</div>";
		html += "<input type='text' class='form-control' aria-label='"+karutaStr[languages[langcode]][attribute]+"' aria-describedby='"+attribute+this.id+"' onchange=\"javascript:UIFactory['Node'].updateMetadataWadAttribute('"+this.id+"','"+attribute+"',this.value)\" value=\""+value+"\"";
		if (disabled!=null && disabled)
			html+= " disabled='disabled'";
		html+= ">";
		html += "</div>";
	}
	if (html!="")
		$("#"+destid).append($(html));
};

//==================================
UIFactory["Node"].prototype.displayMetadatawWadTextAttributeEditor = function(destid,attribute,type)
//==================================
{
	var nodeid = this.id;
	var text = $(this.metadatawad).attr(attribute)
	if (type==null)
		type = 'default';
	if (text==undefined || text=='undefined')
		text="";
	if (type=='default')
		html = "<div id='"+attribute+"_"+nodeid+"'><textarea id='"+nodeid+"_"+attribute+"' class='form-control' style='height:50px'>"+text+"</textarea></div>";
	else if(type.indexOf('x')>-1) {
		var height = type.substring(type.indexOf('x')+1);
		html = "<div id='"+attribute+"_"+nodeid+"'><textarea id='"+nodeid+"_"+attribute+"' class='form-control' style='height:"+height+"px'>"+text+"</textarea></div>";
	}
	$("#"+destid).append($(html));
	//---------------------------
	if (attribute=='help')
		$("#"+nodeid+"_"+attribute).wysihtml5({toolbar:{"size":"xs","font-styles": false,"html": true,"blockquote": false,"image": false,"link": false},'uuid':nodeid,locale:languages[LANG],'events': {'change': function(){UIFactory.Node.updateMetadatawWadTextAttribute(nodeid,attribute);} }});
	else
		$("#"+nodeid+"_"+attribute).change(function(){UIFactory.Node.updateMetadatawWadTextAttribute(nodeid,attribute);});
	//---------------------------
};

//==================================
UIFactory["Node"].prototype.displaySelectRole= function(destid,attribute,yes_no,disabled) 
//==================================
{
	var rolesarray = [];
	var value = $(this.metadatawad).attr(attribute);
	if (value==null || value==undefined || value=='undefined')
		value = "";
	var nodeid = this.id;
	var langcode = LANGCODE;
	var html = "";
	html += "<div class='input-group '>";
	html += "	<div class='input-group-prepend'>";
	html += "		<div class='input-group-text'>"+karutaStr[languages[langcode]][attribute]+"</div>";
	html += "	</div>";
	html += "	<input id='"+attribute+nodeid+"' type='text' class='form-control'  onchange=\"javascript:UIFactory['Node'].updateMetadataWadAttribute('"+nodeid+"','"+attribute+"',this.value)\" value=\""+value+"\"";
	if(disabled!=null && disabled)
		html+= " disabled='disabled' ";			
	html += ">";
	if(disabled==null || !disabled) {
		html += "<div class='input-group-append'>";
		html += "	<button class='btn btn-select-role dropdown-toggle' type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'></button>";
		html += "	<div class='dropdown-menu dropdown-menu-right button-role-caret'>";
//		html += "		<div class='dropdown-menu'>";
		html += "			<a class='dropdown-item' value='' onclick=\"$('#"+attribute+nodeid+"').val('');$('#"+attribute+nodeid+"').change();\")>&nbsp;</a>";
		//---------------------
		for (role in UICom.roles) {
			html += "		<a  class='dropdown-item' value='"+role+"' onclick=\"$('#"+attribute+nodeid+"').attr('value','"+role+"');$('#"+attribute+nodeid+"').change();\")>"+role+"</a>";
			rolesarray[rolesarray.length] = {'libelle':role};
		}
//		html += "		</div>";
		html += "	</div>";
		html += "</div>";
	}
	html += "</div>";
	$("#"+destid).append($(html));
	addautocomplete(document.getElementById(attribute+nodeid), rolesarray);

}

//==================================
function addautocomplete(input,arrayOfValues) {
//==================================
	var currentFocus;
	input.addEventListener("input", function(e) {
		var a, b, i, val = this.value.substring(this.value.lastIndexOf(" ")+1);
		closeAllLists();
		if (!val) { return false;}
	 	currentFocus = -1;
		a = document.createElement("DIV");
		a.setAttribute("id", this.id + "autocomplete-list");
		a.setAttribute("class", "autocomplete-items");
		this.parentNode.appendChild(a);
		for (i = 0; i < arrayOfValues.length; i++) {
			var indexval = arrayOfValues[i].libelle.toUpperCase().indexOf(val.toUpperCase());
			if (indexval>-1) {
				b = document.createElement("DIV");
				b.innerHTML = arrayOfValues[i].libelle.substr(0, indexval);
				b.innerHTML += "<strong>" + arrayOfValues[i].libelle.substr(indexval,val.length) + "</strong>";
				b.innerHTML += arrayOfValues[i].libelle.substr(indexval+val.length);
				b.innerHTML += "<input type='hidden' label=\""+arrayOfValues[i].libelle+"\" >";
				b.addEventListener("click", function(e) {
					if (input.value.lastIndexOf(" "))
						input.value = input.value.substring(0,input.value.lastIndexOf(" ")+1) + $("input",this).attr('label');
					else
						input.value = $("input",this).attr('label');
					$(input).change();
					closeAllLists();
				});
				a.appendChild(b);
			}
		}
	});
	input.addEventListener("keydown", function(e) {
		var x = document.getElementById(this.id + "autocomplete-list");
		if (x) x = x.getElementsByTagName("div");
		if (e.keyCode == 40) {
			currentFocus++;
		addActive(x);
		} else if (e.keyCode == 38) { //up
			currentFocus--;
			addActive(x);
		} else if (e.keyCode == 13) {
			e.preventDefault();
			if (currentFocus > -1) {
				if (x) x[currentFocus].click();
			}
		}
	});
	function addActive(x) {
		if (!x) return false;
		removeActive(x);
		if (currentFocus >= x.length) currentFocus = 0;
		if (currentFocus < 0) currentFocus = (x.length - 1);
		x[currentFocus].classList.add("autocomplete-active");
	}
	function removeActive(x) {
		for (var i = 0; i < x.length; i++) {
			x[i].classList.remove("autocomplete-active");
		}
	}
	function closeAllLists(elmnt) {
		var x = document.getElementsByClassName("autocomplete-items");
		for (var i = 0; i < x.length; i++) {
			if (elmnt != x[i] && elmnt != input) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}
	document.addEventListener("click", function (e) {
		closeAllLists(e.target);
	});
}

//==================================================
UIFactory["Node"].prototype.displayMetadataAttributesEditor = function(destid)
//==================================================
{
	var langcode = LANGCODE;
	var html = "";
	html += "<form id='metadata' class='metadata'>";
	html += "	<div id='metadata-root'></div>";
	html += "	<div id='metadata-part1'></div>"
	html += "	<h4>"+karutaStr[LANG]['metadata']+"</h4>";
	html += "	<div id='metadata-rights'></div>";
	html += "	<div id='metadata-part2'></div>";
	html += "	<div id='metadata_texts'></div>";
	html += "</form>";
	$("#"+destid).append($(html));
	//---------------------------------------------------
	var name = this.asmtype;
	var semtag =  ($("metadata",this.node)[0]==undefined)?'': $($("metadata",this.node)[0]).attr('semantictag');
	if (semtag==undefined) // for backward compatibility - node without semantic tag
		semtag = '';
	var resource_type = "";
	if (this.resource!=null)
		resource_type = this.resource.type;
	if (name=='asmRoot') {
		this.displayMetadataAttributeEditor('metadata-root','list-novisible',true);
		this.displayMetadataAttributeEditor('metadata-root','complex',true);
		this.displayMetadataAttributeEditor('metadata-root','export-pdf',true);
		this.displayMetadataAttributeEditor('metadata-root','export-rtf',true);
		this.displayMetadataAttributeEditor('metadata-root','export-htm',true);
		this.displayMetadataAttributeEditor('metadata-root','public',true);
	}
	if (name=='asmContext' && this.resource.type=='Proxy')
		this.displayMetadataAttributeEditor('metadata-part1','semantictag',false,true);
	else
		this.displayMetadataAttributeEditor('metadata-part1','semantictag');
	if (languages.length>1) { // multilingual application
		this.displayMetadataAttributeEditor('metadata-part1','multilingual-node',true);
		if (name=='asmContext') {
			this.displayMetadataAttributeEditor('metadata-part1','multilingual-resource',true);
		}
	}
	if (name=='asmContext') {
		if (this.resource.type=='Field' || this.resource.type=='TextField' || this.resource.type=='Get_Resource' || this.resource.type=='Get_Get_Resource' || this.resource.type=='Get_Double_Resource')
			this.displayMetadataAttributeEditor('metadata-part1','encrypted',true);
	}
	if (USER.admin)
		this.displayRights('metadata-rights');
	this.displayMetadataWadAttributeEditor('metadata-part2','seenoderoles');
	this.displayMetadataWadAttributeEditor('metadata-part2','delnoderoles');
	if ((name=='asmRoot' || name=='asmStructure' || name=='asmUnit' || name=='asmUnitStructure') && semtag.indexOf('node_resource')<0 && this.structured_resource==null)	{
		this.displayMetadataWadAttributeEditor('metadata-part2','editresroles',false,true);
	}
	else
		this.displayMetadataWadAttributeEditor('metadata-part2','editresroles');
	this.displayMetadataWadAttributeEditor('metadata-part2','commentnoderoles');
	this.displayMetadataWadAttributeEditor('metadata-part2','submitroles');
	if (name=='asmRoot' || name=='asmStructure' || name=='asmUnit' || name=='asmUnitStructure')
		this.displayMetadataWadAttributeEditor('metadata-part2','submitall',true);
	this.displayMetadataWadAttributeEditor('metadata-part2','editnoderoles');
	this.displayMetadataWadAttributeEditor('metadata-part2','duplicateroles');
	this.displayMetadataWadAttributeEditor('metadata-part2','incrementroles');
	if (semtag=='bubble_level1')
		this.displayMetadataWadAttributeEditor('metadata-part2','seeqrcoderoles');
	if (this.resource_type=='Proxy')
		this.displayMetadataWadAttributeEditor('metadata-part2','edittargetroles');
	if (name=='asmContext' && this.resource.type=='Image')
		this.displayMetadataWadAttributeEditor('metadata-part2','resizeroles');
	this.displayMetadataWadAttributeEditor('metadata-part2','graphicerroles');
	this.displayMetadataWadAttributeEditor('metadata-part2','moveroles');
	this.displayMetadataWadAttributeEditor('metadata-part2','showroles');
	this.displayMetadataWadAttributeEditor('metadata-part2','printroles');
//	if ($(this.metadatawad).attr('showroles')!='')
//		this.displayMetadataWadAttributeEditor(this.id,'private',$(this.metadatawad).attr('private'),true);
	this.displayMetadataWadAttributeEditor('metadata-part2','showtoroles');
	this.displayMetadataWadAttributeEditor('metadata-part2','editboxtitle');
	if (name=='asmContext' && this.resource.type=='TextField')
		this.displayMetadataWadAttributeEditor('metadata-part2','maxword');
	//--------------------------------------
	this.displayMetadataWadAttributeEditor('metadata-part2','display',true);
	if (name=='asmUnitStructure')
		this.displayMetadataWadAttributeEditor('metadata-part2','collapsible',true);
	if (name=='asmContext' && this.resource.type!='Proxy' && this.resource.type!='Audio' && this.resource.type!='Video' && this.resource.type!='Document' && this.resource.type!='Image' && this.resource.type!='URL' && this.resource.type!='Oembed')
		this.displayMetadataAttributeEditor('metadata-part2','inline',true);
//	this.displayMetadataWadAttributeEditor(this.id,'veriffunction',$(this.metadatawad).attr('veriffunction'));
	if (resource_type=='Get_Resource' || resource_type=='Get_Get_Resource') {
		this.displayMetadataWadAttributeEditor('metadata-part2','seltype');
	}
	//----------------------Search----------------------------
	if (resource_type=='Get_Resource' || resource_type=='Get_Double_Resource' || resource_type=='Get_Get_Resource' || resource_type=='Proxy' || resource_type=='Action' || resource_type=='URL2Unit' || name=='asmUnitStructure' || name=='asmUnit' || name=='asmStructure') {
		html  = "<hr><label>"+karutaStr[languages[langcode]]['query'+resource_type]+"</label>";
		$("#metadata_texts").append($(html));
		this.displayMetadatawWadTextAttributeEditor('metadata_texts','query');
	}
	//----------------------Share----------------------------
	if (name=='asmRoot' || name=='asmStructure' || name=='asmUnit' || name=='asmUnitStructure') {
		html  = "<hr><label>"+karutaStr[languages[langcode]]['shareroles'];
		if (languages.length>1){
			var first = true;
			for (var i=0; i<languages.length;i++){
				if (!first)
					html += "/";
				html += karutaStr[languages[i]]['shareroles2'];
				first = false;
			}
		} else {
			html += karutaStr[languages[langcode]]['shareroles2'];
		}
		html += karutaStr[languages[langcode]]['shareroles3']+"</label>";
		$('#metadata_texts').append($(html));
		this.displayMetadatawWadTextAttributeEditor('metadata_texts','shareroles');
	}
	//----------------------Menu----------------------------
	if (name=='asmRoot' || name=='asmStructure' || name=='asmUnit' || name=='asmUnitStructure') {
		html  = "<hr><label>"+karutaStr[languages[langcode]]['menuroles'];
		if (languages.length>1){
			var first = true;
			for (var i=0; i<languages.length;i++){
				if (!first)
					html += "/";
				html += karutaStr[languages[i]]['menuroles2'];
				first = false;
			}
		} else {
			html += karutaStr[languages[langcode]]['menuroles2'];
		}
		html += karutaStr[languages[langcode]]['menuroles3']+"</label>";
		$('#metadata_texts').append($(html));
		this.displayMetadatawWadTextAttributeEditor('metadata_texts','menuroles');
	}
	//------------------------Help-------------------------
	html = "<br><hr><label>"+karutaStr[languages[langcode]]['help'];
	if (languages.length>1){
		var first = true;
		for (var i=0; i<languages.length;i++){
			if (!first)
				html += "/";
			html += karutaStr[languages[i]]['help2'];
			first = false;
		}
	}
	html += karutaStr[languages[langcode]]['help3']+"</label>";
	$('#metadata_texts').append($(html));
	this.displayMetadatawWadTextAttributeEditor('metadata_texts','help');
};

//---------------------------------------------------------
//-------------metadata-epm editors -----------------------
//---------------------------------------------------------

//==================================================
UIFactory["Node"].prototype.displayMetadataEpmDisplayViewAttributeEditor = function(destid,attribute,value,yes_no,disabled)
//==================================================
{
	var nodeid = this.id;
	var langcode = LANGCODE;
	var asmtype = this.asmtype;
	var nodetype = (asmtype=='asmContext') ? "resource" : "node";
	var resourcetype = null;
	if (this.resource!=null)
		resourcetype = UICom.structure["ui"][nodeid].resource.type;
	if (value==null || value==undefined || value=='undefined')
		value = "";
	var html = "";
	html += "<div class='input-group '>";
	html += "	<div class='input-group-prepend'>";
	html += "		<div class='input-group-text' id='"+attribute+nodeid+"'>"+karutaStr[languages[langcode]][attribute]+"</div>";
	html += "	</div>";
	html += "	<select class='form-control' onchange=\"javascript:UIFactory.Node.updateMetadataEpmSelectAttribute('"+nodeid+"','"+attribute+"',this)\"";
	if(disabled!=null && disabled)
		html+= " disabled='disabled' ";			
	html+= ">";
	html+= "		<option value=''></option>";
	for (dest in displayView[g_display_type][nodetype]) {
		html += "	<option value='"+displayView[g_display_type][nodetype][dest]+"'";
		if (value==displayView[g_display_type][nodetype][dest])
			html += " selected ";
		html += ">"+displayView[g_display_type][nodetype][dest]+"</option>";
	}
	if (resourcetype!=undefined && resourcetype!=null)
		html+= "		<option disabled>────────────────────</option>";
	for (dest in displayView[g_display_type][nodetype][resourcetype]) {
		html += "<option value='"+displayView[g_display_type][nodetype][resourcetype][dest]+"'";
		if (value==displayView[g_display_type][nodetype][resourcetype][dest])
			html += " selected ";
		html += ">"+displayView[g_display_type][nodetype][resourcetype][dest]+"</option>";
	}
	html+= "	</select>";
	html+= "</div>";
	$("#"+destid).append($(html));
};


//==================================================
UIFactory["Node"].prototype.displayMetadataEpmAttributeEditor = function(destid,attribute,value)
//==================================================
{
	var nodeid = this.id;
	var langcode = LANGCODE;
	if (value==null || value==undefined || value=='undefined')
		value = "";
	var html = "";
	var attribute_label = attribute;
	if (attribute.indexOf('node-')>-1)
		attribute_label = attribute.substring(5);
	if (attribute.indexOf('inparent-')>-1)
		attribute_label = attribute.substring(9);
	if (attribute.indexOf('font-weight')>-1){
		var choices = [{code:'normal',label:'Normal'},{code:'bold',label:'Bold'}];
		html += "<div class='input-group '>";
		html += "	<div class='input-group-prepend' style='margin-right:5px'>";
		html += "		<span class='input-group-text' id='"+attribute+nodeid+"'>"+karutaStr[languages[langcode]][attribute_label]+"</span>";
		html += "	</div>";
		for (var i=0; i<choices.length; i++){
			html +="	<div class='form-check form-check-inline'>";
			html += "		<input class='form-check-input' type='radio' name='"+attribute+nodeid+"' onchange=\"javascript:UIFactory.Node.updateMetadataEpmAttribute('"+nodeid+"','"+attribute+"',this.value)\" value='"+choices[i].code+"' ";
			if (value==choices[i].code)
				html +=" checked";
			html +=">";
			html +="		<label class='form-check-label'>"+choices[i].label+"</label>";
			html += "	</div>";
		}
		html += "</div>";
	}
	else if (attribute.indexOf('font-style')>-1){
		var choices = [{code:'normal',label:'Normal'},{code:'italic',label:'Italic'}];
		html += "<div class='input-group '>";
		html += "	<div class='input-group-prepend' style='margin-right:5px'>";
		html += "		<span class='input-group-text' id='"+attribute+nodeid+"'>"+karutaStr[languages[langcode]][attribute_label]+"</span>";
		html += "	</div>";
		for (var i=0; i<choices.length; i++){
			html +="	<div class='form-check form-check-inline'>";
			html += "		<input class='form-check-input' type='radio' name='"+attribute+nodeid+"' onchange=\"javascript:UIFactory.Node.updateMetadataEpmAttribute('"+nodeid+"','"+attribute+"',this.value)\" value='"+choices[i].code+"' ";
			if (value==choices[i].code)
				html +=" checked";
			html +=">";
			html +="		<label class='form-check-label'>"+choices[i].label+"</label>";
			html += "	</div>";
		}
		html += "</div>";
	}
	else if (attribute.indexOf('color')>-1){
		html += "<div class='input-group '>";
		html += "	<div class='input-group-prepend'>";
		html += "		<span class='input-group-text' id='"+attribute+nodeid+"'>"+karutaStr[languages[langcode]][attribute_label]+"</span>";
		html += "	</div>";
		html += "	<input type='text' class='form-control pickcolor' aria-label='"+karutaStr[languages[langcode]][attribute]+"' onchange=\"javascript:UIFactory['Node'].updateMetadataEpmAttribute('"+nodeid+"','"+attribute+"',this.value)\" value=\""+value+"\">";
		html += "</div>";
//		html += "  <input type='text' class='form-control pickcolor' onchange=\"javascript:UIFactory['Node'].updateMetadataEpmAttribute('"+nodeid+"','"+attribute+"',this.value)\" value='"+value+"' >";
	}
	else if (attribute.indexOf('text-align')>-1){
		var choices = [{code:'left',label:'Left'},{code:'right',label:'Right'},{code:'center',label:'Center'},{code:'justify',label:'Justify'}];
		html += "<div class='input-group '>";
		html += "	<div class='input-group-prepend' style='margin-right:5px'>";
		html += "		<span class='input-group-text' id='"+attribute+nodeid+"'>"+karutaStr[languages[langcode]][attribute_label]+"</span>";
		html += "	</div>";
		for (var i=0; i<choices.length; i++){
			html +="	<div class='form-check form-check-inline'>";
			html += "		<input class='form-check-input' type='radio' name='"+attribute+nodeid+"' onchange=\"javascript:UIFactory.Node.updateMetadataEpmAttribute('"+nodeid+"','"+attribute+"',this.value)\" value='"+choices[i].code+"' ";
			if (value==choices[i].code)
				html +=" checked";
			html +=">";
			html +="		<label class='form-check-label'>"+choices[i].label+"</label>";
			html += "	</div>";
		}
		html += "</div>";
	}
	else {
		html += "<div class='input-group '>";
		html += "	<div class='input-group-prepend'>";
		html += "		<span class='input-group-text' id='"+attribute+nodeid+"'>"+karutaStr[languages[langcode]][attribute_label]+"</span>";
		html += "	</div>";
		html += "	<input type='text' class='form-control' aria-label='"+karutaStr[languages[langcode]][attribute]+"' aria-describedby='"+attribute+nodeid+"' onchange=\"javascript:UIFactory['Node'].updateMetadataEpmAttribute('"+nodeid+"','"+attribute+"',this.value)\" value=\""+value+"\">";
		html += "</div>";
	}
	$("#"+destid).append($(html));
};

//==================================================
UIFactory["Node"].prototype.displayMetadataEpmAttributesEditor = function(destid)
//==================================================
{
	var userrole = $(this.node).attr('role');
	if (userrole==undefined || userrole=='')
		userrole = "norole";
	var editnoderoles = ($(this.metadatawad).attr('editnoderoles')==undefined)?'none':$(this.metadatawad).attr('editnoderoles');
	var graphicerroles = ($(this.metadatawad).attr('graphicerroles')==undefined)?'none':$(this.metadatawad).attr('graphicerroles');
	if (USER.admin || g_userroles[0]=='designer' || graphicerroles.containsArrayElt(g_userroles) || graphicerroles.indexOf(userrole)>-1) {
		var langcode = LANGCODE;
		var html = "";
		html += "<form id='metadata-epm' class='metadata'>";
		html += "	<div id='metadata-epm-root'></div>";
		html += "	<div id='metadata-epm-part1'></div>"
		html += "<h4>"+karutaStr[languages[langcode]]['label']+"</h4>";
		html += "	<div id='metadata-epm-label'></div>";
		if (name=='asmContext') 
			html += "<hr><h4>"+karutaStr[languages[langcode]]['resource']+"</h4>";
		else
			html += "<hr><h4>"+karutaStr[languages[langcode]]['node']+"</h4>";
		html += "	<div id='metadata-node-resouce'></div>";
		if (name=='asmStructure' || name=='asmUnit') {
			html += "<hr><h4>"+karutaStr[languages[langcode]]['inparent']+"</h4>";
			html += "	<div id='metadata-inparent'></div>";
		}
		html += "</form>";
		$("#"+destid).append($(html));
		//---------------------------------------------------
		//---------------------
		var name = this.asmtype;
			//----------------------------------
		if (USER.admin || g_userroles[0]=='designer' || editnoderoles.containsArrayElt(g_userroles) || editnoderoles.indexOf(userrole)>-1) {
			if (name=='asmRoot') {
				this.displayMetadataDisplayTypeAttributeEditor('metadata-epm-root','display-type');
				this.displayMetadataMenuTypeAttributeEditor('metadata-epm-root','menu-type');
				this.displayMetadataEpmAttributeEditor('metadata-epm-root','cssfile',$(this.metadata).attr('cssfile'));
				html  = "<label>"+karutaStr[languages[langcode]]['csstext']+"</label>";
				$("#metadata-epm-root").append($(html));
				this.displayMetadatawWadTextAttributeEditor('metadata-epm-root','csstext');
			}
			this.displayMetadataEpmAttributeEditor('metadata-epm-part1','cssclass',$(this.metadataepm).attr('cssclass'));
			if (name!='asmRoot') {
				this.displayMetadataEpmDisplayViewAttributeEditor('metadata-epm-part1','displayview',$(this.metadataepm).attr('displayview'));
			}
			//------------------------------------
			this.displayMetadataEpmAttributeEditor('metadata-epm-label','font-weight',$(this.metadataepm).attr('font-weight'));
			this.displayMetadataEpmAttributeEditor('metadata-epm-label','font-style',$(this.metadataepm).attr('font-style'));
			this.displayMetadataEpmAttributeEditor('metadata-epm-label','text-align',$(this.metadataepm).attr('text-align'));
			this.displayMetadataEpmAttributeEditor('metadata-epm-label','font-size',$(this.metadataepm).attr('font-size'));
			this.displayMetadataEpmAttributeEditor('metadata-epm-label','padding-top',$(this.metadataepm).attr('padding-top'));
			this.displayMetadataEpmAttributeEditor('metadata-epm-label','othercss',$(this.metadataepm).attr('othercss'));
			this.displayMetadataEpmAttributeEditor('metadata-epm-label','color',$(this.metadataepm).attr('color'));
			this.displayMetadataEpmAttributeEditor('metadata-epm-label','background-color',$(this.metadataepm).attr('background-color'));
		}
		//----------------------------------
		this.displayMetadataEpmAttributeEditor('metadata-node-resouce','node-font-weight',$(this.metadataepm).attr('node-font-weight'));
		this.displayMetadataEpmAttributeEditor('metadata-node-resouce','node-font-style',$(this.metadataepm).attr('node-font-style'));
		this.displayMetadataEpmAttributeEditor('metadata-node-resouce','node-text-align',$(this.metadataepm).attr('node-text-align'));
		this.displayMetadataEpmAttributeEditor('metadata-node-resouce','node-font-size',$(this.metadataepm).attr('node-font-size'));
		this.displayMetadataEpmAttributeEditor('metadata-node-resouce','node-padding-top',$(this.metadataepm).attr('node-padding-top'));
		this.displayMetadataEpmAttributeEditor('metadata-node-resouce','node-othercss',$(this.metadataepm).attr('node-othercss'));
		this.displayMetadataEpmAttributeEditor('metadata-node-resouce','node-color',$(this.metadataepm).attr('node-color'));
		this.displayMetadataEpmAttributeEditor('metadata-node-resouce','node-background-color',$(this.metadataepm).attr('node-background-color'));
	//----------------------------------
		this.displayMetadataEpmAttributeEditor('metadata-inparent','inparent-font-weight',$(this.metadataepm).attr('inparent-font-weight'));
		this.displayMetadataEpmAttributeEditor('metadata-inparent','inparent-font-style',$(this.metadataepm).attr('inparent-font-style'));
		this.displayMetadataEpmAttributeEditor('metadata-inparent','inparent-text-align',$(this.metadataepm).attr('inparent-text-align'));
		this.displayMetadataEpmAttributeEditor('metadata-inparent','inparent-font-size',$(this.metadataepm).attr('inparent-font-size'));
		this.displayMetadataEpmAttributeEditor('metadata-inparent','inparent-padding-top',$(this.metadataepm).attr('inparent-padding-top'));
		this.displayMetadataEpmAttributeEditor('metadata-inparent','inparent-othercss',$(this.metadataepm).attr('inparent-othercss'));
		this.displayMetadataEpmAttributeEditor('metadata-inparent','inparent-color',$(this.metadataepm).attr('inparent-color'));
		this.displayMetadataEpmAttributeEditor('metadata-inparent','inparent-background-color',$(this.metadataepm).attr('inparent-background-color'));
	}
};

//--------------------------------------------------------
//--------------------- UPDATES --------------------------
//--------------------------------------------------------


//==================================================
UIFactory["Node"].updateMetadataAttribute = function(nodeid,attribute,value,checked)
//==================================================
{
	var node = UICom.structure["ui"][nodeid].node;
	if (checked!=undefined && !checked)
		value = "N";
	$($("metadata",node)[0]).attr(attribute,value);
	UICom.UpdateMetadata(nodeid);
	if (g_userroles[0]=='designer' || USER.admin) {  
		UICom.structure["ui"][nodeid].displayMetainfo("metainfo_"+nodeid);
	}
};

//==================================================
UIFactory["Node"].updateMetadataWadAttribute = function(nodeid,attribute,value,checked)
//==================================================
{
	var node = UICom.structure["ui"][nodeid].node;
	if (checked!=undefined && !checked)
		value = "N";
	$($("metadata-wad",node)[0]).attr(attribute,value);
	//-----------------------------------
	if (attribute=='showtoroles')
		if (value!='')
			$($("metadata-wad",node)[0]).attr('private','Y');
		else
			$($("metadata-wad",node)[0]).attr('private','N');
	//-----------------------------------
	UICom.UpdateMetaWad(nodeid);
	if (g_userroles[0]=='designer' || USER.admin) {  
		UICom.structure["ui"][nodeid].displayMetainfo("metainfo_"+nodeid);
	}
};

//==================================================
UIFactory["Node"].updateMetadataEpmAttribute = function(nodeid,attribute,value,checked)
//==================================================
{
	var node = UICom.structure["ui"][nodeid].node;
	if (checked!=undefined && !checked)
		value = "N";
	$($("metadata-epm",node)[0]).attr(attribute,value);
	var refresh = true;
	if (attribute=="top" || attribute=="left")
		refresh = false;
	UICom.UpdateMetaEpm(nodeid,refresh);
	if (g_userroles[0]=='designer' || USER.admin) {  
		UICom.structure["ui"][nodeid].displayMetaEpmInfos("metaepm_"+nodeid);
	}

};

//==================================================
UIFactory["Node"].updateMetadataSelectAttribute = function(nodeid,attribute,select)
//==================================================
{
	var option = $(select).find("option:selected");
	var value = $(option).attr('value');
	var node = UICom.structure["ui"][nodeid].node;
	$($("metadata",node)[0]).attr(attribute,value);
	UICom.UpdateMetadata(nodeid);
	if (g_userroles[0]=='designer' || USER.admin) {  
		UICom.structure["ui"][nodeid].displayMetainfo("metainfo_"+nodeid);
	}
};

//==================================================
UIFactory["Node"].updateMetadataEpmSelectAttribute = function(nodeid,attribute,select)
//==================================================
{
	var option = $(select).find("option:selected");
	var value = $(option).attr('value');
	var node = UICom.structure["ui"][nodeid].node;
	$($("metadata-epm",node)[0]).attr(attribute,value);
	UICom.UpdateMetaEpm(nodeid,refresh);
	if (g_userroles[0]=='designer' || USER.admin) {  
		UICom.structure["ui"][nodeid].displayMetaEpmInfos("metaepm_"+nodeid);
	}
};

//==================================================
UIFactory["Node"].updateMetadatawWadTextAttribute = function(nodeid,attribute)
//==================================================
{
	var node = UICom.structure["ui"][nodeid].node;
	var value = $.trim($("#"+nodeid+"_"+attribute).val());
	if (attribute=='query' && UICom.structure["ui"][nodeid].resource!=undefined && UICom.structure["ui"][nodeid].resource.type=='Proxy' && value!=undefined && value!='') {
		var srce_indx = value.lastIndexOf('.');
		var srce = value.substring(srce_indx+1);
		var semtag_indx = value.substring(0,srce_indx).lastIndexOf('.');
		var semtag = value.substring(semtag_indx+1,srce_indx);
		$($("metadata",node)[0]).attr('semantictag','proxy-'+semtag);
		UICom.UpdateMetadata(nodeid);
	}
	$($("metadata-wad",node)[0]).attr(attribute,value);
	UICom.UpdateMetaWad(nodeid);
};

//--------------------------------------------------------
//--------------------------------------------------------
//--------------------------------------------------------



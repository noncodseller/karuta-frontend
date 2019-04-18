//==============================
function initKarutaPage()
//==============================
{
	//--------------------------
	var html = "";
	html += "<div id='main-body'>";
	html += "	<div id='navigation-bar'></div>";
	html += "	<div id='sub-bar'></div>";
	html += "	<div id='main-container'></div>";
	html += "	<div id='wait-window' class='modal' style='height:100px;'><div id='wait-window-body' class='modal-body'></div>";
	html += "	<div id='wait-spin'></div>";
	html += "	</div>";
	html += "	<div id='post-form' style='display:none'></div>";
	html += "	<div id='print-window' style='display:none'></div>";
	html += "</div>";
	$('body').html(html)
	//--------------------------
	$('body').append(EditBox());
	$('body').append(DeleteBox());
	$('body').append(savedBox());
	$('body').append(alertBox());
	$('body').append(messageBox());
	$('body').append(imageBox());
	$('body').append(LangueBox());
	
	//--------------------------
	var target = document.getElementById('wait-spin');
	var spinner = new Spinner().spin(target);
}

//==============================
function displayKarutaPage()
//==============================
{
	$.ajaxSetup({async: false});
	$.ajax({
		type : "GET",
		dataType : "xml",
		url : serverBCK_API+"/credential",
		data: "",
		success : function(data) {
			setConfigurationVariables();
			loadLanguages(function() {
				getLanguage();
			});
			USER = new UIFactory["User"]($("user",data));
			//-------------------------------
			var html = "";
			html += "	<div id='list-container' class='container-fluid'></div>";
			html += "	<div id='portfolio-container' role='all' style='display:none'></div>";
			html += "	<div id='search-user-div' class='search' style='display:none'></div>";
			html += "	<div id='main-portfoliosgroup' class='col-md-12' style='display:none'></div>";
			html += "	<div id='main-user' class='col-md-12' style='display:none'></div>";
			html += "	<div id='main-usersgroup' class='col-md-12' style='display:none'></div>";
			html += "	<div id='main-exec-batch' class='col-md-12' style='display:none'></div>";
			html += "	<div id='main-exec-report' class='col-md-12' style='display:none'></div>";
			html += "</div>";
			$("#main-container").html(html);
			$.ajax({
				type : "GET",
				dataType : "xml",
				url : serverBCK+"/version",
				data: "",
				success : function(data) {		
					karuta_backend_version = $("number",$("#backend",data)).text();
					karuta_backend_date = $("date",$("#backend",data)).text();
					karuta_fileserver_version = $("number",$("#fileserver",data)).text();
					karuta_fileserver_date = $("date",$("#fileserver",data)).text();
					var navbar_html = getNavBar('list',null);
					$("#navigation-bar").html(navbar_html);
					$("a[data-tooltip='true']").tooltip({html:true});
					applyNavbarConfiguration();
				},
				error : function(jqxhr,textStatus) {
					var navbar_html = getNavBar('list',null);
					$("#navigation-bar").html(navbar_html);
					$("a[data-tooltip='true']").tooltip({html:true});
					getAndApplyMainConfiguration();
				}
			});
			//-------------------------------
			display_list_page();
			//-------------------------------
		},
		error : function(jqxhr,textStatus) {
			alertHTML(karutaStr[LANG]['not-logged']);
			window.location="login.htm?lang="+LANG;
		}
	});
	$.ajaxSetup({async: true});
	$('[data-tooltip="true"]').tooltip();
}

//==============================
function getSearch()
//==============================
{
	var html = "";
	html += "<div id='search' class='input-group'>";
	html += "	<input id='search-input' class='form-control' value='' placeholder='"+karutaStr[LANG]['search-label']+"' onchange='javascript:hideArchiveSearch()'>";
	html += "	<div class='input-group-append'>";
	html +="		<button id='search-button' type='button' onclick='searchPortfolio()' class='btn'><i class='fas fa-search'></i></button>";
	if (USER.creator && !USER.limited)  {
		html += "		<a id='archive-button' href='' class='btn' disabled='true'><i style='margin-top:4px' class='fas fa-download'></i></a>";
		html += "		<button id='remove-button' type='button' disabled='true' onclick=\"UIFactory['Portfolio'].removePortfolios()\" class='btn'><i class='fas fa-trash'></i></button>";
	}
	html += "	</div>";
	html += "</div>";
	return html;
}

//==============================
function showArchiveSearch()
//==============================
{
	var archive_href = serverBCK_API+"/portfolios/zip?portfolios=";
	for (var i = 0; i < portfolios_list.length; i++) {
		if (i>0)
			archive_href += ","
		archive_href += portfolios_list[i].id;
	}
	$("#archive-button").attr("href",archive_href);
	$("#archive-button").attr('disabled',false);
	$("#remove-button").prop('disabled', false);
}

//==============================
function hideArchiveSearch()
//==============================
{
	$("#archive-button").attr("href","");
	$("#archive-button").attr('disabled', true);
	$("#remove-button").prop('disabled', true);
}



//==============================
function setConfigurationVariables()
//==============================
{
	var url = serverBCK_API+"/portfolios/portfolio/code/karuta.configuration?resources=true";
	$.ajax({
		async: false,
		type : "GET",
		dataType : "xml",
		url : url,
		success : function(data) {
			//-----------------------
			var language_nodes = $("metadata[semantictag='portfolio-language']",data);
			for (i=0;i<language_nodes.length;i++){
				languages[i] = $("code",$("asmResource[xsi_type='Get_Resource']",$(language_nodes[i]).parent())).text();
			}
			NONMULTILANGCODE = 0;  // default language if non-multilingual
			LANGCODE = 0; //default value
			LANG = languages[LANGCODE]; //default value
			//---------Navigation Bar--------------
			g_configVar['navbar-brand-logo'] = getImg('config-navbar-brand-logo',data);
			g_configVar['navbar-brand-logo-style'] = getContentStyle('config-navbar-brand-logo',data);
			g_configVar['navbar-text-color'] = getText('config-navbar-text-color','Color','text',data);
			//----------------------
			g_configVar['maxfilesizeupload'] = getText('config-maxfilesizeupload','Field','text',data);
			//----------------------
			g_configVar['list-welcome-image'] = getBackgroundURL('config-list-welcome-image',data);		
			g_configVar['list-welcome-title'] = getText('config-list-welcome-title','Field','text',data);
			g_configVar['list-welcome-subtitle'] = getText('config-list-welcome-subtitle','Field','text',data);
			//----------------------
			g_configVar['list-background-color'] = getText('config-list-background-color','Color','text',data);
			g_configVar['list-element-background-color'] = getText('config-list-element-background-color','Color','text',data);
			g_configVar['list-element-text-color'] = getText('config-list-element-text-color','Color','text',data);
			g_configVar['list-element-background-color-complement'] = getText('config-list-element-background-color-complement','Color','text',data);
			g_configVar['list-title-color'] = getText('config-list-title-color','Color','text',data);
			g_configVar['list-button-background-color'] = getText('config-list-button-background-color','Color','text',data);
			g_configVar['list-button-text-color'] = getText('config-list-button-text-color','Color','text',data);
		}
	});
}
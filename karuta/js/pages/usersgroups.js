

//==============================
function show_list_usersgroups()
//==============================
{
	
	changeCss("body", "background-color:#e0006d;");
	changeCss("a.navbar-icon .glyphicon", "color:"+navbar_icon_color+";");
	var navbar_html = getNavBar('list',null);
	$("#navigation-bar").html(navbar_html);
	$("#refresh").attr("onclick","fill_list_usersgroups()");
	$("#refresh").show();
	$("#main-list").hide();
	$("#main-page").hide();
	$("#main-user").hide();
	$("#main-usersgroup").show();
	$("#main-exec-batch").hide();
	$("#main-exec-report").hide();
}

//==============================
function fill_list_usersgroups()
//==============================
{
	var html = "";
	html += "<span id='usersgroup-create' onclick=\"UIFactory['UsersGroup'].callCreate()\" >"+karutaStr[LANG]['create_group']+"</span>";
	html += "<h3>"+karutaStr[LANG]['list_usersgroups']+"</h3>";
	html += "<div  id='usersgroups'>";
	html += "	<img src='../../karuta/img/ajax-loader.gif'><br>";
	html += "	<h4>"+karutaStr[LANG]['loading']+"</h4>";
	html += "</div>";
	$("#main-usersgroup").html(html);
	$.ajaxSetup({async: false});
	$.ajax({
		type : "GET",
		dataType : "xml",
		url : "../../../"+serverBCK+"/usersgroups",
		data: "",
		success : function(data) {
			UIFactory["UsersGroup"].parse(data);
			UIFactory["UsersGroup"].displayGroups('usersgroups','list');
			//----------------
		},
		error : function(jqxhr,textStatus) {
			loadLanguages(function(data) {alertHTML(karutaStr[LANG]['not-logged']);});
			window.location="login.htm?lang="+LANG;
		}
	});
	$.ajaxSetup({async: true});
}

//==============================
function display_list_usersgroups()
//==============================
{
	if ($("#usersgroup-create").length) {
		show_list_usersgroups();
	} else {
		fill_list_usersgroups();
		show_list_usersgroups();
	}
}
var sWSCRequestedFile = WSCCorePath;
var oWSCPluginLoader = null;
var sWSCQueryStr = null;

if( window.ActiveXObject ){
	oWSCPluginLoader = new ActiveXObject('Microsoft.XMLHTTP');
	sWSCQueryStr = '';
}else if( window.XMLHttpRequest ){
	oWSCPluginLoader = new XMLHttpRequest();
	sWSCQueryStr = null;
}

if(oWSCPluginLoader){
	oWSCPluginLoader.open('GET',sWSCRequestedFile, false )
	oWSCPluginLoader.send( sWSCQueryStr );
	eval(oWSCPluginLoader.responseText);
}

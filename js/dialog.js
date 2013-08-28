tinyMCEPopup.requireLangPack('wsc');

var WSCDialog = {
	init : function() {
		tinyMCEPopup.editor.wscDialogWindow = tinyMCEPopup;
		tinyMCEPopup.editor.execCommand('wscRunInsideModal', false, tinyMCEPopup);
		tinyMCEPopup.editor.execCommand('wscResizeWSCWindow', false, tinyMCEPopup);
	},
	resize : function(e) {
		tinyMCEPopup.editor.execCommand('wscResizeWSCWindow', false, tinyMCEPopup);
	}
};

tinyMCEPopup.onInit.add(WSCDialog.init, WSCDialog);

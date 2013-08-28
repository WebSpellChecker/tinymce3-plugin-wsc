(function() {
	var globalSchemaIdentifier;
	var windowTitle = 'WebSpellChecker';
	var wscSizes = {
		minWidth: 514,
		minHeight: 534
	};
	var languages = {
		'da': 'da_DK',
		'de': 'de_DE',
		'el': 'el_GR',
		'en': 'en_US',
		'es': 'es_ES',
		'fi': 'fi_FI',
		'fr': 'fr_FR',
		'it': 'it_IT',
		'nb': 'nb_NO',
		'nl': 'nl_NL',
		'pt': 'pt_PT',
		'sv': 'sv_SE'
	};

	// Load plugin specific language pack
	tinymce.PluginManager.requireLangPack('wsc');

	// Create WSC plugin
	tinymce.create('tinymce.plugins.wsc', {
		init : function(editor, url) {
			var that = this;
			// basic settings
			var settings = {};
			settings.wscCorePath = window.WSCCorePath;
			settings.customerId = editor.getParam('wsc_customerId', '');

			settings.lang = editor.getParam('wsc_lang', that._getCurrentTinyMCEIntLang(editor));
			settings.ctrl = editor.id;
			settings.cmd = editor.getParam('wsc_cmd', '');
			settings.intLang = editor.getParam('wsc_intLang', that._getCurrentTinyMCEIntLang(editor));

			settings.userDictionaryName = editor.getParam('wsc_userDictionaryName', '');
			settings.customDictionaryName = editor.getParam('wsc_customDictionaryName', '');
			// prevent from executing two different lf on the same page
			if(!globalSchemaIdentifier) {
				globalSchemaIdentifier = editor.getParam('wsc_schemaIdentifier', 18);
			}
			settings.schemaIdentifier = globalSchemaIdentifier;

			settings.width = editor.getParam('wsc_width', wscSizes.minWidth);
			settings.height = editor.getParam('wsc_height', wscSizes.minHeight);
			settings.top = editor.getParam('wsc_top', 0);
			settings.left = editor.getParam('wsc_left', 0);
			settings.title = editor.getParam('wsc_popup_title', windowTitle);

			settings.autoClose = editor.getParam('wsc_autoClose', '');
			settings.domainName = editor.getParam('wsc_domainName', '');
			settings.schemaURI = editor.getParam('wsc_schemaURI', '');
			settings.onCancel = editor.getParam('wsc_popup_cancel', function(){});
			settings.onFinish = editor.getParam('wsc_popup_finish', function(){});
			settings.onClose = editor.getParam('wsc_popup_close', function(){});

			settings.wscCoreURL = settings.wscCorePath + 'wsc&customerid=' + settings.customerId + '&schema=' + settings.schemaIdentifier;

			for(var key in settings) {
				if(settings[key] === '') {
					delete settings[key];
				}
			}

			// Register commands
			editor.addCommand('mceWSC', function() {
				that._initializeWSC(editor, settings, url);
			});
			editor.addCommand('wscRunInsideModal', function(ui, value) {
				that._runInsideModalWindow(editor, settings, value);
			});
			editor.addCommand('wscResizeWSCWindow', function(ui, value) {
				that._resizeWSCWindow(editor, settings, value);
			});

			// Register spell check button
			var wscBtnIcoPath = settings.wscCorePath + 'image&img=btn_wsc_tinymce';
			editor.addButton('wsc', {
				title : 'wsc.desc',
				cmd: 'mceWSC',
				image: wscBtnIcoPath
			});
		},

		// Init WSC service
		_initializeWSC: function(editor, settings, url) {
			var that = this;
			// load script via tinymce api
			var scriptLoader = new tinymce.dom.ScriptLoader();
			scriptLoader.loadScripts([ settings.wscCoreURL ], function() {
				that._openWindow(editor, settings, url);
			});
		},

		// Open WSC window
		_openWindow: function(editor, settings, url) {
			var el = document.getElementById(editor.editorId);
			var _onFinish = settings.onFinish;
			var _onCancel = settings.onCancel;
			var _onClose = settings.onClose;

			// if there is active modal window - close it
			if(editor.wscDialogWindow) {
				editor.wscDialogWindow.close();
			}

			// prevent callbacks rewriting
			if(!settings._callbacksChanged) {
				settings._callbacksChanged = true;

				settings.onFinish = function(mCtrl) {
					// Set changed content back to editor
					editor.setContent(mCtrl.value);

					if(editor.wscDialogWindow) {
						editor.wscDialogWindow.close();
						editor.wscDialogWindow = null;
					}

					if(typeof _onFinish === 'function') {
						_onFinish(mCtrl);
					}
				}

				settings.onCancel = function() {
					if(editor.wscDialogWindow) {
						editor.wscDialogWindow.close();
						editor.wscDialogWindow = null;
					}

					if(typeof _onCancel === 'function') {
						_onCancel();
					}
				}

				settings.onClose = function() {
					if(editor.wscDialogWindow) {
						editor.wscDialogWindow = null;
					}

					if(typeof _onClose === 'function') {
						_onClose();
					}
				}
			}

			// Set editors content to hidden control
			el.value = editor.getContent();

			// for 118 schema we need to use tinymce dialogs manager
			if(settings.schemaIdentifier == 118 && el.value !== '') {
				if(window.DragHandler) {
					window.DragHandler.attach = function() {};
					window.DragHandler.updateWindowSize = function() {};
					window.DragHandler.resetElement = function() {};
				}
				editor.windowManager.open({
					title: settings.title,
					width: settings.width,
					height: settings.height,
					resizable: true,
					maximizable: false,
					inline: 1,
					file : url + '/dialog.htm'
				});
			} else {
				window.WSC.doSpell(settings);
			}
		},

		_runInsideModalWindow: function(editor, settings, value) {
			window.WSC.doSpell(settings);

			// find elements
			editor.plugins.wsc._wscInfo = {};
			editor.plugins.wsc._wscInfo.modalWindowWrapper = document.getElementById('webspellchecker-modal-window-wrapper');
			editor.plugins.wsc._wscInfo.modalWindowHeader = document.getElementById('webspellchecker-modal-header');
			editor.plugins.wsc._wscInfo.modalWindow = document.getElementById('webspellchecker-modal-window');
			editor.plugins.wsc._wscInfo.modalWindowIframe = editor.plugins.wsc._wscInfo.modalWindow.children[0];
			editor.plugins.wsc._wscInfo.contentArea = document.getElementById(value.id + '_content');
			editor.plugins.wsc._wscInfo.iframe = document.getElementById(value.id + '_ifr');
			
			// set wsc modal window inside of tinymce dialog
			editor.plugins.wsc._wscInfo.contentArea.appendChild(editor.plugins.wsc._wscInfo.modalWindowWrapper);
			// remove waste elements
			var wscModalBg = document.getElementById('webspellchecker-modal-bg');
			var wscResize = document.getElementById('webspellchecker-wsc_resize');
			var wscCloseBtn = document.getElementById('webspellchecker-closeButton');


			if(wscModalBg) tinyMCE.DOM.remove(wscModalBg);
			if(wscResize) tinyMCE.DOM.remove(wscResize);
			if(wscCloseBtn) tinyMCE.DOM.remove(wscCloseBtn);
			
			// set min sizes to tinymce dialog window
			value.features.min_height = wscSizes.minHeight;
			value.features.min_width = wscSizes.minWidth;
			
			// Prepare styles
			editor.plugins.wsc._wscInfo.iframe.setAttribute('allowtransparency', 'true');
			editor.plugins.wsc._wscInfo.modalWindowWrapper.style.position = 'absolute';
			editor.plugins.wsc._wscInfo.modalWindowHeader.children[0].style.position = 'static';
			editor.plugins.wsc._wscInfo.modalWindowHeader.children[0].style.background = 'none';
			editor.plugins.wsc._wscInfo.modalWindowHeader.children[0].style.width = 'auto';
			editor.plugins.wsc._wscInfo.modalWindowHeader.children[0].style.height = 'auto';
			editor.plugins.wsc._wscInfo.modalWindowHeader.children[0].style.top = 'auto';
			editor.plugins.wsc._wscInfo.modalWindowHeader.children[0].style.left = 'auto';
		},

		_resizeWSCWindow: function(editor, settings, value) {
			var newWidth = (parseInt(tinymce.DOM.getStyle(editor.plugins.wsc._wscInfo.iframe, 'width', true), 10) || 0) - 2; // minus border width
			var newHeight = (parseInt(tinymce.DOM.getStyle(editor.plugins.wsc._wscInfo.iframe, 'height', true), 10) || 0) - 2; // minus border width
			var wscHeaderHeight = editor.plugins.wsc._wscInfo.modalWindowHeader.clientHeight + (parseInt(tinymce.DOM.getStyle(editor.plugins.wsc._wscInfo.modalWindow, 'marginTop', true), 10) || 0);

			// resize wsc window wrapper
			editor.plugins.wsc._wscInfo.modalWindowWrapper.style.width = newWidth + 'px';
			editor.plugins.wsc._wscInfo.modalWindowWrapper.style.height = newHeight + 'px';
			// resize wsc window
			editor.plugins.wsc._wscInfo.modalWindow.style.marginLeft = '0';
			editor.plugins.wsc._wscInfo.modalWindow.style.width = '100%';
			editor.plugins.wsc._wscInfo.modalWindow.style.height = (newHeight - wscHeaderHeight) + 'px';
			// resize wsc iframe
			editor.plugins.wsc._wscInfo.modalWindowIframe.style.width = '100%';
			editor.plugins.wsc._wscInfo.modalWindowIframe.style.height = '100%';
		},

		_getCurrentTinyMCEIntLang: function(editor) {
			var currIntLang = editor.settings.language;

			currIntLang = languages[currIntLang];
			if(!currIntLang) {
				currIntLang = 'en_US';
			}

			return currIntLang;
		}
	});

	// Register plugin with a short name
	tinymce.PluginManager.add('wsc', tinymce.plugins.wsc);
}());
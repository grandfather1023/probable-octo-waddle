/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2013 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/


/*global $, Folder, app, SaveOptions, File, JSXGlobals, BridgeTalk*/

// ExtendScript running in CEP. Docs on extendscript: https://www.adobe.com/content/dam/acom/en/devnet/scripting/pdfs/javascript_tools_guide.pdf

$._ADBE_LIBS_CORE = {
    //Evaluate a file and catch the exception.
    evalFile: function (path) {
        try {
            $.evalFile(path);
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-evalFile()', ex);
        }
    },
    // Evaluate all the files in the given folder
    evalFiles: function (jsxFolderPath) {
        try {
            var folder = new Folder(jsxFolderPath);
            if (folder.exists) {
                var jsxFiles = folder.getFiles("*.jsx");
                var i, jsxFile;
                for (i = 0; i < jsxFiles.length; i++) {
                    jsxFile = jsxFiles[i];
                    $.evalFile(jsxFile);
                }
            }
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-evalFiles()', ex);
        }
    },
    findFont: function (allFonts, fontName, fontStyle) {
        try {
            if (fontStyle === "normal") {
                fontStyle = "Regular";
            }
            var i;
            for (i = 0; i < allFonts.length; i++) {
                //We must test against the name of the font and not the family since the family might differ from the name we are storing
                //this is especially true with international fonts. Some fonts are stored with their name concatentated with the style so we
                //test an exact match of the name and also the name concatenated with the style just in case.
                if ((allFonts[i].name === fontName && allFonts[i].style.toLowerCase() === fontStyle.toLowerCase()) ||
                        allFonts[i].name === fontName + ' ' + fontStyle) {
                    return allFonts[i];
                }
            }
            return undefined;
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-findFont()', ex);
        }
    },
    showError: function (msg) {
        msg = typeof msg === 'string' ? msg : msg.join('\n');
        alert(msg);
    },
    cleanupUnits: function (value) {
        var values = value.split(" ");
        if (values.length > 1) {
            return values[0];
        }
        return value;
    },
    cleanupFileName: function (value) {
        if (value.indexOf('.') > 0) {
            value = value.substr(0, value.lastIndexOf('.') - 1);
        }
        return value;
    },
    unitToPixels: function (value, resolution) {
        if (value.indexOf("px") > 0) {
            return value;
        }
        if (value.indexOf("in") > 0) {
            return $._ADBE_LIBS_CORE.inToPixels(value);
        }
        if (value.indexOf("cm") > 0) {
            return $._ADBE_LIBS_CORE.cmToPixels(value);
        }
        if (value.indexOf("mm") > 0) {
            return $._ADBE_LIBS_CORE.mmToPixels(value, resolution);
        }
        if (value.indexOf("pt") > 0) {
            return $._ADBE_LIBS_CORE.pointsToPixels(value, resolution);
        }
        if (value.indexOf("pc") > 0) {
            return $._ADBE_LIBS_CORE.picasToPixels(value);
        }
        if (value.indexOf("%") > 0) {
            return $._ADBE_LIBS_CORE.picasToPixels(value);
        }
    },
    //http://www.translatorscafe.com/cafe/EN/units-converter/typography/c/
    picasToPixels: function (picas) {
        return Math.round(picas * 16);
    },
    cmToPixels: function (cms) {
        return Math.round(cms * 37.79527559055);
    },
    inToPixels: function (inches) {
        return Math.round(inches * 96.0000000000011);
    },
    mmToPixels: function (mm, resolution) {
        var pt = mm * 2.83464566929134;
        return $._ADBE_LIBS_CORE.pointsToPixels(pt, resolution);
    },
    pointsToPixels: function (pt, resolution) {
        return Math.round((pt / 72) * resolution);
    },
    pixelsToPoints: function (px, resolution) {
        return (px * 72) / resolution;
    },
    getTempFolder: function () {
        return Folder.temp.fsName;
    },
    getDocument: function (docName) {
        try {
            var i;
            for (i = 0; i < app.documents.length; i++) {
                if (app.documents[i].name === docName) {
                    return app.documents[i];
                }
            }
            return undefined;
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-getDocument()', ex);
        }
    },
    closeDocument: function (docName) {
        try {
            var i;
            for (i = 0; i < app.documents.length; i++) {
                if (app.documents[i].name === docName) {
                    app.documents[i].close(SaveOptions.DONOTSAVECHANGES);
                }
            }
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-closeDocument()', ex);
        }
    },
    isDocumentOpen: function (docName) {
        try {
            if ($.os.indexOf('Windows') > -1) {
                docName = docName.split('/').join('\\');
            }
            var i;
            for (i = 0; i < app.documents.length; i++) {
                try {
                    if (app.documents[i].fullName.fsName === docName) {
                        return 'true';
                    }
                } catch (ignore) {
                    // do nothing; just enables us to skip and move past unsaved docs
                }
            }
            return 'false';
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-isDocumentOpen()', ex);
        }
    },
    saveDocumentWithName: function (docName) {
        try {
            var i;
            for (i = 0; i < app.documents.length; i++) {
                if (app.documents[i].name === docName) {
                    app.documents[i].save();
                    return;
                }
            }
        } catch (ex) {
            $._ADBE_LIBS_CORE.writeToLog('core.jsx-saveDocumentWithName()', ex);
        }
    },
    rgbColorToHex: function (color) {
        return $._ADBE_LIBS_CORE.intToHex(color.red) + $._ADBE_LIBS_CORE.intToHex(color.green) + $._ADBE_LIBS_CORE.intToHex(color.blue);
    },
    intToHex: function (intVal) {
        var hex = intVal.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    },
    hexToR: function (h) {
        return parseInt(($._ADBE_LIBS_CORE.cutHex(h)).substring(0, 2), 16);
    },
    hexToG: function (h) {
        return parseInt(($._ADBE_LIBS_CORE.cutHex(h)).substring(2, 4), 16);
    },
    hexToB: function (h) {
        return parseInt(($._ADBE_LIBS_CORE.cutHex(h)).substring(4, 6), 16);
    },
    cutHex: function (h) {
        return (h.charAt(0) === "#") ? h.substring(1, 7) : h;
    },
    shortenString: function (str, withDots, length) {
        str = str.replace(/(<|>|:|"|\/|\\|\||\?|\*|[\x00-\x1F])|\(|\)|\{|\}|\,/g, '');

        length = length || 10;

        if (str.length > length) {
            str = str.substr(0, length - 1);
            if (withDots) {
                str = str + "...";
            }
        }

        return str;
    },
    setLogPath: function (path) {
        JSXGlobals.logFilePath = path;
    },
    writeToLog: function (source, msg) {
        if (JSXGlobals.logFilePath !== "") {
            var date = new Date();
            var logFile = new File(JSXGlobals.logFilePath);
            logFile.open("a");
            logFile.writeln(date.toString() + " : " + source + " - " + msg);
        }
    },
    pushUniqueValue: function (array, object, property) {
        if (!array) {
            array = [];
        }
        var itemB = object;
        if (property) {
            itemB = object[property];
        }

        var i, itemA;
        for (i = 0; i < array.length; i++) {
            itemA = array[i];

            if (property) {
                itemA = array[i][property];
            }
            if (itemA === itemB) {
                return;
            }
        }
        array.push(object);
    },
    getApplicationVersion: function () {
        return app.version;
    },
    chooseFileLocation: function (promptStr, path, libraryName) {
        var MAX_PATH_LENGTH = 243;
        var isWindows = $.os.indexOf('Windows') > -1;
        var extension = '.cclibs';
        var separator = isWindows ? '\\' : '/';
        var sanitizedLibraryName = decodeURIComponent(libraryName).replace(/[<>:"\/\\|?*]+/g, '');
        var defaultPath = Folder.desktop.toString() + separator;

        // Check if the default path is > 243 characters, if so trim the library name to fit
        if (path === 'null' && isWindows && (defaultPath + sanitizedLibraryName + extension).length > MAX_PATH_LENGTH) {
            var maxFileNameLength = MAX_PATH_LENGTH - defaultPath.length - extension.length;
            sanitizedLibraryName = sanitizedLibraryName.substring(0, maxFileNameLength);
        }

        var file = new File(path === 'null' ? defaultPath + sanitizedLibraryName + extension : path);
        var result = file.saveDlg(promptStr, '*' + extension, false);
        var fsFile = result && encodeURIComponent(result.fsName);
        return fsFile;
    },
    chooseFile: function (promptStr, path) {
        var file = new File(path === "null" ? Folder.desktop : new File(path).parent);
        // Note: Windows only. Doesn't work on Mac.
        var filter = null;
        if ($.os.indexOf('Windows') > -1) {
            filter = "Creative Cloud Libraries: *.cclibs;*.cclibc";
        } else {
            var filterRegex = new RegExp('[^\.]*\.(cclibs|cclibc)$');
            filter = function (fileEntry){
                if (fileEntry instanceof Folder) {
                    return true;
                } else {
                    return filterRegex.test(fileEntry.name);
                }
            };
        }
        var result = file.openDlg(promptStr, filter);
        var fsFile = result && result.exists ? encodeURIComponent(result.fsName) : null;
        return fsFile;
    },
    getHostAppPathViaBridgeTalk: function () {
        var path = "<No path acquired. BridgeTalk not available in host app?>";
        try {
            path = BridgeTalk.getAppPath(BridgeTalk.appSpecifier);
        } catch (ignore) {
        }
        return path;
    }
};

var JSXGlobals = {};
JSXGlobals.logFilePath = "";
JSXGlobals.colorModifiedByUser = "";

JSXGlobals.contentTypes = {};
JSXGlobals.contentTypes.rgb = "application/vnd.adobe.color.rgb+json";
JSXGlobals.contentTypes.hsb = "application/vnd.adobe.color.hsb+json";
JSXGlobals.contentTypes.cmyk = "application/vnd.adobe.color.cmyk+json";
JSXGlobals.contentTypes.lab = "application/vnd.adobe.color.lab+json";
JSXGlobals.contentTypes.gray = "application/vnd.adobe.color.gray+json";

JSXGlobals.textPreviewString = "Aa";
JSXGlobals.textPreviewFontSize = 32;

JSXGlobals.previewMaxWidth = 248;
JSXGlobals.previewMaxHeight = 188;
JSXGlobals.maxNameLength = 248; // 256 - buffer for extensions

// Color types used to generate Tooltips
JSXGlobals.FILL = 'FILL';
JSXGlobals.STROKE = 'STROKE';

// Photoshop specific color types
JSXGlobals.PS_FOREGROUND = 'PS_FOREGROUND';
JSXGlobals.PS_TEXT = 'PS_TEXT';
JSXGlobals.PS_EFFECT_FILL = 'PS_EFFECT_FILL';
JSXGlobals.PS_EFFECT_STROKE = 'PS_EFFECT_STROKE';

// Illustrator specific color types
JSXGlobals.AI_TEXT_FILL = 'AI_TEXT_FILL';
JSXGlobals.AI_TEXT_STROKE = 'AI_TEXT_STROKE';

// InDesign specific color types
JSXGlobals.ID_TEXT_FILL = 'ID_TEXT_FILL';
JSXGlobals.ID_TEXT_STROKE = 'ID_TEXT_STROKE';

// Required to load getLayerSVG.jsx properly
var runGetLayerSVGfromScript = true;

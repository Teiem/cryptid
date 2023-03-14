"use strict";
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
}
;
function _asyncToGenerator(fn) {
    return function() {
        var gen = fn.apply(this, arguments);
        return new Promise(function(resolve, reject) {
            function step(key, arg) {
                try {
                    var info = gen[key](arg);
                    var value = info.value
                } catch (error) {
                    reject(error);
                    return
                }
                if (info.done) {
                    resolve(value)
                } else {
                    return Promise.resolve(value).then(function(value) {
                        step("next", value)
                    }, function(err) {
                        step("throw", err)
                    })
                }
            }
            return step("next")
        }
        )
    }
}
var map;
function canvasMap(canvasId, mapCode, intro, width, target) {
    var pCanvas = document.getElementById(canvasId);
    var pCtx = pCanvas.getContext("2d");
    var pMapCode = mapCode;
    var pIntro = intro;
    var pTarget = target;
    var bDrawTarget = false;
    var pTargetX;
    var pTargetY;
    var pImages;
    var pStructImages;
    var pWidth;
    this.newMapSettings = function(mapCode, intro, target) {
        pMapCode = mapCode;
        pIntro = intro;
        pTarget = target;
        bDrawTarget = false;
        this.loadAndDraw()
    }
    ;
    this.imageOnload = function(image) {
        pImages.push(image);
        if (imagesLoaded()) {
            pImages.sort()
        }
    }
    ;
    this.loadAndDraw = function() {
        var arrImgSrc = mapTiles[pWidth];
        var arrStructSrc = structImg[pWidth];
        var remaining = mapTiles[pWidth].length + structImg[pWidth][0].length + structImg[pWidth][1].length;
        if (remaining !== arrImgSrc) {
            var self = this;
            pImages = new Array;
            pStructImages = new Array;
            arrImgSrc.forEach(function(item) {
                var img = new Image;
                img.onload = function() {
                    --remaining;
                    if (remaining <= 0) {
                        self.drawList()
                    }
                }
                ;
                img.src = item;
                pImages.push(img)
            });
            arrStructSrc.forEach(function(item, index) {
                pStructImages[index] = new Array;
                item.forEach(function(item) {
                    var img = new Image;
                    img.onload = function() {
                        --remaining;
                        if (remaining <= 0) {
                            self.drawList()
                        }
                    }
                    ;
                    img.src = item;
                    pStructImages[index].push(img)
                })
            })
        } else {
            this.drawList()
        }
    }
    ;
    this.drawList = function() {
        this.drawMap();
        this.drawStructures();
        if (bDrawTarget) {
            this.drawTarget(this.pTargetX, this.pTargetY)
        }
    }
    ;
    this.drawTile = function(x, y, img) {
        var yPx = this.yPosToPx(y);
        var xPx = this.xPosToPx(x);
        if (x % 2 === 0) {
            yPx = yPx + widthSettings[pWidth].hex_h / 2
        }
        if (img.naturalWidth === 0) {
            img.onload = function() {
                pCtx.drawImage(img, xPx, yPx)
            }
        } else {
            pCtx.drawImage(img, xPx, yPx)
        }
    }
    ;
    this.drawStructure = function(x, y, img) {
        var yPx = this.yPosToPx(y);
        var xPx = this.xPosToPx(x);
        if (x % 2 === 0) {
            yPx = yPx + widthSettings[pWidth].hex_h / 2
        }
        if (img.naturalWidth === 0) {
            img.onload = function() {
                xPx = xPx + (widthSettings[pWidth].hex_d - img.naturalWidth) / 2;
                yPx = yPx + (widthSettings[pWidth].hex_h - img.naturalHeight) / 2;
                pCtx.drawImage(img, xPx, yPx)
            }
        } else {
            xPx = xPx + (widthSettings[pWidth].hex_d - img.naturalWidth) / 2;
            yPx = yPx + (widthSettings[pWidth].hex_h - img.naturalHeight) / 2;
            pCtx.drawImage(img, xPx, yPx)
        }
    }
    ;
    this.drawText = function(posNum, boardNum) {
        var xPx = widthSettings[pWidth].numberMargin / 2;
        if (posNum % 2 !== 1) {
            xPx += 6 * widthSettings[pWidth].hex_d + 6.5 * widthSettings[pWidth].hex_s + widthSettings[pWidth].numberMargin + widthSettings[pWidth].tileGap
        }
        var row = 1 + Math.floor((posNum - 1) / 2);
        var yPx = (3 * widthSettings[pWidth].hex_h + widthSettings[pWidth].tileGap) * (row - 1) + 2 * widthSettings[pWidth].hex_h;
        pCtx.font = "bold " + widthSettings[pWidth].numberFontSize + ' "Alegreya"';
        pCtx.fillStyle = "black";
        pCtx.textAlign = "center";
        var dispNum = boardNum % 6 + 1;
        pCtx.fillText(dispNum, xPx, yPx, widthSettings[pWidth].numberMargin)
    }
    ;
    this.xPosToPx = function(xPos) {
        var retPos = widthSettings[pWidth].numberMargin + (xPos > 6 ? widthSettings[pWidth].tileGap : 0) + (xPos - 1) * widthSettings[pWidth].hex_ds;
        return retPos
    }
    ;
    this.yPosToPx = function(yPos) {
        var retPos = Math.floor((yPos - 1) / 3) * widthSettings[pWidth].tileGap + (yPos - 1) * widthSettings[pWidth].hex_h;
        return retPos
    }
    ;
    this.drawMap = function() {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        var cleanMapCode = pMapCode.replace("intro_", "");
        for (var i = 0; i < 6; i++) {
            var boardStr = cleanMapCode.substring(i, i + 1);
            var boardNumber = parseInt(boardStr, 16) - 1;
            var xTile = i % 2 * 6 + 1;
            var yTile = Math.floor(i / 2) * 3 + 1;
            this.drawTile(xTile, yTile, pImages[boardNumber]);
            var dotTarget = boardNumber > 5 ? {
                x: xTile + 5,
                y: yTile + 2
            } : {
                x: xTile,
                y: yTile
            };
            var xPx = this.xPosToPx(dotTarget.x);
            var yPx = this.yPosToPx(dotTarget.y);
            if (dotTarget.x % 2 === 0) {
                yPx = yPx + widthSettings[pWidth].hex_h / 2
            }
            xPx = xPx + widthSettings[pWidth].hex_d / 2;
            yPx = yPx + widthSettings[pWidth].hex_h / 2;
            pCtx.fillStyle = widthSettings[pWidth].dot_color;
            pCtx.beginPath();
            pCtx.arc(xPx, yPx, widthSettings[pWidth].dot_height / 2, 0 * Math.PI, 2 * Math.PI);
            pCtx.fill();
            pCtx.strokeStyle = "white";
            pCtx.stroke();
            this.drawText(i + 1, boardNumber)
        }
    }
    ;
    this.drawStructures = function() {
        var sImg = pStructImages;
        var offset = 6;
        var self = this;
        var cleanMapCode = pMapCode.replace("intro_", "");
        sImg.forEach(function(item, index) {
            item.forEach(function(item, index) {
                if (pIntro && index < 3 || !pIntro) {
                    var yP = parseInt(cleanMapCode.substring(offset, offset + 1), 16) + 1;
                    var xP = parseInt(cleanMapCode.substring(offset + 1, offset + 2), 16) + 1;
                    offset += 2;
                    self.drawStructure(xP, yP, item)
                }
            })
        })
    }
    ;
    this.drawTarget = function(x, y) {
        bDrawTarget = true;
        this.pTargetX = x;
        this.pTargetY = y;
        var blank = pImages[pImages.length - 2];
        for (var i = 1; i <= 12; i++) {
            for (var j = 1; j <= 9; j++) {
                if (i !== x || j !== y) {
                    this.drawTile(i, j, blank)
                }
            }
        }
        var src = pImages[pImages.length - 1];
        this.drawTile(x, y, src)
    }
    ;
    this.setWidth = function(width) {
        if (width !== pWidth && width in widthSettings) {
            pWidth = width;
            pImages = new Array;
            pCanvas.width = widthSettings[pWidth].canvas_width;
            pCanvas.height = widthSettings[pWidth].canvas_height
        }
    }
    ;
    this.autoWidthAdjust = function() {
        var winWidth = $(window).width();
        var isDocked = this.isDocked();
        var thresholds = widthSettings.thresholds;
        var widthUse;
        for (var key in thresholds) {
            var maxWidth = thresholds[key];
            if (winWidth >= maxWidth) {
                widthUse = key
            }
        }
        if (isDocked === true) {
            if (!this.dockable()) {
                this.expandMap()
            } else {
                widthUse = "mobile"
            }
        }
        if (pWidth !== widthUse) {
            this.setWidth(widthUse);
            this.loadAndDraw()
        }
    }
    ;
    this.collapseMap = function() {
        var divWidth = $("#menuLarge").width();
        var collapse = false;
        var self = this;
        if (widthSettings["mobile"].canvas_width > divWidth) {
            collapse = true
        }
        if (collapse) {
            $("#mapCanvas").slideUp("slow", function() {
                self.autoSetMapArrow()
            })
        } else if (this.isDocked()) {
            $("#mapDiv").detach().prependTo("#gameMapAnchor");
            map.autoWidthAdjust()
        } else {
            $("#mapDiv").detach().appendTo("#mapAnchor");
            map.autoWidthAdjust();
            if (!$("#mapCanvas").is(":visible")) {
                $("#mapCanvas").slideDown("slow", function() {
                    self.autoSetMapArrow()
                })
            }
        }
    }
    ;
    this.expandMap = function() {
        $("#mapDiv").show();
        if (this.isDocked()) {
            $("#mapDiv").detach().prependTo("#gameMapAnchor");
            map.autoWidthAdjust()
        } else if (this.isCollapsed()) {
            var self = this;
            $("#mapCanvas").slideDown("slow", function() {
                self.autoSetMapArrow()
            })
        }
    }
    ;
    this.toggleExpand = function() {
        if (this.isCollapsed() || this.isDocked()) {
            this.expandMap();
            this.autoSetMapArrow()
        } else {
            this.collapseMap();
            this.autoSetMapArrow()
        }
    }
    ;
    this.isCollapsed = function() {
        var mapObj = $("#mapCanvas");
        return !mapObj.is(":visible")
    }
    ;
    this.isDocked = function() {
        var mapObj = $("#mapAnchor > #mapDiv");
        return mapObj.length > 0
    }
    ;
    this.dockable = function() {
        return !(widthSettings["mobile"].canvas_width > $("#menuLarge").width())
    }
    ;
    this.setMapArrow = function(setTo) {
        var spanElem = $("#mapCollapseArrow");
        spanElem.text(setTo)
    }
    ;
    this.autoSetMapArrow = function() {
        var docked = this.isDocked();
        var collapsed = this.isCollapsed();
        var noDock = !this.dockable();
        if (docked) {
            this.setMapArrow("[>]")
        } else {
            if (noDock) {
                if (collapsed) {
                    this.setMapArrow("[+]")
                } else {
                    this.setMapArrow("[–]")
                }
            } else {
                if (collapsed) {
                    this.setMapArrow("[+]")
                } else {
                    this.setMapArrow("[<]")
                }
            }
        }
    }
}
var mapTiles = {
    mobile: ["./img/art_tiles/mobile/0.png", "./img/art_tiles/mobile/1.png", "./img/art_tiles/mobile/2.png", "./img/art_tiles/mobile/3.png", "./img/art_tiles/mobile/4.png", "./img/art_tiles/mobile/5.png", "./img/art_tiles/mobile/6.png", "./img/art_tiles/mobile/7.png", "./img/art_tiles/mobile/8.png", "./img/art_tiles/mobile/9.png", "./img/art_tiles/mobile/10.png", "./img/art_tiles/mobile/11.png", "./img/art_tiles/mobile/mask.png", "./img/art_tiles/mobile/target.png"],
    tablet: ["./img/art_tiles/tablet/0.png", "./img/art_tiles/tablet/1.png", "./img/art_tiles/tablet/2.png", "./img/art_tiles/tablet/3.png", "./img/art_tiles/tablet/4.png", "./img/art_tiles/tablet/5.png", "./img/art_tiles/tablet/6.png", "./img/art_tiles/tablet/7.png", "./img/art_tiles/tablet/8.png", "./img/art_tiles/tablet/9.png", "./img/art_tiles/tablet/10.png", "./img/art_tiles/tablet/11.png", "./img/art_tiles/tablet/mask.png", "./img/art_tiles/tablet/target.png"],
    desktop: ["./img/art_tiles/desktop/0.png", "./img/art_tiles/desktop/1.png", "./img/art_tiles/desktop/2.png", "./img/art_tiles/desktop/3.png", "./img/art_tiles/desktop/4.png", "./img/art_tiles/desktop/5.png", "./img/art_tiles/desktop/6.png", "./img/art_tiles/desktop/7.png", "./img/art_tiles/desktop/8.png", "./img/art_tiles/desktop/9.png", "./img/art_tiles/desktop/10.png", "./img/art_tiles/desktop/11.png", "./img/art_tiles/desktop/mask.png", "./img/art_tiles/desktop/target.png"]
};
var structImg = {
    mobile: [["./img/art_tiles/mobile/s1.png", "./img/art_tiles/mobile/s2.png", "./img/art_tiles/mobile/s3.png", "./img/art_tiles/mobile/s4.png"], ["./img/art_tiles/mobile/p1.png", "./img/art_tiles/mobile/p2.png", "./img/art_tiles/mobile/p3.png", "./img/art_tiles/mobile/p4.png"]],
    tablet: [["./img/art_tiles/tablet/s1.png", "./img/art_tiles/tablet/s2.png", "./img/art_tiles/tablet/s3.png", "./img/art_tiles/tablet/s4.png"], ["./img/art_tiles/tablet/p1.png", "./img/art_tiles/tablet/p2.png", "./img/art_tiles/tablet/p3.png", "./img/art_tiles/tablet/p4.png"]],
    desktop: [["./img/art_tiles/desktop/s1.png", "./img/art_tiles/desktop/s2.png", "./img/art_tiles/desktop/s3.png", "./img/art_tiles/desktop/s4.png"], ["./img/art_tiles/desktop/p1.png", "./img/art_tiles/desktop/p2.png", "./img/art_tiles/desktop/p3.png", "./img/art_tiles/desktop/p4.png"]]
};
var widthSettings = {
    mobile: {
        numberMargin: 20,
        numberFontSize: "16px",
        tileGap: 10,
        hex_d: 110 / 4.75,
        hex_s: 110 / 9.5,
        hex_ds: (110 / 4.75 + 110 / 9.5) / 2,
        hex_h: Math.sqrt(3) * (110 / 9.5),
        fissure_draw: false,
        fissure_active_idx: 0,
        fissure_dormant_idx: 0,
        canvas_width: 260,
        canvas_height: 210,
        dot_height: 0,
        dot_color: "black"
    },
    tablet: {
        numberMargin: 25,
        numberFontSize: "22px",
        tileGap: 7,
        hex_d: 178 / 4.75,
        hex_s: 178 / 9.5,
        hex_ds: (178 / 4.75 + 178 / 9.5) / 2,
        hex_h: Math.sqrt(3) * (178 / 9.5),
        fissure_draw: true,
        fissure_active_idx: 5,
        fissure_dormant_idx: 6,
        canvas_width: 400,
        canvas_height: 320,
        dot_height: 7,
        dot_color: "black"
    },
    desktop: {
        numberMargin: 30,
        numberFontSize: "30px",
        tileGap: 10,
        hex_d: 248 / 4.75,
        hex_s: 248 / 9.5,
        hex_ds: (248 / 4.75 + 248 / 9.5) / 2,
        hex_h: Math.sqrt(3) * (248 / 9.5),
        fissure_draw: true,
        canvas_width: 550,
        canvas_height: 450,
        dot_height: 10,
        dot_color: "#060d10"
    },
    thresholds: {
        mobile: 0,
        tablet: 700,
        desktop: 1e3
    }
};
function map_init() {
    map = new canvasMap("mapCanvas","B312CA1A2A8A517A207306",false,"mobile");
    map.autoWidthAdjust();
    map.loadAndDraw();
    map.autoSetMapArrow();
    $(window).on("resize", function(e) {
        map.autoWidthAdjust();
        map.autoSetMapArrow()
    })
}
var errorReporter = function errorReporter() {
    this.DIV_ERROR = "#errorBox";
    this.DIV_ERROR_TEXT = "#errorText";
    this.errorQueue = [];
    this.currentError = null
};
errorReporter.prototype.showError = function() {
    if (!$(this.DIV_ERROR).is(":visible") && this.errorQueue.length > 0) {
        this.currentError = this.getNextError();
        $(this.DIV_ERROR_TEXT).html(this.currentError.message);
        $(this.DIV_ERROR).show()
    }
}
;
errorReporter.prototype.close = function() {
    $(this.DIV_ERROR).hide();
    try {
        this.currentError.callback()
    } catch (err) {}
    this.showError()
}
;
errorReporter.prototype.addError = function(s, callback) {
    this.errorQueue.push({
        message: s,
        callback: callback
    });
    this.showError()
}
;
errorReporter.prototype.getNextError = function() {
    var first = this.errorQueue[0];
    this.errorQueue.shift();
    return first
}
;
function gameController() {
    var pCurrentSetup;
    var pCurrentGame;
    var pPlayers;
    var pIntro;
    var pHint;
    var pKeepMap;
    var pGameStore;
    var clueDisplaying;
    var clueReminderClick = 0;
    var error = new errorReporter;
    var gameActive = false;
    var DIV_NEW_GAME = "#newGameDialog";
    var DIV_LOAD = "#loadingDialog";
    var DIV_LOAD_CONTENT = "#loadingDialogContent";
    var DIV_CLUE = "#clueDiv";
    var DIV_CLUE_TITLE = "#clueHeader";
    var SPAN_CLUE = "#clueText";
    var BUTTON_CLUE = "#clueButton";
    var BUTTON_REMIND_PRFX = "#reminder";
    var DIV_REMIND = "#clueReminderDiv";
    var DIV_REMIND_TEXT = "#reminderClueText";
    var DIV_HINT = "#hintDiv";
    var DIV_HINT_TEXT = "#hintText";
    var DIV_TARGET = "#targetDisp";
    var DIV_TARGET_CONFIRM = "#targetConfirm";
    var DIV_REVEAL = "#clueReveal";
    var LIST_REVEAL = "#revealList";
    var DIV_HINT_CONFIRM = "#hintConfirm";
    var DIV_QUIT_CONFIRM = "#quitConfirm";
    var FORM_PLAYERS = "#ngfPlayers";
    var FORM_INTRO = "#ngfMode";
    var FORM_HINT = "#ngfHints";
    var FORM_KEEP = "#ngfKeepMap";
    this.getPlayers = function() {
        return pPlayers
    }
    ;
    this.setPlayers = function(players) {
        players = Number(players);
        if (players >= 2 && players <= 5) {
            pPlayers = players
        }
    }
    ;
    this.getIntro = function() {
        return pIntro
    }
    ;
    this.setIntro = function(intro) {
        if (typeof intro === "boolean") {
            pIntro = intro
        }
    }
    ;
    this.toggleIntro = function() {
        pIntro = !pIntro
    }
    ;
    this.getHint = function() {
        return pHint
    }
    ;
    this.setHint = function(hint) {
        if (typeof hint === "boolean") {
            pHint = hint
        }
    }
    ;
    this.toggleHint = function() {
        pHint = !pHint
    }
    ;
    this.getKeepMap = function() {
        return pKeepMap
    }
    ;
    this.setKeepMap = function(keepMap) {
        if (typeof keepMap === "boolean") {
            pKeepMap = keepMap
        }
    }
    ;
    this.toggleKeepMap = function() {
        pKeepMap = !pKeepMap
    }
    ;
    this.getCurrentGame = function() {
        return pCurrentGame
    }
    ;
    this.getCurrentSetup = function() {
        return pCurrentSetup
    }
    ;
    this.getGameStore = function() {
        return pGameStore
    }
    ;
    this.init = function() {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(players, intro, hint, keepMap) {
            var mode, restoreLocal, fromServer, errMsgs, self, retryButton;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                    case 0:
                        mode = "normal";
                        this.setPlayers(players);
                        this.setIntro(intro);
                        this.setKeepMap(keepMap);
                        this.setHint(hint);
                        if (this.getIntro()) {
                            mode = "intro"
                        }
                        pGameStore = new gameStore;
                        settings.listen("store", function() {
                            if (settings.get("store")) {
                                pGameStore.commitToStorage()
                            } else {
                                pGameStore.removeFromStorage()
                            }
                        });
                        pGameStore.setMode(mode);
                        restoreLocal = false;
                        fromServer = false;
                        errMsgs = [];
                        _context.prev = 12;
                        _context.next = 15;
                        return pGameStore.restoreFromLocal();
                    case 15:
                        restoreLocal = _context.sent;
                        _context.next = 22;
                        break;
                    case 18:
                        _context.prev = 18;
                        _context.t0 = _context["catch"](12);
                        restoreLocal = false;
                        errMsgs.push(_context.t0);
                    case 22:
                        if (restoreLocal) {
                            if (!pGameStore.hasTwoPlayer()) {
                                pGameStore.resetStore();
                                restoreLocal = false
                            }
                        }
                        if (restoreLocal) {
                            _context.next = 36;
                            break
                        }
                        $(DIV_LOAD_CONTENT).data("tkey", "loading_remote");
                        translate_one($(DIV_LOAD_CONTENT));
                        _context.prev = 26;
                        _context.next = 29;
                        return pGameStore.fetchFromServer();
                    case 29:
                        fromServer = _context.sent;
                        _context.next = 36;
                        break;
                    case 32:
                        _context.prev = 32;
                        _context.t1 = _context["catch"](26);
                        fromServer = false;
                        errMsgs.push(_context.t1);
                    case 36:
                        if (restoreLocal || fromServer) {
                            this.showDiv(DIV_NEW_GAME);
                            this.hideDiv(DIV_LOAD)
                        } else {
                            $(DIV_LOAD_CONTENT).empty();
                            $(DIV_LOAD_CONTENT).append('<div class="load_error w3-margin-bottom" data-tkey="loading_err_intro"></div>');
                            errMsgs.forEach(function(item) {
                                $(DIV_LOAD_CONTENT).append('<div class="load_error w3-margin-bottom" data-tkey="' + item + '"></div>')
                            });
                            self = this;
                            retryButton = $('<button class="w3-button w3-block cryptid-highlight cryptid-hover-highlight load_error" data-tkey="general_retry"></button>').appendTo(DIV_LOAD_CONTENT).click(function() {
                                self.init()
                            });
                            $(".load_error").each(function(index, element) {
                                translate_one($(element))
                            })
                        }
                        pGameStore.fillGameStore();
                        pGameStore.replaceEmpty();
                        self = this;
                        $("#clueButton").click(function() {
                            self.showClue()
                        });
                        $("[data-pnum]").click(function() {
                            self.remindClue($(this).data("pnum"))
                        });
                        $("#ngfStart").click(function() {
                            self.startGame()
                        });
                    case 43:
                    case "end":
                        return _context.stop()
                    }
                }
            }, _callee, this, [[12, 18], [26, 32]])
        }));
        return function(_x, _x2, _x3, _x4) {
            return _ref.apply(this, arguments)
        }
    }();
    this.error = function() {
        return error
    }
    ;
    this.harvestSettings = function() {
        this.setPlayers(settings.get("players"));
        this.setHint(true);
        this.setIntro(!settings.get("advanced"));
        this.setKeepMap(settings.get("keep"))
    }
    ;
    this.startGame = function() {
        this.harvestSettings();
        if (!this.getKeepMap() || typeof pCurrentGame === "undefined" || pCurrentGame.mode !== this.getMode() || pCurrentGame.players[this.getPlayers()].length < 1) {
            if (typeof pCurrentGame !== "undefined") {
                error.addError(translate_string("error_map_change"))
            }
            try {
                pCurrentGame.save()
            } catch (err) {}
            pCurrentGame = pGameStore.getRandomGame(this.getMode(), this.getPlayers())
        }
        pCurrentSetup = pCurrentGame.popRandomSetup(this.getMode(), this.getPlayers());
        pCurrentGame.save();
        soundMngr.playSound(soundMngr.START);
        $(".game-gameplay").show();
        $(".game-start").hide();
        map.newMapSettings(pCurrentGame.key, pIntro, pCurrentSetup.target);
        map.expandMap();
        $(DIV_REMIND).slideUp();
        $(DIV_REVEAL).slideUp();
        $(DIV_TARGET).slideUp();
        $(SPAN_CLUE).fadeOut();
        this.clueReminderClick = 0;
        this.resetReminder();
        $(DIV_HINT).slideUp();
        this.clueDisplaying = 0;
        this.showClue();
        myTut.showStep(3);
        gameActive = true
    }
    ;
    this.createClueReminders = function() {
        for (var i = 1; i <= 5; i++) {
            var buttonId = BUTTON_REMIND_PRFX + i;
            if (i > pPlayers) {
                $(buttonId).hide()
            } else {
                $(buttonId).show()
            }
        }
        $(DIV_REMIND).slideDown()
    }
    ;
    this.showClue = function() {
        var showKey = pPlayers == 2 ? "clue_button_show_plural" : "clue_button_show";
        var hideKey = pPlayers == 2 ? "clue_button_hide_plural" : "clue_button_hide";
        var titleKey = pPlayers == 2 ? "clue_title_plural" : "clue_title";
        $(DIV_CLUE_TITLE).data("tkey", titleKey);
        if (!$(DIV_CLUE).is(":visible")) {
            $(DIV_CLUE).slideDown("slow")
        }
        var isShowing = this.clueDisplaying % 2 === 0;
        var clueNo = Math.floor(this.clueDisplaying / 2);
        var playerNo = clueNo + 1;
        if (pPlayers === 2) {
            playerNo = Math.floor(this.clueDisplaying / 3) + 1
        }
        if (playerNo > pPlayers) {
            $(DIV_CLUE).slideUp();
            $(DIV_TARGET).slideDown();
            this.createClueReminders();
            this.showHint();
            myTut.showStep(7)
        } else {
            if (isShowing) {
                $(SPAN_CLUE).fadeOut();
                $(BUTTON_CLUE).data("tkey", showKey);
                $(BUTTON_CLUE).data("tpnum", playerNo);
                translate_one($(BUTTON_CLUE).first());
                $(DIV_CLUE_TITLE).data("tpnum", playerNo);
                translate_one($(DIV_CLUE_TITLE).first());
                myTut.showStep(5)
            } else {
                var clueText = translate_string(pCurrentSetup[0].rules[clueNo], null);
                if (pPlayers === 2) {
                    clueText += "<br><br>" + translate_string(pCurrentSetup[0].rules[clueNo + 1], null);
                    $(SPAN_CLUE).html(clueText);
                    this.clueDisplaying += 2
                }
                if (pPlayers != 2) {
                    var clueKey = pCurrentSetup[0].rules[clueNo];
                    $(SPAN_CLUE).data("tkey", clueKey);
                    $(SPAN_CLUE).html(translate_string(clueKey, null))
                }
                $(SPAN_CLUE).fadeIn();
                $(BUTTON_CLUE).data("tkey", hideKey);
                $(BUTTON_CLUE).data("data-tkey", hideKey);
                $(BUTTON_CLUE).data("tpnum", playerNo);
                translate_one($(BUTTON_CLUE).first());
                myTut.showStep(6)
            }
            this.clueDisplaying++
        }
    }
    ;
    this.remindClue = function(num) {
        var buttonId = BUTTON_REMIND_PRFX + num;
        var message;
        var topMessage;
        var pNum = pPlayers === 2 ? (num - 1) * 2 + 1 : num;
        if (clueReminderClick === 0) {
            message = "reminder_button_show";
            topMessage = "reminder_instruction_confirm" + (pPlayers == 2 ? "_plural" : "");
            clueReminderClick = num
        } else if (clueReminderClick < 10 && num === clueReminderClick) {
            message = "reminder_button_hide";
            topMessage = "reminder_instruction_hide" + (pPlayers == 2 ? "_plural" : "");
            var clueText = "<div id='remindTextTemp' class='w3-block w3-margin-bottom cryptid-hide'>" + translate_string(pCurrentSetup[0].rules[pNum - 1], null);
            if (pPlayers === 2) {
                clueText += "<br><br>" + translate_string(pCurrentSetup[0].rules[pNum], null)
            }
            clueText += "</div>";
            $(buttonId).before(clueText);
            $("#remindTextTemp").slideDown();
            try {
                var buzzNum = [];
                for (var i = 0; i < clueReminderClick; i++) {
                    buzzNum.push(50, 50)
                }
                navigator.vibrate(buzzNum)
            } catch (e) {}
            soundMngr.playClue(pNum);
            clueReminderClick += 10
        } else if (clueReminderClick > 10) {
            buttonId = BUTTON_REMIND_PRFX + (clueReminderClick - 10);
            topMessage = "reminder_instruction" + (pPlayers == 2 ? "_plural" : "");
            message = "player_" + (clueReminderClick - 10);
            $("#remindTextTemp").slideUp(400, function() {
                $("#remindTextTemp").remove()
            });
            clueReminderClick = 0
        } else if (num !== clueReminderClick) {
            topMessage = "reminder_instruction" + (pPlayers == 2 ? "_plural" : "");
            buttonId = BUTTON_REMIND_PRFX + clueReminderClick;
            message = "player_" + clueReminderClick;
            clueReminderClick = 0
        }
        $(buttonId).data("tkey", message);
        $(buttonId).data("tpnum", num);
        $("#reminderClueText").data("tpnum", num);
        $("#reminderClueText").data("tkey", topMessage);
        translate_one($("#reminderClueText"));
        translate_one($(buttonId))
    }
    ;
    this.resetReminder = function() {
        $("#remindTextTemp").remove();
        translate_one($("#reminderClueText").data("tkey", "reminder_instruction" + (pPlayers == 2 ? "_plural" : "")));
        $(DIV_REMIND + " button").each(function(idx, el) {
            $(el).data("tkey " + "player_" + (idx + 1));
            translate_one(el)
        });
        clueReminderClick = 0
    }
    ;
    this.targetConfirm = function() {
        $(DIV_TARGET_CONFIRM).show()
    }
    ;
    this.targetShow = function() {
        var target = pCurrentSetup[0].destination;
        var els = target.split(",");
        var y = parseInt(els[0]);
        var x = parseInt(els[1]);
        map.drawTarget(x, y);
        $(DIV_TARGET).slideUp();
        $(DIV_REMIND).slideUp();
        game.revealClues();
        map.expandMap();
        $("html, body").animate({
            scrollTop: $("#mapDiv").offset().top
        }, 1e3);
        this.hintShow()
    }
    ;
    this.endConfirm = function() {
        if (!$(DIV_REVEAL).is(":visible")) {
            $(DIV_QUIT_CONFIRM).show()
        } else {
            this.end()
        }
    }
    ;
    this.end = function() {
        $(".game-gameplay").hide();
        $(".game-start").show();
        $("#keepMapToggle").show();
        myTut.showStep(0);
        gameActive = false
    }
    ;
    this.revealClues = function() {
        var clues = [];
        if (pPlayers === 2) {
            clues[0] = translate_string(pCurrentSetup[0].rules[0], null) + "<br>" + translate_string(pCurrentSetup[0].rules[1], null);
            clues[1] = translate_string(pCurrentSetup[0].rules[2], null) + "<br>" + translate_string(pCurrentSetup[0].rules[3], null)
        } else {
            for (var i = 0; i < pPlayers; i++) {
                clues[i] = pCurrentSetup[0].rules[i]
            }
        }
        $(LIST_REVEAL).empty();
        for (var i = 0; i < pPlayers; i++) {
            var li = "<li><span>" + (pPlayers == 2 ? clues[i] : translate_string(clues[i], null)) + "</span></li>";
            $(LIST_REVEAL).append(li)
        }
        $(DIV_REVEAL).slideDown()
    }
    ;
    this.showDiv = function(id) {
        $(id).show()
    }
    ;
    this.hideDiv = function(id) {
        $(id).hide()
    }
    ;
    this.getMode = function() {
        return this.getIntro() ? "intro" : "normal"
    }
    ;
    this.showHint = function() {
        if (pHint) {
            $(DIV_HINT_TEXT).empty();
            var hintBtn = $('<button class="w3-block w3-button cryptid-highlight cryptid-hover-highlight w3-margin-bottom" id="btnHint" data-tkey="hint_show_hint">Reveal Hint</button>').appendTo(DIV_HINT_TEXT);
            translate_one(hintBtn);
            $(hintBtn).click(function(e) {
                $(DIV_HINT_CONFIRM).show()
            });
            $(DIV_HINT).slideDown()
        }
    }
    ;
    this.hintShow = function() {
        $(DIV_HINT_TEXT).data("tkey", pCurrentSetup[0]["hint"]);
        translate_one($(DIV_HINT_TEXT));
        $(DIV_HINT).slideDown()
    }
    ;
    this.getGameActive = function() {
        return gameActive
    }
}
function gameStore() {
    var pMode = "normal";
    var pGameCollection = ["intro", "normal"];
    var gameLimit = settings.get("gameLimit");
    var tryLimit = 5;
    var statusErrors = {
        0: "loading_err_unknown",
        404: "loading_err_404",
        500: "loading_err_server",
        503: "loading_err_server_unavailable",
        502: "loading_err_gateway",
        504: "loading_err_gateway"
    };
    pGameCollection["intro"] = [];
    pGameCollection["normal"] = [];
    this.setMode = function(set) {
        if (set === "intro") {
            pMode = "intro"
        } else {
            pMode = "normal"
        }
    }
    ;
    this.getMode = function() {
        return pMode
    }
    ;
    this.countGames = function(mode) {
        var count = 0;
        for (var key in pGameCollection[mode]) {
            count++
        }
        return count
    }
    ;
    this.replaceEmpty = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, element, iter, mode, el, replace, i, gotGame;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                case 0:
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    _context2.prev = 3;
                    _iterator = pGameCollection[Symbol.iterator]();
                case 5:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        _context2.next = 25;
                        break
                    }
                    element = _step.value;
                    iter = pGameCollection[element];
                    mode = element;
                    _context2.t0 = regeneratorRuntime.keys(iter);
                case 10:
                    if ((_context2.t1 = _context2.t0()).done) {
                        _context2.next = 22;
                        break
                    }
                    el = _context2.t1.value;
                    el = iter[el];
                    replace = false;
                    for (i = 3; i < 6; i++) {
                        if (el.players[i].length <= 0) {
                            replace = true
                        }
                    }
                    if (!replace) {
                        _context2.next = 20;
                        break
                    }
                    _context2.next = 18;
                    return this.fetchGame(mode);
                case 18:
                    gotGame = _context2.sent;
                    if (gotGame) {
                        localforage.removeItem(el.key)
                    }
                case 20:
                    _context2.next = 10;
                    break;
                case 22:
                    _iteratorNormalCompletion = true;
                    _context2.next = 5;
                    break;
                case 25:
                    _context2.next = 31;
                    break;
                case 27:
                    _context2.prev = 27;
                    _context2.t2 = _context2["catch"](3);
                    _didIteratorError = true;
                    _iteratorError = _context2.t2;
                case 31:
                    _context2.prev = 31;
                    _context2.prev = 32;
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return()
                    }
                case 34:
                    _context2.prev = 34;
                    if (!_didIteratorError) {
                        _context2.next = 37;
                        break
                    }
                    throw _iteratorError;
                case 37:
                    return _context2.finish(34);
                case 38:
                    return _context2.finish(31);
                case 39:
                case "end":
                    return _context2.stop()
                }
            }
        }, _callee2, this, [[3, 27, 31, 39], [32, , 34, 38]])
    }));
    this.commitToStorage = function() {
        for (var i = 0; i < pGameCollection.length; i++) {
            var mode = pGameCollection[i].toString();
            for (var j in pGameCollection[mode]) {
                pGameCollection[mode][j].save()
            }
        }
    }
    ;
    this.removeFromStorage = function() {
        localforage.clear()
    }
    ;
    this.fillGameStore = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        var fail, i, mode, gotGame;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                case 0:
                    fail = 0;
                    i = 0;
                case 2:
                    if (!(i < pGameCollection.length)) {
                        _context3.next = 22;
                        break
                    }
                    mode = pGameCollection[i].toString();
                    if (fail) {
                        _context3.next = 19;
                        break
                    }
                case 5:
                    if (!(this.countGames(mode) < gameLimit && fail < tryLimit)) {
                        _context3.next = 19;
                        break
                    }
                    gotGame = false;
                    _context3.prev = 7;
                    _context3.next = 10;
                    return this.fetchGame(mode);
                case 10:
                    gotGame = _context3.sent;
                    _context3.next = 16;
                    break;
                case 13:
                    _context3.prev = 13;
                    _context3.t0 = _context3["catch"](7);
                    console.log(_context3.t0);
                case 16:
                    if (!gotGame) {
                        fail++
                    }
                    _context3.next = 5;
                    break;
                case 19:
                    i++;
                    _context3.next = 2;
                    break;
                case 22:
                case "end":
                    return _context3.stop()
                }
            }
        }, _callee3, this, [[7, 13]])
    }));
    this.fetchGame = function(fetchMode) {
        var self = this;
        var dto = {
            mode: fetchMode,
            mapsUsed: this.modeMapCodes(fetchMode)
        };
        var promise = new Promise(function(resolve, reject) {
            $.getJSON("php/getGame.php", dto).done(function(data) {
                self.storeGame(data);
                resolve(true)
            }).fail(function(jxhr, textStatus, error) {
                var status = jxhr.status || 0;
                var errMsg = "";
                if (jxhr.readyState === 4) {
                    errMsg = statusErrors[status] || "loading_err_unknown"
                } else if (jxhr.readyState === 0) {
                    errMsg = "loading_err_network"
                } else {
                    errMsg = "loading_err_unknown"
                }
                reject(errMsg)
            })
        }
        );
        return promise
    }
    ;
    this.restoreFromLocal = function() {
        var self = this;
        var restored_intro = 0;
        var restored_normal = 0;
        var removeKeys = [];
        var promise = new Promise(function(resolve, reject) {
            localforage.iterate(function(value, key, i) {
                var valid = true;
                if (!value.hasOwnProperty("key")) {
                    valid = false
                }
                try {
                    if (value.players["3"][0].rules[0].indexOf(" ") !== -1) {
                        valid = false
                    }
                } catch (e) {
                    valid = false
                }
                if (valid) {
                    var gObj = new gameObject;
                    gObj.create(value);
                    self.storeGame(gObj);
                    if (gObj.mode === "intro") {
                        restored_intro++
                    } else {
                        restored_normal++
                    }
                } else {
                    removeKeys.push(key)
                }
            }).then(function() {
                for (var key in removeKeys) {
                    localforage.removeItem(removeKeys[key])
                }
            }).then(function() {
                if (restored_intro >= 1 && restored_normal >= 1) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            }).catch(function() {
                reject(false)
            })
        }
        );
        return promise
    }
    ;
    this.fetchFromServer = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        var normal, intro;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                case 0:
                    _context4.next = 2;
                    return this.fetchGame("normal");
                case 2:
                    normal = _context4.sent;
                    _context4.next = 5;
                    return this.fetchGame("intro");
                case 5:
                    intro = _context4.sent;
                    if (!(!intro || !normal)) {
                        _context4.next = 10;
                        break
                    }
                    return _context4.abrupt("return", false);
                case 10:
                    return _context4.abrupt("return", true);
                case 11:
                case "end":
                    return _context4.stop()
                }
            }
        }, _callee4, this)
    }));
    this.modeMapCodes = function(mode) {
        var arrCodes = [];
        for (var element in pGameCollection[mode]) {
            arrCodes.push[element]
        }
    }
    ;
    this.storeGame = function(result) {
        var gObj = new gameObject;
        gObj.create(result);
        pGameCollection[gObj.mode][gObj.key] = gObj
    }
    ;
    this.offlineAvailable = function() {
        if (localforage.driver === null) {
            return false
        } else {
            return true
        }
    }
    ;
    this.getRandomGame = function(mode, numPlayers) {
        var modeIdx = mode === "intro" ? "intro" : "normal";
        var selFrom = pGameCollection[modeIdx];
        var validGames = [];
        for (var key in selFrom) {
            var element = selFrom[key];
            if (element.players[numPlayers].length > 0) {
                validGames.push(element.key)
            }
        }
        if (validGames.length <= 0) {
            return null
        }
        var idx = Math.floor(Math.random() * validGames.length);
        return pGameCollection[modeIdx][validGames[idx]]
    }
    ;
    this.getGameStore = function() {
        return pGameCollection
    }
    ;
    this.summaryInfo = function() {
        var _this = this;
        return new Promise(function(resolve, reject) {
            var stats = {};
            stats.offline = _this.offlineAvailable();
            stats.storage = localforage.driver();
            var offlineAdvanced = 0;
            var offlineIntro = 0;
            var self = _this;
            try {
                localforage.keys().then(function(keys) {
                    for (var key in keys) {
                        if (keys[key].includes("intro")) {
                            offlineIntro++
                        }
                    }
                    offlineAdvanced = keys.length - offlineIntro;
                    stats.counts = {
                        standard: self.countGames("intro"),
                        advanced: self.countGames("normal"),
                        offlineStandard: offlineIntro,
                        offlineAdvanced: offlineAdvanced
                    };
                    resolve(stats)
                })
            } catch (err) {
                reject(err)
            }
        }
        )
    }
    ;
    this.resetStore = function() {
        localforage.clear();
        pGameCollection["intro"] = [];
        pGameCollection["normal"] = [];
        gameLimit = settings.get("gameLimit");
        this.fillGameStore()
    }
    ;
    this.hasTwoPlayer = function() {
        var key = Object.keys(pGameCollection["normal"])[0];
        var firstSetup = pGameCollection["normal"][key];
        return firstSetup.hasTwoPlayer()
    }
    ;
    this.testDropTwo = function() {
        for (var mode in pGameCollection) {
            var coll = pGameCollection[pGameCollection[mode]];
            for (var idx in coll) {
                var game = coll[idx];
                if (game.hasTwoPlayer()) {
                    delete game.players["2"];
                    game.save()
                }
            }
        }
    }
}
function gameObject() {
    this.create = function(dataObj) {
        this.key = dataObj.key;
        this.mapCode = dataObj.mapCode;
        this.mode = dataObj.mode;
        this.players = dataObj.players;
        this.save()
    }
    ;
    this.hasTwoPlayer = function() {
        return this.players.hasOwnProperty("2")
    }
    ;
    this.save = function() {
        var dObj = {
            key: this.key,
            mapCode: this.mapCode,
            mode: this.mode,
            players: this.players
        };
        if (settings.get("store")) {
            localforage.setItem(this.key, dObj).catch(function(err) {
                console.log(err)
            })
        }
    }
    ;
    this.popRandomSetup = function(mode, numPlayers) {
        var arrSetups = this.players[numPlayers];
        if (arrSetups.length <= 0) {
            return null
        }
        var idx = Math.floor(Math.random() * arrSetups.length);
        var game = arrSetups.splice(idx, 1);
        if (numPlayers == 2) {
            var clueString = game[0].rules.join(",");
            this.players[4] = this.players[4].filter(function(value, index, array) {
                return clueString !== value.rules.join(",")
            })
        }
        if (numPlayers == 4) {
            var clueString = game[0].rules.join(",");
            this.players[2] = this.players[2].filter(function(value, index, array) {
                return clueString !== value.rules.join(",")
            })
        }
        return game
    }
}
(function() {
    if (langForce !== false) {
        set_lang(langForce)
    }
}
);
function translate_all(jsdata) {
    langData = jsdata;
    $("[data-tkey]").each(function(index, el) {
        translate_one(el)
    });
    $("#lang_list").val(langCode)
}
function translate_one(inElement) {
    var strTr = $(inElement).data("tkey");
    var translated = "";
    if ("tpnum"in $(inElement).data()) {
        var num = $(inElement).data("tpnum");
        translated = translate_string(strTr, num)
    } else {
        translated = translate_string(strTr, num)
    }
    if ($(inElement).is("input")) {
        $(inElement).val(translated)
    } else if ($(inElement).is("a")) {
        $(inElement).attr("href", translated)
    } else {
        $(inElement).html(translated)
    }
}
function translate_string(tKey, iPlayer) {
    var retString = langData[tKey] || "Missing key for " + tKey;
    if (typeof iPlayer !== "undefined") {
        var playerString = langData["player_" + iPlayer];
        retString = retString.replace("?p?", playerString)
    }
    return retString
}
function change_lang_select() {
    var lang_sel = $("#lang_list").val();
    set_lang(lang_sel)
}
function set_lang(inCode) {
    langCode = inCode.substr(0, 2);
    if (langForce !== false) {
        langCode = langForce
    }
    if (langCode !== prevCode) {
        var useCode = langCode in langs ? langCode : "en";
        langData = langs[useCode];
        translate_all(langData);
        $(".lang-flag").attr("src", "img/flags/" + useCode + ".png");
        $(".logo").each(function() {
            var size = $(this).data("size");
            $(this).attr("src", "img/logos/" + useCode + "." + size + ".png")
        });
        $(".lang-drop").val(useCode);
        $(".cc-message").html(translate_string("cookie_consent_message"));
        $(".cc-dismiss").text(translate_string("cookie_consent_deny"));
        $(".cc-allow").text(translate_string("cookie_consent_allow"))
    }
    prevCode = langCode
}
function populate_langs() {
    $("select[data-setting=lang]").each(function(idx, el) {
        for (var code in langs) {
            var opt = $('<option value="' + code + '">\n                ' + langs[code]["lang_name"] + "</option>");
            $(this).append(opt)
        }
    });
    settings.listen("lang", function() {
        set_lang(settings.get("lang"))
    });
    $("#topFlag").click(function(ev) {
        menu.showBurger();
        setTimeout(function() {
            $(".lang-highlight").toggleClass("cryptid-tut");
            setTimeout(function() {
                $(".lang-highlight").toggleClass("cryptid-tut")
            }, 1500)
        }, 600)
    })
}
var map_arrays = [[[0, 0], [0, 0], [0, 0], [0, 0], [1, 0], [1, 0], [4, 0], [4, 0], [0, 0], [2, 0], [1, 0], [1, 0], [4, 0], [4, 0], [2, 0], [2, 2], [2, 2], [1, 2]], [[4, 1], [1, 1], [1, 1], [1, 0], [1, 0], [1, 0], [4, 0], [4, 0], [1, 0], [2, 0], [2, 0], [2, 0], [4, 0], [3, 0], [3, 0], [3, 0], [3, 0], [2, 0]], [[4, 0], [4, 0], [1, 0], [1, 0], [1, 0], [0, 0], [4, 1], [4, 1], [1, 0], [3, 0], [0, 0], [0, 0], [3, 1], [3, 0], [3, 0], [3, 0], [0, 0], [0, 0]], [[2, 0], [2, 0], [3, 0], [3, 0], [3, 0], [3, 0], [2, 0], [2, 0], [3, 0], [0, 0], [0, 0], [0, 1], [2, 0], [2, 0], [2, 0], [1, 0], [1, 0], [1, 1]], [[4, 0], [4, 0], [4, 0], [3, 0], [3, 0], [3, 0], [4, 0], [2, 0], [2, 0], [0, 0], [3, 0], [3, 2], [2, 0], [2, 0], [0, 0], [0, 0], [0, 2], [0, 2]], [[2, 2], [2, 0], [4, 0], [4, 0], [4, 0], [1, 0], [3, 2], [3, 0], [4, 0], [4, 0], [1, 0], [1, 0], [3, 0], [0, 0], [0, 0], [0, 0], [0, 0], [1, 0]], [[1, 2], [2, 2], [2, 2], [2, 0], [4, 0], [4, 0], [1, 0], [1, 0], [2, 0], [0, 0], [4, 0], [4, 0], [1, 0], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0]], [[2, 0], [3, 0], [3, 0], [3, 0], [3, 0], [4, 0], [2, 0], [2, 0], [2, 0], [1, 0], [4, 0], [4, 0], [1, 0], [1, 0], [1, 0], [1, 1], [1, 1], [4, 1]], [[0, 0], [0, 0], [3, 0], [3, 0], [3, 0], [3, 1], [0, 0], [0, 0], [3, 0], [1, 0], [4, 1], [4, 1], [0, 0], [1, 0], [1, 0], [1, 0], [4, 0], [4, 0]], [[1, 1], [1, 0], [1, 0], [2, 0], [2, 0], [2, 0], [0, 1], [0, 0], [0, 0], [3, 0], [2, 0], [2, 0], [3, 0], [3, 0], [3, 0], [3, 0], [2, 0], [2, 0]], [[0, 2], [0, 2], [0, 0], [0, 0], [2, 0], [2, 0], [3, 2], [3, 0], [0, 0], [2, 0], [2, 0], [4, 0], [3, 0], [3, 0], [3, 0], [4, 0], [4, 0], [4, 0]], [[1, 0], [0, 0], [0, 0], [0, 0], [0, 0], [3, 0], [1, 0], [1, 0], [4, 0], [4, 0], [3, 0], [3, 2], [1, 0], [4, 0], [4, 0], [4, 0], [2, 0], [2, 2]]];
var Menu = function Menu() {
    this.CHUNK_CLASS = ".menu-chunk";
    this.MOBILE_MENU = "#mobile_side_menu";
    this.MOBILE_OPEN = ".mobile-burger";
    this.MOBILE_CLOSE = "#mobile_side_close";
    this.list = this.buildList();
    this.attachHandlers()
};
Menu.prototype.buildList = function() {
    var list = [];
    $(this.CHUNK_CLASS).each(function(index, item) {
        list.push({
            id: $(item).attr("id"),
            element: item
        })
    });
    return list
}
;
Menu.prototype.attachHandlers = function() {
    var self = this;
    $("[data-menuchunk]").click(function() {
        self.showSection($(this).data("menuchunk"))
    });
    $(this.MOBILE_OPEN).click(function() {
        self.showBurger()
    });
    $(this.MOBILE_CLOSE).click(function() {
        self.hideBurger()
    })
}
;
Menu.prototype.showSection = function(section) {
    var exists = this.list.filter(function(item) {
        return item.id === section
    }).length > 0;
    if (exists) {
        this.list.forEach(function(el, index) {
            var show = el.id === section;
            var func = null;
            if (show) {
                $(el.element).show();
                func = $(el.element).data("show")
            } else {
                $(el.element).hide();
                func = $(el.element).data("hide")
            }
            if (func !== undefined) {
                try {
                    func()
                } catch (e) {
                    console.log("Error running function on chunk display")
                }
            }
        });
        this.hideBurger()
    } else {
        console.log("Invalid menuchunk in link")
    }
}
;
Menu.prototype.showBurger = function() {
    $(this.MOBILE_MENU).show()
}
;
Menu.prototype.hideBurger = function() {
    $(this.MOBILE_MENU).hide()
}
;
var Settings = function Settings() {
    this.defaults = {
        gameLimit: 20,
        tutorial: true,
        players: 4,
        advanced: false,
        bgm: false,
        sfx: true,
        store: false,
        keep: true,
        lang: langCode
    };
    this.settings = Cookies.getJSON("cryptid-settings") || this.defaults;
    this.listeners = {};
    var self = this;
    Object.keys(this.settings).forEach(function(key, index) {
        self.updateUI(key, self.settings[key])
    });
    this.setHandlers();
    this.setOfflineFuncs();
    this.OFFLINE_DIV = "settings-elements";
    this.ticker = null;
    this.listen("store", function() {
        if (!self.settings.store) {
            Cookies.remove("cryptid-settings")
        }
    });
    this.listen("players", function() {
        var pcount = self.get("players");
        if (pcount == 2) {
            $("#twoPlayerWarn").slideDown();
            $("#tut_container").slideUp()
        } else {
            $("#twoPlayerWarn").hide();
            if (self.get("tutorial")) {
                $("#tut_container").slideDown()
            }
        }
    });
    var pcount = this.get("players");
    this.set("players", pcount);
    this.set("lang", this.get("lang"))
};
Settings.prototype.get = function(key) {
    if (this.settings.hasOwnProperty(key)) {
        return this.settings[key]
    } else {
        if (this.defaults.hasOwnProperty(key)) {
            return this.defaults[key]
        } else {
            throw "Setting key not recognised"
        }
    }
}
;
Settings.prototype.set = function(key, value) {
    if (!this.settings.hasOwnProperty(key)) {
        this.settings[key] = null
    }
    this.settings[key] = value;
    if (key === "gameLimit") {
        value = Math.min(Math.max(Math.round(value), 0), 100)
    }
    this.notify(key, value);
    this.updateUI(key, value);
    if (this.settings.store) {
        Cookies.set("cryptid-settings", this.settings, {
            expires: 730
        });
        Cookies.set("cookieconsent_status", "allow", {
            expires: 730
        })
    } else {
        Cookies.remove("cryptid-settings");
        Cookies.remove("cookieconsent_status")
    }
}
;
Settings.prototype.listen = function(key, func) {
    if (this.defaults.hasOwnProperty(key)) {
        if (!this.listeners.hasOwnProperty(key)) {
            this.listeners[key] = []
        }
        this.listeners[key].push(func)
    } else {
        throw "Setting key not recognised"
    }
}
;
Settings.prototype.notify = function(key, value) {
    if (this.listeners.hasOwnProperty(key)) {
        this.listeners[key].forEach(function(element) {
            element(value)
        })
    }
}
;
Settings.prototype.updateUI = function(key, value) {
    var attr = "[data-setting='" + key + "']";
    $(attr).each(function(index, element) {
        switch ($(element).attr("type")) {
        case "checkbox":
            if ($(element).prop("checked") !== value) {
                $(element).prop("checked", value)
            }
            break;
        default:
            if ($(element).val() !== value) {
                $(element).val(value)
            }
        }
    })
}
;
Settings.prototype.setHandlers = function() {
    var self = this;
    $("[data-setting]").change(function() {
        switch ($(this).attr("type")) {
        case "checkbox":
            self.set($(this).data("setting"), $(this).prop("checked"));
            break;
        default:
            self.set($(this).data("setting"), $(this).val())
        }
    })
}
;
Settings.prototype.setOfflineFuncs = function() {
    var self = this;
    $("#offline-elements").data("show", function() {
        self.offlineShow()
    }).data("hide", function() {
        self.offlineHide()
    })
}
;
Settings.prototype.offlineSummary = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
            switch (_context5.prev = _context5.next) {
            case 0:
                game.getGameStore().summaryInfo().then(function(off_settings) {
                    var cacheStatus = false;
                    try {
                        cacheStatus = window.applicationCache.status !== window.applicationCache.UNCACHED
                    } catch (err) {
                        cacheStatus = false
                    }
                    var out = {
                        appcache: cacheStatus,
                        storage: off_settings.offline,
                        storageType: off_settings.storage,
                        storageEnabled: settings.get("store"),
                        countStandard: off_settings.counts.offlineStandard,
                        countAdvanced: off_settings.counts.offlineAdvanced,
                        version: cryptid_version
                    };
                    $("[data-offline]").each(function(index, element) {
                        var output = out[$(element).data("offline")];
                        if ((typeof output === "undefined" ? "undefined" : _typeof(output)) === _typeof(true)) {
                            output = '<div class="w3-large' + (output ? ' tick">✔' : ' cross">✘') + "</div>"
                        }
                        $(element).empty().append(output)
                    });
                    if (out.appcache && out.storage && out.storageEnabled) {
                        $(".offline-working").show();
                        $(".offline-not-working").hide()
                    } else {
                        $(".offline-working").hide();
                        $(".offline-not-working").show()
                    }
                });
            case 1:
            case "end":
                return _context5.stop()
            }
        }
    }, _callee5, this)
}));
Settings.prototype.offlineShow = function() {
    this.ticker = setInterval(this.offlineSummary, 500);
    this.offlineSummary()
}
;
Settings.prototype.offlineHide = function(open) {
    clearInterval(this.ticker)
}
;
Settings.prototype.toggle = function() {
    if ($("#" + this.SETTINGS_DIV).is(":visible")) {
        this.hide("game-elements")
    } else {
        this.show()
    }
}
;
var soundMngr;
var SoundManager = function SoundManager() {
    this.BGM = "music";
    this.START = "start";
    this.BTN = "button";
    this.CLUES = "clues";
    this.CLICK = "click";
    this.pSounds = {};
    this.pSounds[this.START] = new Howl({
        src: ["snd/start.mp3", "snd/start.wav"]
    });
    this.pSounds[this.BGM] = new Howl({
        src: ["snd/music.mp3", "snd/music.ogg"],
        html5: true,
        volume: .5,
        loop: true
    });
    this.pSounds[this.BTN] = new Howl({
        src: ["snd/button.mp3", "snd/button.wav"]
    });
    this.pSounds[this.CLUES] = new Howl({
        src: ["snd/twigs.mp3", "snd/twigs.wav"],
        sprite: {
            clue1: [0, 300],
            clue2: [0, 600],
            clue3: [0, 900],
            clue4: [0, 1200],
            clue5: [0, 1600]
        }
    });
    this.pSounds[this.CLICK] = new Howl({
        src: ["snd/click.mp3", "snd/click.wav"]
    });
    var self = this;
    $("button").click(function() {
        self.playSound(self.CLICK)
    })
};
SoundManager.prototype.playSound = function(soundName) {
    if (settings.get("sfx")) {
        this.pSounds[soundName].play()
    }
}
;
SoundManager.prototype.playClue = function(clueNum) {
    if (settings.get("sfx")) {
        switch (clueNum) {
        case 1:
            this.pSounds[this.CLUES].play("clue1");
            break;
        case 2:
            this.pSounds[this.CLUES].play("clue2");
            break;
        case 3:
            this.pSounds[this.CLUES].play("clue3");
            break;
        case 4:
            this.pSounds[this.CLUES].play("clue4");
            break;
        case 5:
            this.pSounds[this.CLUES].play("clue5");
            break;
        default:
            break
        }
    }
}
;
SoundManager.prototype.playMusic = function() {
    if (settings.get("bgm")) {
        this.pSounds[this.BGM].play()
    }
    settings.listen("bgm", function(play) {
        if (play) {
            soundMngr.pSounds[soundMngr.BGM].play()
        } else {
            soundMngr.pSounds[soundMngr.BGM].pause()
        }
    })
}
;
function createsounds() {
    soundMngr = new SoundManager;
    soundMngr.playMusic()
}
var game;
var settings;
var cryptid_version = "3f.20191122.2";
var myTut;
var menu;
window.addEventListener("load", function(e) {
    var reloadErr = new errorReporter;
    window.applicationCache.addEventListener("updateready", function(e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            window.location.reload()
        } else {}
    }, false)
}, false);
$(document).ready(function() {
    var test;
    window.onbeforeunload = function() {
        if (game.getGameActive() === true) {
            return "Leaving the page will end any games in progress. Are you sure you want to leave?"
        }
    }
    ;
    settings = new Settings;
    menu = new Menu;
    createsounds();
    game = new gameController;
    test = game.init(4, false, false, true);
    populate_langs();
    langCode = settings.get("lang") || window.navigator.userLanguage || window.navigator.language;
    set_lang(langCode);
    create_tutorial();
    settings.set("players", settings.get("players"));
    map_init();
    $("#ngfStart").prop("disabled", false);
    $(".privacy-expand").click(function() {
        var content = $("#" + $(this).data("expandid"));
        var icon = $(this).find(".privacy-expand-icon");
        $(content).slideToggle("slow", function() {
            var visible = $(content).is(":visible");
            var write = "[-]";
            if (!visible) {
                write = "[+]"
            }
            $(icon).text(write)
        })
    })
});
var TutorialStep = function TutorialStep(innerHTML, prevNode, nextNode, hideNext, hidePrev, scrollTo) {
    this.innerHTML = innerHTML;
    this.prevNode = prevNode;
    this.nextNode = nextNode;
    this.hideNext = hideNext;
    this.hidePrev = hidePrev;
    this.scrollTo = scrollTo
};
var Tutorial = function Tutorial(inSteps, inContainer, inDiv, inNextButton, inPrevButton, inCloseButton) {
    this.div = inDiv;
    this.container = inContainer;
    this.steps = inSteps;
    this.show = true;
    this.currStep = 0;
    this.next = inNextButton;
    this.prev = inPrevButton;
    this.close = inCloseButton;
    var cook_val = settings.get("tutorial");
    if (!cook_val) {
        this.show = false
    }
    this.showTutorial(this.show);
    this.next.click({
        obj: this
    }, this.nextStep);
    this.prev.click({
        obj: this
    }, this.prevStep);
    this.close.click({
        obj: this
    }, this.clickClose);
    var self = this;
    settings.listen("tutorial", function(show) {
        self.show = show;
        self.showTutorial(show)
    });
    this.showStep(0)
};
Tutorial.prototype.showStep = function(i) {
    if (this.steps.length <= i) {
        return false
    }
    $(this.div).data("tkey", this.steps[i].innerHTML);
    $(this.div).attr("data-tkey", this.steps[i].innerHTML);
    translate_one(this.div);
    if (this.steps[i].hideNext) {
        this.next.hide()
    } else {
        this.next.show()
    }
    if (this.steps[i].hidePrev) {
        this.prev.hide()
    } else {
        this.prev.show()
    }
    this.currStep = i;
    var mobileOffset = $("html").width() <= 600 ? 60 : 0;
    var element = this.steps[i].scrollTo || "#tut_container";
    $("html, body").animate({
        scrollTop: $(element).offset().top - mobileOffset
    }, 500)
}
;
Tutorial.prototype.nextStep = function(e) {
    var tutObj = e.data.obj;
    var iNext = tutObj.steps[tutObj.currStep].nextNode;
    tutObj.showStep(iNext)
}
;
Tutorial.prototype.prevStep = function(e) {
    var tutObj = e.data.obj;
    var iNext = tutObj.steps[tutObj.currStep].prevNode;
    tutObj.showStep(iNext)
}
;
Tutorial.prototype.showTutorial = function(boolShow) {
    if (boolShow) {
        this.container.show()
    } else {
        this.container.hide()
    }
}
;
Tutorial.prototype.clickClose = function(e) {
    var tutObj = e.data.obj;
    tutObj.show = false;
    tutObj.showTutorial(false);
    $(this.container).hide();
    settings.set("tutorial", false)
}
;
function create_tutorial() {
    var tutNodes = [];
    tutNodes.push(new TutorialStep("tut_node_0",0,1,false,true));
    tutNodes.push(new TutorialStep("tut_node_1",0,2,false,true));
    tutNodes.push(new TutorialStep("tut_node_2",1,0,true,false));
    tutNodes.push(new TutorialStep("tut_node_3",2,4,false,true));
    tutNodes.push(new TutorialStep("tut_node_4",3,5,false,false));
    tutNodes.push(new TutorialStep("tut_node_5",4,6,true,false));
    tutNodes.push(new TutorialStep("tut_node_6",0,6,true,true));
    tutNodes.push(new TutorialStep("tut_node_7",0,8,false,true));
    tutNodes.push(new TutorialStep("tut_node_8",7,0,true,false));
    myTut = new Tutorial(tutNodes,$("#tut_container"),$("#tut_body"),$("#tut_next"),$("#tut_prev"),$("#tut_close"))
}

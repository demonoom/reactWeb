/**
 * Created by madapeng on 17-4-17.
 */


;(function ($) {


    var littlePanle = function () {

        this.param = {
            url: null,
            title: '',
            orderIndex: 1,
            stylePage: {
                top: 0,
                left: 0,
                width: 400,
                height: 596,
                position: 'relative',
                backgroundColor: '#fff',
                zIndex: 0
            },
            style: {},
            sourcesCreate: [],
        }

    }


    littlePanle.prototype.el = {};
    littlePanle.prototype.zoomview = function (id) {

        let nodeEl = $('#' + id);
        let posRef2 = window.getComputedStyle(nodeEl[0]);
        let perWidth = replaceUnit(posRef2.width);
        let perHeight = replaceUnit(posRef2.height);
        let perTop = replaceUnit(posRef2.top);
        let perLeft = replaceUnit(posRef2.left);

        nodeEl.attr('per', JSON.stringify({
            position: posRef2.position,
            width: Math.round(perWidth),
            height: Math.round(perHeight),
            left: Math.round(perLeft),
            top: Math.round(perTop)
        }));
        nodeEl.css({width: '100%', height: '100%', left: 0, top: 0, position: 'fixed'});
        //
        let el = nodeEl.find('.zoom');
        el.off();
        el.html('&#xe60f;');
        el.on('click', this.zoomMinView.bind(this, id));
        enterFull(nodeEl[0]);
    }
    littlePanle.prototype.zoomMinView = function (id) {
        let nodeEl = $('#' + id);
        let perInfo = nodeEl.attr('per');
        nodeEl.removeAttr('per');
        let perObj = eval('(' + perInfo + ')');
        nodeEl.css({
            position: perObj.position,
            width: perObj.width,
            height: perObj.height,
            left: perObj.left,
            top: perObj.top
        });

        let el = nodeEl.find('.zoom');
        el.off();
        el.html('&#xe67e;');
        el.on('click', this.zoomview.bind(this, id));
        //
        exitFull();

    }
    littlePanle.prototype.closepanle = function (id) {

        let tmp = [];
        LP.mgr.map(function (item, index) {
            if (item.id == id) {
                tmp.push(item)
            }
        });
        LP.hideArr = LP.hideArr.concat(tmp);
        if (!(LP.mgr.length - LP.hideArr.length)) {
            LP.delAll();
        } else {

            $('#' + id).css({visibility: 'hidden'});
            $('#ifr' + id).removeAttr('src');
        }
    }


    littlePanle.prototype._teachAdminIframe_HtmlTemplet = function (obj) {

        let id = UUID(8, 16);
        this.id = id;
        this.ifrid = 'ifr' + id;
        this.htm = `<div id="${id}" class="dialog little-layout-aside-r-show">
                <div class="header draggable">
                <h3 class="title">${ obj.title }</h3>
                    <div class="little-tilte">
                        <a class="close"><i className="iconfont iconfont_close">&#xe615;</i></a>
                        <a class="zoom"><i className="iconfont iconfont_more">&#xe67e;</i></a>
                        <a class="back"><i className="iconfont iconfont_more1">&lt;</i></a>
                        <a class="forward"><i className="iconfont iconfont_more2">&gt;</i></a>
                        
                    </div>
                </div>
                <div class="content">
                    <section class="littleAnt-iframe-panle">
                        <iframe  border={0} id="${this.ifrid}"  src="${ obj.url }"  ></iframe>
                    </section>
                </div>
                </div>`;


        let styleObj = this.calcPos(this.param.stylePage, this.param.stylePage.zIndex, this.param.orderIndex);

        this.htm = $(this.htm).css(styleObj);
        $(document.body).append(this.htm);
        this.el = $('#' + this.id);
        $(this.el).drag();
        $(this.el).find('.close').on('click', this.closepanle.bind(this, this.id));
        $(this.el).find('.zoom').on('click', this.zoomview.bind(this, this.id));
        $(this.el).find('.back').on('click', this.historyControler.bind(this, this.id, -1));
        $(this.el).find('.forward').on('click', this.historyControler.bind(this, this.id, 1));
        $(this.el).find('.enterFull').on('click', enterFull);
        $(this.el).find('.exitFull').on('click', exitFull);
        this.ifrel = $('#' + this.ifrid);

        this.ifrel.on('load', this._iframeonloadevent.bind(this, this.ifrid));

        return this;
    }


    littlePanle.prototype._showMP4PPTPDFTemplet = function (obj) {
        let id = UUID(8, 16);
        this.id = id;
        this.ifrid = 'ifr' + id;
        this.htm = `<div id="${id}" class="dialog little-layout-aside-r-show">
                <div class="header draggable">
                <h3 class="title">${ obj.title }</h3>
                    <div class="little-tilte">
                        <a class="close"><i className="iconfont iconfont_close">&#xe615;</i></a>
                        <a class="zoom"><i className="iconfont iconfont_more">&#xe67e;</i></a>
                        
                    </div>
                </div>
                <div class="content">
                    <section class="littleAnt-iframe-panle">
                        <iframe  border={0} id="${this.ifrid}"  src="${ obj.url }"  ></iframe>
                    </section>
                </div>
                </div>`;

        var objtemplet = {htm: this.htm, id: this.id, ifrid: this.ifrid};
        let styleObj = this.calcPos(this.param.stylePage, this.param.stylePage.zIndex, this.param.orderIndex);

        objtemplet.htm = $(objtemplet.htm).css(styleObj);
        $(document.body).append(objtemplet.htm);
        this.el = $('#' + objtemplet.id);
        $(this.el).drag();
        $(this.el).find('.close').on('click', this.closepanle.bind(this, this.id));
        $(this.el).find('.zoom').on('click', this.zoomview.bind(this, this.id));
        $(this.el).find('.back').on('click', this.historyControler.bind(this, this.id, -1));
        $(this.el).find('.forward').on('click', this.historyControler.bind(this, this.id, 1));
        $(this.el).find('.enterFull').on('click', enterFull);
        $(this.el).find('.exitFull').on('click', exitFull);
        this.ifrel = $('#' + objtemplet.ifrid);

        this.ifrel.on('load', this._iframeonloadevent.bind(this, objtemplet.ifrid));

        return this;
    }


    littlePanle.prototype._showHtmlFlv = function (obj) {

        let id = UUID(8, 16);
        this.id = id;
        let vid = 'v' + this.id;
        let videoArr = obj.param || [obj];
//
        let listBtn = [];
        let srcList = [];
        let classChange = 'single';

        if (videoArr.length > 1) {
            classChange = 'multi';
            videoArr.map(function (video, i) {
                i++;
                srcList.push({type: 'video/x-flv', src: video.path});
                listBtn.push("<a class='listBtn' >" + i + "</a>");
            });
        } else {
            let flv = videoArr[0];
            srcList.push({type: 'video/x-flv', src: flv.path || flv.url});
        }


        let htm = `<div id="${id}" class="dialog little-layout-aside-r-show">
                <div class="header draggable">
                <h3 class="title">${ obj.title }</h3>
                    <div class="little-tilte">
                        <a class="close"><i className="iconfont iconfont_close">&#xe615;</i></a>
                    </div>
                </div>
                <div class="content">
                    <section class="littleAnt-iframe-panle ${classChange}">
                       <video id="${vid}" class="video-js vjs-default-skin vjs-big-play-centered"
                       src="${srcList[0].src}"   data-setup='{}'></video>
                       <div class="list-group" >${ listBtn.length ? listBtn.join('') : '' }</div>
                    </section>
                </div>
                </div>`;


        var htmlContent = htm;
        let styleObj = this.calcPos(obj.stylePage, obj.stylePage.zIndex, obj.orderIndex);
        htmlContent = $(htmlContent).css(styleObj);
        $(document.body).append(htmlContent);
        this.el = $('#' + this.id);
        $(this.el).drag();
        $(this.el).find('.close').on('click', this.closepanle.bind(this, this.id));

        var options = {
            sourceOrder: true,
            controls: true,
            autoplay: true,
            preload: "auto",
            sources: srcList,
            techOrder: ['html5', 'flash']
        };

        var playerA = videojs(vid, options, function () {
            playerA.play();
            playerA.on('ended', function () {
            });
        });

        $('.list-group a').on("click", function () {
            let nextVideo = srcList[parseInt($(this).text()) - 1];
            playerA.src(nextVideo);
        });


        return this;

    }


    littlePanle.prototype.GetLP = function (obj, oldArray) {

        this.param.mode = obj.mode || obj.htmlMode || '';
        this.param.width = obj.width || '';
        this.param.param = obj.param;
        this.param.title = obj.title;
        this.param.url = this._setProxyInfo(obj.url);

        let maxIndex = () => {
            let refindex = 0;
            if (!oldArray.length) return refindex;
            oldArray.map(function (item, index) {

                let ind = $(item.el.selector).css('z-index');
                ind = parseInt(ind);
                ind++;
                refindex = ind > refindex ? ind : refindex;

            })
            return refindex;
        }

        this.param.orderIndex = oldArray.length;
        this.param.stylePage.zIndex = maxIndex();
        this.param.stylePage.width = parseInt(this.param.width.replace(/[a-z]*/img, ''));
        //
        //

        switch (this.param.mode) {
            default:
                this._showMP4PPTPDFTemplet(this.param);
                break;
            case 'flv':
                this._showHtmlFlv(this.param);
                // this._showHtmlFlv_old(this.param);
                break;
            case 'teachingAdmin':
                this._teachAdminIframe_HtmlTemplet(this.param);
                break;

        }

        return this;
    }
    littlePanle.prototype._setProxyInfo = function (url) {

        if (!url) return '';

        if (/www\.maaee\.com/img.test(url)) {
            return '/proxy' + url.split('www.maaee.com')[1];
        }

        if (/60\.205\.86\.217:8585/img.test(url)) {
            return '/proxy' + url.split('60.205.86.217:8585')[1];
        }

        if (/60\.205\.86\.217/img.test(url)) {
            return '/proxy' + url.split('60.205.86.217')[1];
        }

        return url;
    }


    littlePanle.prototype.calcPos = function (refStyle, index, orderIndex) {

        // 计算出复位的位置
        var refOff = $('.ant-layout-operation').offset();
        var refW = $('.ant-layout-operation').width();

        let tmpInterval = orderIndex * 45;
        //
        if (!refStyle.width) {
            refStyle.width = 380;
        }
        let leftRef = (refOff.left + refW) - refStyle.width;
        leftRef = leftRef + tmpInterval;
        refStyle.left = parseInt(leftRef.toFixed());
        //
        let topRef = refOff.top + tmpInterval;
        topRef = topRef - $(document.body).height();
        topRef = topRef - refStyle.height * orderIndex;
        refStyle.top = parseInt(topRef.toFixed());
        //
        refStyle.zIndex = index++;

        return refStyle

    }

    littlePanle.prototype._iframeonloadevent = function (id, event) {

        event.target.contentWindow.phone = phone;

    }


    littlePanle.prototype.historyControler = function (id, num) {

        var ifr = $('#ifr' + id)[0];
        ifr.contentWindow.history.go(num);

    }

    // 保持android ios 一直体验的接口实现
    var phone = {
        showLoading() {


        },

        showLoading(cancelAble) {


        },

        dismissLoading() {

        },

        showMessage(message) {

        },

        playAudio(url) {

        },

        playVideoM(jsonObject) {


        },

        playVideoJSON(jsonObject) {
            var obj = eval('(' + jsonObject + ')');
            top.LP.Start({url: '', title: obj.title, htmlMode: true, param: obj.liveVideos});
        },

        showImage(url) {

        },

        showImage(url, currentUrl) {

        },

        showPdf(pdfUrl) {

            top.LP.Start({url: pdfUrl, title: ''});
        },

        playVideo(videoPath) {

            top.LP.Start({url: videoPath, title: ''});

        },

        finish() {

        },

        /**
         * 结束本activity并且刷新前一个fragment
         */
        finishForRefresh() {

        },

        /**
         * 结束本fragment并且在前一个fragment执行一段脚本
         *
         * @param cmd
         */
        finishForExecute(cmd) {

        },

        /**
         * 结束并开启一个新页面
         *
         * @param url
         */
        finishForNewPage(url) {

        },

        /**
         * 是否显示分享按钮
         *
         * @param shareAble
         */
        setShareAble(shareAble) {

        },

        teacherJoinClass(vid) {

        },

        /**
         * 是否可以下拉刷新
         *
         * @param refreshAble
         */
        setRefreshAble(refreshAble) {

        },

        showSubjectWeikeMaterials(subjectId) {

        },

        addSubjectWeikeMaterialInput(subjectId) {

        }


    }


    var lpM = {
        mgr: [],
        hideArr: [],

        Start(objParam){
            this.GetLP(objParam);
        },
        GetLP(objParam) {

            if ((this.mgr.length - this.hideArr.length) >= 3) {
                alert('弹窗打开太多！');
                return;
            }
            let objA = new littlePanle().GetLP(objParam, this.mgr);
            this.mgr.push(objA);
            this.addOrderBtn();
            return objA;
        },
        addOrderBtn(){
            if (!$('.ant-layout-header .lpmgrbtn').length) {
                $('.ant-layout-header > div').append("<div class='lpmgrbtn'>" +
                    "<a onclick='LP.orderAll()' class='no_le'><i class='iconfont'>&#xe67a;</i><span>复位</span></a>" +
                    "<a onclick='LP.delAll()' class='del'><i class='iconfont'>&#xe6b4;</i><span>关闭</span></a>" +
                    "</div>");
            }
        },
        delAll(){
            $('.dialog.little-layout-aside-r-show').remove();
            this.mgr = [];
            this.hideArr = [];
            $('.lpmgrbtn').remove();

        },
        orderAll(){

            if (!this.mgr.length) {
                return;
            }

            // 计算出复位的位置
            var refOff = $('.ant-layout-operation').offset();
            var refW = $('.ant-layout-operation').width();
            //
            let tmpArr = [];
            let newArr = [];

            // 复位所有lp
            this.mgr.map(function (item, index) {

                if ($(item.el.selector).css('visibility') == 'hidden') {
                    tmpArr.push(item);
                    $(item.el.selector).remove();
                } else {
                    newArr.push(item);
                    index = index - tmpArr.length;
                    let tmpInterval = index * 45;
                    let leftRef = (refOff.left + refW) - $(item.el).width();
                    leftRef = leftRef + tmpInterval;
                    leftRef = parseInt(leftRef.toFixed());
                    //
                    //
                    let topRef = refOff.top + tmpInterval;
                    topRef = topRef - $(document.body).height();
                    topRef = topRef - ($(item.el).height() * index);
                    topRef = parseInt(topRef.toFixed());
                    //
                    let zindex = index++;

                    $(item.el).css({top: topRef, left: leftRef, zIndex: zindex});
                }

            })

            this.mgr = newArr;
            this.hideArr = [];


        }
    }


    window.LP = lpM;


}(jQuery));

function UUID(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}


function exitFull() {
    var docElm = document;

    if (docElm.exitFullscreen) {
        docElm.exitFullscreen();
    }
    else if (docElm.mozCancelFullScreen) {
        docElm.mozCancelFullScreen();
    }
    else if (docElm.webkitCancelFullScreen) {
        docElm.webkitCancelFullScreen();
    }
    else if (docElm.msExitFullscreen) {
        docElm.msExitFullscreen();
    }
    if (typeof fn == 'function') fn();
}

function enterFull(el) {
    var docElm = document.documentElement;
    if (el) docElm = el;
//W3C
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
    }
//FireFox
    else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
    }
//Chrome等
    else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
    }
//IE11
    else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}
function replaceUnit(str) {
    return parseInt(str.replace(/[a-z]*/img, ''))

}
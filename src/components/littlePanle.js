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


    littlePanle.prototype._teachAdmin_UI_templet = function (obj) {

        let id = UUID(8, 16);
        this.id = id;
        this.ifrid = 'ifr' + id;
        this.htm = `<div id="${id}" class="dialog little-layout-aside-r-show teachingAdmin">
                <div class="header draggable">
                <h3 class="title">${ obj.title }</h3>
                    <div class="little-tilte">
                        <a class="back"><i class="anticon anticon-left "></i></a>
                    </div>
                </div>
                <div class="content">
                    <section class="littleAnt-iframe-panle">
                        <iframe  border={0} id="${this.ifrid}"  src="${ obj.url }"  ></iframe>
                    </section>
                </div>
                </div>`;

        let styleObj = (refStyle, index, orderIndex) => {

            // 计算出复位的位置
            var refOff = $('.ant-layout-operation').offset();
            var refW = $('.ant-layout-operation').width();

            let tmpInterval = 0;
            //
            if (!refStyle.width) {
                refStyle.width = 380;
            }
            let leftRef = (refOff.left + refW) - refStyle.width;
            //  leftRef = leftRef + tmpInterval;
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

        this.htm = $(this.htm).css(styleObj(this.param.stylePage, this.param.stylePage.zIndex, this.param.orderIndex));
        $(document.body).append(this.htm);
        this.el = $('#' + this.id);
        if (obj.drag) {
            $(this.el).drag();
        }

        $(this.el).find('.back').on('click', this.closepanle.bind(this, this.id));
        this.ifrel = $('#' + this.ifrid);
        this.ifrel.on('load', this._teachAdmin_UI_templet_iframe_event.bind(this, this.id, this.ifrid));
        return this;
    }
    littlePanle.prototype._teachAdmin_UI_templet_iframe_event = function (id, ifrid, event) {

        event.target.contentWindow.phone = phone;
        $('#' + id + ' h3').text(event.target.contentWindow.document.title);
    }

//
    littlePanle.prototype._default_UI_templet = function (obj) {
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

        this.ifrel.on('load', this._default_UI_templet_iframe_event.bind(this, objtemplet.ifrid));


        return this;
    }

    littlePanle.prototype._default_UI_templet_iframe_event = function (id, event) {
        event.target.contentWindow.phone = phone;
    }

    littlePanle.prototype._flv_UI_templet = function (obj) {

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


    littlePanle.prototype._liveTV_UI_templet = function (obj) {

        let id = UUID(8, 16);
        this.id = id;
        this.ifrliveid = 'live' + id;
        this.pptIframeName = 'panle' + id;
        this.showTuiPing = 'showTuiPing';
        this.htm = `<div id="${id}" class="dialog little-layout-aside-r-show ${obj.mode}">
		<div class="public—til—blue">
							<div class="little-tilte">
                    			<a class="back"><i class="anticon anticon-left "></i></a>
                    		</div>
                			<span>${ obj.title }</span>
               			 </div>
                <div class="content">
                    <section class="liveTV tab">
                        <ul>
                            <li class="panleBtn ant-menu-item-selected" ref="panleBtn" >
                                <i class="icon_menu_ios icon_baiban"></i>
                                <span class="tan">白板</span>
                            </li>
                            <li class="publicBtn" ref="publicBtn"  >
                                <i class="icon_menu_ios icon_gongpin"></i>
                                <span class="tan">公屏</span>
                            </li>
                        </ul>
                    </section>
					
					<div class="right_cont">
						 	<section class="live" id="${this.ifrliveid}">
                   			</section>
							<div class="activity">
								<section class="panle">
									<iframe  id="${this.pptIframeName}"  name="${this.pptIframeName}"  />
									<div  id="${this.showTuiPing}" class="panle_book ${this.showTuiPing}" ></div>
										  <div class="showDanmuArea" ></div>
											<div class="floatBtn" >
												<span class="lz"  ><img src="../../src/components/images/lizan.png" width="50" height="50" /></span>
												<span class="dm"  ><img src="../../src/components/images/danmu.png" width="50" height="50" /></span>
											</div>
											<div class="inputArea" >
												<textarea placeholder="输入弹幕内容！" class="textarea_1"  id="InputTxtToPanel" ></textarea>
												<button  ref="sendPanleText" >发送弹幕</button>
											</div>
								</section>
								<section class="public" >
									<div class="showDanmuArea" ></div>
									<div class="inputArea" >
										<textarea placeholder="输入公屏内容！" class="textarea_2" id="InputTxtToPublic" ></textarea>
										<button ref="sendPublicImg" >发图片</button>
										<button ref="sendPublicText"  >发公屏</button>
									</div>
								</section>
						 </div>
					</div>
                    

                    
                </div>
                </div>`;

        let styleObj = (refStyle) => {
            refStyle.left = 0;
            refStyle.top = 0;
            refStyle.position = 'fixed';
            refStyle.width = '100%';
            refStyle.height = '100%';
            refStyle.zIndex = 10;
            return refStyle
        }

        this.htm = $(this.htm).css(styleObj(this.param.stylePage));
        $('.ant-layout-operation').append(this.htm);
        this.el = $('#' + this.id);
        $(this.el).find('.back').on('click', this.closepanle.bind(this, this.id));
        $(this.el).find('.liveTV.tab li').on('click', this.changePanel);
        $(this.el).find('.activity .inputArea button').on('click', this.sendContent.bind(this, this.param));
//
//
//
        videojs.options.flash.swf = "static/video-js.swf";
        obj.param.ifrliveid = this.ifrliveid;
        obj.param.pptIframeName = this.pptIframeName;
        obj.param.showTuiPing = this.showTuiPing;
        obj.param.warpid = this.id;

        this.websocket(obj.param);
        return this;
    }

    // 发送内容
    littlePanle.prototype.sendContent = function (param, event) {


        event = event || window.event;
        let el = $(event.target);

        let con = {}
        let user = eval("(" + sessionStorage.getItem('loginUser') + ")");

        switch ($(el).attr('ref')) {
            case 'sendPanleText':

                let tmpTxt1 = $('#InputTxtToPanel').val();
                if(!tmpTxt1){
                    return;
                }
                $('#InputTxtToPanel').val('');

                con = {command: "simpleClassDanmu", data: {content: tmpTxt1}};
                LP.LiveTVSocket.send(con);
                $('.liveTV.tab li').removeClass('on');
                $(el).addClass('on');
                return;
                break;
            case 'sendPublicText':

                let tmpTxt2 = $('#InputTxtToPublic').val();
                if(!tmpTxt2){
                    return;
                }
                $('#InputTxtToPublic').val('');

                con = {
                    "command": "message",
                    "data": {
                        "message": {
                            "command": "message",
                            "content": tmpTxt2,
                            "createTime": new Date().getTime(),
                            fromUser: user,
                            "state": 2,
                            "toId": param.param.vid,
                            "toType": 3,
                            "uuid": UUID(32, 16),
                        }
                    }
                };


                ms.send(con);
                $('.liveTV.tab li').removeClass('on');
                $(el).addClass('on');
                break;
            case 'sendPublicImg':


                con = {
                    "command": "message",
                    "data": {
                        "message": {
                            "attachment": {
                                "address": "http://192.168.2.104:8080/upload4/2017-05-24/11/79a4b8c2-a152-4638-bb8a-f2d50e67d200.webp",
                                createTime: new Date().getTime(),
                                type: 1,
                                user: user,
                            },
                            "command": "message",
                            "content": '',
                            "createTime": new Date().getTime(),
                            fromUser: user,
                            "state": 2,
                            "toId": param.param.vid,
                            toType: 3,
                            "uuid": UUID(32, 16),
                        }
                    }
                };

                ms.send(con);
                $('.liveTV.tab li').removeClass('on');
                $(el).addClass('on');

                break;

        }


    }




    littlePanle.prototype.websocket = function (obj) {
        var connection = new ClazzConnection();
        LP.LiveTVSocket = connection;
        let __this = this;

        connection.clazzWsListener = {

            onError: function (errorMsg) {
                //强制退出课堂
                __this.closepanle(obj.id)

            },

            onWarn: function (warnMsg) {


                alert(warnMsg);
            },
            // 显示消息
            onMessage: function (info) {

                let htm = '';
                switch (info.command) {
                    case 'pushHandout': // 图片
                        htm = `<img src='${info.data.url}'/>`;
                        $('#' + obj.showTuiPing).html(htm).css({'z-index':1});
                        $('#' + obj.pptIframeName).css({'z-index':0});

                        break;
                    case'classOver':
                        alert('下课了!');
                        __this.commitClose(obj.warpid);
                        break;
                    case 'studentLogin': // 显示直播视频

				//	info.data.play_rtmp_url = 'rtmp://60.205.86.217:1935/live2/54208';
                        htm = ` <video   id="v${obj.ifrliveid}" class="video-js vjs-default-skin vjs-big-play-centered"
                               controls preload="auto" poster="" width="300" height="300"
                               data-setup='{}'>
                                <source  src="${info.data.play_rtmp_url}"   type='rtmp/flv'  /></video>`;
                        $('#' + obj.ifrliveid).html(htm);
                        var player = videojs('v' + obj.ifrliveid, {}, function onPlayerReady() {
                            this.play();
                            this.on('ended', function () {
                                // videojs.log('Awww...over so soon?!');
                            });
                        });
                        break;
                    case 'classDanmu':

                        let sayText1 = `<p>${info.data.message.content}</p>`;
                        let loginUser = eval('('+ sessionStorage.getItem('loginUser')+')');
                        let fromUser1 =  info.data.message.fromUser;
                        let refClass = 'left';

                        if(fromUser1.colUid==loginUser.colUid){
                            refClass = 'right';
                        }
                        let fromUserName1 = `<p class="u-name">${fromUser1.userName}</p>`;
                        let userFace = `<img src="${fromUser1.avatar}" />`;

                        if (info.data.message.attachment) {
                            sayText1 = `<img style="width:120px;height:auto;"  src="${info.data.message.attachment.address}"/>`;
                        }
                        htm = `<div class="sayLine ${refClass}"><div class="username" >${fromUserName1}</div><div class="saycont"><div class="sayHeader" >${userFace}</div><div class="sayCon" >${sayText1}</div></div>`;
                        $('.public .showDanmuArea').append(htm);
                        break;
                    case'simpleClassDanmu': // 弹幕

                        let sayText = `<p>${info.data.message.content}</p>`;
                        let fromUser = `<p>${info.data.message.fromUser.userName}：</p>`;
                        htm = `<marquee behavior="scroll" contenteditable="true" onstart="this.firstChild.innerHTML+=this.firstChild.innerHTML;" scrollamount="5" onmouseover="this.stop();" onmouseout="this.start();"><div class="sayLine">${fromUser}${sayText}</div></marquee>`;
                        $('.panle .showDanmuArea').append(htm);
                        break;

                    default :
                        __this.parsePPT.call(__this, obj,info );
                        break;

                }

            }
        };

        connection.connect({command: 'studentLogin', data: {userId: parseInt(obj.uid), vid: obj.vid}});
    }


    littlePanle.prototype.parsePPT = function (param, info) {

        let _self = this;
        let command = info.command;
        let pptIframeName = param.pptIframeName;
        let showTuiPing = param.showTuiPing;



        //课堂ppt操作
        if (command == "class_ppt") {
            var control = info.data.control;


            //1:play 2:pre 3:next 4:click 5:close
            switch (control) {
                case 1:
                    playPPT( _self._setProxyInfo(  info.data.html ));
                    break;
                case 2:
                    pptPre();
                    break;
                case 3:
                    pptNext();
                    break;
                case 4:
                    pptClick();
                    break;
                case 5:
                    closePPT();
                    break;
                case 6:
                    pptPreAni();
                    break;
            }
        }

        //检测ppt是否同步

        if (command == "pptCheckPage") {
            var current = info.data.currentPage;
            pptCheckPage(current);
        }


        function playPPT(html) {
            $("#" + pptIframeName).attr("src", html + "?v=1").css({'z-index':1});
            $('#' + showTuiPing).css({'z-index':0});
        }


        function closePPT() {

        }


        function pptPre() {
            window.frames[pptIframeName].window.pre();
        }

        function pptPreAni() {
            window.frames[pptIframeName].window.preAni();
        }

        function pptNext() {
            window.frames[pptIframeName].window.next();
        }

        function pptClick() {
            window.frames[pptIframeName].window.click();
        }


        function pptCheckPage(currentPage) {
            window.frames[pptIframeName].window.checkSlide(currentPage);
        }

    }

    // 白板公屏切换
    littlePanle.prototype.changePanel = function (event) {


        event = event || window.event;
        let el = event.target;
        if (el.nodeName != 'li') {
            el = $(el.parentNode);
        }

        switch ($(el).attr('ref')) {
            case 'panleBtn':
                $('.activity .public').css({display: 'none'});
                $('.activity .panle').css({display: 'block'});
                break;
            case 'publicBtn':
                $('.activity .panle').css({display: 'none'});
                $('.activity .public').css({display: 'block'});
                break;

        }

        $('.liveTV.tab li').removeClass('ant-menu-item-selected');
        $(el).addClass('ant-menu-item-selected');

    }

    littlePanle.prototype.commitClose=function(id){
        var msg = "您确定要退出课堂？";
        if (confirm(msg)){
            this.closepanle(id);
            return true;
        }else{
            return false;
        }
    }


    littlePanle.prototype.GetLP = function (obj, oldArray) {

        this.param.mode = obj.mode || obj.htmlMode || '';
        this.param.width = obj.width || '';
        this.param.param = obj.param;
        this.param.title = obj.title;
        this.param.drag = obj.drag;
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
                this._default_UI_templet(this.param);
                break;
            case 'flv':
                this._flv_UI_templet(this.param);
                break;
            case 'teachingAdmin':
                this._teachAdmin_UI_templet(this.param);
                break;
            case 'liveTV':
                this._liveTV_UI_templet(this.param);
                break;

        }

        return this;
    }
    littlePanle.prototype._setProxyInfo = function (url) {

        if (!url) return '';


        if (/www\.maaee\.com\:80/img.test(url)) {
            return '/proxy' + url.split('www.maaee.com:80')[1];
        }

        if (/www\.maaee\.com/img.test(url)) {
            return '/proxy' + url.split('www.maaee.com')[1];
        }


        if (/60\.205\.86\.217:8585/img.test(url)) {
            return '/proxy' + url.split('60.205.86.217:8585')[1];
        }

        if (/60\.205\.86\.217/img.test(url)) {
            return '/proxy' + url.split('60.205.86.217')[1];
        }
        //192.168.1.59:8080
        if (/192\.168\.1\.59\:8080/img.test(url)) {
            return '/proxy' + url.split('192.168.1.59:8080')[1];
        }
        //192.168.1.59:8080
        if (/192\.168\.1\.34\:8080/img.test(url)) {
            return '/proxy' + url.split('192.168.1.34:8080')[1];
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


    littlePanle.prototype.historyControler = function (id, num) {

        var ifr = $('#ifr' + id)[0];
        ifr.contentWindow.history.go(num);

    }


    var lpM = {
        mgr: [],
        hideArr: [],

        Start(objParam){
            this.GetLP(objParam);
        },

        GetLP(objParam) {
            let _this = this;
            let objA;

            switch (objParam.mode) {
                case 'teachingAdmin':
                    objA = new littlePanle().GetLP(objParam, _this.mgr);
                    break;

                case 'liveTV':

                    if (_this.mgr.length) {
                        alert('打开太多！');
                        return;
                    }
                    objA = new littlePanle().GetLP(objParam, _this.mgr);
                    break;

                default :
                    if ((this.mgr.length - _this.hideArr.length) >= 3) {
                        alert('打开太多！');
                        return;
                    }
                    objA = new littlePanle().GetLP(objParam, _this.mgr);
                    _this.addOrderBtn();
            }
            this.mgr.push(objA);
            return objA;

        },
        addOrderBtn(){
            if ($('.ant-layout-header .lpmgrbtn').length) return;
            $('.ant-layout-header > div').append("<div class='lpmgrbtn'>" +
                "<a onclick='LP.orderAll()' class='no_le'><i class='iconfont'>&#xe67a;</i><span>复位</span></a>" +
                "<a onclick='LP.delAll()' class='del'><i class='iconfont'>&#xe6b4;</i><span>关闭</span></a>" +
                "</div>");
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


// 保持android ios 一直体验的接口实现
var phone = {
    // callHandler ({method: xxxx, callbackId: xxxxxx, url: xxxxx})
    callHandler(refObj, ifrobj)
    {

        let obj = refObj;
        //  let obj = eval('(' + ref + ')');

        if (!this[obj.method]) {
            console.error(ref);
            return;
        }
        let result = this[obj.method](obj);

        if (result && obj.callbackId) {
            ifrobj.contentWindow[obj.callbackId](result);
        }
    },

    openNewPage(args){
        let obj = {mode: 'teachingAdmin', url: args.url};
        LP.Start(obj);
    },

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
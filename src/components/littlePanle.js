/**
 * Created by madapeng on 17-4-17.
 */
// import {showModal} from '../utils/utils';

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
                height: 500,
                position: 'relative',
                backgroundColor: '#fff',
                zIndex: 0
            },
            style: {},
            sourcesCreate: [],
        }

    };

    littlePanle.prototype.el = {};
    var aa = true;
    littlePanle.prototype.zoomview = function (id) {


        let nodeEl = $('#' + id);
        /*
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
        if (aa) {
            nodeEl.css({width: '100%', height: '100%', left: 0, top: '10%', position: 'fixed'});
            aa = false;
        } else {
            nodeEl.css({width: '100%', height: '100%', left: 0, top: 0, position: 'fixed'});
            aa = true;
        }
        let el = nodeEl.find('.zoom');
        el.off();
        el.html('&#xe60f;');
        el.on('click', this.zoomMinView.bind(this, id));
        // el.off('click',this.zoomview.bind(this, id)).on('click', this.zoomMinView.bind(this, id));
        */
        enterFull(nodeEl[0]);
    };
    littlePanle.prototype.zoomMinView = function (id) {
        // alert(2);
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

    };
    littlePanle.prototype.closepanle = function (id) {
        if (window.liveTVWS) {
            window.liveTVWS._close();
        }


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
        utilsCommon.unbind(document, 'paste', onPasteFunction);
    };

    var isAddedListener = false;

    littlePanle.prototype._teachAdmin_UI_templet = function (obj) {

        let id = UUID(8, 16);
        this.id = id;
        this.ifrid = 'ifr' + id;
        this.htm = `<div id="${id}" class="dialog little-layout-aside-r-show teachingAdmin">
                <div class="header draggable">
                <h3 class="title">${ obj.title }</h3>
                    <div class="little-tilte">
                        <a class="back"><i class="anticon anticon-left "></i></a>
                        <!--<div class="goback">后退</div>-->
                    </div>
                </div>
                <div class="content">
                    <section class="littleAnt-iframe-panle">
                        <iframe  border={0} class="shengpi" id="${this.ifrid}"  src="${ obj.url }" name="${this.ifrid}" ></iframe>
                    </section>
                </div>
                </div>`;

        let styleObj = (refStyle, index, orderIndex) => {

            var layouts = $('.ant-layout-operation');
            console.log(layouts);
            // 计算出复位的位置
            var refOff = $('.ant-layout-operation').eq(layouts.length - 1).offset();
            var refW = $('.ant-layout-operation').width();

            //
            if (!refStyle.width) {
                refStyle.width = 380;
            }
            let leftRef = (refOff.left + refW) - refStyle.width;
            //  leftRef = leftRef + tmpInterval;
            refStyle.left = parseInt(leftRef.toFixed());
            //
            let topReff = refOff.top;
            // let topRef = refOff.top ;
            topReff = topReff - $(document.body).height();
            // console.log(topRef);-590
            // topRef = topRef - refStyle.height * orderIndex + 25 * orderIndex;
            topReff = topReff - refStyle.height * orderIndex;
            // console.log(topRef);减500
            refStyle.top = parseInt(topReff.toFixed());

            console.log(window.screen.height);
            refStyle.zIndex = index++;

            return refStyle

        };

        this.htm = $(this.htm).css(styleObj(this.param.stylePage, this.param.stylePage.zIndex, this.param.orderIndex));
        $(document.body).append(this.htm);
        this.el = $('#' + this.id);
        if (obj.drag) {
            $(this.el).drag();
        }

        $(this.el).find('.back').on('click', this.closepanle.bind(this, this.id));
        $(this.el).find('.goback').on('click', this.gobackpanle.bind(this, this.id));
        this.ifrel = $('#' + this.ifrid);

        var iframe = this.ifrel[0];
        var idd = iframe.id;
        console.log(idd);
        if (!isAddedListener) {
            window.addEventListener('message', function (e) {
                var data = JSON.parse(e.data);
                //data.method方式
                //data.callbackId回调方法名
                //data.errorbackId错误回调方法名
                console.log(data);
                if (data.method == 'selectPictures') {

                    //调用选择图片插件，获取图片的路径存入paths
                    window.__noom__(data.callbackId);

                    window.__noomUpLoad__ = function (result, callbackId) {
                        var str = result.join(',');
                        var paths = str;
                        var callbackId = callbackId;
                        var response = {'callbackId': callbackId, 'params': paths};
                        //iframe.contentWindow.postMessage(JSON.stringify(response), '*');
                        var ifm = document.getElementById(data.windowName);
                        ifm.contentWindow.postMessage(JSON.stringify(response), '*');
                    };
                } else if (data.method == 'showImage') {
                    //data.currentUrl   当前的地址
                    //data.url  全部地址，用#分割
                    window.__sendImg__(data.currentUrl, data.url);

                } else if (data.method == 'openNewPage') {
                    let obj = {mode: 'teachingAdmin', title: '', url: data.url};
                    LP.Start(obj);
                }
            });
            isAddedListener = true;
        }


        this.ifrel.on('load', this._teachAdmin_UI_templet_iframe_event.bind(this, this.id, this.ifrid, 1));
        return this;
    };

    littlePanle.prototype.gobackpanle = function () {
        //向jsp发送后退信号
        var iframe = this.ifrel[0];

        iframe.contentWindow.postMessage('goback', '*');
        // stopPropagation
        // iframe.contentWindow.stopPropagation();

    };

    littlePanle.prototype._teachAdmin_UI_templet_iframe_event = function (id, ifrid, event) {

        //event.target.contentWindow.phone = phone;
        //$("#" + id + " h3").text(event.target.contentWindow.document.title);
        //$("#" + id + " h3").text(event.target.contentWindow.documentf.title);

    };

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

        /*与iframe通信*/
        // var iframe = this.ifrel[0];
        //
        // window.addEventListener('message', function (e) {
        //     var data = JSON.parse(e.data);
        //     if (data.method == 'selectPictures') {
        //         alert("执行选择图片逻辑!!");
        //         var paths = "https://gss0.bdstatic.com/94o3dSag_xI4khGkpoWK1HF6hhy/baike/c0%3Dbaike92%2C5%2C5%2C92%2C30/sign=593ce0758b13632701e0ca61f0e6cb89/fcfaaf51f3deb48fc4b7dd77f11f3a292cf578b8.jpg";
        //         var callbackId = data.callbackId;
        //         var response = {'callbackId': callbackId, 'params': paths};
        //         iframe.contentWindow.postMessage(JSON.stringify(response), '*');
        //     }
        // });
        this.ifrel.on('load', this._default_UI_templet_iframe_event.bind(this, objtemplet.ifrid));


        return this;
    };

    littlePanle.prototype._default_UI_templet_iframe_event = function (id, event) {
        console.log('onload');
        event.target.contentWindow.phone = phone;
    }

    littlePanle.prototype._flv_UI_templet = function (obj) {

        let id = UUID(8, 16);
        this.id = id;
        let vid = 'v' + this.id;
        let videoArr = obj.param || [obj];
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
        this.ajaxUploadBtn = 'ajaxUpload_btn_' + id;
        this.showTuiPing = 'showTuiPing';
        this.mode = obj.mode;
        this.htm = `<div id="${id}" class="dialog little-layout-aside-r-show ${this.mode}">
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
						 	<div class="activity">
								<section class="panle">
									<iframe  id="${this.pptIframeName}"  name="${this.pptIframeName}"  />
									<div class="maskPPT" ></div>
									<div class="danmu_pic"><img src="../../src/components/images/danmu_pic.png"  height="208" /></div>
									<div id="${this.showTuiPing}" class="panle_book ${this.showTuiPing}" ></div>
                                      <ul class="showDanmuArea" ></ul>
                                        <div class="inputArea" >
                                            <input placeholder="输入弹幕内容！" class="textarea_1"  id="InputTxtToPanel" maxlength="20" ></input>
                                            <button  ref="sendPanleText" >发送弹幕</button>
                                        </div>
								</section>
								<section class="public" >
									<div class="showDanmuArea" >
										<div class="danmu_pic"><img src="../../src/components/images/gongping_pic.png"  height="286" /></div>
									</div>
									<div class="inputArea" >
										<textarea placeholder="输入文字内容！" class="textarea_2" id="InputTxtToPublic" ></textarea>
                                        <span class="file_btn st_file_wrap">
                                            <span class="st_file_tex">发图片</span>
                                            <input type="file"   id="${this.ajaxUploadBtn}" class="st_file"/>
                                        </span>
										<button id="sendPublicText" ref="sendPublicText" >发文字</button>
									</div>
								</section>
						 </div>
						
						 <section class="live" id="${this.ifrliveid}">
                   		 </section>
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


        $(this.el).find('.back').on('click', this.commitClose.bind(this, this.id));

        $(this.el).find('.liveTV.tab li').on('click', this.changePanel);
        $(this.el).find('.activity .inputArea button').on('click', this.sendContent.bind(this, this.param));
        $(this.el).find('#reflash').on('click', this.reflashLiveTv.bind(this, this.ifrliveid));
        this._initBtnUploadBtn(this.ajaxUploadBtn, obj.param);
        utilsCommon.bind(document, 'paste', onPasteFunction);
        obj.param.ifrliveid = this.ifrliveid;
        obj.param.pptIframeName = this.pptIframeName;
        obj.param.showTuiPing = this.showTuiPing;
        obj.param.warpid = this.id;

        this.websocket(obj.param);
        return this;
    }


    littlePanle.prototype._liveTVHistory_UI_templet = function (obj) {

        let id = UUID(8, 16);
        this.id = id;
        this.ifrliveid = 'live' + id;
        this.pptIframeName = 'panle' + id;
        this.ajaxUploadBtn = 'ajaxUpload_btn_' + id;
        this.showTuiPing = 'showTuiPing';
        this.mode = obj.mode;
        let vid = 'v' + this.id;
        let videoArr = obj.param.objref.liveVideos;
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


        this.thistTuiPingUi = [];
        if (!obj.param.tuipingImgArr.length) {
            this.thistTuiPingUi.push(`<div class="danmu_pic"><img src="../../src/components/images/danmu_pic.png" height="208"></div>`);
        }
        for (let i = 0; i < obj.param.tuipingImgArr.length; i++) {
            let imgData = obj.param.tuipingImgArr[i];
            this.thistTuiPingUi.push(`<img class="topics_zanImg"  onclick="showLargeImg(this)"  src="${imgData.path}"/>`);
        }

        this.htm = `<div id="${id}" class="dialog little-layout-aside-r-show ${this.mode}">
		                  <div class="public—til—blue">
							<div class="little-tilte">
                    			<a class="back"><i class="anticon anticon-left "></i></a>
                    		</div>
                			<span>${ obj.title }</span>
               			 </div>
                <div class="content">
					<div class="right_cont">
						 	<div class="activity">
								<section class="panle">
									<!-- <iframe  id="${this.pptIframeName}"  name="${this.pptIframeName}"  /> -->
									<div id="${this.showTuiPing}" class="panle_book ${this.showTuiPing}" ><div class="tuitu">${this.thistTuiPingUi.join('')}</div></div>
								</section>
						 </div>
						 <section id="${this.ifrliveid}" class="live littleAnt-iframe-panle ${classChange}">
                       <video id="${vid}" class="video-js vjs-default-skin vjs-big-play-centered"
                       src="${srcList[0].src}"   data-setup='{}'></video>
                      
                       <div class="list-group" >${ listBtn.length ? listBtn.join('') : '' }</div>
                    </section>
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
        $(this.el).find('#reflash').on('click', this.reflashLiveTv.bind(this, this.ifrliveid));


        var options = {
            sourceOrder: true,
            controls: true,
            autoplay: true,
            preload: "auto",
            sources: srcList,
            techOrder: ['html5', 'flash']
        };

        var playerA = videojs(vid, options, function () {
            playerA.on('ended', function () {
            });
        });
        playerA.play();

        $('.list-group a').on("click", function () {
            let nextVideo = srcList[parseInt($(this).text()) - 1];
            playerA.src(nextVideo);
        });

        return this;
    }

    littlePanle.prototype.reflashLiveTv = function (videoId) {
        var video_1 = $('#' + videoId).find('video')[0];
        if (video_1.readyState > 3) {
            video_1.load();
        }

    }

    // 发送内容
    littlePanle.prototype.sendContent = function (param, event) {
        event = event || window.event;
        let el = $(event.target);
        let con = {}
        let user = eval("(" + sessionStorage.getItem('loginUser') + ")");
        if (window.screen_lock) {
            log.info('老师已开启禁言！');
            return;
        }
        switch ($(el).attr('ref')) {
            case 'sendPanleText':
                let tmpTxt1 = $('#InputTxtToPanel').val();
                if (!tmpTxt1) {
                    return;
                }
                $('#InputTxtToPanel').val('');

                con = {command: "simpleClassDanmu", data: {content: tmpTxt1}};
                LP.LiveTVSocket.send(con);

                return;
                break;
            case 'sendPublicText':

                let tmpTxt2 = $('#InputTxtToPublic').val();
                if (!tmpTxt2) {
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
                break;
        }
    };


//fileupload 图片上传
    littlePanle.prototype._initBtnUploadBtn = function (elId, param) {


        let sendImg = function (url) {

            if (!url) return;
            let user = eval("(" + sessionStorage.getItem('loginUser') + ")");
            let con = {
                "command": "message",
                "data": {
                    "message": {
                        "attachment": {
                            "address": url,
                            createTime: new Date().getTime(),
                            type: 1,
                            user: user,
                        },
                        "command": "message",
                        "content": '',
                        "createTime": new Date().getTime(),
                        fromUser: user,
                        "state": 2,
                        "toId": param.vid,
                        toType: 3,
                        "uuid": UUID(32, 16),
                    }
                }
            };
            ms.send(con);
        }

        var action = 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload';

        $('#' + elId).fileupload({
            url: action,
            dataType: 'text',
            done: function (e, data) {
                // sendImg(url);
            },
            submit: function () {

                if (window.screen_lock) {
                    log.info('老师已开启禁言！');
                    return false;
                } else {
                    return true;
                }
            },
            success: function (url, status)  //服务器成功响应处理函数
            {
                if (window.screen_lock) {
                    log.info('老师已开启禁言！');
                    return;
                }
                sendImg(url);
            },
            progressall: function (e, data) {


            },
            error: function (url, status, e)//服务器响应失败处理函数
            {

                sendImg(url);
            }

        })
            .prop('disabled', !$.support.fileInput)
            .parent().addClass($.support.fileInput ? undefined : 'disabled');

    }


    littlePanle.prototype.websocket = function (obj) {
        var connection = new ClazzConnection();

        LP.LiveTVSocket = connection;
        let __this = this;

        connection.clazzWsListener = {

            onError: function (errorMsg) {
                //强制退出课堂
                log.info(errorMsg);
                __this.closepanle(obj.warpid);
                setTimeout(function () {
                    window._changeGetLives('liveTV');
                }, 500);

            },

            onWarn: function (warnMsg) {
                log.warn(warnMsg);
            },
            screenLock: function () {
                if (window.screen_lock) {
                    return true;
                }
                return false;
            },
            // 显示消息
            onMessage: function (info) {

                let htm = '';
                switch (info.command) {
                    case 'screen_lock':
                        window.screen_lock = info.data.screen_lock;
                        if (info.data.screen_lock) {
                            log.info('开启禁言！');
                        } else {
                            log.info('关闭禁言！');
                        }
                        break;
                    case'classOver':
                        log.info('下课了！');
                        __this.closepanle(obj.warpid);
                        setTimeout(function () {
                            window._changeGetLives('history');
                        }, 500);
                        break;
                    case 'studentLogin': // 显示直播视频
                        //     info.data.play_rtmp_url = 'rtmp://60.205.86.217:1935/live2/54208';
                        window.screen_lock = info.data.screen_lock;
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
                    case'simpleClassDanmu': // 弹幕
                        clearInterval(window.simpleClassDanmuT);
                        if (this.screenLock()) return;
                        let sayText = info.data.message.content;
                        let fromUser = info.data.message.fromUser.userName;
                        htm = `<li><p class="sayLine"><span>${fromUser}:&nbsp;</span><span>${sayText}</span></p></li>`;

                        let lis = $('.panle .showDanmuArea li');
                        if (lis.length == 5) {
                            $(lis[0]).remove();
                        }
                        $('.panle .danmu_pic').remove();
                        $('.panle .showDanmuArea').append(htm);

                        window.simpleClassDanmuT = setInterval(function () {
                            let lis = $('.panle .showDanmuArea li');
                            if (lis.length) {
                                $(lis[0]).remove();
                            }
                        }, 5000);

                        break;

                    case 'classDanmu':
                        if (this.screenLock()) return;
                        let sayText1 = `<p>${info.data.message.content}</p>`;
                        let loginUser = eval('(' + sessionStorage.getItem('loginUser') + ')');
                        let fromUser1 = info.data.message.fromUser;
                        let refClass = 'left';
                        if (fromUser1.colUid == loginUser.colUid) {
                            refClass = 'right';
                        }
                        let fromUserName1 = `<p class="u-name">${fromUser1.userName}</p>`;
                        let userFace = `<img src="${fromUser1.avatar}" />`;
                        if (info.data.message.attachment) {
                            sayText1 = `<img style="width:120px;height:auto;" class="topics_zanImg"    onclick="showLargeImg(this,'.public')"  src="${info.data.message.attachment.address}"/>`;
                        }

                        htm = `<div class="sayLine ${refClass}"><div class="username" >${fromUserName1}</div><div class="saycont"><div class="sayHeader" >${userFace}</div><div class="sayCon" >${sayText1}</div></div>`;
                        $('.public .danmu_pic').remove();
                        let showDanmuArea = $('.public .showDanmuArea');

                        let danmuArea = showDanmuArea[0];
                        let currentScrollTop = danmuArea.scrollTop;
                        let maxScrollTop = danmuArea.scrollHeight.toFixed() - danmuArea.clientHeight.toFixed();
                        if (currentScrollTop >= maxScrollTop) {
                            showDanmuArea.append(htm);
                            danmuArea.scrollTop = danmuArea.scrollHeight.toFixed();
                        } else {
                            showDanmuArea.append(htm);
                        }
                        break;
                    case 'pushHandout': // 图片
                        if (this.screenLock()) return;
                        htm = `<img src='${info.data.url}'/>`;
                        $('#' + obj.showTuiPing).show().html(htm);
                        $('#' + obj.pptIframeName).hide();
                        $('.panle .danmu_pic').remove();
                        break;


                    default :
                        __this.parsePPT.call(__this, obj, info);

                        break;
                }
            }
        };
        connection.connect({command: 'studentLogin', data: {userId: parseInt(obj.uid), vid: obj.vid}});
        this.insertClassroom(obj);
    }

// 后进的学生，显示的ppt
    littlePanle.prototype.insertClassroom = function (obj) {
        let _this = this;
        var param = {method: 'getVclassPPTOpenInfo', vid: obj.vid + ''};
        doWebService(JSON.stringify(param), {
            onResponse: function (result) {
                if (!result.success) {
                    return;
                }

                var openInfo = result.response;
                if (!openInfo) return;
                //打开课堂中的ppt
                $("#" + obj.pptIframeName).show().attr("src", _this._setProxyInfo(openInfo.pptUrl) + "?v=1").css({'z-index': 1});
                $('#' + obj.showTuiPing).hide();
                //更换当前页
                $("#" + obj.pptIframeName).on('load', function () {
                    this.contentWindow.checkSlide(openInfo.currentPage);
                })

            },
            onError: function (error) {
                //  alert(error);
            }
        });

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
                    playPPT(_self._setProxyInfo(info.data.html));
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
            $("#" + pptIframeName).show().attr("src", html + "?v=1").css({'z-index': 1});
            $('#' + showTuiPing).hide();
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
        let li = null;

        if (el.nodeName.toLowerCase() != 'li') {
            li = $(el.parentNode)[0];
        } else {
            li = el;
        }


        switch ($(li).attr('ref')) {
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
        $(li).addClass('ant-menu-item-selected');

    }

    littlePanle.prototype.commitClose = function (id) {
        let _this = this;
        var msg = "您确定要退出课堂？";
        contemosConfirm(msg, function () {
            _this.closepanle(id);
        });

    }


    littlePanle.prototype.GetLP = function (obj, oldArray) {

        console.log(obj);
        console.log(oldArray);
        //oldArray是个空数组，第二次是两个underfined
        console.log('-------------------');

        this.param.mode = obj.mode || obj.htmlMode || '';
        this.param.width = obj.width || '';
        this.param.param = obj.param;
        this.param.title = obj.title;
        this.param.drag = obj.drag;
        this.param.url = this._setProxyInfo(obj.url);

        let maxIndex = () => {
            let refindex = 0;
            console.log(oldArray.length);
            if (!oldArray.length) return refindex;

            oldArray.map(function (item, index) {

                if (item !== undefined) {
                    let ind = $(item.el.selector).css('z-index');
                    ind = parseInt(ind);
                    ind++;
                    refindex = ind > refindex ? ind : refindex;
                } else {
                    refindex = 0;
                }

            });
            return refindex;
        }

        // this.param.orderIndex = oldArray.length;
        this.param.orderIndex = 0;
        //直接制成0之后（包括上面的判断）可以解决开了teach不能开default的问题，但是不能多开，多开会影响位置
        //零时制成只能开1个

        this.param.stylePage.zIndex = maxIndex();
        this.param.stylePage.width = parseInt(this.param.width.replace(/[a-z]*/img, ''));

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
            case 'history':
                // this._liveTV_UI_templet(this.param);
                this._liveTVHistory_UI_templet(this.param);
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

        Start(objParam) {
            this.GetLP(objParam);
        },

        GetLP(objParam) {
            let _this = this;
            let objA;

            switch (objParam.mode) {
                case 'teachingAdmin':
                    // objA = new littlePanle().GetLP(objParam, _this.mgr);
                    //调用noomPanle.js中的panel
                    window.__noomPanel__(objParam);
                    break;

                case 'liveTV':
                    _this.delAll();
                    objA = new littlePanle().GetLP(objParam, _this.mgr);
                    break;
                case 'history':
                    _this.delAll();
                    objA = new littlePanle().GetLP(objParam, _this.mgr);
                    break;

                default :
                    //暂时把这个限制去掉
                    // if ((this.mgr.length - _this.hideArr.length) >= 2) {
                    //     log.info('打开太多！');
                    //     return;
                    // }

                    objA = new littlePanle().GetLP(objParam, _this.mgr);
                    _this.addOrderBtn();
            }
            this.mgr.push(objA);
            return objA;

        },
        addOrderBtn() {
            if ($('.ant-layout-header .lpmgrbtn').length) return;
            $('.ant-layout-header > div').append("<div class='lpmgrbtn'>" +
                "<a onclick='LP.orderAll()' class='no_le'><i class='iconfont'>&#xe67a;</i><span>复位</span></a>" +
                "<a onclick='LP.delAll()' class='del'><i class='iconfont'>&#xe6b4;</i><span>关闭</span></a>" +
                "</div>");
        },
        delAll() {
            $('.dialog.little-layout-aside-r-show').remove();
            this.mgr = [];
            this.hideArr = [];
            $('.lpmgrbtn').remove();

        },
        orderAll() {

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

            });

            this.mgr = newArr;
            this.hideArr = [];


        }
    };


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
    var iframe = $(el).find("iframe")[0];
    if(iframe != null && typeof(iframe) != 'undefined' ){
        el = iframe;
    }
//W3C
    if (docElm.requestFullscreen) {
        el.requestFullscreen();
    }
//FireFox
    else if (docElm.mozRequestFullScreen) {
        el.mozRequestFullScreen();
    }
//Chrome等
    else if (docElm.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
    }
//IE11
    else if (docElm.msRequestFullscreen) {
        el.msRequestFullscreen();
    }
}

function replaceUnit(str) {
    return parseInt(str.replace(/[a-z]*/img, ''))

}

var utilsCommon = (function () {
    function addEvents(target, type, func) {
        if (target.addEventListener) //非ie 和ie9
            target.addEventListener(type, func, false);
        else if (target.attachEvent) //ie6到ie8
            target.attachEvent("on" + type, func);
        else target["on" + type] = func; //ie5
    };

    function removeEvents(target, type, func) {
        if (target.removeEventListener)
            target.removeEventListener(type, func, false);
        else if (target.detachEvent)
            target.detachEvent("on" + type, func);
        else target["on" + type] = null;
    };
    return {
        bind: addEvents,
        unbind: removeEvents
    }
})();


function onPasteFunction(event) {
    event = event || window.event;

    // 添加到事件对象中的访问系统剪贴板的接口
    var clipboardData = event.clipboardData,
        i = 0,
        items, item, types;

    if (clipboardData) {
        items = clipboardData.items;

        if (!items) {
            return;
        }

        item = items[0];
        // 保存在剪贴板中的数据类型
        types = clipboardData.types || [];

        for (; i < types.length; i++) {
            if (types[i] === 'Files') {
                item = items[i];
                break;
            }
        }

        // 判断是否为图片数据
        if (item && item.kind === 'file' && item.type.match(/^image\//i)) {
            // 读取该图片
            // imgReader(item);
            var file = item.getAsFile();
            UploadFile1(file);
        }
    }


}

var UploadFile1 = function (readerResult) {
    // let url = 'http://192.168.1.34:8890/Excoord_Upload_Server/file/upload';
    //    let url = '/proxy/upload/1/34/8890';
    //  let url = 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload';
    let url = '/proxy/upload/45/125/8890';
    //   let url = 'http://192.168.2.104:8890/Excoord_Upload_Server/file/upload';
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('enctype', 'multipart/form-data');
    //   xhr.setRequestHeader('Content-Type', 'image/png');
    // 

    let fd = new FormData();
    fd.append('fileName', new Date().getTime() + '.jpg');
    fd.append('file', readerResult);


    if (!XMLHttpRequest.prototype.sendAsBinary) {
        XMLHttpRequest.prototype.sendAsBinary = function (datastr) {
            function byteValue(x) {
                return x.charCodeAt(0) & 0xff;
            }

            var ords = Array.prototype.map.call(datastr, byteValue);
            var ui8a = new Uint8Array(ords);
            this.send(ui8a.buffer);
        };
    }
    // xhr.sendAsBinary(readerResult);

    xhr.send(fd);

    xhr.onreadystatechange = function () {
        //  
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                console.log("response: " + xhr.responseText);
            }

        }
    }
}


var imgReader = function (item) {

    var reader = new FileReader();
    // 读取文件后将其显示在网页中
    reader.onload = function (e) {
        var img = new Image();
        img.src = e.target.result;

        document.body.appendChild(img);
    };
    var file = item.getAsFile();

    // 读取文件
    reader.readAsDataURL(file);
};

function contemosConfirm(msg, okFn, cancelfn) {

    let okfnRef = function () {
        if (okFn) {
            okFn();
        }
        $('#modal_dialog').remove();
    };
    let cancelfnRef = function () {
        if (cancelfn) {
            cancelfn();
        }
        $('#modal_dialog').remove();
    };


    let htm = `<div id="modal_dialog"><div   class="ant-modal-mask"></div><div tabindex="-1" class="ant-modal-wrap " role="dialog">
<div role="document" class="ant-modal " style="width: 400px;"><div class="ant-modal-content">
<button aria-label="Close" class="ant-modal-close"><span class="ant-modal-close-x"></span></button>
<div class="ant-modal-body"><div class="class_right"><i class="anticon anticon-question-circle icon_Alert icon_orange"></i>
<span style="font-size: 14px;">${msg}</span></div></div><div class="ant-modal-footer">
<button type="button" id="cancelBtn"   class="ant-btn ant-btn-ghost ant-btn-lg"><span>取 消</span></button>
<button type="button" id="okBtn"    class="ant-btn ant-btn-primary ant-btn-lg"><span>确 定</span></button></div></div>
<div tabindex="0" style="width: 0px; height: 0px; overflow: hidden;">sentinel</div></div></div></div>`;
    if (!$('#modal_dialog')[0]) {
        $(document.body).append(htm);
    } else {
        $('#modal_dialog').show();
    }
    $('#modal_dialog #cancelBtn').one('click', cancelfnRef);
    $('#modal_dialog #okBtn').one('click', okfnRef);
}

function showLargeImg(el, parentSelector) {
    $.openPhotoGallery(el, parentSelector)
}

// 保持android ios 一直体验的接口实现
var phone = {
    // callHandler ({method: xxxx, callbackId: xxxxxx, url: xxxxx})
    callHandler(json) {

        var method = json.method;

        if (method == 'selectPicture') {
            // .....执行本地逻辑
            alert(1);
            var paths = "";
            var backId = json.callbackId;
            iframeWindow.Bridge.cb.backId(paths);
        } else if (method = 'openNewPage') {
            alert(2);

        }
    },

    openNewPage(args) {
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

function doWebService(data, listener) {
    WEBSERVICE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
    var pro = document.getElementById("pro");
    //进度条的宽度，用来模拟进度条的进度
    var width = 0;
    //计时器对象，通过计时器对象，完成定时的进度条刷新
    var timer;
    var requestCount = 0;
    if (pro != null) {
        //每次访问设定初始值
        pro.style.width = "0%";
        //设置显示状态为显示
        pro.style.display = 'block';
        //开启定时器
        timer = setInterval(
            () => {
                //定时器每隔一定毫秒时间宽度+20
                width += 1;
                requestCount++;
                //在后台结果未返回前，即使计时器计算的宽度大于了100，也将进度条控制在100以内（此处设置了95），以表现未走完的状态
                if (width >= 100 || requestCount > 1000) {
                    pro.style.width = "100%";
                    pro.style.display = 'none';
                    //清除定时器
                    clearInterval(timer);
                }
                //设置进度条的宽度
                pro.style.width = width + "%";
            },
            8
        );
    }
    $.post(WEBSERVICE_URL, {
        params: data
    }, function (result, status) {
        if (status == "success") {
            listener.onResponse(result);
        } else {
            listener.onError(result);
        }
    }, "json");
}

function changeStatus(videoEl) {
    let roateNum = roateNum || 0;
    roateNum += 90;
    if (roateNum == 360) {
        roateNum = 0;
    }
    $(videoEl)[0].style.transform = "rotate(" + roateNum + "deg)";
}
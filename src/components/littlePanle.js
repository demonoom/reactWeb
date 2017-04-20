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
                width: 360,
                height: 596,
                position: 'relative',
                backgroundColor: '#fff',
                zIndex: 0
            },
            style: {},
        }

    }


    littlePanle.prototype.el = {};
    littlePanle.prototype.zoomview = function (id) {
        let nodeEl = $('#'+id);
        let perWidth = nodeEl.width();
        let perHeight = nodeEl.height();
        let perTop = nodeEl.css('top');
        let perLeft = nodeEl.css('left');
        let refHeight = getViewPortHeight();
        nodeEl.attr('per', JSON.stringify( {width:Math.round(perWidth) , height:Math.round(perHeight), left:Math.round(perLeft),top:Math.round(perTop)}));
        nodeEl.css({width:'100%', height: refHeight, left:0,top:-refHeight});
        //
        enterFull();
        //
        let el = nodeEl.find('.zoom');
        el.off();
        el.on('click',this.zoomMinView.bind(this,id));
    }
    littlePanle.prototype.zoomMinView = function (id) {
        let nodeEl = $('#'+id);
        let perInfo = nodeEl.attr('per');
        let perObj = eval('('+perInfo+')');
        nodeEl.css({width:perObj.width, height:perObj.height, left: perObj.left, top: perObj.top });
        //
        let el = nodeEl.find('.zoom');
        el.off();
        el.on('click',this.zoomview.bind(this,id));
    }

    littlePanle.prototype.closepanle = function (id) {
        let tmp = [];
        LP.mgr.map(function (item, index) {
            if (item.id == id) {
                tmp.push(item)
            }
        });
        LP.hideArr = LP.hideArr.concat(tmp);
        if(!(LP.mgr.length - LP.hideArr.length)){
            LP.delAll();
        }else{

           $('#' + id).css({visibility: 'hidden'});
        }
    }


    littlePanle.prototype._show = function () {
        var htm = this.templateHtml();
        let styleObj = this.calcPos(this.param.stylePage, this.param.stylePage.zIndex, this.param.orderIndex);

        htm = $(htm).css(styleObj);
        $(document.body).append(htm);
        this.el = $('#' + this.id);
        $(this.el).drag();
        $(this.el).find('.close').on('click', this.closepanle.bind(this, this.id));
        $(this.el).find('.zoom').on('click', this.zoomview.bind(this, this.id));
        $(this.el).find('.back').on('click', this.historyControler.bind(this, this.id,-1));
        $(this.el).find('.forward').on('click', this.historyControler.bind(this, this.id,1));
        $(this.el).find('.enterFull').on('click', enterFull );
        $(this.el).find('.exitFull').on('click', exitFull );

        return this;
    }

    littlePanle.prototype.GetLP = function (obj, oldArray) {
        this.param.url = obj.url;
        this.param.title = obj.title;

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
        this.param.stylePage.width = parseInt( obj.width.replace(/[a-z]*/img,''));
        this._show();
        return this;
    }

    littlePanle.prototype.calcPos = function (refStyle, index, orderIndex) {
        // 计算出复位的位置
        var refOff = $('.ant-layout-operation').offset();
        var refW = $('.ant-layout-operation').width();

        let tmpInterval = orderIndex * 45;
        //
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


    littlePanle.prototype.historyControler = function (id,num) {

        let ifr = $('#ifr'+id)[0];
        ifr.contentWindow.history.go(num);

    }
    littlePanle.prototype.templateHtml = function () {

        let id = UUID(8, 16);
        this.id = id;

        let htm = `<div id="${id}" class="dialog little-layout-aside-r-show">
                <div class="header draggable">
                <h3 class="title">${ this.param.title }</h3>
                    <div class="little-tilte">
                    	<a class="back"><i className="iconfont iconfont_more">&#xe74d;</i></a>
                        <a class="forward"><i className="iconfont iconfont_more">&#xe801;</i></a>
                        <a class="close"><i className="iconfont iconfont_close">&#xe615;</i></a>
                        <a class="zoom"><i className="iconfont iconfont_more">&#xe6b8;</i></a>
                        
                    </div>
                </div>
                <div class="content">
                    <section class="littleAnt-iframe-panle">
                        <iframe  border={0} id="ifr${id}"  src="${ this.param.url }"></iframe>
                    </section>
                </div>
                </div>`;

        return htm;
    }

    var lpM = {
        mgr: [],
        hideArr: [],

        Start(obj){
           this.GetLP(objParam);
        },
        GetLP (objParam) {

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
                    "<a onclick='LP.orderAll()'><i class='iconfont'>&#xe67a;</i></a>" +
                    "<a onclick='LP.delAll()' class='del'><i class='iconfont'>&#xe62f;</i></a>" +
                    "<a onclick='enterFull()' class='enterFull'><i class='iconfont'>&#xe600;</i></a>" +
                    "<a onclick='exitFull()' class='exitFull'><i class='iconfont'>&#xe674;</i></a>" +
                    "</div>");
            }
        },
        delAll(){
          $('.dialog.little-layout-aside-r-show').remove();
          this.mgr=[];
          this.hideArr=[];
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
            this.mgr.map(function (item, index, arr) {

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

function getViewPortHeight() {
       return document.documentElement.clientHeight || document.body.clientHeight;
 }


function exitFull() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
    else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    }
    else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

function enterFull() {
    var docElm = document.documentElement;
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
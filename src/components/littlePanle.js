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
        alert('放大' + id);
    }

    littlePanle.prototype.closepanle = function (id) {
        let tmp = [];
        LP.mgr.map(function (item, index) {
            if (item.id == id) {
                tmp.push(item)
            }
        });
        LP.hideArr = LP.hideArr.concat(tmp);

        $('#' + id).css({visibility: 'hidden'});
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

        let tmpInterval = orderIndex * 42;
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

    littlePanle.prototype.templateHtml = function () {

        let id = UUID(8, 16);
        this.id = id;

        let htm = `<div id="${id}" class="dialog little-layout-aside-r-show">
                <div class="header draggable">
                <h3 class="title">${ this.param.title }</h3>
                    <div class="little-tilte">
                        <a     class="close"><i  >X</i></a>
                        <a     class="zoom"><i  >大</i></a>
                    </div>
                </div>
                <div class="content">
                    <section class="littleAnt-iframe-panle">
                        <iframe  border={0}   src="${ this.param.url }"></iframe>
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

            if ((this.mgr.length - this.hideArr.length) >= 5) {
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
                $('.ant-layout-header > div').append("<div class='lpmgrbtn'  ><a style='display: inline-block; width:42px; height: 22px; background-color: #ffc444; color: #fff' onclick='LP.orderAll()'>复位</a><a style='display: inline-block; width:42px; height: 22px; background-color: #ffc444; color: #fff' onclick='LP.delAll()'>删除</a></div>");
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
                    let tmpInterval = index * 42;
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
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data. At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}
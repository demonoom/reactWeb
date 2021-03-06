/**
 * Created by noom on 17-9-7.
 */
import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Card, Button, Row, Col} from 'antd';
import {message, Pagination, Modal, Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {showLargeImg} from '../../utils/utils';
import MakeDingModal from './MakeDingModal';


var ding;
var DingArr = [];
var DListArr = [];
var notRedMesArr = [];

const DingMessageTabComponents = React.createClass({

    getInitialState() {
        ding = this;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            dMesList: [],   //存放获取的Ding消息对象
            type: 1,     //操作类型（1：查看收到  2：查看发出）
            totalCount: 0,       //分页时，返回的总数据量
            recPage: 1,      //在查看我收到的消息页面时的当前页码
            sendPage: 1,       //在查看我发出的消息时的当前页码
            //最终页面上显示的分页器上显示的页码值（该值由type来决定，type==0时取recPage,否则取sendPage值）
            currentShowPage: 1,
            repeatMes: '',     //回复消息的内容
            makeDingModalIsShow: false,
        };
    },

    componentDidMount() {
        var ms = window.ms;
        var initPageNo = 1;
        var initType = 1;
        ding.getDList(initPageNo, initType);
        ding.dingMs(ms);
    },

    componentWillUpdate() {
        var _this = this;
        //未读消息id的数组集合
        var arr = this.state.notRedMesArr;
        if (isEmpty(document.querySelector('.ding_bg_list')) == false) {
            document.querySelector('.ding_bg_list').className = 'ding_mes_read ding_bg_list'
        }
        if (isEmpty(arr) == false) {
            for (var i = 0; i < arr.length; i++) {
                if (isEmpty(document.getElementById(arr[0])) == false) {
                    document.getElementById(arr[i]).className = 'ding_mes_notRead ding_bg_list';
                }
            }
        }
        var id = this.state.biuId;
        if (isEmpty(document.getElementById(id)) == false) {
            document.getElementById(id).className = 'ding_bg_list ding_mes_read';
            //把这个id从notRedMesArr中剔除
            arr.forEach(function (v, i) {
                if (v == id) {
                    arr.splice(i, 1);
                    _this.setState({notRedMesArr: arr})
                }
            })
        }
    },

    /**
     * 即使通讯
     * @param ms
     */
    dingMs(ms) {
        var _this = this;
        ms.msgWsListener = {
            onMessage: function (info) {
                var command = info.command;
                if (isEmpty(command) == false) {
                    if (command == 'message') {  //单条消息
                        var data = info.data;
                        if (data.message.command == "biu_message") {
                            var obj = JSON.parse(data.message.content);
                            if (obj.userId !== _this.state.loginUser.colUid) {
                                var dingData = _this.state.DPanelMes;
                                //将新来的这条信息放在原本DPanelMes的第一条位置   考虑设置一个参数标识为未读，所有未读的消息都为黄色，点击之后更改这个标识，重新渲染
                                dingData.unshift(obj);
                                //渲染ding列表
                                ding.buildDList(dingData, 1);
                                _this.props.FshowAlert(true);
                            }
                        }
                    }
                }
            }
        }
    },

    /**
     * 消息类型切换详情面板消失
     */
    mesListLev() {
        this.refs.dingPanel.className = 'ding_panel ding_hide';
    },

    /**
     * 消息列表分页功能响应函数
     * @param page
     */
    pageOnChange(page) {
        if (ding.state.type == 1) {
            ding.setState({
                recPage: page,
            });
            ding.getDList(page, 1);
        } else {
            ding.setState({
                sendPage: page,
            });
            ding.getDList(page, 2);
        }
    },

    /**
     * 获取Ding列表
     */
    getDList(pageNo, type) {
        var _this = this;
        if (isEmpty(pageNo)) {
            if (type == 1) {
                pageNo = ding.state.recPage;
            } else {
                pageNo = ding.state.sendPage;
            }
        }
        var param = {
            "method": 'getBius',
            "userId": this.state.loginUser.colUid,
            "type": type,
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                _this.setState({DPanelMes: response});
                ding.buildDList(response, type);
                response.forEach(function (e) {
                    DingArr.push(e);
                });
                var pager = ret.pager;
                _this.setState({
                    "topicCardList": DingArr,
                    "totalCount": pager.rsCount,
                    "currentShowPage": pageNo,
                    type: type
                });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 渲染ding列表
     */
    buildDList(e, type) {
        var _this = this;
        e.forEach(function (v) {
            // 转化时间
            var createTime = getLocalTime(v.createTime);
            // 内容
            var content = v.content;
            // 图片
            if (isEmpty(v.attachments) === false) {
                var imgSrc = v.attachments[0].address;
            } else {
                var imgSrc = '';
            }
            ;
            // 总人数
            var revCon = v.receivers.length;
            // 作者
            var author = v.user.userName;
            // 未读
            var notRed = 0;
            v.receivers.forEach(function (e) {
                if (e.receiveState == 0) {
                    notRed++;
                }
                //判断出userId等于自己的id的时候，并且这个receiveState == 0,让这个成为未读标识，记录消息id---v.id
                if (e.userId == _this.state.loginUser.colUid && e.receiveState == 0) {
                    notRedMesArr.push(e.biuId);
                }
            });
            var id = v.id;
            if (type == 2) {
                if (isEmpty(v.attachments) === false) {
                    var sendFMine = <div className="ding_bg_list ding_mes_read">
                        <div onClick={ding.entMesDetil.bind(this, id)} style={{cursor: 'pointer'}}>
                            <div className="ding_ding_i"><img src="../src/components/images/ding_icon.png"/><span
                                className="ding_ding">叮</span><span className="ding_left_1">我发出的</span><span
                                className="ding_left_2 ding_t_12">{createTime}</span></div>
                            <h5>
                                <div>{content}</div>
                            </h5>
                        </div>
                        <img src={imgSrc} className="ding_bg_l" onClick={showLargeImg}/>
                        <div className="ding_t_12 ding_bg_l">共{revCon}人，<span className="ding_t_red">{notRed}</span>人未读
                        </div>
                    </div>;
                } else {
                    var sendFMine = <div className="ding_bg_list ding_mes_read">
                        <div onClick={ding.entMesDetil.bind(this, id)} style={{cursor: 'pointer'}}>
                            <div className="ding_ding_i"><img src="../src/components/images/ding_icon.png"/><span
                                className="ding_ding">叮</span><span className="ding_left_1">我发出的</span><span
                                className="ding_left_2 ding_t_12">{createTime}</span></div>
                            <h5>
                                <div>{content}</div>
                            </h5>
                        </div>
                        <div className="ding_t_12 ding_bg_l">共{revCon}人，<span className="ding_t_red">{notRed}</span>人未读
                        </div>
                    </div>;
                }
                ;
            } else {
                if (isEmpty(v.attachments) === false) {
                    var sendFMine = <div className="ding_bg_list" id={id}>
                        <div onClick={ding.entMesDetil.bind(this, id)} style={{cursor: 'pointer'}}>
                            <div className="ding_ding_i"><img src="../src/components/images/ding_icon.png"/><span
                                className="ding_ding">叮</span><span className="ding_left_1">来自{author}</span><span
                                className="ding_left_2 ding_t_12">{createTime}</span></div>
                            <h5>
                                <div>{content}</div>
                            </h5>
                        </div>
                        <img src={imgSrc} className="ding_bg_l" onClick={showLargeImg}/>
                        <div className="ding_t_12 ding_bg_l">共{revCon}人，<span className="ding_t_red">{notRed}</span>人未读
                        </div>
                    </div>;
                } else {
                    var sendFMine = <div className="ding_bg_list" id={id}>
                        <div onClick={ding.entMesDetil.bind(this, id)} style={{cursor: 'pointer'}}>
                            <div className="ding_ding_i"><img src="../src/components/images/ding_icon.png"/><span
                                className="ding_ding">叮</span><span className="ding_left_1">来自{author}</span><span
                                className="ding_left_2 ding_t_12">{createTime}</span></div>
                            <h5>
                                <div>{content}</div>
                            </h5>
                        </div>
                        <div className="ding_t_12 ding_bg_l">共{revCon}人，<span className="ding_t_red">{notRed}</span>人未读
                        </div>
                    </div>;
                }
                ;
            }
            DListArr.push(sendFMine);
        });
        ding.setState({notRedMesArr});
        ding.setState({DListArr});
        DListArr = [];
        notRedMesArr = [];
    },

    /**
     * Ding消息详情进场
     */
    entMesDetil(id) {
        this.setState({biuId: id});
        var _this = this;
        this.refs.dingPanel.className = 'ding_panel ding_enter';
        //确认已读
        _this.confirmReadBiu(id);
        //渲染详情面板
        _this.showDingList(id);
        //先进入详情，后willcomponents
    },

    /**
     * 确认已读
     */
    confirmReadBiu(id) {
        var param = {
            "method": 'confirmReadBiu',
            "biuId": id,
            "userId": this.state.loginUser.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret);
            },
            onError: function (error) {
                message.error(error);
            }
        });
        this.props.showAlert(false);
    },
    /**
     * 渲染消息详情面板内容
     * @param id
     */
    showDingList(id) {
        // 根据id值请求详情
        var _this = this;
        var param = {
            "method": 'getBiuById',
            "biuId": id,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                // 评论条数
                var recNum = data.comments.length;
                // 接受人数
                var recPerNum = data.receivers.length;
                // 已读数
                var readPer = 0;
                // 已读人名
                var readPerName = [];
                // 已读头像
                var readPerImg = [];
                for (var i = 0; i < recPerNum; i++) {
                    if (data.receivers[i].receiveState == 1) {
                        readPer++;
                        readPerName.push(data.receivers[i].user.userName);
                        readPerImg.push(data.receivers[i].user.avatar);
                    }
                }
                // 未读数
                var noReadPer = 0;
                // 未读人名
                var noReadperName = [];
                // 未读头像
                var noReadImg = [];
                for (var i = 0; i < recPerNum; i++) {
                    if (data.receivers[i].receiveState == 0) {
                        noReadPer++;
                        noReadperName.push(data.receivers[i].user.userName);
                        noReadImg.push(data.receivers[i].user.avatar);
                    }
                }
                _this.setState({noReadPer, readPer});
                // 渲染第一个card
                if (isEmpty(data.attachments) === false) {
                    var hfirst = '<div class="ding_side"><img src="../src/components/images/ding_icon.png" /><span class="ding_ding">叮</span></div>' +
                        '<p>' + data.content + '</p>' +
                        '<img class="dingImg" src=' + data.attachments[0].address + '>' +
                        '<div class="ding_user_t">' +
                        '<img class="dingHead" src=' + data.user.avatar + '>' +
                        '<span class="gray_42">' + data.user.userName + '</span>' +
                        '<span class="add_out ding_gray">' + getLocalTime(data.createTime) + '</span>' +
                        '</div>';
                } else {
                    var hfirst = '<div class="ding_side"><img src="../src/components/images/ding_icon.png" /><span class="ding_ding">叮</span></div>' +
                        '<p>' + data.content + '</p>' +
                        '<div class="ding_user_t">' +
                        '<img class="dingHead" src=' + data.user.avatar + '>' +
                        '<span class="gray_42">' + data.user.userName + '</span>' +
                        '<span class="add_out ding_gray">' + getLocalTime(data.createTime) + '</span>' +
                        '</div>';
                }
                _this.refs.cardfir.innerHTML = hfirst;
                // 渲染第二个card
                var hsecond1 = '<ul>' + '<li>' + '<ul class="dReadList">';
                var hsecond2 = '';
                if (readPer == 0) {
                    hsecond2 = '<li style="text-align: center;width: 100%">全部未读</li>';
                } else {
                    for (var i = 0; i < readPer; i++) {
                        hsecond2 += '<li>' +
                            '<img class="dingHead"' +
                            'src=' + readPerImg[i] +
                            '>' +
                            '<div class="message_name user">' + readPerName[i] + '</div>' +
                            '</li>'
                    }
                }
                var hsecond3 = '</ul>' + '</li>' + '<li>' + '<ul class="dReadList dingHide">';
                var hsecond4 = '';
                if (noReadPer == 0) {
                    hsecond4 = '<li style="text-align: center;width: 100%">全部已读</li>';
                } else {
                    for (var i = 0; i < noReadPer; i++) {
                        hsecond4 += '<li>' +
                            '<img class="dingHead"' +
                            'src=' + noReadImg[i] +
                            '>' +
                            '<div class="message_name user">' + noReadperName[i] + '</div>' +
                            '</li>'
                    }
                }
                var hsecond5 = '</ul>' + '</li>' + '</ul>';

                var hsecond = hsecond1 + hsecond2 + hsecond3 + hsecond4 + hsecond5;
                _this.refs.cardsec.innerHTML = hsecond;
                // 渲染第三个card
                var hthirdStart = '<div class="dReadClick"><span>回复（' + recNum + '）</span></div>' + '<div class="ding_read_u">' + '<ul>';
                var hthirdMid = '';
                if (recNum == 0) {
                    hthirdMid = '<li style="text-align: center">暂无回复</li>';
                } else {
                    for (var i = 0; i < recNum; i++) {
                        hthirdMid += '<li class="ding_rev">' +
                            '<img class="dingHead" src=' + data.comments[i].user.avatar + '>' +
                            '<div>' +
                            '<div class="message_name user">' + data.comments[i].user.userName + '</div>' +
                            '<p class="gray_42 date_tr ding_comment">' + data.comments[i].content + '</p>' +
                            '</div>' +
                            '<span class="ding_t_12 ding_gray">' + getLocalTime(data.comments[i].createTime) + '</span>' +
                            '</li>';
                    }
                }
                var hthirdEnd = '</ul>' + '</div>';
                var hthird = hthirdStart + hthirdMid + hthirdEnd;
                _this.refs.cardthd.innerHTML = hthird;

            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * Ding消息详情离场
     */
    levMesDetil() {
        this.refs.dingPanel.className = 'ding_panel ding_leave';
        var b = document.getElementById('alreadyR');
        var c = document.getElementById('neverR');
        b.className = 'ding_t_active';
        c.className = 'dign_t_default';
    },
    /*点击已读*/
    read() {
        var a = document.getElementsByClassName('dReadList');
        a[0].className = 'dReadList';
        a[1].className = 'dReadList dingHide';
        var b = document.getElementById('alreadyR');
        var c = document.getElementById('neverR');
        b.className = 'ding_t_active';
        c.className = 'dign_t_default';
    },
    /*点击未读*/
    unRead() {
        var a = document.getElementsByClassName('dReadList');
        a[0].className = 'dReadList dingHide';
        a[1].className = 'dReadList';
        var b = document.getElementById('alreadyR');
        var c = document.getElementById('neverR');
        b.className = 'dign_t_default';
        c.className = 'ding_t_active';

    },
    // 回复ding
    sendMes(id) {
        var _this = this;
        var biuId = id;
        var biuContent = this.state.repeatMes;
        if (biuContent.trim() === '') {
            message.error('消息不能为空');
            return;
        }
        var userId = this.state.loginUser.colUid;
        var param = {
            "method": 'commentBiu',
            "userId": userId,
            "biuId": biuId,
            "biuContent": biuContent,
            "attachmentPaths": ""
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == '调用成功') {
                    _this.state.repeatMes = '';
                    _this.showDingList(id);
                }

            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 叮一下
     */
    makeDing() {
        ding.setState({makeDingModalIsShow: true});
    },
    /**
     * 叮一下取消和关闭的回调
     */
    closeDingModel() {
        this.setState({makeDingModalIsShow: false});
    },
    /**
     * 回复消息输入的响应
     * @param e
     */
    repMesOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var repeatMes = target.value;
        if (repeatMes.length > 120) {
            repeatMes = repeatMes.substr(0, 120);
            message.error('已经达到最大字数限制');
        }
        this.setState({repeatMes});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var breadMenuTip = "我收到的";
        if (ding.state.type == 1) {
            breadMenuTip = "我收到的";
        } else {
            breadMenuTip = "我发出的";
        }
        //标题
        var optionButton;
        optionButton = <div className="public—til—blue">
            <div className="talk_ant_btn1">
                <Button value="talk" onClick={ding.makeDing} className="calmBorderRadius antnest_talk">叮一下</Button>
            </div>
            {breadMenuTip}
        </div>;

        return (
            <div>
                <div className="talk_ant_btn">
                    {optionButton}
                </div>

                <div className="favorite_scroll ding_list">
                    <div className="antnest_cont topics_calc ding_bg" style={{overflow: 'scroll'}}>
                        {ding.state.DListArr}
                    </div>

                    <Pagination key="all" total={ding.state.totalCount} pageSize={getPageSize()}
                                current={ding.state.currentShowPage}
                                onChange={ding.pageOnChange}/>


                    <div className="ding_panel" ref="dingPanel">
                        <div className="ding_top">
                            <Icon type="close" className="d_mesclose" onClick={ding.levMesDetil}/>
                        </div>
                        <div className="ding_inner">
                            <Card>
                                <div className="ding_side_wrap" ref="cardfir"></div>
                            </Card>
                            <Card>
                                <div className="">
                                    <div className="dReadClick">
                                        <span id="alreadyR" className="ding_t_active"
                                              onClick={ding.read}>已读（{this.state.readPer}人）</span>
                                        <span id="neverR" onClick={ding.unRead}>未读（{this.state.noReadPer}人）</span>
                                    </div>
                                    <div ref="cardsec" className="ding_read_u">

                                    </div>
                                </div>
                            </Card>
                            <Card>
                                <div ref="cardthd"></div>
                            </Card>
                        </div>
                        <div className="ding_bottom">
                            <Input className="ding_ipt" placeholder="请输入评论内容" type="textarea" rows={1}
                                   value={this.state.repeatMes}
                                   onChange={this.repMesOnChange}
                            />
                            <Button className="ding_send ding_send_btn" type="primary"
                                    onClick={ding.sendMes.bind(this, this.state.biuId)}>发送</Button>
                        </div>
                    </div>
                </div>
                <MakeDingModal
                    isShow={this.state.makeDingModalIsShow}
                    closeDingModel={this.closeDingModel}
                />
            </div>
        );
    },
});

export default DingMessageTabComponents;

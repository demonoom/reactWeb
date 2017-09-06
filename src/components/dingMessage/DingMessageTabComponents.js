import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Card, Button, Row, Col} from 'antd';
import {message, Pagination, Modal, Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {showLargeImg} from '../../utils/utils';
import UploadImgComponents from './UploadImgComponents';
import ConfirmModal from '../ConfirmModal';

var ding;
var DingArr = [];
var DListArr = [];
var timer = null;
const DingMessageTabComponents = React.createClass({

    getInitialState() {
        ding = this;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            dMesList: [],   //存放获取的Ding消息对象
            type: 0,     //操作类型（1：查看收到  2：查看发出）
            totalCount: 0,       //分页时，返回的总数据量
            recPage: 1,      //在查看我收到的消息页面时的当前页码
            sendPage: 1,       //在查看我发出的消息时的当前页码
            //最终页面上显示的分页器上显示的页码值（该值由type来决定，type==0时取recPage,否则取sendPage值）
            currentShowPage: 1,
            repeatMes:'',     //回复消息的内容
        };
    },

    componentDidMount() {
        var initPageNo = 1;
        var initType = 1;
        ding.getDList(initPageNo, initType);
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
            });
            var id = v.id;
            if (type == 2) {
                if (isEmpty(v.attachments) === false) {
                    var sendFMine = <div>
                        {/*<img src="1.png" alt=""/>*/}
                        <div>
                            <div onClick={ding.entMesDetil.bind(this, id)} style={{cursor: 'pointer'}}>
                                <div><span>叮</span><span>我发出的</span><span>{createTime}</span></div>
                                <h5>{content}</h5>
                            </div>
                            <img src={imgSrc} style={{width: '35%'}} onClick={showLargeImg}/>
                            <div>共{revCon}人，{notRed}人未读</div>
                        </div>
                    </div>;
                } else {
                    var sendFMine = <div>
                        {/*<img src="1.png" alt=""/>*/}
                        <div>
                            <div onClick={ding.entMesDetil.bind(this, id)} style={{cursor: 'pointer'}}>
                                <div><span>叮</span><span>我发出的</span><span>{createTime}</span></div>
                                <h5>{content}</h5>
                            </div>
                            <div>共{revCon}人，{notRed}人未读</div>
                        </div>
                    </div>;
                }
                ;
            } else {
                if (isEmpty(v.attachments) === false) {
                    var sendFMine = <div>
                        {/*<img src="1.png" alt=""/>*/}
                        <div>
                            <div onClick={ding.entMesDetil.bind(this, id)} style={{cursor: 'pointer'}}>
                                <div><span>叮</span><span>来自{author}</span><span>{createTime}</span></div>
                                <h5>{content}</h5>
                            </div>
                            <img src={imgSrc} style={{width: '35%'}} onClick={showLargeImg}/>
                            <div>共{revCon}人，{notRed}人未读</div>
                        </div>
                    </div>;
                } else {
                    var sendFMine = <div>
                        {/*<img src="1.png" alt=""/>*/}
                        <div>
                            <div onClick={ding.entMesDetil.bind(this, id)} style={{cursor: 'pointer'}}>
                                <div><span>叮</span><span>来自{author}</span><span>{createTime}</span></div>
                                <h5>{content}</h5>
                            </div>
                            <div>共{revCon}人，{notRed}人未读</div>
                        </div>
                    </div>;
                }
                ;
            }
            DListArr.push(sendFMine);
        });
        ding.setState({DListArr});
        DListArr = [];
    },

    /**
     * Ding消息详情进场
     */
    entMesDetil(id) {
        this.setState({biuId:id});
        var _this = this;
        this.refs.dingPanel.style.animationPlayState = "running";
        _this.showDingList(id);
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
                    var hfirst = '<h5>叮</h5>' +
                        '<p>' + data.content + '</p>' +
                        '<img class="dingImg" src=' + data.attachments[0].address + '>' +
                        '<div>' +
                        '<img class="dingHead" src=' + data.user.avatar + '>' +
                        '<span>' + data.user.userName + '</span>' +
                        '<span>' + getLocalTime(data.createTime) + '</span>' +
                        '</div>';
                } else {
                    var hfirst = '<h5>叮</h5>' +
                        '<p>' + data.content + '</p>' +
                        '<div>' +
                        '<img class="dingHead" src=' + data.user.avatar + '>' +
                        '<span>' + data.user.userName + '</span>' +
                        '<span>' + getLocalTime(data.createTime) + '</span>' +
                        '</div>';
                }
                _this.refs.cardfir.innerHTML = hfirst;
                // 渲染第二个card
                var hsecond1 = '<ul>' + '<li>' + '<ul class="dReadList">';
                var hsecond2 = '';
                for (var i = 0; i < readPer; i++) {
                    hsecond2 += '<li>' +
                        '<img class="dingHead"' +
                        'src='+readPerImg[i]+
                        '>' +
                        '<div>'+readPerName[i]+'</div>' +
                        '</li>'
                }
                var hsecond3 = '</ul>' + '</li>' + '<li>' + '<ul class="dReadList dingHide">';
                var hsecond4 = '';
                for (var i = 0; i < noReadPer; i++) {
                    hsecond4 += '<li>' +
                        '<img class="dingHead"' +
                        'src='+noReadImg[i] +
                        '>' +
                        '<div>'+noReadperName[i]+'</div>' +
                        '</li>'
                }
                var hsecond5 = '</ul>' + '</li>' + '</ul>';

                var hsecond = hsecond1 + hsecond2 + hsecond3 + hsecond4 + hsecond5;
                _this.refs.cardsec.innerHTML = hsecond;
                // 渲染第三个card
                var hthirdStart = '<div>回复（' + recNum + '）</div>' + '<div>' + '<ul>';
                var hthirdMid = '';
                for (var i = 0; i < recNum; i++) {
                    hthirdMid += '<li class="ding_rev">' +
                        '<img class="dingHead" src=' + data.comments[i].user.avatar + '>' +
                        '<div>' +
                        '<h5>' + data.comments[i].user.userName + '</h5>' +
                        '<p>' + data.comments[i].content + '</p>' +
                        '</div>' +
                        '<span>' + getLocalTime(data.comments[i].createTime) + '</span>' +
                        '</li>';
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
        var dingPanel = ding.refs.dingPanel;
        clearInterval(timer);
        timer = setInterval(function () {
            // 目标位置
            var target = 1200;
            // 当前位置
            var leader = dingPanel.offsetLeft;
            // 步距
            var step = (target - leader) / 10;
            step = Math.ceil(step);
            leader = leader + step;
            dingPanel.style.left = leader + 'px';
            if (leader == target) {
                clearInterval(timer);
            }
        }, 15)
    },
    /*点击已读*/
    read() {
        var a = document.getElementsByClassName('dReadList');
        a[0].className = 'dReadList';
        a[1].className = 'dReadList dingHide';
    },
    /*点击未读*/
    unRead() {
        var a = document.getElementsByClassName('dReadList');
        a[0].className = 'dReadList dingHide';
        a[1].className = 'dReadList';
    },
    // 回复ding
    sendMes(id) {
        var _this = this;
        var biuId = id;
        var biuContent = this.state.repeatMes;
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
                if(ret.msg == '调用成功') {
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
     * 回复消息的相应
     * @param e
     */
    repMesOnChange(e) {
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var repeatMes = target.value;
        this.setState({repeatMes});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var breadMenuTip = "叮列表";
        if (ding.state.type == 1) {
            breadMenuTip = "叮列表";
        } else {
            breadMenuTip = "叮列表";
        }
        //标题
        var optionButton;
        optionButton = <div className="public—til—blue">
            <div className="talk_ant_btn1">
                <Button value="talk" onClick={ding.showaddTopicModal} className="antnest_talk">叮一下</Button>
            </div>
            {breadMenuTip}
        </div>;

        return (
            <div>
                <div className="talk_ant_btn">
                    {optionButton}
                </div>

                <div className="favorite_scroll ding_list">
                    <div className="antnest_cont topics_calc" style={{overflow: 'scroll'}}>
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
                                <div ref="cardfir"></div>
                            </Card>
                            <Card>
                                <div>
                                    <div className="dReadClick"><span
                                        onClick={ding.read}>已读（{this.state.readPer}人）</span><span
                                        onClick={ding.unRead}>未读（{this.state.noReadPer}人）</span></div>
                                    <div ref="cardsec">

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
                            <Button type="primary" onClick={ding.sendMes.bind(this,this.state.biuId)}>发送</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
});

export default DingMessageTabComponents;

import React from 'react';
import {
    message,
    Card,
    Button,
    Row,
    Col
} from 'antd';
import {doWebService} from '../WebServiceHelper';
import {isEmpty} from '../utils/Const';
import {MsgConnection} from '../utils/msg_websocket_connection';

var personCenterA;
var subjectList = [];
var antGroup;
var messageList = [];
//消息通信js
var ms;
var imgTagArray = [];
var showImg = "";
var showContent = "";//将要显示的内容
var data = [];
var courseWareList;
var activeKey = new Array();
var coursePanelChildren;
var liveInfosPanelChildren;
class PersonCenterV2 extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            userInfo: this.props.userInfo,
        };
        personCenterA = this;
        this.isFollow();
        this.isFollow = this.isFollow.bind(this);
        this.getLiveInfo = this.getLiveInfo.bind(this)
        this.getMyFollows = this.getMyFollows.bind(this)
        this.getMySubjects = this.getMySubjects.bind(this)
        this.getMyCourseWares = this.getMyCourseWares.bind(this)

    }

    callEvent(param) {
        if (param) {
            this.props.callEvent(param);
            return
        }


    }


    /**
     * 获取联系人列表
     */
    isFollow() {
        var param = {
            "method": 'isFollow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId": this.props.userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var isFollow = ret.response;
                personCenterA.setState({"isFollow": isFollow});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 发消息
     */
    sendMessage(e) {
        var userId = personCenterA.props.userInfo.user.colUid;
        ms = new MsgConnection();
        messageList.splice(0);
        var loginUserId = sessionStorage.getItem("ident");
        var machineId = sessionStorage.getItem("machineId");
        var pro = {
            "command": "messagerConnect",
            "data": {"machineType": "ios", "userId": Number.parseInt(loginUserId), "machine": machineId}
        };
        ms.msgWsListener = {
            onError: function (errorMsg) {

            }, onWarn: function (warnMsg) {

            }, onMessage: function (info) {
                if (antGroup.state.optType == "sendMessage") {
                    //获取messageList
                    var command = info.command;

                    if (isEmpty(command) == false) {
                        if (command == "messageList") {
                            var data = info.data;
                            var messageArray = data.messages;
                            var uuidsArray = [];
                            messageArray.forEach(function (e) {
                                var fromUser = e.fromUser;
                                var colUtype = fromUser.colUtype;
                                if (("SGZH" == colUtype || fromUser.colUid == userId) && e.toType == 1) {
                                    var uuid = e.uuid;
                                    uuidsArray.push(uuid);
                                    imgTagArray.splice(0);
                                    showImg = "";
                                    var content = e.content;
                                    /*var imgTagArrayReturn = antGroup.getImgTag(e.content);*/
                                    var imgTagArrayReturn = [];
                                    var messageReturnJson = antGroup.getImgTag(e.content);
                                    if (messageReturnJson.messageType == "text") {
                                        content = messageReturnJson.textMessage;
                                    } else if (messageReturnJson.messageType == "imgTag") {
                                        imgTagArrayReturn = messageReturnJson.imgMessage;
                                    }
                                    var message = {
                                        'fromUser': fromUser,
                                        'content': content,
                                        "messageType": "getMessage",
                                        "imgTagArray": imgTagArrayReturn,
                                        "messageReturnJson": messageReturnJson
                                    };
                                    messageList.push(message);
                                }
                            });
                            if (uuidsArray.length != 0) {
                                var receivedCommand = {
                                    "command": "messageRecievedResponse",
                                    "data": {"uuids": uuidsArray}
                                };
                                ms.send(receivedCommand);
                            }
                            antGroup.setState({"messageList": messageList});
                        } else if (command == "message") {
                            var data = info.data;
                            var messageOfSinge = data.message;
                            var uuidsArray = [];
                            var fromUser = messageOfSinge.fromUser;
                            var colUtype = fromUser.colUtype;
                            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                            if (("SGZH" == colUtype || fromUser.colUid != loginUser.colUid) && messageOfSinge.toType == 1) {
                                var uuid = messageOfSinge.uuid;
                                uuidsArray.push(uuid);
                                var content = messageOfSinge.content;
                                imgTagArray.splice(0);
                                showImg = "";
                                //var imgTagArrayReturn = antGroup.getImgTag(messageOfSinge.content);
                                var imgTagArrayReturn = [];
                                var messageReturnJson = antGroup.getImgTag(messageOfSinge.content);
                                if (messageReturnJson.messageType == "text") {
                                    content = messageReturnJson.textMessage;
                                } else if (messageReturnJson.messageType == "imgTag") {
                                    imgTagArrayReturn = messageReturnJson.imgMessage;
                                }
                                var messageShow = {
                                    'fromUser': fromUser,
                                    'content': content,
                                    "messageType": "getMessage",
                                    "imgTagArray": imgTagArrayReturn,
                                    "messageReturnJson": messageReturnJson
                                };
                                messageList.push(messageShow);
                                if (uuidsArray.length != 0) {
                                    var receivedCommand = {
                                        "command": "messageRecievedResponse",
                                        "data": {"uuids": uuidsArray}
                                    };
                                    ms.send(receivedCommand);
                                }
                            }
                            antGroup.setState({"messageList": messageList});
                        }
                    }
                }
            }
        };
        ms.connect(pro);
        antGroup.setState({"optType": "sendMessage", "userIdOfCurrentTalk": userId, "currentUser": user});
    }


    /**
     * 学生的提问
     */
    studentAsk() {
        antGroup.setState({
            "optType": "turnToAsk",
            "currentUser": personCenterA.props.userInfo.user,
            "activeKey": "我发起过的提问"
        });
    }

    /**
     * 学生的学习轨迹
     */
    studentStudyTrack() {
        antGroup.setState({
            "optType": "turnStudyTrack",
            "currentUser": personCenterA.props.userInfo.user,
            "activeKey": "studyTrack"
        });
    }

    /**
     * 关注联系人
     */
    followUser() {
        var param = {
            "method": 'follow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId": personCenterA.props.userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("关注成功");
                    personCenterA.setState({"isFollow": true});
                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 关注联系人
     */
    unfollowUser() {
        var param = {
            "method": 'unFollow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId": personCenterA.props.userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("取消关注成功");
                    personCenterA.setState({"isFollow": false});
                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 获取我的关注列表
     */
    getMyFollows(user) {
        user = this.state.userInfo.user;
        /*
         [[methond,param,ref],[methond,param,ref][,...]]
         mainlayout 切换组件
         调用ref实例方法或         修改ref属性
         */
        let param = {
            linkpart: [
                ['switchSection', 'visitAntGroup', null],
                ['getMyFollows', user, 'antGroupTabComponents']
            ],
            param: this.linkpart

        }
        this.props.callEvent(param);
    }


    /**
     * 获取我的题目
     */
    getMySubjects() {
        let user = this.state.userInfo.user;
        /*
         [[methond,param,ref],[methond,param,ref][,...]]
         mainlayout 切换组件
         调用ref实例方法或         修改ref属性
         */
        let param = {
            linkpart: [
                ['switchSection', 'visitAntGroup', null],
                ['callBackGetMySubjects', user, 'antGroupTabComponents']
            ],
            param: this.linkpart

        }
        this.props.callEvent(param);
    }

    /**
     * 获取我的资源
     */
    getMyCourseWares() {
        let user = this.state.userInfo.user;
        /*
         [[methond,param,ref],[methond,param,ref][,...]]
         mainlayout 切换组件
         调用ref实例方法或         修改ref属性
         */
        let param = {
            linkpart: [
                ['switchSection', 'visitAntGroup', null],
                ['callBackGetMyCourseWares', user, 'antGroupTabComponents']
            ],
            param: this.linkpart

        }
        this.props.callEvent(param);
    }

    /**
     * 获取我的直播课
     */
    getLiveInfo() {
        let user = this.state.userInfo.user;
        /*
         [[methond,param,ref],[methond,param,ref][,...]]
         mainlayout 切换组件
         调用ref实例方法或         修改ref属性
         */
        let param = {
            linkpart: [
                ['switchSection', 'visitAntGroup', null],
                ['gitUserLiveInfo', {user: user, pageNo: 1}, 'antGroupTabComponents']
            ],
            param: this.linkpart

        }
        this.props.callEvent(param);
    }

    /**
     * 进入系统平台规则显示页面
     */
    turnToPlatformRulePage(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var urlType = target.value;

        if (isEmpty(urlType) == false && urlType == "level") {
            antGroup.setState({
                "optType": "getScoreOrLevelPage",
                "currentUser": personCenterA.props.userInfo,
                "activeKey": "userScores",
                "urlType": urlType
            });
        } else {
            antGroup.setState({
                "optType": "getPlatformRulePage",
                "currentUser": personCenterA.props.userInfo,
                "activeKey": "platformRulePage"
            });
        }
    }


    /**
     * 获取个人中心
     */
    SetPerson(obj) {
        if (!obj.visible) return;
        var param = {
            "method": 'getPersonalCenterData',
            "userId": obj.userId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var userInfo = ret.response;

                antGroup.setState({"optType": "personCenter", "currentPerson": userInfo, "activeKey": "loginWelcome"});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    render() {
        var userPhotoTag;
        var user = personCenterA.props.userInfo.user;

        var userName = user.userName;
        if (isEmpty(user.avatar) == false) {
            userPhotoTag = <span className="person_user_bg">
                <img src={user.avatar} className="person_user"/>
            </span>;
            <div></div>
        }
        var userLinkCard;
        var userInfoCard;
        //PAREN---家长
        var intro = personCenterA.props.userInfo.introduction;
        if (user.colUtype == "STUD") {
            if (isEmpty(intro)) {
                intro = "这家伙很懒，还没编辑个人简介";
            }
            userLinkCard = <div title={userName + '的个人名片'} className="person_container">
                <Button value={user.colUid} icon="question-circle-o" onClick={personCenterA.studentAsk}
                        className="person_cor person_cor1">
                    <div>提问</div>
                </Button>
                <Button value={user.colUid} icon="area-chart" onClick={personCenterA.studentStudyTrack}
                        className="person_cor person_cor2">
                    <div>学习轨迹</div>
                </Button>
                <Button value={user.colUid} icon="star-o" onClick={personCenterA.getUserFavorite}
                        className="person_cor person_cor3">
                    <div>收藏</div>
                </Button>
                <Button value={user.colUid} icon="heart-o" onClick={ this.getMyFollows.bind(this, user) }
                        className="person_cor person_cor4">
                    <div>关注</div>
                </Button>
            </div>;
            userInfoCard = <Card title={personCenterA.props.userInfo.user.userName + '的个人名片'} className="bai">
                <Row className="person_13">
                    <Col span={3} className="gary_person">学&nbsp;&nbsp;&nbsp;&nbsp;校：</Col>
                    <Col span={21} className="black_person">{personCenterA.props.userInfo.school}</Col>
                    <Col span={3} className="gary_person">年&nbsp;&nbsp;&nbsp;&nbsp;级：</Col>
                    <Col span={21} className="black_person ">{personCenterA.props.userInfo.grade}</Col>
                </Row>
                <Row>
                    <Col span={3} className="gary_person">个人简介：</Col>
                    <Col span={21} className="black_person">{intro}</Col>
                </Row>
            </Card>;
        } else {
            if (isEmpty(intro)) {
                intro = "该老师很忙，还没编辑个人简介";
            }
            userLinkCard = <div title={userName + '的个人名片'} className="person_container ">
                <Button value={user.colUid} icon="play-circle-o" className="person_cor person_cor1"
                        onClick={personCenterA.getLiveInfo}>
                    <div>直播</div>
                </Button>
                <Button value={user.colUid} icon="area-chart" className="person_cor person_cor2"
                        onClick={personCenterA.getMyCourseWares}>
                    <div>资源</div>
                </Button>
                <Button value={user.colUid} icon="star-o" className="person_cor person_cor3"
                        onClick={personCenterA.getMySubjects}>
                    <div>题库</div>
                </Button>
                <Button value={user.colUid} icon="heart-o" className="person_cor person_cor4"
                        onClick={  this.getMyFollows.bind(this, user)  }>
                    <div>关注</div>
                </Button>
            </div>;

            userInfoCard = <Card title={personCenterA.props.userInfo.user.userName + '的个人名片'} className="bai">
                <Row className="person_13">
                    <Col span={3} className="gary_person">学&nbsp;&nbsp;&nbsp;&nbsp;校：</Col>
                    <Col span={21} className="black_person">{personCenterA.props.userInfo.school}</Col>
                    <Col span={3} className="gary_person">科&nbsp;&nbsp;&nbsp;&nbsp;目：</Col>
                    <Col span={21} className="black_person">{personCenterA.props.userInfo.course}</Col>
                    <Col span={3} className="gary_person">年&nbsp;&nbsp;&nbsp;&nbsp;级：</Col>
                    <Col span={21} className="black_person">{personCenterA.props.userInfo.grade}</Col>
                </Row>
                <Row>
                    <Col span={3} className="gary_person">个人简介：</Col>
                    <Col span={21} className="black_person">{intro}</Col>
                </Row>
            </Card>;
        }

        var followButton;

        if (personCenterA.props.isFollow == false) {
            followButton =
                <Button icon="plus" onClick={personCenterA.followUser} className="persono_btn_blue">关注</Button>;
        } else {
            followButton = <Button icon="plus" onClick={personCenterA.unfollowUser}>取消关注</Button>;
        }

        return (
            <div>
                <Card className="bai">
                    {userPhotoTag}

                    <span className="person_btn">
                        <Button className="antnest_talk" value="score"
                                onClick={personCenterA.turnToPlatformRulePage}>{personCenterA.props.userInfo.score}积分</Button>
						<Button value="level"
                                onClick={personCenterA.turnToPlatformRulePage}>{personCenterA.props.userInfo.level.name}</Button>
                    </span>
                    <span className="person_btn_ri">
                    <Button icon="message" value={personCenterA.props.userInfo.user.colUid}
                            onClick={personCenterA.sendMessage} className="antnest_talk  persono_btn_blue">发消息</Button>
                        {followButton}
					 </span>

                </Card>

                <div>{userLinkCard}
                    {userInfoCard}

                </div>
            </div>
        );
    }
}

export default PersonCenterV2;

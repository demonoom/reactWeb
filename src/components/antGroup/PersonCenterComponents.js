import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Table} from 'antd';
import { Menu, Dropdown,message,Pagination,Tag , Modal,Popover,Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {getAllTopic} from '../../utils/Const';
import {getOnlyTeacherTopic} from '../../utils/Const';
const TabPane = Tabs.TabPane;

var personCenter;
const PersonCenterComponents = React.createClass({

    getInitialState() {
        personCenter = this;
        var userInfo = personCenter.props.userInfo;
        console.log("currentPerson"+userInfo);
        personCenter.isFollow();
        return {
            userInfo:personCenter.props.userInfo,
        };
    },

    /**
     * 获取联系人列表
     */
    isFollow(){
        var param = {
            "method": 'isFollow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId":personCenter.props.userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var isFollow = ret.response;
                personCenter.setState({"isFollow":isFollow});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 发消息
     */
    sendMessage(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var userId = target.value;
        console.log(userId);
        personCenter.props.callBackTurnToMessagePage(userId);
    },
    /**
     * 学生的提问
     * @param e
     */
    studentAsk(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var userId = target.value;
        console.log(userId);
        personCenter.props.callBackTurnToAsk(userId);
    },
    /**
     * 学生的学习轨迹
     */
    studentStudyTrack(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var userId = target.value;
        console.log(userId);
        personCenter.props.callBackStudyTrack(userId);
    },
    /**
     * 关注联系人
     */
    followUser(){
        var param = {
            "method": 'follow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId":personCenter.props.userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    message.success("关注成功");
                    personCenter.setState({"isFollow":true});
                }else{
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 关注联系人
     */
    unfollowUser(){
        var param = {
            "method": 'unFollow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId":personCenter.props.userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    message.success("取消关注成功");
                    personCenter.setState({"isFollow":false});
                }else{
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取我的关注列表
     */
    getMyFollows(e){
        personCenter.props.callBackGetMyFollows(personCenter.props.userInfo.user);
    },

    /**
     * 获取我的关注列表
     */
    getUserFavorite(e){
        personCenter.props.callBackGetUserFavorite(personCenter.props.userInfo.user);
    },

    render() {
        var userPhotoTag;
        var user = personCenter.state.userInfo.user;
        var userName = user.userName;
        if(isEmpty(user.avatar)==false){
            userPhotoTag = <p className="person_user_bg">
                <img src={user.avatar} className="person_user"/>
				<img src={user.avatar} className="blur"/>		
            </p>;
			<div></div>
        }
        var userLinkCard;
        var userInfoCard;
        //PAREN---家长
        if(user.colUtype=="STUD"){
            userCard = <Card title={userName+'的个人名片'} className="bai">

                <Row>
                    <Col span={10}><Button value={user.colUid} icon="question-circle-o" onClick={personCenter.studentAsk}>{userName}的提问</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button value={user.colUid} icon="area-chart" onClick={personCenter.studentStudyTrack}>{userName}的学习轨迹</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button value={user.colUid} icon="star-o" onClick={personCenter.getUserFavorite}>{userName}的收藏</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button value={user.colUid} icon="heart-o" onClick={personCenter.getMyFollows}>{userName}的关注</Button></Col>
                </Row>
            </Card>;
            userInfoCard = <Card title={personCenter.state.userInfo.user.userName+'的个人名片'}  style={{ width: 700 }}>
                <Row>
                    <Col span={4} className="person_le">学校：</Col>
                    <Col span={8}>{personCenter.state.userInfo.school}</Col>
                    <Col span={4}>年级：</Col>
                    <Col span={8}>{personCenter.state.userInfo.grade}</Col>
                </Row>
                <Row>
                    <Col span={4}>个人简介：</Col>
                    <Col span={10}>这家伙很懒，还没编辑个人简介</Col>
                </Row>
            </Card>;
        }else{

            userCard = <Card title={userName+'的个人名片'}  className="bai">

                <Row>
                    <Col span={10}><Button value={user.colUid} icon="question-circle-o">{userName}的直播</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button value={user.colUid} icon="area-chart">{userName}的资源</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button value={user.colUid} icon="star-o">{userName}的题库</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button value={user.colUid} icon="heart-o">{userName}的关注</Button></Col>
                </Row>
            </Card>;
            userInfoCard = <Card title={personCenter.state.userInfo.user.userName+'的个人名片'}  style={{ width: 700 }}  className="bai">
                <Row>
                    <Col span={4}>学校：</Col>
                    <Col span={8}>{personCenter.state.userInfo.school}</Col>
                    <Col span={4}>科目：</Col>
                    <Col span={8}>{personCenter.state.userInfo.course}</Col>
                    <Col span={4}>年级：</Col>
                    <Col span={8}>{personCenter.state.userInfo.grade}</Col>
                </Row>
                <Row>
                    <Col span={4}>个人简介：</Col>
                    <Col span={10}>该老师很忙，还没编辑个人简介</Col>
                </Row>
            </Card>;
        }

        var followButton;
        console.log("isFollow:"+personCenter.state.isFollow);
        if(personCenter.state.isFollow==false){
            followButton = <Button icon="plus" onClick={personCenter.followUser}>关注</Button>;
        }else {
            followButton = <Button icon="plus" onClick={personCenter.unfollowUser}>取消关注</Button>;
        }

        return (
            <div>
                <Card className="bai">
                    {userPhotoTag}
                    <p className="person_btn">
                        <Button>{personCenter.state.userInfo.score}积分</Button><Button>{personCenter.state.userInfo.level.name}</Button>
                    </p>
                </Card>
                <Card className="bai">
                    <Button icon="message" value={personCenter.state.userInfo.user.colUid} onClick={personCenter.sendMessage}>发消息</Button>
                    {followButton}
                </Card>

                {userInfoCard}
                {userLinkCard}

            </div>
        );
    },
});

export default PersonCenterComponents;

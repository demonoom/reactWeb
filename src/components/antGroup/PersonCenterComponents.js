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
        personCenter.props.callBackTurnToMessagePage(personCenter.props.userInfo.user);
    },
    /**
     * 学生的提问
     */
    studentAsk(){
        personCenter.props.callBackTurnToAsk(personCenter.props.userInfo.user);
    },
    /**
     * 学生的学习轨迹
     */
    studentStudyTrack(){
        personCenter.props.callBackStudyTrack(personCenter.props.userInfo.user);
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
    getMyFollows(){
        personCenter.props.callBackGetMyFollows(personCenter.props.userInfo.user);
    },

    /**
     * 获取我的收藏列表
     */
    getUserFavorite(){
        personCenter.props.callBackGetUserFavorite(personCenter.props.userInfo.user);
    },

    /**
     * 获取我的题目
     */
    getMySubjects(){
        personCenter.props.callBackGetMySubjects(personCenter.props.userInfo.user);
    },

    /**
     * 获取我的资源
     */
    getMyCourseWares(){
        personCenter.props.callBackGetMyCourseWares(personCenter.props.userInfo.user);
    },

    /**
     * 获取我的直播课
     */
    getLiveInfo(){
        personCenter.props.callBackGetLiveInfo(personCenter.props.userInfo.user);
    },
    /**
     * 进入系统平台规则显示页面
     */
    turnToPlatformRulePage(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var urlType = target.value;
        console.log(urlType);
        personCenter.props.callBackTurnToPlatformRulePage(personCenter.props.userInfo,urlType);
    },

    render() {
        var userPhotoTag;
        var user = personCenter.state.userInfo.user;
        var userName = user.userName;
        if(isEmpty(user.avatar)==false){
            userPhotoTag = <span className="person_user_bg">
                <img src={user.avatar} className="person_user"/>
            </span>;
			<div></div>
        }
        var userLinkCard;
        var userInfoCard;
        //PAREN---家长
        var intro=personCenter.state.userInfo.introduction;
        if(user.colUtype=="STUD"){
            if(isEmpty(intro)){
                intro="这家伙很懒，还没编辑个人简介";
            }
            userLinkCard = <div title={userName+'的个人名片'} className="person_container">
                <Button value={user.colUid} icon="question-circle-o" onClick={personCenter.studentAsk} className="person_cor person_cor1"><div>提问</div></Button>
                <Button value={user.colUid} icon="area-chart" onClick={personCenter.studentStudyTrack} className="person_cor person_cor2"><div>学习轨迹</div></Button>
                <Button value={user.colUid} icon="star-o" onClick={personCenter.getUserFavorite} className="person_cor person_cor3"><div>收藏</div></Button>
                <Button value={user.colUid} icon="heart-o" onClick={personCenter.getMyFollows} className="person_cor person_cor4"><div>关注</div></Button>
            </div>;
            userInfoCard = <Card title={personCenter.state.userInfo.user.userName+'的个人名片'}  className="bai">
                <Row className="person_13">
                    <Col span={3} className="gary_person">学&nbsp;&nbsp;&nbsp;&nbsp;校：</Col>
                    <Col span={21} className="black_person">{personCenter.state.userInfo.school}</Col>
                    <Col span={3} className="gary_person">年&nbsp;&nbsp;&nbsp;&nbsp;级：</Col>
                    <Col span={21} className="black_person ">{personCenter.state.userInfo.grade}</Col>
                </Row>
                <Row>
                    <Col span={3} className="gary_person">个人简介：</Col>
                    <Col span={21} className="black_person">{intro}</Col>
                </Row>
            </Card>;
        }else{
            if(isEmpty(intro)){
                intro="该老师很忙，还没编辑个人简介";
            }
            userLinkCard = <div title={userName+'的个人名片'}  className="person_container ">
                <Button value={user.colUid} icon="play-circle-o"  className="person_cor person_cor1" onClick={personCenter.getLiveInfo}><div>直播</div></Button>
                <Button value={user.colUid} icon="area-chart" className="person_cor person_cor2" onClick={personCenter.getMyCourseWares}><div>资源</div></Button>
                <Button value={user.colUid} icon="star-o" className="person_cor person_cor3" onClick={personCenter.getMySubjects}><div>题库</div></Button>
                <Button value={user.colUid} icon="heart-o" className="person_cor person_cor4" onClick={personCenter.getMyFollows}><div>关注</div></Button>
            </div>;
			
            userInfoCard = <Card title={personCenter.state.userInfo.user.userName+'的个人名片'}  className="bai">
                <Row className="person_13">
                    <Col span={3} className="gary_person">学&nbsp;&nbsp;&nbsp;&nbsp;校：</Col>
                    <Col span={21} className="black_person">{personCenter.state.userInfo.school}</Col>
                    <Col span={3} className="gary_person">科&nbsp;&nbsp;&nbsp;&nbsp;目：</Col>
                    <Col span={21} className="black_person">{personCenter.state.userInfo.course}</Col>
                    <Col span={3} className="gary_person">年&nbsp;&nbsp;&nbsp;&nbsp;级：</Col>
                    <Col span={21} className="black_person">{personCenter.state.userInfo.grade}</Col>
                </Row>
                <Row>
                    <Col span={3} className="gary_person">个人简介：</Col>
                    <Col span={21} className="black_person">{intro}</Col>
                </Row>
            </Card>;
        }

        var followButton;

        if(personCenter.state.isFollow==false){
            followButton = <Button icon="plus" onClick={personCenter.followUser} className="persono_btn_blue">关注</Button>;
        }else {
            followButton = <Button icon="plus" onClick={personCenter.unfollowUser}>取消关注</Button>;
        }

        return (
            <div>
                <Card className="bai">
                    {userPhotoTag}

                    <span className="person_btn">
                        <Button className="antnest_talk" 　value="score" onClick={personCenter.turnToPlatformRulePage}>{personCenter.state.userInfo.score}积分</Button>
						<Button value="level" onClick={personCenter.turnToPlatformRulePage} >{personCenter.state.userInfo.level.name}</Button>
                    </span>
					<span className="person_btn_ri">
                    <Button icon="message" value={personCenter.state.userInfo.user.colUid} onClick={personCenter.sendMessage} className="antnest_talk  persono_btn_blue">发消息</Button>
                     {followButton}
					 </span>

                   
                </Card>
               
                <div>{userLinkCard}
                {userInfoCard}
                
               </div>
            </div>
        );
    },
});

export default PersonCenterComponents;

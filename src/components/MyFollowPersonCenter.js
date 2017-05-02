import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Table} from 'antd';
import { Menu, Dropdown,message,Pagination,Tag , Modal,Popover,Input} from 'antd';
import {doWebService} from '../WebServiceHelper';
import {isEmpty} from '../utils/Const';

var personCenter;
const MyFollowPersonCenter = React.createClass({

    getInitialState() {
        personCenter = this;
        var isExist = this.checkPersonIsInContacts();
        this.isFollow();
        return {
            userInfo:this.props.userInfo,
            isExist:isExist
        };
    },

    /**
     * 判断当前个人中心显示的人员是否是当前用户的联系人
     */
    checkPersonIsInContacts(){
        var isExist=false;
        var userContactsData = this.props.userContactsData;
        for(var i=0;i<userContactsData.length;i++){
            var contactJson=userContactsData[i];
            if(contactJson.key==this.props.userInfo.user.colUid){
                isExist = true;
                break;
            }
        }
        return isExist;
    },

    /**
     * 获取联系人列表
     */
    isFollow(){
        let _this=this;
        var param = {
            "method": 'isFollow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId":this.props.userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var isFollow = ret.response;
                _this.setState({"isFollow":isFollow});
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
        this.props.callBackTurnToMessagePage(this.props.userInfo.user);
    },
    /**
     * 学生的提问
     */
    studentAsk(){
        this.props.callBackTurnToAsk(this.props.userInfo.user);
    },
    /**
     * 学生的学习轨迹
     */
    studentStudyTrack(){
        this.props.callBackStudyTrack(this.props.userInfo.user);
    },
    /**
     * 关注联系人
     */
    followUser(){
        let _this=this;
        var param = {
            "method": 'follow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId":this.props.userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    message.success("关注成功");
                    _this.setState({"isFollow":true});
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
        let _this=this;
        var param = {
            "method": 'unFollow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId":this.props.userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    message.success("取消关注成功");
                    _this.setState({"isFollow":false});
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
     * 获取我的收藏列表
     */
    getUserFavorite(){
        this.props.callBackGetUserFavorite(this.props.userInfo.user);
    },

    /**
     * 获取我的题目
     */
    getMySubjects(){
        this.props.callBackGetMySubjects(this.props.userInfo.user);
    },

    /**
     * 获取我的资源
     */
    getMyCourseWares(){
        this.props.callBackGetMyCourseWares(this.props.userInfo.user);
    },

    /**
     * 获取我的直播课
     */
    getLiveInfo(){
        this.props.callBackGetLiveInfo(this.props.userInfo.user);
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
        this.props.callBackTurnToPlatformRulePage(this.props.userInfo,urlType);
    },

    intoMyFollows(){

      this.props.intoMyFollows(this.props.userInfo.user.colUid);
    },

    render() {
        var userPhotoTag;
        var user = this.state.userInfo.user;
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
        var intro=this.state.userInfo.introduction;
        if(user.colUtype=="STUD"){
            if(isEmpty(intro)){
                intro="这家伙很懒，还没编辑个人简介";
            }
            userLinkCard = <div  className="person_container">
                <Button value={user.colUid} icon="question-circle-o" onClick={this.studentAsk} className="person_cor person_cor1" title={userName+'的提问'}><div>提问</div></Button>
                <Button value={user.colUid} icon="area-chart" onClick={this.studentStudyTrack} className="person_cor person_cor2" title={userName+'的学习轨迹'}><div>学习轨迹</div></Button>
                <Button value={user.colUid} icon="star-o" onClick={this.getUserFavorite} className="person_cor person_cor3" title={userName+'的收藏'}><div>收藏</div></Button>
                <Button value={user.colUid} icon="heart-o" onClick={this.getMyFollows} className="person_cor person_cor4"  title={userName+'的关注'}><div>关注</div></Button>
            </div>;
            userInfoCard = <Card title={this.state.userInfo.user.userName+'的名片'}  className="bai">
                <Row className="person_13">
                    <Col span={3} className="gary_person">学&nbsp;&nbsp;&nbsp;&nbsp;校：</Col>
                    <Col span={21} className="black_person">{this.state.userInfo.school}</Col>
                    <Col span={3} className="gary_person">年&nbsp;&nbsp;&nbsp;&nbsp;级：</Col>
                    <Col span={21} className="black_person ">{this.state.userInfo.grade}</Col>
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
            userLinkCard = <div  className="person_container ">
                <Button value={user.colUid} icon="play-circle-o"  className="person_cor person_cor1" onClick={this.getLiveInfo} title={userName+'的直播'} ><div>直播</div></Button>
                <Button value={user.colUid} icon="area-chart" className="person_cor person_cor2" onClick={this.getMyCourseWares} title={userName+'的资源'} ><div>资源</div></Button>
                <Button value={user.colUid} icon="star-o" className="person_cor person_cor3" onClick={this.getMySubjects} title={userName+'的题库'} ><div>题库</div></Button>
                <Button value={user.colUid} icon="heart-o" className="person_cor person_cor4" onClick={ this.intoMyFollows } title={userName+'的关注'} ><div>关注</div></Button>
            </div>;

            userInfoCard = <Card title={this.state.userInfo.user.userName+'的名片'}  className="bai">
                <Row className="person_13">
                    <Col span={3} className="gary_person">学&nbsp;&nbsp;&nbsp;&nbsp;校：</Col>
                    <Col span={21} className="black_person">{this.state.userInfo.school}</Col>
                    <Col span={3} className="gary_person">科&nbsp;&nbsp;&nbsp;&nbsp;目：</Col>
                    <Col span={21} className="black_person">{this.state.userInfo.course}</Col>
                    <Col span={3} className="gary_person">年&nbsp;&nbsp;&nbsp;&nbsp;级：</Col>
                    <Col span={21} className="black_person">{this.state.userInfo.grade}</Col>
                </Row>
                <Row>
                    <Col span={3} className="gary_person">{userName+'简介：'}</Col>
                    <Col span={21} className="black_person">{intro}</Col>
                </Row>
            </Card>;
        }

        var followButton;
        var sendMessageButton;
        //个人中心页面中，如果是自己，则不能显示关注和取消关注
        if(this.state.userInfo.user.colUid != sessionStorage.getItem("ident")){
            if(this.state.isFollow==false){
                followButton = <Button icon="heart-o" onClick={this.followUser} className="persono_btn_gray">关注</Button>;
            }else {
                followButton = <Button icon="heart" onClick={this.unfollowUser} className="persono_btn_gray">取消关注</Button>;
            }
        }
        //如果个人中心显示的用户并不是当前用户的联系人，则不能显示发消息按钮
        if(this.state.isExist){
            sendMessageButton=<Button icon="message" value={this.state.userInfo.user.colUid} onClick={this.sendMessage} className="antnest_talk  persono_btn_blue">发消息</Button>;
        }
        /*
         if(this.state.isFollow==false){
         followButton = <Button icon="heart-o" onClick={this.followUser} className="persono_btn_gray">关注</Button>;
         }else {
         followButton = <Button icon="heart" onClick={this.unfollowUser} className="persono_btn_gray">取消关注</Button>;
         }
         */

        return (
            <div>
                <Card className="bai">
                    {userPhotoTag}

                    <span className="person_btn">
                        <Button className="antnest_talk antnest_icon_radius" 　value="score" onClick={this.turnToPlatformRulePage}><i className="iconfont iconfont_jifen">&#xe608;</i><span className="iocnfont_sp_jifen">{this.state.userInfo.score}</span>积分</Button>
						<Button className="antnest_icon_blue_radius" value="level" onClick={this.turnToPlatformRulePage} >{this.state.userInfo.level.name}</Button>
                    </span>
                    <span className="person_btn_ri">
                     {sendMessageButton}
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

export default MyFollowPersonCenter;

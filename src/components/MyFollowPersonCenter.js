import React, { PropTypes } from 'react';
import { Card,Button,Row,Col ,message,} from 'antd';
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


    componentWillReceiveProps: function(nextProps) {

        this.setState({ userInfo : nextProps.userInfo });

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


    intoMyFollows(){

      this.props.intoMyFollows(this.props.userInfo.user);
    },

    render() {


        var userPhotoTag;
        var user = this.props.userInfo.user;
        var userName = user.userName;
        if(isEmpty(user.avatar)==false){
            userPhotoTag = <div className="person_user_bg2">
                <img src={user.avatar} className="person_user"/>
            </div>;
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
                <Button value={user.colUid} icon="question-circle-o" onClick={this.studentAsk} className="person_cor" title={userName+'的提问'}><div>提问</div></Button>
                <Button value={user.colUid} icon="area-chart" onClick={this.studentStudyTrack} className="person_cor" title={userName+'的学习轨迹'}><div>学习轨迹</div></Button>
                <Button value={user.colUid} icon="star-o" onClick={this.getUserFavorite} className="person_cor" title={userName+'的收藏'}><div>收藏</div></Button>
                <Button value={user.colUid} icon="heart-o" onClick={this.getMyFollows} className="person_cor"  title={userName+'的关注'}><div>关注</div></Button>
            </div>;
            userInfoCard = <Card title={this.state.userInfo.user.userName+'的名片'}  className="bai">
                <Row className="person_13">
                    <p className="user_cont"><Col className="gary_person user_til_name">学&nbsp;&nbsp;&nbsp;&nbsp;校：</Col>
                    <Col span={21} className="black_person">{this.state.userInfo.school}</Col></p>
                    <Col className="gary_person user_til_name">年&nbsp;&nbsp;&nbsp;&nbsp;级：</Col>
                    <Col span={21} className="black_person ">{this.state.userInfo.grade}</Col>
                </Row>
                <Row>
                    <Col className="gary_person user_til_name">个人简介：</Col>
                    <Col span={21} className="black_person">{intro}</Col>
                </Row>
            </Card>;
        }
        else{
            if(isEmpty(intro)){
                intro="该老师很忙，还没编辑个人简介";
            }
            userLinkCard = <div  className="person_container ">
                <Button value={user.colUid} icon="play-circle-o"  className="person_cor" onClick={this.getLiveInfo} title={userName+'的直播'} ><div>直播</div></Button>
                <Button value={user.colUid} icon="area-chart" className="person_cor" onClick={this.getMyCourseWares} title={userName+'的资源'} ><div>资源</div></Button>
                <Button value={user.colUid} icon="star-o" className="person_cor" onClick={this.getMySubjects} title={userName+'的题库'} ><div>题库</div></Button>
                <Button value={user.colUid} icon="heart-o" className="person_cor" onClick={ this.intoMyFollows } title={userName+'的关注'} ><div>关注</div></Button>
            </div>;

            userInfoCard = <Card title={this.state.userInfo.user.userName+'的名片'}  className="bai new_center_user">
                <Row className="person_13">
                    <p className="user_cont"><span className="user_til_name">学&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;校：</span><span className="black_person">{this.state.userInfo.school}</span></p>
                    <p className="user_cont"><span className="user_til_name">科&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;目：</span><span className="black_person">{this.state.userInfo.course}</span></p>
                    <p className="user_cont"><span className="user_til_name">年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级：</span><span className="black_person">{this.state.userInfo.grade}</span></p>
                </Row>
                <Row>
                    <p className="user_cont"><span className="user_til_name">个人简介：</span><span className="black_person">{intro}</span></p>
                </Row>
            </Card>;
        }

        var followButton;
        var sendMessageButton;
        //个人中心页面中，如果是自己，则不能显示关注和取消关注
        if(this.state.userInfo.user.colUid != sessionStorage.getItem("ident")){
            if(this.state.isFollow==false){
                followButton = <Button onClick={this.followUser} className="persono_btn_gray">关注</Button>;
            }else {
                followButton = <Button onClick={this.unfollowUser} className="persono_btn_gray_old">取消关注</Button>;
            }
        }
        //如果个人中心显示的用户并不是当前用户的联系人，则不能显示发消息按钮
        if(this.state.isExist){
            sendMessageButton=<Button icon="message" value={this.state.userInfo.user.colUid} onClick={this.sendMessage} className="antnest_talk  persono_btn_blue">发消息</Button>;
        }

        return (
            <div className="maaee_group_pa">
                <div className="bai gary_person">
                    {userPhotoTag}

                    <div className="person_btn">
                        <button className="ant-btn antnest_talk antnest_icon_radius"   onClick={ ()=>{
                            this.props.callBackTurnToPlatformRulePage( 'score');
                        }
                        }><span className="iocnfont_sp_jifen">{this.state.userInfo.score}</span>积分</button>
                        <span className="bor_ri_line"></span>
						<button className="ant-btn antnest_icon_blue_radius"   onClick={ ()=>{
                            this.props.callBackTurnToPlatformRulePage( 'level');
						}
						} >{this.state.userInfo.level.name}</button>
                    </div>
                    <div className="person_btn_ri">
                     {sendMessageButton}
                        {followButton}
					 </div>
                </div>
				
                <div >
					{userLinkCard}
                    {userInfoCard}
                </div>
         </div>   
        );
    },
});

export default MyFollowPersonCenter;

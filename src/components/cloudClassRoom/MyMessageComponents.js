 import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,message,Pagination} from 'antd';
import {doWebService_CloudClassRoom} from '../../utils/CloudClassRoomURLUtils';
import {isEmpty} from '../../utils/utils';
import ConfirmModal from '../ConfirmModal';

const MyMessageComponents = React.createClass({

    getInitialState() {
        var cloudClassRoomUser = JSON.parse(sessionStorage.getItem("cloudClassRoomUser"));
        return {
            currentPageNo:1,
            status:'2,3',
            cloudClassRoomUser:cloudClassRoomUser,
        };
    },

    componentDidMount(){
        this.queryPageByTeamＵser(this.state.currentPageNo,this.state.status);
    },
    /**
     * 查询当前用户的所有申请中和待审核的消息
     * @param pageNo
     * @param status
     */
    queryPageByTeamＵser(pageNo,status){
        var _this = this;
        var param = {
            "method": 'queryPageByTeamUser',
            "pageNo": pageNo,
            "status":status,
            "personId":_this.state.cloudClassRoomUser.colUid
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var pager = ret.pager;
                var teamUserCardArray = [];
                if(isEmpty(response)==false){
                    response.forEach(function (teamUser) {
                        //２．申请中　３．邀请中
                        var status = teamUser.status;
                        var id = teamUser.id;
                        var teamName = teamUser.team.name;
                        var userName = teamUser.user.userName;
                        var schoolName = teamUser.user.schoolName;
                        var optButton;
                        var statusMessage = "申请中";
                        var requestMessage;
                        if(status==2){
                            statusMessage = "申请中";
                            requestMessage=userName+"申请加入您的"+teamName;
                            optButton = <div className="info_btn">
                                <Button className="add_study-b" onClick={_this.showUpdateTeamUserConfirmModal.bind(_this,id,1)}>同意</Button>
                                <Button className="correct_name" onClick={_this.showUpdateTeamUserConfirmModal.bind(_this,id,4)}>拒绝</Button>
                            </div>;
                        }else{
                            requestMessage=teamName+"邀请您加入";
                            statusMessage = "邀请中";
                            optButton="";
                        }
                        var teamUserCard=<Card className="information">
                            <div className="info_user">
                                <img className="person_user pers_bo_ra" src="http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png" />
                            </div>
                            <div>
                                <div className="info_school"><span className="info_school_s">{userName}</span><span className="live_color live_orange">{statusMessage}</span></div>
                                <div className="apply_for">{schoolName}</div>
                                <div  className="exam-particulars_time">{requestMessage}</div>
                            </div>
                                {optButton}
                        </Card>;
						
                        teamUserCardArray.push(teamUserCard);
                    });
                }else{
                    var teamUserCard=<Card className="pers_bo_ra noDataTipImg">
                        <div>
                            <Icon type="frown-o" /><span>&nbsp;&nbsp;暂无数据</span>
                        </div>
                    </Card>;
                    teamUserCardArray.push(teamUserCard);
                }
                _this.setState({teamUserCardArray,total:pager.rsCount});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    showUpdateTeamUserConfirmModal(teamUserId,teamUserStatus){
        var modalTitle;
        if(teamUserStatus==1)
        {
            modalTitle = "确定要同意该用户加入您的团队";
        }else{
            modalTitle = "确定要拒绝该用户加入您的团队";
        }
        this.setState({teamUserId,teamUserStatus,modalTitle});
        this.refs.confirmModal.changeConfirmModalVisible(true);
    },

    closeConfirmModal() {
        this.refs.confirmModal.changeConfirmModalVisible(false);
    },

    /**
     * 同意或拒绝用户进群操作
     */
    updateTeamUser(){
        var _this = this;
        var teamUserJson = {id:_this.state.teamUserId,
            status:_this.state.teamUserStatus};
        var param = {
            "method": 'updateTeamUser',
            "jsonObject": JSON.stringify(teamUserJson),
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response==true){
                    message.success("操作成功,谢谢!");
                }else{
                    message.error("操作失败");
                }
                _this.closeConfirmModal();
                _this.queryPageByTeamＵser(_this.state.currentPageNo,_this.state.status);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    onChange(pageNumber) {
        var _this = this;
        console.log('Page: ', pageNumber);
        _this.setState({"currentPageNo":pageNumber});
        _this.queryPageByTeamＵser(pageNumber,_this.state.status);
    },


/**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div>
                {this.state.teamUserCardArray}
                <Pagination defaultCurrent={this.state.currentPageNo} current={this.state.currentPageNo} total={this.state.total} onChange={this.onChange} />
                <ConfirmModal ref="confirmModal"
                              title={this.state.modalTitle}
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.updateTeamUser}
                ></ConfirmModal>
            </div>
        );
    },
});

export default MyMessageComponents;

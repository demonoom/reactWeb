import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Radio,Table,message,Modal,Input,Transfer} from 'antd';
import {isEmpty} from '../../utils/utils';
import {getCloudClassRoomRequestURL} from '../../utils/CloudClassRoomURLUtils';
import {cloudClassRoomRequestByAjax} from '../../utils/CloudClassRoomURLUtils';
import {getPageSize} from '../../utils/Const';
import {doWebService_CloudClassRoom} from '../../utils/CloudClassRoomURLUtils';
import ConfirmModal from '../ConfirmModal';
const RadioGroup = Radio.Group;

var userTeamColumns = [ {
    title: '团队头像',
    dataIndex: 'teamPhoto',
    className: 'left-12',
},{
    title: '团队名称',
    dataIndex: 'teamName',
},{
    title: '团队人数',
    dataIndex: 'teamCount',
},{
    title: '团队设置',
    dataIndex: 'teamSet',
},];
var teamTableData = [];
const AntTeamComponents = React.createClass({

    getInitialState() {
        var cloudClassRoomUser = JSON.parse(sessionStorage.getItem("cloudClassRoomUser"));
        return {
            currentPage:1,
            userTeamData:[],
            createTeamModalVisible:false,
            totalTeamCount:0,
            cloudClassRoomUser:cloudClassRoomUser,
        };
    },

    componentDidMount(){
        var type = this.props.type;
        this.setState({type});
        this.findTeamInfoByType(type);
    },

    componentWillReceiveProps(nextProps){
        var type = nextProps.type;
        this.setState({type});
        this.findTeamInfoByType(type,nextProps.teamSearchKey);
    },

    findTeamInfoByType(type,teamSearchKey){
        var _this = this;
        switch(type){
            case "myTeam":
                _this.findTeamByUserId(teamSearchKey);
                break;
            case "allTeam":
                _this.findTeam(teamSearchKey);
                break;
        }
    },

    findTeamByUserId(teamSearchKey){
        var _this = this;
        var param = {
            "method": 'findTeamByUserId',
            "id": _this.state.cloudClassRoomUser.colUid,
            "name":''
        };
        if(isEmpty(teamSearchKey)==false){
            param.name=teamSearchKey;
        }
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                _this.buildTeamListByResponse(response);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    findTeam(teamSearchKey){
        var _this = this;
        var param = {
            "method": 'findTeam',
            "name":''
        };
        if(isEmpty(teamSearchKey)==false){
            param.name=teamSearchKey;
        }
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                _this.buildTeamListByResponse(response);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 查询我创建的团队
     */
    findTeamByManager(){
        var _this = this;
        var param = {
            "method": 'findTeamByManager',
            "userId": _this.state.cloudClassRoomUser.colUid,
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                _this.buildTeamListByResponse(response);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 查询我加入的团队
     */
    findMyJoinTeam(){
        var _this = this;
        var param = {
            "method": 'findMyJoinTeam',
            "userId": _this.state.cloudClassRoomUser.colUid,
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                _this.buildTeamListByResponse(response);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    buildTeamListByResponse(response){
        // var total = response.total;
        // var responseRows=response.rows;
        var _this = this;
        var total = response.length;
        teamTableData.splice(0);
        response.forEach(function (team) {
            var requestAddBtn;
            var isAtThisTeam=false;
            if(isEmpty(team.users)){
                team.users.forEach(function (user) {
                    if(users.colUid==_this.state.cloudClassRoomUser.colUid){
                        isAtThisTeam=true;
                    }
                });
            }
            if(isAtThisTeam==false){
                requestAddBtn = <Button style={{ }} type=""  value={team.id} onClick={_this.showAddTeamModal.bind(_this,team)}  icon="plus-circle-o" title="申请加入" className="score3_i"></Button>;
            }else{
                requestAddBtn="";
            }
            var settingBtn;
            if(team.manager==_this.state.cloudClassRoomUser.colUid){
                settingBtn=<Button style={{ }} type=""  value={team.id} onClick={_this.showTeamSettingModal}  icon="setting" title="设置" className="score3_i"></Button>;
            }else{
                settingBtn="";
            }
            var subjectOpt=<div>
                {requestAddBtn}
                {settingBtn}
            </div>;
            var teamUsersPhoto=[];
            var imgTag = <div className="maaee_group_face">{teamUsersPhoto}</div>;
            if(isEmpty(team.users)==false ){
                for(var i=0;i<team.users.length;i++){
                    var user = team.users[i];
                    var userAvatarTag = <img src={user.avatar} ></img>;
                    teamUsersPhoto.push(userAvatarTag);
                    if(i>=3){
                        break;
                    }
                }
                switch (teamUsersPhoto.length){
                    case 1:
                        imgTag = <div className="maaee_group_face1">{teamUsersPhoto}</div>;
                        break;
                    case 2:
                        imgTag = <div className="maaee_group_face2">{teamUsersPhoto}</div>;
                        break;
                    case 3:
                        imgTag = <div className="maaee_group_face3">{teamUsersPhoto}</div>;
                        break;
                    case 4:
                        imgTag = <div className="maaee_group_face">{teamUsersPhoto}</div>;
                        break;
                }
            }
            var teamUserCount=0;
            if(isEmpty(team.users)==false){
                teamUserCount = team.users.length;
            }
            teamTableData.push({
                key: team.id,
                teamPhoto:imgTag,
                teamName: team.name,
                teamCount: teamUserCount,
                teamSet:subjectOpt
            });
        });
        _this.setState({userTeamData:teamTableData,totalTeamCount:total});
    },

    getTeamList(pageNo,whereJson){
        var _this = this;
        var requestUrl = getCloudClassRoomRequestURL("teamList");
        var requestType ="POST";
        var propertyJson={
            "numPerPage": getPageSize(),
            "currentPage": pageNo
        };
        if(typeof(whereJson)!="undefined" ){
            propertyJson.where=JSON.stringify(whereJson);
        }
        cloudClassRoomRequestByAjax(requestUrl,propertyJson,requestType, {
            onResponse: function (ret) {
                if (ret.meta.success == true && ret.meta.message=="ok") {
                    message.success("成功");
                    var response=ret.data;
                    var total = response.total;
                    var responseRows=response.rows;
                    var teamTableData = [];
                    responseRows.forEach(function (team) {
                        var subjectOpt=<Button style={{ }} type=""  value={team.id} onClick={_this.showTeamSettingModal}  icon="setting" title="设置" className="score3_i"></Button>;
                        var teamUsersPhoto=[];
                        var imgTag = <div className="maaee_group_face">{teamUsersPhoto}</div>;
                        if(isEmpty(team.users)==false ){
                            for(var i=0;i<team.users.length;i++){
                                var user = team.users[i];
                                var userAvatarTag = <img src={user.avatar} ></img>;
                                teamUsersPhoto.push(userAvatarTag);
                                if(i>=3){
                                    break;
                                }
                            }
                            switch (teamUsersPhoto.length){
                                case 1:
                                    imgTag = <div className="maaee_group_face1">{teamUsersPhoto}</div>;
                                    break;
                                case 2:
                                    imgTag = <div className="maaee_group_face2">{teamUsersPhoto}</div>;
                                    break;
                                case 3:
                                    imgTag = <div className="maaee_group_face3">{teamUsersPhoto}</div>;
                                    break;
                                case 4:
                                    imgTag = <div className="maaee_group_face">{teamUsersPhoto}</div>;
                                    break;
                            }
                        }
                        var teamUserCount=0;
                        if(isEmpty(team.users)==false){
                            teamUserCount = team.users.length;
                        }
                        teamTableData.push({
                            key: team.id,
                            teamPhoto:imgTag,
                            teamName: team.name,
                            teamCount: teamUserCount,
                            teamSet:subjectOpt
                        });
                    });
                    _this.setState({userTeamData:teamTableData,totalTeamCount:total});
                } else {
                    message.error("失败");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    showTeamSettingModal(){

    },

    showAddTeamModal(teamObj){
        this.setState({teamObj});
        this.refs.confirmModal.changeConfirmModalVisible(true);
    },
    /**
     * 过滤我创建的团队和我所在的团队
     * @param e
     */
    teamTypeFliterOnChange(e){
        console.log('radio checked', e.target.value);
        this.setState({
            teamTypeFliterValue: e.target.value,
        });
        if(e.target.value==0){
            this.findTeamByManager();
        }else{
            this.findMyJoinTeam();
        }
    },



    onTeamPageChange(page){
        // this.getUserChatGroupById(page);
        this.setState({
            currentPage: page,
        });
    },


    /**
     * 查询我加入的团队
     */
    findAllUserTeacher(){
        var _this = this;
        const mockData = [];
        var targetKeys = [];
        var param = {
            "method": 'findAllUserTeacher',
            "userId": _this.state.cloudClassRoomUser.colUid,
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var userType = e.colUtype;
                    // userType != "SGZH" &&
                    if (parseInt(userId) != _this.state.cloudClassRoomUser.colUid) {
                        const data = {
                            key: userId,
                            title: userName,
                        };
                        mockData.push(data);
                    }
                });
                _this.setState({mockData, targetKeys});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    transferHandleChange(targetKeys){
        this.setState({ targetKeys });
    },

    createTeamModalHandleCancel(){
        this.setState({"createTeamModalVisible":false,"updateGroupId":''});
    },
    /**
     * 创建团队
     */
    createTeam(){
        var _this = this;
        if(isEmpty(_this.state.targetKeys)){
            message.error("请选择团队成员");
            return;
        }
        var teamJson={};
        teamJson.name = _this.state.teamName;
        teamJson.createTime = new Date().valueOf();
        teamJson.manager=_this.state.cloudClassRoomUser.colUid;
        var usersArray=[];
        _this.state.targetKeys.forEach(function (id) {
            var userJson={};
            userJson.id=id;
            usersArray.push(userJson);
        });
        var mySelfJson={id:_this.state.cloudClassRoomUser.colUid};
        usersArray.push(mySelfJson);
        teamJson.users = usersArray;
        var param = {
            "method": 'saveTeam',
            "jsonObject": JSON.stringify(teamJson),
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response==true){
                    message.success("团队创建成功");
                }else{
                    message.success("团队创建失败");
                }
                _this.createTeamModalHandleCancel();
                switch(_this.state.type){
                    case "myTeam":
                        _this.findTeamByUserId();
                        break;
                    case "allTeam":
                        _this.findTeam();
                        break;
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    teamNameOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var teamName = target.value;
        this.setState({"teamName":teamName});
    },

    showCreateTeamModal(){
        this.findAllUserTeacher();
        this.setState({"createTeamModalVisible":true});
    },

    closeConfirmModal() {
        this.refs.confirmModal.changeConfirmModalVisible(false);
    },
    /**
     * 申请加入某个团队
     */
    requestAddThisTeam(){
        var teamObj = this.state.teamObj;
        console.log(teamObj.id);
        this.closeConfirmModal();
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var filterRadios;
        if(this.state.type=="myTeam"){
            filterRadios=
                <RadioGroup onChange={this.teamTypeFliterOnChange} value={this.state.teamTypeFliterValue}>
                    <Radio value="0">我创建的团队</Radio>
                    <Radio value="1">我加入的团队</Radio>
                </RadioGroup>;
        }else{
            filterRadios="";
        }

        return (
            <div className="favorite_scroll series_courses">
                {/*className="myfollow_zb"*/}
                <div  className="myfollow_zb">

                    {filterRadios}
                    <Table className="details table_team"
                           scroll={{ x: true, }} columns={userTeamColumns} showHeader={false}
                           dataSource={this.state.userTeamData}
                     pagination={{ total:this.state.totalCount,
                      pageSize: getPageSize(),onChange:this.onTeamPageChange }}/> 
				</div>
                <Modal
                    visible={this.state.createTeamModalVisible}
                    title="创建团队"
                    onCancel={this.createTeamModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <button type="primary" htmlType="submit" className="ant-btn-primary ant-btn" onClick={this.createTeam}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={this.createTeamModalHandleCancel} >取消</button>
                    ]}
                >
                    <Row className="ant-form-item">
                        <span >
                            <Input placeholder="请输入团队名称" value={this.state.teamName} defaultValue={this.state.teamName} onChange={this.teamNameOnChange} />
                        </span>
                    </Row>
                    <Row className="ant-form-item">
                        <Col span={24}>
                            <Transfer
                                dataSource={this.state.mockData}
                                showSearch
                                listStyle={{
                                    width: 268,
                                    height: 320,
                                }}
                                titles={['待选联系人','已选联系人']}
                                operations={['', '']}
                                targetKeys={this.state.targetKeys}
                                onChange={this.transferHandleChange}
                                render={item => `${item.title}`}
                            />
                        </Col>
                    </Row>

                </Modal>

                <ConfirmModal ref="confirmModal"
                              title="确定要申请加入该团队?"
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.requestAddThisTeam}
                ></ConfirmModal>

            </div>
        );
    },
});

export default AntTeamComponents;

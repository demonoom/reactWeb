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
        this.findTeamInfoByType(type,this.state.currentPage);
    },

    componentWillReceiveProps(nextProps){
        var type = nextProps.type;
        this.setState({type,"teamSearchKey":nextProps.teamSearchKey});
        this.findTeamInfoByType(type,this.state.currentPage,nextProps.teamSearchKey);
    },

    findTeamInfoByType(type,pageNo,teamSearchKey){
        var _this = this;
        switch(type){
            case "myTeam":
                _this.findTeamByUserId(pageNo,teamSearchKey);
                break;
            case "allTeam":
                _this.findTeam(pageNo,teamSearchKey);
                break;
        }
    },

    findTeamByUserId(pageNo,teamSearchKey){
        var _this = this;
        var param = {
            "method": 'findTeamByUserId',
            "id": _this.state.cloudClassRoomUser.colUid,
            "name":'',
            "pageNo":pageNo
        };
        if(isEmpty(teamSearchKey)==false){
            param.name=teamSearchKey;
        }
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var pager = ret.pager;
                teamTableData.splice(0);
                if(isEmpty(pager)==false){
                    _this.setState({total:pager.rsCount});
                }
                if(isEmpty(response)==false){
                    _this.buildTeamListByResponse(response);
                }else{
                    _this.setState({teamTableData});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    findTeam(pageNo,teamSearchKey){
        var _this = this;
        var param = {
            "method": 'findTeam',
            "name":'',
            "pageNo":pageNo
        };
        if(isEmpty(teamSearchKey)==false){
            param.name=teamSearchKey;
        }
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var pager = ret.pager;
                teamTableData.splice(0);
                if(isEmpty(pager)==false){
                    _this.setState({total:pager.rsCount});
                }
                if(isEmpty(response)==false){
                    _this.buildTeamListByResponse(response);
                }else{
                    _this.setState({teamTableData});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 查询我创建的团队
     */
    findTeamByManager(pageNo){
        var _this = this;
        var param = {
            "method": 'findTeamByManager',
            "userId": _this.state.cloudClassRoomUser.colUid,
            "pageNo":pageNo
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var pager = ret.pager;
                teamTableData.splice(0);
                if(isEmpty(pager)==false){
                    _this.setState({total:pager.rsCount});
                }
                if(isEmpty(response)==false){
                    _this.buildTeamListByResponse(response);
                }else{
                    _this.setState({teamTableData});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 查询我加入的团队
     */
    findMyJoinTeam(pageNo){
        var _this = this;
        var param = {
            "method": 'findMyJoinTeam',
            "userId": _this.state.cloudClassRoomUser.colUid,
            "pageNo":pageNo
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var pager = ret.pager;
                teamTableData.splice(0);
                if(isEmpty(pager)==false){
                    _this.setState({total:pager.rsCount});
                }
                if(isEmpty(response)==false){
                    _this.buildTeamListByResponse(response);
                }else{
                    _this.setState({teamTableData});
                }
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
                settingBtn=<Button style={{ }} type=""  value={team.id} onClick={_this.showUpdateTeamModal.bind(_this,team)}  icon="setting" title="设置" className="score3_i"></Button>;
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
            this.findTeamByManager(1);
        }else{
            this.findMyJoinTeam(1);
        }
    },

    onTeamPageChange(page){
        if(this.state.teamTypeFliterValue == 0){
            this.findTeamByManager(page);
        }else if(this.state.teamTypeFliterValue == 1){
            this.findMyJoinTeam(page);
        }else{
            this.findTeamInfoByType(this.state.type,page,this.state.teamSearchKey);
        }
        this.setState({
            currentPage: page,
        });
    },


    /**
     * 查询可以加入团队的所有老师
     */
    findAllUserTeacher(optSource){
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
                switch (optSource){
                    case "create":
                        _this.setState({mockData, targetKeys});
                        break;
                    case "update":
                        _this.setState({mockData});
                        break;
                }

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
        this.setState({"createTeamModalVisible":false,"updateGroupId":'',targetKeys:[]});
    },

    updateTeamModalHandleCancel(){
        this.setState({"updateTeamModalVisible":false,"updateGroupId":'',targetKeys:[]});
    },

    /**
     * 创建团队
     */
    createTeam(saveOrUpdate){
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
        var requestMethod;
        var successMessage;
        var errorMessage;
        switch(saveOrUpdate){
            case "create":
                successMessage="团队创建成功";
                errorMessage="团队创建失败";
                teamJson.id = "";
                requestMethod = "saveTeam";
                break;
            case "update":
                successMessage="团队修改成功";
                errorMessage="团队修改失败";
                teamJson.id = _this.state.teamObj.id;
                requestMethod = "updateTeam";
                break;
        }
        var param = {
            "method": requestMethod,
            "jsonObject": JSON.stringify(teamJson),
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response==true){
                    message.success(successMessage);
                }else{
                    message.success(errorMessage);
                }
                _this.createTeamModalHandleCancel();
                _this.updateTeamModalHandleCancel();
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
    /**
     * 显示创建团队的modal
     */
    showCreateTeamModal(){
        this.findAllUserTeacher("create");
        this.setState({"createTeamModalVisible":true});
    },
    /**
     * 显示修改团队的modal
     */
    showUpdateTeamModal(team){
        this.findAllUserTeacher("update");
        var teamName = team.name;
        var users = team.users;
        var targetKeys=[];
        if(isEmpty(users)==false){
            users.forEach(function (user) {
                var userId = user.colUid;
                targetKeys.push(userId);
            })
        }
        this.setState({"updateTeamModalVisible":true,teamName,targetKeys,teamObj:team});
    },

    closeConfirmModal() {
        this.refs.confirmModal.changeConfirmModalVisible(false);
    },
    /**
     * 申请加入某个团队
     */
    requestAddThisTeam(){
        var _this = this;
        var teamObj = _this.state.teamObj;
        console.log(teamObj.id);
        var userId = _this.state.cloudClassRoomUser.colUid;
        var teamUserJson = {teamId:teamObj.id,userId:parseInt(userId),
            status:'2',createTime:new Date().valueOf()};
        var param = {
            "method": 'saveTeamUser',
            "jsonObject": JSON.stringify(teamUserJson),
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response==true){
                    message.success("申请成功,请等待管理员审核,谢谢!");
                }else{
                    message.error("申请失败");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
        _this.closeConfirmModal();
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
                     pagination={{ total:this.state.total,
                      pageSize: getPageSize(),onChange:this.onTeamPageChange }}/> 
				</div>
                <Modal
                    visible={this.state.createTeamModalVisible}
                    title="创建团队"
                    onCancel={this.createTeamModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <button type="primary" htmlType="submit" className="ant-btn-primary ant-btn" onClick={this.createTeam.bind(this,"create")}  >确定</button>,
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

                <Modal
                    visible={this.state.updateTeamModalVisible}
                    title="修改团队"
                    onCancel={this.updateTeamModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <button type="primary" htmlType="submit" className="ant-btn-primary ant-btn" onClick={this.createTeam.bind(this,"update")}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={this.updateTeamModalHandleCancel} >取消</button>
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

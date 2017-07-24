import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Radio,Table,message,Modal,Input,Transfer,Checkbox} from 'antd';
import {isEmpty} from '../../utils/utils';
import {getPageSize} from '../../utils/Const';
import {doWebService_CloudClassRoom} from '../../utils/CloudClassRoomURLUtils';
import ConfirmModal from '../ConfirmModal';
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

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
const options = [
    { label: <div>
        <span>李老师</span><span>语文</span>
        <span>恒坐标学校</span>
    </div>, value: '1' },
    { label: <div>
        <span>张老师</span><span>数学</span>
        <span>恒坐标学校</span>
    </div>, value: '2' },
];
const AntTeamComponents = React.createClass({

    getInitialState() {
        var cloudClassRoomUser = JSON.parse(sessionStorage.getItem("cloudClassRoomUser"));
        return {
            currentPage:1,
            userTeamData:[],
            createTeamModalVisible:false,
            totalTeamCount:0,
            cloudClassRoomUser:cloudClassRoomUser,
            optType:'teamList',
            settingTeamName:'',
            teacherSourceListPageNo:1,
            teacherSrcOptions:[],
            teacherTargetOptions:[],
            teamUserId:-1,
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
    /**
     * 初始化页面元素
     */
    initPage(){
        this.setState({teacherSrcOptions:[],teacherTargetOptions:[],teamName:'',searchKey:''});
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
        var _this = this;
        var total = response.length;
        response.forEach(function (team) {
            var isAtThisTeam=false;
            if(isEmpty(team.teamUsers)){
                team.teamUsers.forEach(function (teamUser) {
                    if(teamUser.user.colUid==_this.state.cloudClassRoomUser.colUid){
                        isAtThisTeam=true;
                    }
                });
            }
            var teamUsersPhoto=[];
            var imgTag = <div className="maaee_group_face">{teamUsersPhoto}</div>;
            if(isEmpty(team.teamUsers)==false ){
                for(var i=0;i<team.teamUsers.length;i++){
                    var teamUser = team.teamUsers[i];
                    var userAvatarTag = <img src={teamUser.user.avatar} ></img>;
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
            if(isEmpty(team.teamUsers)==false){
                teamUserCount = team.teamUsers.length;
            }
            teamTableData.push({
                key: team.id,
                teamPhoto:imgTag,
                teamName: team.name,
                teamCount: teamUserCount,
                teamSet:<Button style={{ }} type=""  value={team.id} onClick={_this.editTeam.bind(_this,team)}  icon="setting" title="设置" className="score3_i"></Button>
            });
        });
        _this.setState({userTeamData:teamTableData,totalTeamCount:total});
    },

    showTeamSettingModal(){

    },
    /**
     * 显示移除团队成员的确认modal
     * @param removeUser
     */
    showRemoveUserModal(removeUser){
        this.setState({removeUser,"exitOrDelete":'delete'});
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
        this.setState({"createTeamModalVisible":false});
    },

    updateTeamModalHandleCancel(){
        this.setState({"updateTeamModalVisible":false});
    },

    /**
     * 创建团队
     */
    createTeam(){
        var _this = this;
        var teacherTargetOptions = _this.state.teacherTargetOptions;
        if(isEmpty(teacherTargetOptions)){
            message.error("请选择团队成员");
            return;
        }
        var teamJson={};
        teamJson.name = _this.state.teamName;
        teamJson.createTime = new Date().valueOf();
        teamJson.manager=_this.state.cloudClassRoomUser.colUid;
        var usersArray=[];
        for(var i=0;i<teacherTargetOptions.length;i++){
            var teacher = teacherTargetOptions[i];
            var teacherArray = teacher.value.split("#");
            var userId = teacherArray[0];
            var userJson={};
            userJson.id=userId;
            usersArray.push(userJson);
        }
        var mySelfJson={id:_this.state.cloudClassRoomUser.colUid};
        usersArray.push(mySelfJson);
        teamJson.users = usersArray;
        var param = {
            "method": "saveTeam",
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
                _this.findTeamByUserId(1);
                _this.initPage();
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
        this.setState({"createTeamModalVisible":true,"teacherSrcOptions":[],"teacherTargetOptions":[],"searchKey":''});
    },
    /**
     * 显示修改团队的modal
     */
    editTeam(team){
        var _this = this;
        _this.findAllUserTeacher("update");
        var teamUsers = team.teamUsers;
        if(isEmpty(teamUsers)==false){
            teamUsers.forEach(function (teamUser) {
                if(teamUser.user.colUid==_this.state.cloudClassRoomUser.colUid){
                    _this.setState({teamUserId:teamUser.id});
                }
            })
        }
        _this.setState({"optType":'teamSet',"settingTeam":team});
        //团队设置按钮和搜索文本框的显示和隐藏 true：隐藏  false：显示
        _this.props.onSetBtnClick(true);
    },
    /**
     * 关闭移除团队成员的确认modal
     */
    closeConfirmModal() {
        this.refs.confirmModal.changeConfirmModalVisible(false);
    },
    /**
     * 添加团队成员
     */
    saveTeamUser(){
        var _this = this;
        var teacherTargetOptions = _this.state.teacherTargetOptions;
        var settingTeam = _this.state.settingTeam;
        if(isEmpty(teacherTargetOptions)){
            message.error("请选择团队成员");
            return;
        }
        var teamUsersArray=[];
        for(var i=0;i<teacherTargetOptions.length;i++){
            var teacher = teacherTargetOptions[i];
            var teacherArray = teacher.value.split("#");
            var userId = teacherArray[0];
            var userJson={};
            userJson.teamId = settingTeam.id;
            userJson.userId=userId;
            teamUsersArray.push(userJson);
        }
        var param = {
            "method": 'saveTeamUser',
            "jsonObject": JSON.stringify(teamUsersArray),
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response==true){
                    message.success("团队成员添加成功!");
                }else{
                    message.error("团队成员添加失败");
                }
                _this.addUserToSettingTeam();
                _this.updateTeamModalHandleCancel();
                _this.initPage();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 返回团队列表
     */
    returnToTeamList(){
        this.setState({optType:'teamList'});
        //团队设置按钮和搜索文本框的显示和隐藏 true：隐藏  false：显示
        this.props.onSetBtnClick(false);
    },
    /**
     * 团队设置时，退出团队/解散团队确认操作
     */
    showDissolutionTeamConfirmModal(){
        this.refs.deleteTeamConfirmModal.changeConfirmModalVisible(true);
    },

    /**
     * 显示添加团队成员的窗口
     */
    showAddMembersModal(){
        this.setState({"updateTeamModalVisible":true});
    },

    /**
     * 显示修改群名称的窗口
     */
    showUpdateTeamNameModal(){
        this.setState({updateTeamNameModalVisible:true,settingTeamName:this.state.settingTeam.name});
    },

    /**
     * 关闭修改团队名称的窗口
     */
    updateTeamNameModalHandleCancel(){
        this.setState({updateTeamNameModalVisible:false});
    },

    /**
     * 修改团队名称时，团队名称改变的响应函数
     */
    updateTeamNameOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var settingTeamName = target.value;
        this.setState({settingTeamName});
    },

    /**
     * 修改团队名称
     */
    updateTeamName(){
        var _this = this;
        var teamJson = _this.state.settingTeam;
        teamJson.name = _this.state.settingTeamName;
        var mySelfJson={id:_this.state.cloudClassRoomUser.colUid};
        teamJson.users.push(mySelfJson);
        var param = {
            "method": "updateTeam",
            "jsonObject": JSON.stringify(teamJson),
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response==true){
                    message.success("修改成功");
                }else{
                    message.success(ret.msg);
                }
                _this.updateTeamNameModalHandleCancel();
                _this.findTeamByUserId();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 根据输入的关键字，查询老师的信息
     */
    findTeacherByKeyWords(){
        var _this = this;
        const teacherSrcOptions = [];
        var param = {
            "method": 'findTeacherByKeyWords',
            "searchKeyWords": _this.state.searchKey,
            "pageNo":_this.state.teacherSourceListPageNo,
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var schoolName = e.schoolName;
                    var userAvatar = e.avatar;
                    if (parseInt(userId) != _this.state.cloudClassRoomUser.colUid) {
                        const data = {key:userId,
                        label: <div>
                            <div className="group_team_gray6">{userName}</div>
                            <div className="group_team_gray9">{schoolName}</div>
                        </div>, value: userId+"#"+userName+"#"+schoolName+"#"+userAvatar }
                        teacherSrcOptions.push(data);
                    }
                });
                _this.setState({teacherSrcOptions});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 老师信息过滤文本框输入改变
     * @param e
     */
    searchKeyOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var searchKey = target.value;
        this.setState({"searchKey":searchKey});
    },
    /**
     * 老师源数据列表选中函数
     * @param checkedValues
     */
    teacherSrcOnChange(checkedValues) {
        this.setState({"teacherSrcChecked":checkedValues});
    },
    teacherTargetOnChange(checkedValues) {
        this.setState({"teacherTargetChecked":checkedValues});
    },
    /**
     * 将选中的数据，添加到右侧，并将已选的数据，从左侧移除
     */
    addTeacherToTarget(){
        // var this = this;
        var teacherTargetOptions=this.state.teacherTargetOptions;
        var teacherSrcChecked = this.state.teacherSrcChecked;
        if(isEmpty(teacherSrcChecked)==false){
            teacherSrcChecked.forEach(function (everyTeacher) {
                var teacherInfoArray = everyTeacher.split("#");
                var userId = teacherInfoArray[0];
                var userName = teacherInfoArray[1];
                var schoolName = teacherInfoArray[2];
                var userAvatar = teacherInfoArray[3];
                const data = {key:userId,
                    label: <div>
                        <div className="group_team_gray6">{userName}</div>
                        <div className="group_team_gray9">{schoolName}</div>
                    </div>, value: userId+"#"+userName+"#"+schoolName+"#"+userAvatar }
                teacherTargetOptions.push(data);
            });
            var teacherSrcOptions = this.removeTeacherFormOptions(teacherSrcChecked,"src");
            this.setState({teacherTargetOptions,teacherSrcOptions,teacherSrcChecked:[],teacherTargetChecked:[]});
        }else{
            message.warning("请先选中老师再执行添加操作");
        }
    },
    /**
     * 将选中的数据，添加到左侧，并将已选的数据，从右侧移除
     */
    addTeacherToSrc(){
        var _this = this;
        var teacherSrcOptions=_this.state.teacherSrcOptions;
        var teacherTargetChecked = _this.state.teacherTargetChecked;
        if(isEmpty(teacherTargetChecked)==false){
            teacherTargetChecked.forEach(function (everyTeacher) {
                var teacherInfoArray = everyTeacher.split("#");
                var userId = teacherInfoArray[0];
                var userName = teacherInfoArray[1];
                var schoolName = teacherInfoArray[2];
                var userAvatar = teacherInfoArray[3];
                const data = {key:userId,
                    label: <div>
                        <div className="group_team_gray6">{userName}</div>
                        <div className="group_team_gray9">{schoolName}</div>
                    </div>, value: userId+"#"+userName+"#"+schoolName+"#"+userAvatar }
                teacherSrcOptions.push(data);
            });
            var teacherTargetOptions = _this.removeTeacherFormOptions(teacherTargetChecked,"target");
            this.setState({teacherTargetOptions,teacherSrcOptions,teacherSrcChecked:[],teacherTargetChecked:[]});
        }else{
            message.warning("请先选中老师再执行添加操作");
        }
    },
    /**
     * 从checkout中移除数据
     * @param removeOptions
     * @param whereIs
     */
    removeTeacherFormOptions(removeOptions,whereIs){
        var newArray;
        var _this = this;
        if(whereIs=="src"){
            //从源数据中移除
            var teacherSrcOptions = _this.state.teacherSrcOptions;
            removeOptions.forEach(function (userInfo) {
                var teacherInfoArray = userInfo.split("#");
                var userId = teacherInfoArray[0];
                for(var i=0;i<teacherSrcOptions.length;i++){
                    var srcTeacher = teacherSrcOptions[i];
                    var srcTeacherArray = srcTeacher.value.split("#");
                    var srcUserId = srcTeacherArray[0];
                    if(userId==srcUserId){
                        teacherSrcOptions.splice(i,1);
                        break;
                    }
                }
            });
            newArray = teacherSrcOptions;
        }else{
            //从目标数据中移除
            var teacherTargetOptions = _this.state.teacherTargetOptions;
            removeOptions.forEach(function (userInfo) {
                var teacherInfoArray = userInfo.split("#");
                var userId = teacherInfoArray[0];
                for(var i=0;i<teacherTargetOptions.length;i++){
                    var srcTeacher = teacherTargetOptions[i];
                    var srcTeacherArray = srcTeacher.value.split("#");
                    var srcUserId = srcTeacherArray[0];
                    if(userId==srcUserId){
                        teacherTargetOptions.splice(i,1);
                        break;
                    }
                }
            });
            newArray = teacherTargetOptions;
        }
        return newArray;
    },

    /**
     * 解散团队
     */
    deleteTeam(){
        var _this = this;
        var deleteTeamId = _this.state.settingTeam.id;
        var param = {
            "method": 'deleteTeam',
            "teamId": deleteTeamId,
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response==true){
                    message.success("团队解散成功");
                }else{
                    message.error(ret.msg);
                }
                _this.closeDeleteTeamConfirmModal();
                _this.findTeamByUserId(1);
                _this.returnToTeamList();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 删除团队成员
     */
    deleteTeamUser(){
        var _this = this;
        if(_this.state.exitOrDelete=="delete"){
            var removeUser = _this.state.removeUser;
            var param = {
                "method": 'deleteTeamUser',
                "id": removeUser.id,
            };
        }else{
            var teamUserId = _this.state.teamUserId;
            var param = {
                "method": 'deleteTeamUser',
                "id": teamUserId,
            };
        }
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response==true){
                    message.success("操作成功");
                }else{
                    message.error(ret.msg);
                }
                if(_this.state.exitOrDelete=="delete"){
                    _this.closeConfirmModal();
                    _this.removeUserFromSettingTeam(removeUser);
                }else{
                    _this.closeExitTeamConfirmModal();
                    _this.findTeamByUserId(1);
                    _this.returnToTeamList();
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 删除本地存储的用户
     */
    removeUserFromSettingTeam(removeUser){
        var settingTeam = this.state.settingTeam;
        var newTeamUserArray=[];
        settingTeam.teamUsers.forEach(function (userInfo) {
            if(removeUser.id!=userInfo.id){
                newTeamUserArray.push(userInfo);
            }
        });
        settingTeam.teamUsers=newTeamUserArray;
        this.setState({settingTeam});
    },

    /**
     * 增加本地存储的用户
     */
    addUserToSettingTeam(){
        var settingTeam = this.state.settingTeam;
        var teacherTargetOptions = this.state.teacherTargetOptions;
        for(var i=0;i<teacherTargetOptions.length;i++){
            var teacher = teacherTargetOptions[i];
            var teacherArray = teacher.value.split("#");
            var userId = teacherArray[0];
            var userName = teacherArray[1];
            var userAvatar = teacherArray[3];
            var userJson={};
            userJson.teamId = settingTeam.id;
            userJson.userId=userId;
            var user = {};
            user.colUid = userId;
            user.userName = userName;
            user.avatar = userAvatar;
            userJson.user = user;
            settingTeam.teamUsers.push(userJson);
        }
        this.setState({settingTeam});
    },

    /**
     * 关闭解散团队确认框
     */
    closeDeleteTeamConfirmModal(){
        this.refs.deleteTeamConfirmModal.changeConfirmModalVisible(false);
    },
    /**
     * 显示退出群组确认Modal
     */
    showExitTeamConfirmModal(){
        this.setState({"removeUser":this.state.cloudClassRoomUser,"exitOrDelete":'exit'});
        this.refs.exitTeamConfirmModal.changeConfirmModalVisible(true);
    },

    /**
     * 关闭退出群组确认Modal
     */
    closeExitTeamConfirmModal(){
        this.refs.exitTeamConfirmModal.changeConfirmModalVisible(false);
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        var mainPanel;
        if(_this.state.optType == "teamSet"){
            var welcomeTitle = "团队设置";
            var managerUser = _this.state.settingTeam.user;
            var topButton;
            var dissolutionChatGroupButton;
            var editTeamButton;
            if(managerUser.colUid==_this.state.cloudClassRoomUser.colUid){
                topButton = <span className="right_ri">
                    <span className="toobar">
                        <Button  onClick={_this.showAddMembersModal} className="group_edit_add"><Icon type="plus" />添加成员</Button>
                    </span>
                </span>;
                dissolutionChatGroupButton = <Button onClick={_this.showDissolutionTeamConfirmModal} className="group_red_font">解散该团队</Button>;
                editTeamButton=<Button onClick={_this.showUpdateTeamNameModal} className="group_edit"><i className="iconfont">&#xe610;</i>编辑</Button>;
            }else{
                topButton = null;
                dissolutionChatGroupButton = <Button onClick={_this.showExitTeamConfirmModal} className="group_red_font">退出该团队</Button>;
                editTeamButton = null;
            }
            var userLiTagArray=[];
            var settingTeam = _this.state.settingTeam;
            settingTeam.teamUsers.forEach(function (teamUser) {
                var userHeaderIcon;
                var removeUserButton;
                if(isEmpty(teamUser.user)==false){
                    userHeaderIcon = <img src={teamUser.user.avatar}></img>;
                }else{
                    userHeaderIcon=<span className="attention_img"><img src={require('../images/maaee_face.png')}></img></span>;
                }
                if(managerUser.colUid==_this.state.cloudClassRoomUser.colUid && teamUser.user.colUid !=_this.state.cloudClassRoomUser.colUid){
                    removeUserButton = <Button　value={teamUser.user.colUid} onClick={_this.showRemoveUserModal.bind(_this,teamUser)} className="group_del"><Icon type="close-circle-o" /></Button>;
                }else{
                    removeUserButton = null;
                }
                var liTag = <div className="group_fr">
                    <span className="attention_img">{userHeaderIcon}</span><span>{teamUser.user.userName}</span>
                    {removeUserButton}
                </div>;
                userLiTagArray.push(liTag);
            });

            mainPanel = <div className="group_cont">
                <div className="public—til—blue">
                    <div className="ant-tabs-right">
                        <Button onClick={_this.returnToTeamList}>
                            <Icon type="left" />
                        </Button>
                    </div>
                    {welcomeTitle}
                </div>
                <div className="favorite_scroll del_out">
                    <ul className="integral_top">
                        <span className="integral_face">
                            <img src={managerUser.avatar} className="person_user"/>
                        </span>
                        <div className="class_right color_gary_f">
                            {_this.state.settingTeam.name}
                            {editTeamButton}
                        </div>
                        <div className="integral_line"></div>
                    </ul>
                    <ul className="group_fr_ul">
                        <li className="color_gary_f"><span>团队成员：{userLiTagArray.length}人</span>{topButton}</li>
                        <li className="user_hei">
                            {userLiTagArray}
                        </li>
                        <li className="btm">{dissolutionChatGroupButton}</li>
                    </ul>
                </div>
            </div>;
        }else{
            mainPanel = <div  className="myfollow_zb">
                <RadioGroup onChange={_this.teamTypeFliterOnChange} value={_this.state.teamTypeFliterValue}>
                    <Radio value="0">我创建的团队</Radio>
                    <Radio value="1">我加入的团队</Radio>
                </RadioGroup>
                <Table className="details table_team"
                       scroll={{ x: true, }} columns={userTeamColumns} showHeader={false}
                       dataSource={_this.state.userTeamData}
                       pagination={{ total:_this.state.total,
                           pageSize: getPageSize(),onChange:_this.onTeamPageChange }}/>
            </div>;
        }

        return (
            <div className="favorite_scroll series_courses">

                {mainPanel}

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
                            <div className="ant-transfer">
                                <Col className="ant-transfer-list team_add">
                                    <div>
                                        <p className="team_remark">请按enter键搜索老师账号或姓名</p>
                                        <div className="team_head">
                                            <Input placeholder="请输入需添加的老师账号或姓名" value={this.state.searchKey} onChange={this.searchKeyOnChange} onPressEnter={this.findTeacherByKeyWords} className="ant-transfer-list-search"/>
                                            <span className="ant-transfer-list-search-action1"><Icon type="search" /></span>
                                        </div>
                                        <div  className="group_team">
                                            <CheckboxGroup options={this.state.teacherSrcOptions} value={this.state.teacherSrcChecked} onChange={this.teacherSrcOnChange}/>
                                        </div>
                                    </div>
                                </Col>
                                <Col className="ant-transfer-operation">
                                    <Button onClick={this.addTeacherToTarget}><Icon type="right" /></Button>
                                    <Button onClick={this.addTeacherToSrc}><Icon type="left" /></Button>
                                </Col>
                                <Col className="ant-transfer-list team_add">
                                    <div>
                                        <div className="group_team2">
                                            <CheckboxGroup options={this.state.teacherTargetOptions} value={this.state.teacherTargetChecked} onChange={this.teacherTargetOnChange} />
                                        </div>
                                    </div>
                                </Col>
                            </div>
                        </Col>
                    </Row>

                </Modal>

                <Modal
                    visible={this.state.updateTeamModalVisible}
                    title="添加团队成员"
                    onCancel={this.updateTeamModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <button type="primary" htmlType="submit" className="ant-btn-primary ant-btn" onClick={this.saveTeamUser}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={this.updateTeamModalHandleCancel} >取消</button>
                    ]}
                >
                    <Row className="ant-form-item">
					 <Col span={24}>
					 	<div className="ant-transfer">
							<Col className="ant-transfer-list team_add">
								<div>
									<p className="team_remark">请按enter键搜索老师账号或姓名</p>
									<div className="team_head">
										<Input placeholder="请输入需添加的老师账号或姓名" value={this.state.searchKey} onChange={this.searchKeyOnChange} onPressEnter={this.findTeacherByKeyWords}  className="ant-transfer-list-search"/>
										<span className="ant-transfer-list-search-action1"><Icon type="search" /></span>
									</div>
									<div   className="group_team">
										<CheckboxGroup options={this.state.teacherSrcOptions} value={this.state.teacherSrcChecked} onChange={this.teacherSrcOnChange} />
									</div>
								</div>
							</Col>
							<Col className="ant-transfer-operation">
								<Button onClick={this.addTeacherToTarget}><Icon type="right" /></Button>
								<Button onClick={this.addTeacherToSrc}><Icon type="left" /></Button>
							</Col>
							<Col className="ant-transfer-list team_add">
								<div>
									<div className="group_team2">
										<CheckboxGroup options={this.state.teacherTargetOptions} value={this.state.teacherTargetChecked} onChange={this.teacherTargetOnChange} />
									</div>
								</div>
							</Col>
						</div>
						</Col>
                    </Row>

                </Modal>

                <ConfirmModal ref="confirmModal"
                              title="确定要移除该团队成员?"
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.deleteTeamUser}
                ></ConfirmModal>

                <ConfirmModal ref="deleteTeamConfirmModal"
                              title="确定要解散该团队?"
                              onConfirmModalCancel={this.closeDeleteTeamConfirmModal}
                              onConfirmModalOK={this.deleteTeam}
                ></ConfirmModal>

                <ConfirmModal ref="exitTeamConfirmModal"
                              title="确定要退出该团队?"
                              onConfirmModalCancel={this.closeExitTeamConfirmModal}
                              onConfirmModalOK={this.deleteTeamUser}
                ></ConfirmModal>

                <Modal className="modol_width"
                       visible={this.state.updateTeamNameModalVisible}
                       title="修改团队名称"
                       onCancel={this.updateTeamNameModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={[
                           <button type="primary" htmlType="submit" className="ant-btn ant-btn-primary ant-btn-lg" onClick={this.updateTeamName}  >确定</button>,
                           <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={this.updateTeamNameModalHandleCancel} >取消</button>
                       ]}
                >
                    <Row className="ant-form-item">
                        <Col span={6} className="right_look">群名称：</Col>
                        <Col span={14}>
                            <Input value={this.state.settingTeamName} defaultValue={this.state.settingTeamName} onChange={this.updateTeamNameOnChange}/>
                        </Col>
                    </Row>
                </Modal>

            </div>
        );
    },
});

export default AntTeamComponents;

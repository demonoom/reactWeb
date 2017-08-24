import React, { PropTypes } from 'react';
import {Icon,Button,Row,Col,
    Input,Checkbox,message} from 'antd';
import {isEmpty} from '../../utils/utils';
import {TYPE_TEACHER} from '../../utils/Const';
import {doWebService} from '../../WebServiceHelper';
const CheckboxGroup = Checkbox.Group;
var copyPersonIdArray=[];
const CopyPersonSettingComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            approvalTypeValue:1,
            teacherSrcOptions:[],
            teacherTargetOptions:[],
        };
    },

    componentDidMount(){
    },

    componentWillReceiveProps(nextProps){
        copyPersonIdArray = nextProps.copyPersonIdArray;
    },

    componentDidUpdate(){
    },

    /**
     * 初始化页面元素
     */
    initPage(){
        this.setState({teacherSrcOptions:[],teacherTargetOptions:[],searchKey:''});
    },

    /**
     * 通过数组的形式,获取已选中的抄送人信息
     */
    getCopyPersonArray(){
        return this.state.teacherTargetOptions;
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
     * 根据输入的关键字，查询老师的信息
     */
    findTeacherByKeyWords(){
        var _this = this;
        const teacherSrcOptions = [];
        var searchOptions={
            keywords:_this.state.searchKey,
            schoolId:_this.state.loginUser.schoolId,
            userType:TYPE_TEACHER
        }
        var param = {
            "method": 'searchStructureUsers',
            "operateUserId": _this.state.loginUser.colUid,
            "searchOptions": JSON.stringify(searchOptions),
            "pageNo":-1,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    var clazzes = e.clazzes;
                    var gradeName="";
                    if(isEmpty(clazzes)==false){
                        var grade = clazzes[0].grade;
                        gradeName = grade.name;
                    }
                    var teacher = e.teacher;
                    var course = teacher.course;
                    var user = teacher.user;
                    var courseName = course.name;
                    var userId = user.colUid;
                    var userName = user.userName;
                    var userAvatar = user.avatar;

                    var isExitAtTargetOptions=_this.findTeacherIsExitAtTargetOptions(userId);
                    var isExitInCopyPersonArray = _this.findTeacherIsExitAtCopyPersonArray(userId);
                    if(isExitAtTargetOptions==false && isExitInCopyPersonArray==false){
                        const data = {key:userId,
                            label: <div>
                                <div>
                                    <span className="group_team_gray6">{userName}</span>
                                    <span className="group_team_blue9">{courseName}</span>
                                </div>
                                <div className="group_team_gray9">{gradeName}</div>
                            </div>, value: userId+"#"+userName+"#"+gradeName+"#"+userAvatar+"#"+courseName };
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
     * 判断当前查询到的用户在Target中是否存在，如果已经存在，则过滤掉，避免重复添加
     * @param userId
     * @returns {boolean}
     */
    findTeacherIsExitAtTargetOptions(userId){
        var isExit = false;
        var teacherTargetOptions = this.state.teacherTargetOptions;
        if(isEmpty(teacherTargetOptions)==false){
            for(var i=0;i<teacherTargetOptions.length;i++){
                var teacher = teacherTargetOptions[i];
                var teacherArray = teacher.value.split("#");
                var userIdInTarget = teacherArray[0];
                if(userIdInTarget == userId){
                    isExit = true;
                    break;
                }
            }
        }
        return isExit;
    },

    /**
     * 判断当前查询到的用户在已添加的审批抄送人中是否存在，如果已经存在，则过滤掉，避免重复添加
     * @param userId
     * @returns {boolean}
     */
    findTeacherIsExitAtCopyPersonArray(userId){
        var isExit = false;
        for(var i=0;i<copyPersonIdArray.length;i++){
            var addedUserId = copyPersonIdArray[i];
            if(addedUserId == userId){
                isExit = true;
                break;
            }
        }
        return isExit;
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
        var _this = this;
        var teacherTargetOptions=_this.state.teacherTargetOptions;
        var teacherSrcChecked = _this.state.teacherSrcChecked;
        if(isEmpty(teacherSrcChecked)==false){
            teacherSrcChecked.forEach(function (everyTeacher) {
                var teacherInfoArray = everyTeacher.split("#");
                // userId+"#"+userName+"#"+gradeName+"#"+userAvatar+"#"+courseName
                var userId = teacherInfoArray[0];
                var userName = teacherInfoArray[1];
                var gradeName = teacherInfoArray[2];
                var userAvatar = teacherInfoArray[3];
                var courseName = teacherInfoArray[4];
                const data = {key:userId,
                    label: <div>
                        <div>
                            <span className="group_team_gray6">{userName}</span>
                            <span className="group_team_blue9">{courseName}</span>
                        </div>
                        <div className="group_team_gray9">{gradeName}</div>
                    </div>, value: userId+"#"+userName+"#"+gradeName+"#"+userAvatar+"#"+courseName };
                teacherTargetOptions.push(data);
            });
            var teacherSrcOptions = _this.removeTeacherFormOptions(teacherSrcChecked,"src");
            _this.setState({teacherTargetOptions,teacherSrcOptions,teacherSrcChecked:[],teacherTargetChecked:[]});
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
                var subjectName = teacherInfoArray[4];
                const data = {key:userId,
                    label: <div>
                        <div>
                            <span className="group_team_gray6">{userName}</span>
                            <span className="group_team_blue9">{subjectName}</span>
                        </div>
                        <div className="group_team_gray9">{schoolName}</div>
                    </div>, value: userId+"#"+userName+"#"+schoolName+"#"+userAvatar+"#"+subjectName }
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
     * 渲染页面
     * @returns {XML}
     */
    render() {
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        return (
            <div>
                <Row className="ant-form-item">
                    <Col span={24}>
                        <div className="ant-transfer">
                            <Col className="ant-transfer-list team_add">
                                <div>
                                    <p className=".group_team_gray9 team_remark">请按enter键搜索老师账号或姓名</p>
                                    <div className="team_head">
                                        <Input placeholder="请输入需添加的老师账号或姓名" value={this.state.searchKey} onChange={this.searchKeyOnChange} onPressEnter={this.findTeacherByKeyWords} className="ant-transfer-list-search"/>
                                        <span className="ant-transfer-list-search-action1"><Icon type="search" onClick={this.findTeacherByKeyWords} /></span>
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
            </div>
        );
    },
});

export default CopyPersonSettingComponent;

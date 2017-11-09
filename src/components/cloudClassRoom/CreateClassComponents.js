import React, {PropTypes} from 'react';
import {
    Tabs, Breadcrumb, Icon, Card, Button, Row, Col, Steps,
    Input, Select, Radio, DatePicker, Checkbox, message, Upload,
} from 'antd';
import ImageAnswerUploadComponents from './ImageAnswerUploadComponents';
import WeiClassUploadComponents from './WeiClassUploadComponents';
import {isEmpty, getLocalTime} from '../../utils/utils';
import {doWebService_CloudClassRoom} from '../../utils/CloudClassRoomURLUtils';

const dateFormat = 'YYYY/MM/DD';
const dateFullFormat = 'YYYY-MM-DD HH:mm:ss';
const Step = Steps.Step;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const {RangePicker} = DatePicker;

var lessonArray = [];
var courseInfoJson = {};
var weiClassList = {};
var videoJsonArray = [];
var teamJsonArray = [];
var firstTeamId;
var isSeriesStr = "系列课";
var fileList = [];
var uploadClickNum;
var upLoadNum;

const CreateClassComponents = React.createClass({

    getInitialState() {
        var cloudClassRoomUser = JSON.parse(sessionStorage.getItem("cloudClassRoomUser"));
        console.log(cloudClassRoomUser);
        return {
            stepNum: 0,
            isFree: 1,
            isTeam: 1,
            isLimit: 1,
            money: 0,
            limitPerson: 0,
            moneyInputDisable: true,
            isSeriesDisabled: false,
            teamDisabled: true,
            cloudClassRoomUser: cloudClassRoomUser,
            isWeiClass: false,
            isShowClass: false,
            upLoadNum: 0
        };
    },

    componentDidMount() {
        this.getAllClass();
        this.getAllSubject();
        this.findTeamByUserId();
        var isSeries = this.props.isSeries;
        this.setState({isSeries});
        if (isSeries == "1") {
            isSeriesStr = "系列课";
        } else {
            isSeriesStr = "单节课";
        }
        // courseInfoJson={isPublish:2,isSeries:2,publisher_id:this.state.cloudClassRoomUser.colUid,isFree:1,money:0};
        this.initCreatePage(isSeries);
    },
    /**
     * 创建课程
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        var isWeiClass = this.state.isWeiClass;
        var isShowClass = this.state.isShowClass;
        var isSeries = nextProps.isSeries;
        //isWeiClass为true，代表是微课
        if (isWeiClass) {
            if (isSeries == 1) {
                //系列微课
                isSeries = 3
            } else if (isSeries == 2) {
                //单节微课
                isSeries = 4
            }
        }
        // if (isShowClass) {
        //     showCourse = 1
        // } else {
        //     showCourse = 0
        // }
        var stepDirect = nextProps.stepDirect;
        this.setState({stepDirect, isSeries});
        if (isSeries == "1" || isSeries == "3") {
            isSeriesStr = "系列课";
        } else {
            isSeriesStr = "单节课";
        }
        courseInfoJson.isSeries = isSeries;
        // this.initCreatePage(isSeries,"update");
    },

    /**
     * 初始化创建面板
     * @param isSeries
     */
    initCreatePage(isSeries) {
        lessonArray.splice(0);
        courseInfoJson = {};
        var isSeriesStr;
        var videoNumInputDisable;
        var videoNum = 0;
        courseInfoJson.videoNum = videoNum;
        videoJsonArray = [];
        courseInfoJson.videos = [];
        courseInfoJson.isSeries = isSeries;
        courseInfoJson.publishType = 2;
        courseInfoJson.isPublish = 2;
        courseInfoJson.publisher_id = this.state.cloudClassRoomUser.colUid;
        courseInfoJson.money = 0;
        courseInfoJson.limitPerson = 0;
        courseInfoJson.isFree = 1;
        courseInfoJson.isLimit = 1;
        courseInfoJson.showCourse = 0;   //展示课默认为0
        fileList.splice(0);
        // weifileList.splice(0);
        this.setState({
            isSeries,
            isSeriesStr,
            videoNumInputDisable,
            videoNum,
            "courseName": '',
            "isFree": 1,
            "isLimit": 1,
            "showCourse": 0,
            "money": 0,
            "limitPerson": 0,
            "defaultSubjectSelected": "",
            "defaultSelected": '',
            "isTeam": 1,
            "defaultTeamSelected": '',
            "courseSummary": '',
            "moneyInputDisable": true,
            "numInputDisable": true,
            isWeiClass: false,
            isShowClass: false,
        });
        // this.getAllTeam();
    },
    /**
     * 获取所有的年级
     */
    getAllClass() {
        var _this = this;
        var param = {
            "method": 'findCourseClass',
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (isEmpty(response) == false) {
                    var classOptionArray = [];
                    var defaultSelected;
                    for (var i = 0; i < response.length; i++) {
                        var classInfo = response[i];
                        var id = classInfo.id;
                        var name = classInfo.name;
                        var parentid = classInfo.parentid;
                        var optionObj = <Option key={id} value={id}>{name}</Option>;
                        if (i == 0) {
                            defaultSelected = id;
                            courseInfoJson.courseClass = id;
                        }
                        classOptionArray.push(optionObj);
                        var courseTypes = classInfo.courseTypes;
                        if (isEmpty(courseTypes) == false) {
                            for (var j = 0; j < courseTypes.length; j++) {
                                var courseType = courseTypes[j];
                                var courseTypeId = courseType.id;
                                var courseTypeName = courseType.name;
                                var optionObj = <Option key={courseTypeId}
                                                        value={courseTypeId}>{courseTypeName}</Option>;
                                /*if(i==0 && j==0){
                                    defaultSelected = courseTypeId;
                                    courseInfoJson.courseClass=courseTypeId;
                                }*/
                                classOptionArray.push(optionObj);
                            }
                        }
                    }
                    _this.setState({classOptionArray, defaultSelected});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 获取所有的授课科目
     */
    getAllSubject() {
        var _this = this;
        var param = {
            "method": 'findCourseSubject',
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (isEmpty(response) == false) {
                    var subjectOptionArray = [];
                    var defaultSubjectSelected;
                    for (var i = 0; i < response.length; i++) {
                        var subjectInfo = response[i];
                        var id = subjectInfo.id;
                        var name = subjectInfo.name;
                        var parentid = subjectInfo.parentid;
                        var optionObj = <Option key={id} value={id}>{name}</Option>;
                        if (i == 0) {
                            defaultSubjectSelected = id;
                            courseInfoJson.courseTypeId = id;
                        }
                        subjectOptionArray.push(optionObj);
                    }
                    _this.setState({subjectOptionArray, defaultSubjectSelected});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    findTeamByUserId() {
        var _this = this;
        var param = {
            "method": 'findTeamByUserId',
            "id": JSON.parse(sessionStorage.getItem("cloudClassRoomUser")).colUid,
            "pageNo": '',
            "name": ''
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var teamOptionArray = [];
                for (var i = 0; i < response.length; i++) {
                    var teamJson = {};
                    var teamInfo = response[i];
                    var id = teamInfo.id;
                    if (i == 0) {
                        firstTeamId = id;
                    }
                    var name = teamInfo.name;
                    var status = teamInfo.status;
                    var users = teamInfo.users;
                    var optionObj = <Option key={id} value={id}>{name}</Option>;
                    var teamUserOptionArray = [];
                    for (var j = 0; j < users.length; j++) {
                        var user = users[j];
                        var colUid = user.colUid;
                        var userName = user.userName;
                        var userOptionObj = <option value={colUid}>{userName}</option>;
                        teamUserOptionArray.push(userOptionObj);
                    }
                    teamJson.teamId = id;
                    teamJson.teamUserOptionArray = teamUserOptionArray;
                    teamOptionArray.push(optionObj);
                    teamJsonArray.push(teamJson);
                }
                _this.setState({teamOptionArray});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 根据teamId获取team下的老师
     * @param teamId
     * @returns {Array}
     */
    getTeamUserOptions(teamId) {
        var teamUserOptionArray = [];
        for (var i = 0; i < teamJsonArray.length; i++) {
            var teamJson = teamJsonArray[i];
            if (teamJson.teamId == teamId) {
                teamUserOptionArray = teamJson.teamUserOptionArray;
                break;
            }
        }
        this.setState({teamUserOptionArray});
    },

    /**
     * 发课的回调
     */
    addCourse() {
        console.log(courseInfoJson);
        var _this = this;
        var param = {
            "method": 'addCourse',
            "jsonObject": JSON.stringify(courseInfoJson),
        };
        console.log(param);
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (response == true) {
                    message.success("课程创建成功");
                } else {
                    message.error("课程创建失败");
                }
                fileList.splice(0);
                // weifileList.splice(0);
                _this.props.onSaveOk();
            },
            onError: function (error) {
                message.error(error);
            }
        });
        _this.initCreatePage(_this.state.isSeries);
        _this.changeStep("pre");
    },

    /**
     * 课程科目内容改变时的响应函数
     * @param value
     */
    courseSelectOnChange(value) {
        console.log(`selected ${value}`);
        this.setState({defaultSubjectSelected: value});
        courseInfoJson.courseTypeId = value;
    },
    /**
     * 授课年级内容改变时的响应函数
     * @param value
     */
    classLevelSelectOnChange(value) {
        console.log(`selected ${value}`);
        this.setState({defaultSelected: value});
        courseInfoJson.courseClass = value;
    },
    /**
     * 授课方式(单节/系列)
     * @param e
     */
    classTypeOnChange(e) {
        console.log('radio checked', e.target.value);
        var isTeam = e.target.value;
        var isSeriesDisabled;
        var teamDisabled;
        if (isTeam == 1) {
            //发布者ＩＤ 单人授课时为人员id　团队授课时为团队id
            courseInfoJson.publisher_id = this.state.cloudClassRoomUser.colUid;
            courseInfoJson.publishType = 2;
            isSeriesDisabled = false;
            teamDisabled = true;
        } else {
            courseInfoJson.publisher_id = firstTeamId;
            courseInfoJson.publishType = 1;
            isSeriesDisabled = true;
            teamDisabled = false;
        }
        this.setState({
            isTeam: isTeam, isSeriesDisabled, teamDisabled
        });
    },
    /**
     * 课程是否免费的判断
     * @param e
     */
    classIsFreeOnChange(e) {
        console.log('radio checked', e.target.value);
        var isFree = e.target.value;

        var moneyInputDisable = true;
        if (isFree == 1) {
            //TODO 免费时,输入金额的文本框禁用,课程金额为0
            courseInfoJson.money = 0;
            moneyInputDisable = true;
        } else {
            moneyInputDisable = false;
        }
        courseInfoJson.isFree = isFree;
        this.setState({
            isFree: isFree, moneyInputDisable, money: courseInfoJson.money
        });
    },

    /**
     * 勾选是否为微课的回调
     */
    isWeiClass(e) {
        this.setState({isWeiClass: e.target.checked});
    },

    /**
     * 勾选是否为展示课的回调
     */
    isShowClass(e) {
        this.setState({isShowClass: e.target.checked});
        if (e.target.checked) {
            //钩中展示课
            courseInfoJson.showCourse = 1;
        } else {
            courseInfoJson.showCourse = 0;
        }
    },

    /**
     * 人数是否限制的回调
     */
    numberIsLimit(e) {
        var isLimit = e.target.value;
        var numInputDisable = true;
        if (isLimit == 1) {
            //TODO 免费时,输入金额的文本框禁用,课程金额为0
            courseInfoJson.limitPerson = 0;
            numInputDisable = true;
        } else {
            numInputDisable = false;
        }
        courseInfoJson.isLimit = isLimit;
        this.setState({isLimit, numInputDisable, limitPerson: 0});
    },
    /**
     * 授课形式,系列课和单节课
     * @param value
     */
    courseTypeSelectOnChange(value) {
        console.log(`courseTypeSelectOnChange ${value}`);
        courseInfoJson.isSeries = value;
    },
    /**
     * 授课团队改变时的响应函数
     * @param value
     */
    teamSelectOnChange(value) {
        console.log(`teamSelectOnChange selected ${value}`);
        //团队授课时,发布者为团队id
        courseInfoJson.publisher_id = value;
        this.getTeamUserOptions(value);
        this.setState({"teamId": value, defaultTeamSelected: value});
    },

    /**
     * 授课时间响应函数
     * @param date
     * @param dateString
     */
    classTimeOnChange(date, dateString) {
        console.log(date, dateString);
        var startTime = dateString[0];
        var endTime = dateString[1];
        var startTimestamp = new Date(startTime).valueOf();
        var endTimestamp = new Date(endTime).valueOf();
        courseInfoJson.startTime = startTimestamp;
        courseInfoJson.endTime = endTimestamp;
    },

    changeStep(stepDirect) {
        var _this = this;
        switch (stepDirect) {
            case "pre":
                _this.setState({"stepNum": 0});
                break;
            case "next":
                _this.setState({"stepNum": 1});
                break;
        }
    },
    /**
     * 添加课程目录
     */
    addLesson() {
        /*if(lessonArray.length >= courseInfoJson.videoNum){
            message.error("排课次数已经达到授课总课时,无法新增");
            return;
        }*/
        var videoNumBeforeAdd = this.state.videoNum;
        if (this.state.isSeries == "2" && videoNumBeforeAdd == 1 || this.state.isSeries == "4" && videoNumBeforeAdd == 1) {
            //单节课
            message.error("单节课只能排课一次,无法继续添加课程目录!");
            return;
        }
        var lessonNum = lessonArray.length + 1;
        // <Col span={4}>第{lessonNum}课时</Col>
        var teacherObj;
        if (this.state.isTeam == 1) {
            teacherObj = <span>{this.state.cloudClassRoomUser.userName}</span>;
        } else {
            teacherObj = <Col span={24}>
                <select className="lessonTeamTeacher course_n">
                    {/*<option value="1">a</option>
                     <option value="2">b</option>
                     <option value="3">c</option>
                     <option value="4">d</option>*/}
                    {this.state.teamUserOptionArray}
                </select>
            </Col>;
        }
        var timeObj = <Col span={4}>
            <Col span={24}>
                <DatePicker
                    className="lessonTime"
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="Select Time"
                    onChange={this.lessonTimeOnChange}
                    onOk={this.lessonTimeOnOk}
                />
            </Col>
        </Col>;
        var lessonJson = {lessonNum, teacherObj, timeObj};
        lessonArray.push(lessonJson);
        var newVideoNum = parseInt(videoNumBeforeAdd) + 1
        courseInfoJson.videoNum = newVideoNum;
        this.setState({lessonArray, "videoNum": newVideoNum});
        // this.buildEveryLessonTag(lessonArray);
    },

    buildEveryLessonTag(lessonArray) {
        var everyLessonArray = [];
        // <Col span={4}>第{lessonNum}课时</Col>
        if (typeof(lessonArray) != "undefined") {
            for (var i = 0; i < lessonArray.length; i++) {
                var lessonJson = lessonArray[i];
                var lessonRowObj = <Row>
                    <Col span={4} className="add_left">第{lessonJson.lessonNum}课时</Col>
                    <Col span={8}>
                        <Input key={i} id={lessonJson.lessonNum} onChange={this.lessonTitleOnChange}/>
                    </Col>
                    <Col span={4}>{lessonJson.teacherObj}</Col>
                    <Col span={4}>{lessonJson.timeObj}</Col>
                    <Col span={4}>
                        <Button icon="delete" onClick={this.removeLesson.bind(this, lessonJson.lessonNum)}></Button>
                    </Col>
                </Row>;
                everyLessonArray.push(lessonRowObj);
            }
        }
        this.setState({everyLessonArray});
    },
    /**
     * 创建课程页面，日期改变响应函数
     * @param value
     * @param dateString
     * @param Event
     */
    lessonTimeOnChange(value, dateString, Event) {
        console.log('Selected Time: ', value);
        console.log('Formatted Selected Time: ', dateString);
    },

    lessonTimeOnOk(value) {
        console.log('onOk: ', value);
    },

    removeLesson(lessonNum) {
        for (var i = 0; i < lessonArray.length; i++) {
            var lessonJson = lessonArray[i];
            if (lessonJson.lessonNum == lessonNum) {
                lessonArray.splice(i, 1);
                break;
            }
        }
        lessonArray.forEach(function (lessonObj) {
            if (lessonObj.lessonNum > lessonNum) {
                lessonObj.lessonNum -= 1;
            }
        });
        var videoNumBeforeRemove = this.state.videoNum;
        var newVideoNum = parseInt(videoNumBeforeRemove) - 1
        courseInfoJson.videoNum = newVideoNum;
        this.setState({lessonArray, "videoNum": newVideoNum});
    },

    /**
     * 对提交的数据进行基础验证
     */
    checkSubmitData() {
        var checkResult = true;
        if (isEmpty(courseInfoJson.courseName)) {
            message.error("请输入课程名称");
            checkResult = false;
        } else if (courseInfoJson.courseName.length > 35) {
            message.error("课程名称不能超过35个字符");
            checkResult = false;
        } else if (courseInfoJson.isFree == 2 && courseInfoJson.money == 0) {
            message.error("收费课程请输入课程费用");
            checkResult = false;
        } else if (isEmpty(courseInfoJson.courseTypeId)) {
            message.error("请选择课程科目");
            checkResult = false;
        } else if (isEmpty(courseInfoJson.courseClass)) {
            message.error("请选择授课年级");
            checkResult = false;
        }
        /*else if(this.state.isTeam==1 && isEmpty(isSeries)){
            message.error("单人授课时,请选择课程类型");
            checkResult=false;
        }*/
        else if (this.state.isTeam == 2 && isEmpty(this.state.teamId)) {
            message.error("团队授课时,请选择团队名称");
            checkResult = false;
        } else if (this.state.isSeries == 2 && courseInfoJson.startTime != courseInfoJson.endTime) {
            message.error("单节课的授课时间只能在一天范围内");
            checkResult = false;
        } else if (isEmpty(courseInfoJson.image)) {
            message.error("请选择课程封面");
            checkResult = false;
        } else if (isEmpty(courseInfoJson.content) == false && courseInfoJson.content.length > 500) {
            message.error("课程概述不能超出500个字符");
            checkResult = false;
        } else if (isEmpty(courseInfoJson.videoNum)) {
            message.error("请输入总课时");
            checkResult = false;
        } else if (isEmpty(courseInfoJson.videos) || courseInfoJson.videos.length == 0) {
            message.error("请至少输入一次授课课表");
            checkResult = false;
        }
        /*else if(isEmpty(courseInfoJson.startTime) ||　isEmpty(courseInfoJson.endTime)){
            message.error("请选择授课时间");
            checkResult=false;
        }*/
        return checkResult;
    },

    /**
     * 保存课程信息
     */
    saveClassInfo() {
        var checkResult = this.checkSubmitData();
        if (checkResult == false) {
            return;
        }
        var lessonTeamTeacherTagArray = $(".lessonTeamTeacher option:selected");
        var lessonTimeTagArray = $("input.ant-calendar-range-picker");
        var arr = $('.noom_input');
        console.log(arr.length);
        var userId;
        /*if(this.state.isTeam==1) {
            //发布者ＩＤ 单人授课时为人员id　团队授课时为团队id
            userId = loginUser.colUid;
        }else{
            userId = this.state.teamId;
        }*/
        for (var i = 0; i < arr.length; i++) {
            var videoJson = {};
            var option = lessonTeamTeacherTagArray[i];
            var timeTag = lessonTimeTagArray[i];
            var teacher;
            if (this.state.isTeam == 1) {
                teacher = this.state.cloudClassRoomUser.colUid;
            } else {
                teacher = option.value;
            }
            if (isEmpty(timeTag) == false) {
                var time = timeTag.value;
            } else {
                var time = '';
            }
            console.log("teacher" + teacher + "\t" + time);
            videoJson.squence = i + 1;
            // videoJson.courseId = courseInfoJson.courseTypeId;
            videoJson.userID = teacher;
            videoJson.liveTime = new Date(time).valueOf();
            this.buildVideosArray(videoJson);
        }
        if (isEmpty(courseInfoJson.videos) == false) {
            var checkResult = true;
            if (this.state.isWeiClass) {
                //微课验证
                courseInfoJson.videos.forEach(function (video) {
                    if (isEmpty(video.name) || isEmpty(video.url) || isEmpty(video.userID)) {
                        checkResult = false;
                        return;
                    }
                })
            } else {
                //普通课验证
                courseInfoJson.videos.forEach(function (video) {
                    if (isEmpty(video.name) || isEmpty(video.userID) || isEmpty(video.liveTime) || isNaN(video.liveTime)) {
                        checkResult = false;
                        return;
                    }
                })
            }
            if (checkResult == false) {
                message.error("排课课表中存在空值,请检查");
                return;
            }
        }
        this.addCourse();
    },
    /**
     * 立即发布复选框选中响应函数
     * @param e
     */
    publishClassAtNow(e) {
        console.log(`checked = ${e.target.checked}`);
        // 是否发布　１已发布　２未发布
        if (e.target.checked) {
            courseInfoJson.isPublish = 1;
        } else {
            courseInfoJson.isPublish = 2;
        }
    },

    /**
     * 课程名称文本框内容改变响应函数
     * @param e
     */
    courseNameOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var courseName = target.value;
        if (courseName.length > 35) {
            message.error("课程名称不能超过35个字符");
            return;
        }
        this.setState({courseName});
        courseInfoJson.courseName = courseName;
    },
    /**
     * 课程收费金额文本框内容改变时的响应
     * @param e
     */
    moneyOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var money = target.value;
        this.setState({money});
        courseInfoJson.money = money;
    },
    /**
     *  限制人数变化的回调
     */
    numOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var limitPerson = target.value;
        this.setState({limitPerson});
        courseInfoJson.limitPerson = limitPerson;
    },
    /**
     * 课程概述内容响应函数
     * @param e
     */
    classSummaryOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var courseSummary = target.value;
        courseInfoJson.content = courseSummary;
        this.setState({courseSummary});
    },
    /**
     * 总课时内容改变时的响应函数
     * @param e
     */
    classTimesOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var videoNum = target.value;
        console.log("classTimes:" + videoNum);
        courseInfoJson.videoNum = videoNum;
        this.setState({videoNum});
    },

    /**
     * 获取课程封面
     */
    getLessonImageList(file, isRemoved) {
        var lessonImage = file.response;
        if (isEmpty(isRemoved) == false && isRemoved == "removed") {
            lessonImage = "";
        }
        if (isEmpty(lessonImage) == false) {
            var fileJson = {
                uid: Math.random(),
                url: lessonImage,
            }
            fileList.splice(0);
            fileList.push(fileJson);
        }
        //题目图片答案的图片来源
        courseInfoJson.image = lessonImage;
    },
    /**
     * 创建课程页面的排课名称改变响应函数
     * @param e
     */
    lessonTitleOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var squence = target.id;
        var name = target.value;
        var videoJson = {squence, name};
        this.buildVideosArray(videoJson, "title");
    },

    buildVideosArray(videoJson, buildType) {
        var isExistSameVideo = false;
        for (var i = 0; i < videoJsonArray.length; i++) {
            var everyVideoJson = videoJsonArray[i];
            if (everyVideoJson.squence == videoJson.squence) {
                if (buildType == "title") {
                    everyVideoJson.name = videoJson.name;
                } else {
                    everyVideoJson.squence = videoJson.squence;
                    // everyVideoJson.courseId = videoJson.courseId;
                    everyVideoJson.userID = videoJson.userID;
                    everyVideoJson.liveTime = videoJson.liveTime;
                }
                isExistSameVideo = true;
                break;
            }
        }
        if (isExistSameVideo == false) {
            videoJsonArray.push(videoJson);
        }
        courseInfoJson.videos = videoJsonArray;
    },

    getVideoInfoFromCourseInfoJson(squence) {
        var videoInfo;
        var videos = courseInfoJson.videos;
        for (var i = 0; i < videos.length; i++) {
            var videoJson = videos[i];
            if (videoJson.squence == squence) {
                videoInfo = videoJson;
                break;
            }
        }
        return videoInfo;
    },

    teamTeacherSelectOnChange(value) {
        console.log(value);
    },

    uploadOnclick(num) {
        uploadClickNum = num;
        this.setState({upLoadNum: num});
        // upLoadNum = num;
    },

    /**
     * 微课上传完成的回调
     * @param e
     */
    weiClassUpload(e, i) {
        console.log(i);
        console.log('上传完成的回调');
        courseInfoJson.videos[i].url = e.response;
        courseInfoJson.videos[i].remark = e.name;
    },

    /**
     * 微课上传之前的回调
     * @param e
     */
    beforeUploadBack(e) {
        //将对象保存在courseInfo.videos中，以便下次渲染的时候取出来使用
        weiClassList = {
            uid: e.uid,
            name: e.name,
            status: 'done',
            url: e.response,
        };
        courseInfoJson.videos[uploadClickNum].weiClassList = weiClassList;
        weiClassList = {};
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        var classStepStatus;
        var lessonStepStatus;
        var saveButton;
        var preButton;
        var nextButton;
        var stepPanel;
        if (this.state.stepNum == 0) {
            saveButton = "";
            classStepStatus = "";
            preButton = <Button disabled onClick={this.changeStep.bind(this, "pre")}>上一步</Button>;
            nextButton = <Button onClick={this.changeStep.bind(this, "next")}>下一步</Button>;
            stepPanel = <div>
                <Row>
                    <Col span={4}>课程名称：</Col>
                    <Col span={18}>
                        <Input value={this.state.courseName} onChange={this.courseNameOnChange}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>课程费用：</Col>
                    <Col span={18}>
                        <RadioGroup onChange={this.classIsFreeOnChange} value={this.state.isFree}>
                            <Radio style={radioStyle} value={1} className="line_block">
                                免费
                            </Radio>
                            <Radio style={radioStyle} value={2} className="line_block">
                                收费
                                {/*<Row>
                                    <Col span={8}>请输入课程费用</Col>
                                    <Col span={16}>
                                        /!*<Input value={this.state.money}  style={{ width: 160 }} disabled={this.state.moneyInputDisable} onChange={this.moneyOnChange}/>*!/
                                    </Col>
                                </Row>*/}
                            </Radio>
                            <span>
                              <Input value={this.state.money} style={{width: 160}}
                                     disabled={this.state.moneyInputDisable} onChange={this.moneyOnChange}/>
                            </span>
                        </RadioGroup>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>人数限制：</Col>
                    <Col span={18}>
                        <RadioGroup onChange={this.numberIsLimit} value={this.state.isLimit}>
                            <Radio style={radioStyle} value={1} className="line_block">
                                不限人数
                            </Radio>
                            <Radio style={radioStyle} value={2} className="line_block">
                                限制人数
                            </Radio>
                            <span>
                              <Input value={this.state.limitPerson} style={{width: 160}}
                                     disabled={this.state.numInputDisable} onChange={this.numOnChange}/>
                            </span>
                        </RadioGroup>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>课程科目：</Col>
                    <Col span={18}>
                        <Select defaultValue={this.state.defaultSubjectSelected}
                                value={this.state.defaultSubjectSelected} style={{width: 120}}
                                onChange={this.courseSelectOnChange}>
                            {this.state.subjectOptionArray}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>授课年级：</Col>
                    <Col span={18}>
                        <Select defaultValue={this.state.defaultSelected} value={this.state.defaultSelected}
                                style={{width: 120}} onChange={this.classLevelSelectOnChange}>
                            {this.state.classOptionArray}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>授课形式：</Col>
                    <Col span={18} style={{height: 140}}>
                        <RadioGroup onChange={this.classTypeOnChange} value={this.state.isTeam}>
                            <Radio style={radioStyle} value={1}>单人授课</Radio>
                            <Row style={{width: 420}}>
                                <Col span={24} style={{marginLeft: 22}}>课程类型：{isSeriesStr}</Col>
                                {/* <Col span={16}>
									<Select defaultValue={this.state.isSeries} value={this.state.isSeries} style={{ width: 120 }} disabled={this.state.isSeriesDisabled} onChange={this.courseTypeSelectOnChange}>
										<Option value="1">系列课</Option>
										<Option value="2">单节课</Option>
									</Select>
								</Col>*/}
                            </Row>
                            <Radio style={radioStyle} value={2}>
                                团队授课
                                <Row>
                                    <Col span={6} style={{marginLeft: 22}}>选择团队：</Col>
                                    <Col span={16}>
                                        <Select defaultValue={this.state.defaultTeamSelected}
                                                value={this.state.defaultTeamSelected}
                                                disabled={this.state.teamDisabled} style={{width: 120}}
                                                onChange={this.teamSelectOnChange}>
                                            {this.state.teamOptionArray}
                                        </Select>
                                    </Col>
                                </Row>
                            </Radio>
                        </RadioGroup>
                    </Col>
                </Row>
                <Row>
                    <Checkbox onChange={this.isShowClass} checked={this.state.isShowClass} className="upexam_le_datika">是否为展示课</Checkbox>
                </Row>
                <Row>
                    <Checkbox onChange={this.isWeiClass} checked={this.state.isWeiClass} className="upexam_le_datika">是否为微课</Checkbox>
                </Row>
                {/*<Row>
                    <Col span={4}>授课时间：</Col>
                    <Col span={18}>
                        <RangePicker onChange={this.classTimeOnChange} />
                    </Col>
                </Row>*/}
                <Row>
                    <Col span={4}>课程封面：</Col>
                    <Col span={18}>
                        <ImageAnswerUploadComponents fileList={fileList}
                                                     callBackParent={this.getLessonImageList}>
                        </ImageAnswerUploadComponents>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>课程概述：</Col>
                    <Col span={18}>
                        <Input value={this.state.courseSummary} type="textarea" rows={4}
                               onChange={this.classSummaryOnChange}/>
                    </Col>
                </Row>
            </div>;
        } else {
            preButton = <Button onClick={this.changeStep.bind(this, "pre")}>上一步</Button>;
            saveButton = <Button onClick={this.saveClassInfo}>保存</Button>;
            nextButton = "";
            var everyLessonArray = [];
            if (this.state.isWeiClass) {
                //是微课
                if (typeof(this.state.lessonArray) != "undefined") {
                    for (var i = 0; i < this.state.lessonArray.length; i++) {
                        var lessonJson = this.state.lessonArray[i];
                        //获取已经保存的时间信息，并重新初始化到页面的组件上
                        var videoInfo = this.getVideoInfoFromCourseInfoJson(lessonJson.lessonNum);
                        var videoName = "";
                        var weifileList = [];
                        if (isEmpty(videoInfo) == false) {
                            console.log("videoInfo name:" + videoInfo.name);
                            videoName = videoInfo.name;
                            // weifileList = videoInfo.weiClassList;
                            weifileList.push(videoInfo.weiClassList);
                        }
                        var lessonRowObj = <Row>
                            <Col span={3} className="add_left">第{lessonJson.lessonNum}课时</Col>
                            <Col span={8} className="class_right">
                                <Input className="noom_input" key={i} id={lessonJson.lessonNum} defaultValue={videoName}
                                       onChange={this.lessonTitleOnChange}/>
                            </Col>
                            <Col span={4} className="class_right">{lessonJson.teacherObj}</Col>
                            <Col span={4} className="class_right">

                            </Col>
                            <Col span={3} className="class_right create_upload"
                                 onClick={this.uploadOnclick.bind(this, i)}>
                                <WeiClassUploadComponents
                                    upLoadNumber={i}
                                    callBackParent={this.weiClassUpload}
                                    beforeUploadBack={this.beforeUploadBack}
                                    noom={weifileList}
                                    videoName={videoName}
                                />
                            </Col>
                            <Col span={2}>
                                <Button icon="delete" className="create_upload_btn"
                                        onClick={this.removeLesson.bind(this, lessonJson.lessonNum)}></Button>
                            </Col>
                        </Row>;
                        everyLessonArray.push(lessonRowObj);
                    }
                }
                stepPanel = <div>
                    <Row>
                        <Col span={4}>总&nbsp;&nbsp;课&nbsp;&nbsp;时：</Col>
                        <Col span={20}>
                            <Input value={this.state.videoNum} disabled={true} onChange={this.classTimesOnChange}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={4}>设置课表：</Col>
                        <Col span={20}>
                            <Row className="no_ant-row price">
                                <Col span={3} className="add_left">目录</Col>
                                <Col span={8}>名称</Col>
                                <Col span={4} className="class_right">授课老师</Col>
                                <Col span={4} className="class_right">微课名</Col>
                                <Col span={3} className="class_right">微课上传</Col>
                                <Col span={2} className="class_right">操作</Col>
                            </Row>
                            {everyLessonArray}
                            <Row>
                                <Col span={24}>
                                    <Button icon="add" onClick={this.addLesson}
                                            className="add_DIR add_study-b">添加目录</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} className="knowledge_ri">
                            <Checkbox onChange={this.publishClassAtNow}>立即发布</Checkbox>
                        </Col>
                    </Row>
                </div>;
            } else {
                if (typeof(this.state.lessonArray) != "undefined") {
                    for (var i = 0; i < this.state.lessonArray.length; i++) {
                        var lessonJson = this.state.lessonArray[i];
                        //获取已经保存的时间信息，并重新初始化到页面的组件上
                        var videoInfo = this.getVideoInfoFromCourseInfoJson(lessonJson.lessonNum);
                        var videoName = "";
                        if (isEmpty(videoInfo) == false) {
                            console.log("videoInfo name:" + videoInfo.name);
                            videoName = videoInfo.name;
                        }
                        var lessonRowObj = <Row>
                            <Col span={4} className="add_left">第{lessonJson.lessonNum}课时</Col>
                            <Col span={8}>
                                <Input className="noom_input" key={i} id={lessonJson.lessonNum} defaultValue={videoName}
                                       onChange={this.lessonTitleOnChange}/>
                            </Col>
                            <Col span={4}>{lessonJson.teacherObj}</Col>
                            <Col span={4}>
                                <Col span={24}>
                                    <DatePicker
                                        className="lessonTime"
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        placeholder="Select Time"
                                        onChange={this.lessonTimeOnChange}
                                        onOk={this.lessonTimeOnOk}
                                    />
                                </Col>
                            </Col>
                            <Col span={4}>
                                <Button icon="delete" className="create_upload_btn"
                                        onClick={this.removeLesson.bind(this, lessonJson.lessonNum)}></Button>
                            </Col>
                        </Row>;
                        everyLessonArray.push(lessonRowObj);
                    }
                }
                stepPanel = <div>
                    <Row>
                        <Col span={4}>总&nbsp;&nbsp;课&nbsp;&nbsp;时：</Col>
                        <Col span={20}>
                            <Input value={this.state.videoNum} disabled={true} onChange={this.classTimesOnChange}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={4}>设置课表：</Col>
                        <Col span={20}>
                            <Row className="no_ant-row price">
                                <Col span={4} className="add_left">目录</Col>
                                <Col span={8}>名称</Col>
                                <Col span={4}>授课老师</Col>
                                <Col span={4}>授课时间</Col>
                                <Col span={4}>操作</Col>
                            </Row>
                            {everyLessonArray}
                            <Row>
                                <Col span={24}>
                                    <Button icon="add" onClick={this.addLesson}
                                            className="add_DIR add_study-b">添加目录</Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} className="knowledge_ri">
                            <Checkbox onChange={this.publishClassAtNow}>立即发布</Checkbox>
                        </Col>
                    </Row>
                </div>;
            }
        }

        return (
            <div>
                <div className="modal_steps">
                    <Steps current={this.state.stepNum}>
                        <Step title="课程信息" icon={<Icon type="credit-card"/>}/>
                        <Step title="设置课表" icon={<Icon type="smile-o"/>}/>
                    </Steps>
                </div>
                {stepPanel}
                {/* <div>
                    <Row>
                        <Col span={24}>
                            {preButton}
                            {nextButton}
                            {saveButton}
                        </Col>
                    </Row>
                </div>*/}
            </div>
        );
    },
});

export default CreateClassComponents;

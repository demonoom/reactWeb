import React, {PropTypes} from 'react';
import {
    Tabs, Breadcrumb, Icon, Card, Button, Row, Col, Steps,
    Input, Select, Radio, DatePicker, Checkbox, message, Upload
} from 'antd';
import ImageAnswerUploadComponents from './ImageAnswerUploadComponents';
import {isEmpty, formatYMD, getLocalTime} from '../../utils/utils';
import {doWebService_CloudClassRoom} from '../../utils/CloudClassRoomURLUtils';
import moment from 'moment';
import WeiClassUploadComponents from './WeiClassUploadComponents';
import KnowledgePointModal from './KnowledgePointModal';

const dateFormat = 'YYYY/MM/DD';
const dateFullFormat = 'YYYY-MM-DD HH:mm:ss';
const Step = Steps.Step;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const {RangePicker} = DatePicker;

var courseInfoJson = {
    isPublish: 2,
    isSeries: 2,
    publisher_id: sessionStorage.getItem("ident"),
    isFree: 1,
    money: 0,
    isLimit: 1,
    limitPerson: 0,
    updateDisabled: false, //默认所有组件是可以修改的
};
var lessonArray = [];
var videoJsonArray = [];
var teamJsonArray = [];
var fileList = [];
var oriUrl;
var uploadClickNum;
const UpdateClassComponents = React.createClass({

    getInitialState() {
        var cloudClassRoomUser = JSON.parse(sessionStorage.getItem("cloudClassRoomUser"));
        this.findTeamByUserId();
        return {
            stepNum: 0,
            isFree: 1,
            isTeam: 1,
            isLimit: 1,
            money: 0,
            limitPerson: 0,
            isSeries: 2,
            isSeriesDisabled: false,
            teamDisabled: true,
            teamUserOptionArray: [],
            cloudClassRoomUser: cloudClassRoomUser,
            defaultTeamSelected: '',
            isWeiClass: false,
            isShowClass: false,
            isTestClass: false,//默认测试课勾选状态
            test: cloudClassRoomUser.test ,//获取当前用户的test ""为不是 test是测试用户
            selectKnowledgeModalIsShow:false   //修改 知识点弹框

        };
    },

    componentDidMount() {
        var updateClassObj = this.props.updateClassObj;
        this.setState({updateClassObj});
        this.findTeamByUserId();
        /*if(isEmpty(updateClassObj)==false){
            this.initPageInfo(updateClassObj);
        }*/
    },

    componentWillMount() {
        var updateClassObj = this.props.updateClassObj;
        var image = updateClassObj.image;
        if (isEmpty(image) == false) {
            var fileJson = {
                uid: Math.random(),
                url: image,
            }
            fileList.splice(0);
            fileList.push(fileJson);
        }
        this.getAllClass();
        if(this.state.stepNum==0){
            this.getAllSubject(updateClassObj.courseClassId);
        }
        // this.findTeamByUserId();
    },

    componentWillReceiveProps(nextProps) {
        if (!this.state.isWeiClass) {
            if (courseInfoJson.isSeries == 3) {
                //系列微课
                courseInfoJson.isSeries = 1
            } else if (courseInfoJson.isSeries == 4) {
                //单节微课
                courseInfoJson.isSeries = 2
            }
        }
        if (!nextProps.isChangeStep) {
            this.findTeamByUserId();
            var updateClassObj = nextProps.updateClassObj;
            var image = updateClassObj.image;
            if (isEmpty(image) == false) {
                var fileJson = {
                    uid: Math.random(),
                    url: image,
                }
                fileList.splice(0);
                fileList.push(fileJson);
            }
            this.initPageInfo(updateClassObj);
            this.setState({updateClassObj});
        }
        /*if(isEmpty(updateClassObj)==false){
            this.initPageInfo(updateClassObj);
        }*/
        /* this.getAllClass();
         this.getAllSubject();*/
    },

    /**
     * 初始化更新页面
     * @param updateClassObj
     */
    initPageInfo(updateClassObj) {
        var _this = this;
        var isDisable = false;//是否限制更新
        var courseName = updateClassObj.courseName;
        var money = updateClassObj.money;
        var limitPerson = updateClassObj.limitPerson;
        var isFree = updateClassObj.isFree;
        var isLimit = updateClassObj.isLimit;
        var isTeam = updateClassObj.isTeam;
        var moneyInputDisable;
        var isShowseclect = false;
        var LessionIsUpdateDisable = false;
        videoJsonArray = [];

        if (money != 0) {
            isFree = 2;
            moneyInputDisable = false;
        } else {
            isFree = 1;
            moneyInputDisable = true;
        }
        var numInputDisable;
        if (limitPerson != 0) {
            isLimit = 2;
            numInputDisable = false;
        } else {
            isLimit = 1;
            numInputDisable = true;
        }
        var id = updateClassObj.id;
        var content = updateClassObj.content;
        var courseTypeId = updateClassObj.courseTypeId;
        var courseClass = updateClassObj.courseClassId;
        var image = updateClassObj.image;
        var videoNum = updateClassObj.videoNum;
        var startTime = updateClassObj.startTime;
        var endTime = updateClassObj.endTime;
        var isPublish = updateClassObj.isPublish;
        var publisher_id = updateClassObj.publisher_id;
        var publisher = updateClassObj.publisher;
        var publishType = updateClassObj.publishType;
        var videos = updateClassObj.videos;
        var showCourse = updateClassObj.showCourse;   //是否为展示课   1是0不是
        var isTeam;
        var isSeriesDisabled;
        var teamDisabled;
        if (publishType == 1) {
            //团队发布
            isTeam = 2;
            isSeriesDisabled = true;
            teamDisabled = true;
            _this.getTeamUserOptions(publisher_id);
        } else {
            isTeam = 1;
            isSeriesDisabled = false;
            teamDisabled = true;
        }
        var startTimeYMD = formatYMD(startTime);
        var endTimeYMD = formatYMD(endTime);
        var classTimeRange = [moment(startTimeYMD, dateFormat), moment(endTimeYMD, dateFormat)];
        var isWeiClass = this.state.isWeiClass;
        /*if(isEmpty(image)==false){
            var fileJson = {
                uid: Math.random(),
                url: image,
            }
            fileList.push(fileJson);
        }*/
        var isSeries = updateClassObj.isSeries;
        if (isSeries == 3 || isSeries == 4) {
            isWeiClass = true;
        } else {
            isWeiClass = false;
        }
        if (!isWeiClass) {
            if (isSeries == 3) {
                //系列微课
                isSeries = 1
            } else if (isSeries == 4) {
                //单节微课
                isSeries = 2
            }
        }
        var isSeriesStr;
        var videoNumInputDisable;
        if (isSeries == "1" || "3") {
            isSeriesStr = "系列课";
            videoNumInputDisable = false;
        } else {
            isSeriesStr = "单节课";
            videoNum = 1;
            videoNumInputDisable = true;
        }
        if (isSeries == 3 || 4) {
            this.setState({isWeiClass: true});
        } else {
            this.setState({isWeiClass: false});
        }
        if (showCourse == 1) {
            this.setState({isShowClass: true})
        } else {
            this.setState({isShowClass: false})
        }

        //测试课勾选状态
        var test = updateClassObj.test;  //从updateClassObj这个属性来获取test的值
        if (test == "test") {
            this.setState({isTestClass: true});
        } else {
            this.setState({isTestClass: false});
        }

        _this.setState({
            isWeiClass,
            updateId: updateClassObj.id,
            courseName,
            isFree,
            isLimit,
            money,
            limitPerson,
            moneyInputDisable,
            numInputDisable,
            // defaultSubjectSelected:,
            courseClass: courseClass,
            publishType,
            // defaultTeamSelected:publisher_id,
            courseSummary: content,
            videoNum,
            classTimeRange,
            isTeam,
            isSeriesDisabled,
            isSeries,
            teamDisabled,
            fileList,
            isSeriesStr,
            videoNumInputDisable,
        });
        courseInfoJson.id = id;
        courseInfoJson.courseName = courseName;
        courseInfoJson.money = money;
        courseInfoJson.limitPerson = limitPerson;
        courseInfoJson.isFree = isFree;
        courseInfoJson.isLimit = isLimit;
        courseInfoJson.showCourse = showCourse;
        courseInfoJson.content = content;
        courseInfoJson.isSeries = isSeries;
        courseInfoJson.courseTypeId = courseTypeId;
        courseInfoJson.courseClass = courseClass;
        courseInfoJson.image = image;
        courseInfoJson.videoNum = videoNum;
        courseInfoJson.startTime = startTime;
        courseInfoJson.endTime = endTime;
        courseInfoJson.isPublish = isPublish;
        courseInfoJson.publisher_id = publisher_id;
        courseInfoJson.publisher = publisher;
        courseInfoJson.publishType = publishType;
        courseInfoJson.videos = videos;
        courseInfoJson.test = test;//测试课默认为updateClassObj.test
        if (courseInfoJson.isPublish == 1) {
            isDisable = true;
            isShowseclect = true;
        } else {
            isDisable = false;
            isShowseclect = false;
        }

        if (isEmpty(videos) == false) {
            var lessonNum = 0;
            lessonArray.splice(0);
            videos.forEach(function (video, i) {
                var videoStatus = video.videoStatus;
                // var currentLessionIsUpdateDisable=false;
                //1.未直播2.直播中3.结束
                var currentLessionIsUpdateDisable = false;
                if (videoStatus == 2 || videoStatus == 3) {
                    isDisable = true;
                    currentLessionIsUpdateDisable = true;
                    LessionIsUpdateDisable = true;
                    teamDisabled = true;
                }
                var weiClassName = {
                    name: video.remark,
                    uid: i
                };
                var weifileList = [
                    weiClassName
                ];
                _this.setState({weifileList});
                //将数据返回到数据库
                var squence = video.squence;
                var name = video.name;
                var url = video.url;
                var remark = video.remark;
                var id = video.id;
                var liveTime = video.liveTime;
                var videoJson = {squence, name, url, remark, videoStatus, id, 'delete': video.delete,liveTime};
                _this.buildVideosArray(videoJson, "title");
                lessonNum += 1;
                var liveTime = getLocalTime(video.liveTime);
                var videoNameInput = <Input disabled={currentLessionIsUpdateDisable} id={lessonNum} value={name}
                                            onChange={_this.lessonTitleOnChange}
                                            className="noom_input"/>;
                var videoNameObj = <Col span={8}>
                    {videoNameInput}
                </Col>;
                var teacherObj;
                if (isTeam == 1) {
                    teacherObj = <span>{_this.state.cloudClassRoomUser.userName}</span>;
                } else {
                    var videoUser = video.user;
                    var teamUsers = _this.state.teamUsers;
                    var optionsArray = [];
                    teamUsers.forEach(function (user) {
                        var option;
                        if (user.colUid == videoUser.colUid) {
                            option = <option value={user.colUid} selected="selected">{user.userName}</option>
                        } else {
                            option = <option value={user.colUid}>{user.userName}</option>
                        }
                        optionsArray.push(option);
                    });
                    teacherObj = <Col span={24}>
                        <select className="lessonTeamTeacher course_n">
                            {/* {_this.state.teamUserOptionArray}*/}
                            {optionsArray}
                        </select>
                    </Col>;
                }
                // defaultValue={moment({liveTime}, dateFullFormat)}
                // value={moment({liveTime}, dateFullFormat)}
                //授课时间
                var timeObj = <Col span={4} className="class_right">
                    <Col span={24}>
                        <DatePicker
                            key={lessonNum}
                            defaultValue={moment(liveTime, dateFullFormat)}
                            className="lessonTime"
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="Select Time"
                            onChange={_this.lessonTimeOnChange}
                            onOk={_this.lessonTimeOnOk}
                            disabled={currentLessionIsUpdateDisable}
                        />
                    </Col>
                </Col>;

                var uploadList = <Col span={3} className="class_right create_upload"
                >
                    <WeiClassUploadComponents
                        upLoadNumber={i}
                        callBackParent={_this.weiClassUpload}
                        beforeUploadBack={_this.beforeUploadBack}
                        noom={_this.state.weifileList}
                    />
                </Col>;
                var lessonJson = {
                    lessonNum,
                    teacherObj,
                    timeObj,
                    videoNameObj,
                    uploadList,
                    currentLessionIsUpdateDisable,
                    deleteDisable: true,
                    videoStatus,
                    'delete': video.delete,
                    squence,
                    "videoName": name,
                    liveTime
                };
                lessonArray.push(lessonJson);
                _this.setState({lessonArray});
            })
        }
        if(isEmpty(isSeries)==false){
            _this.getAllClass();
        }
        _this.getAllSubject(courseClass);
        _this.setState({
            weifileList: [],
            updateDisabled: isDisable,
            isShowseclect: isShowseclect,
            LessionIsUpdateDisable: LessionIsUpdateDisable
        })
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
                    for (var i = 0; i < response.length; i++) {
                        var classInfo = response[i];
                        var id = classInfo.id;
                        var name = classInfo.name;
                        var optionObj = <Option key={id} value={id}>{name}</Option>;
                        if (id == courseInfoJson.courseClass) {
                            _this.setState({"courseClass": name});
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
                                classOptionArray.push(optionObj);
                                if (id == courseInfoJson.courseClass) {
                                    _this.setState({"courseClass": name});
                                }
                            }
                        }
                        // var optionObj = <Option key={id} value={id}>{name}</Option>;
                        // classOptionArray.push(optionObj);
                    }
                    _this.setState({classOptionArray});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 获取所有的授课科目，并设置默认选中的科目
     */
    getAllSubject(courseClass) {
        var _this = this;
        var methodName = "findCourseSubject";
        if(isEmpty(courseClass)==false && courseClass=='29'){
            methodName = "findRealLessonSubject";
        }
        var param = {
            "method": methodName,
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (isEmpty(response) == false) {
                    var subjectOptionArray = [];
                    for (var i = 0; i < response.length; i++) {
                        var subjectInfo = response[i];
                        var id = subjectInfo.id;
                        var name = subjectInfo.name;
                        var optionObj = <Option key={id} value={id}>{name}</Option>;
                        subjectOptionArray.push(optionObj);
                        if (id == courseInfoJson.courseTypeId) {
                            _this.setState({defaultSubjectSelected: name});
                        }
                    }
                    _this.setState({subjectOptionArray});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    updateCourse() {
        var _this = this;
        if(isEmpty(courseInfoJson.isSeries)){
            //如果是实景课，isSeries设置为1
            courseInfoJson.isSeries = "1";
        }
        var param = {
            "method": 'updateCourse',
            "data": JSON.stringify(courseInfoJson),
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (response) {
                    message.success("课程信息修改成功");
                    _this.setState({"stepNum": 0});
                }
                _this.props.onSaveOk();
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
                teamJsonArray.splice(0);
                for (var i = 0; i < response.length; i++) {
                    var teamJson = {};
                    var teamInfo = response[i];
                    var id = teamInfo.id;
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
                    teamJson.users = users;
                    teamOptionArray.push(optionObj);
                    teamJsonArray.push(teamJson);
                    if (id == courseInfoJson.publisher_id) {
                        _this.setState({"defaultTeamSelected": name});
                    }
                }
                _this.initPageInfo(_this.state.updateClassObj);
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
        var teamUsers;
        for (var i = 0; i < teamJsonArray.length; i++) {
            var teamJson = teamJsonArray[i];
            if (teamJson.teamId == teamId) {
                teamUserOptionArray = teamJson.teamUserOptionArray;
                teamUsers = teamJson.users;
                break;
            }
        }
        this.setState({teamUserOptionArray, teamUsers});
        this.changeVideosSelect(this.state.isTeam, teamUserOptionArray);
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
        this.setState({courseClass: value});
        // courseInfoJson.courseClass = value;

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
        if (isTeam == 1) { // 单人
            //发布者ＩＤ 单人授课时为人员id　团队授课时为团队id
            courseInfoJson.publisherId = this.state.cloudClassRoomUser.colUid;
            courseInfoJson.publishType = 2;
            isSeriesDisabled = false;
            teamDisabled = true;
        } else { // 团队
            courseInfoJson.publisherId = "";
            courseInfoJson.publishType = 1;
            isSeriesDisabled = true;
            teamDisabled = false;
        }
        this.changeVideosSelect(isTeam);
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
     * 授课形式,系列课和单节课
     * @param value
     */
    courseTypeSelectOnChange(value) {
        console.log(`courseTypeSelectOnChange ${value}`);
        courseInfoJson.isSeries = value;
        this.setState({isSeries: value});
    },

    /**
     * 授课团队改变时的响应函数
     * @param value
     */
    teamSelectOnChange(value) {
        console.log(`teamSelectOnChange selected ${value}`);
        //团队授课时,发布者为团队id
        courseInfoJson.publisherId = value;
        this.getTeamUserOptions(value);
        this.setState({"teamId": value, defaultTeamSelected: value});
    },

    /**
     * 修改排课部分的页面显示方式：
     * 单人授课只显示姓名
     * 团队授课显示团队成员的下拉列表
     */
    changeVideosSelect(isTeam) {
        var _this = this;
        var updateClassObj = _this.state.updateClassObj;
        // var isTeam = _this.state.isTeam;
        var videos = updateClassObj.videos;
        if (isEmpty(videos) == false) {
            var lessonNum = 0;
            lessonArray.splice(0);
            videos.forEach(function (video) {
                var squence = video.squence;
                var name = video.name;
                var id = video.id;
                var videoJson = {squence, name, id, 'delete': video.delete};
                _this.buildVideosArray(videoJson, "title");
                lessonNum += 1;
                var liveTime = getLocalTime(video.liveTime);
                var videoNameObj = <Col span={8}>
                    <Input id={lessonNum} defaultValue={video.name} onChange={_this.lessonTitleOnChange}
                           className="noom_input"/>
                </Col>;
                var teacherObj;
                if (isTeam == 1) {
                    teacherObj = <span>{_this.state.cloudClassRoomUser.userName}</span>;
                } else {
                    var videoUser = video.user;
                    var teamUsers = _this.state.teamUsers;
                    var optionsArray = [];
                    if (isEmpty(teamUsers) == false) {
                        teamUsers.forEach(function (user) {
                            var option;
                            if (user.colUid == videoUser.colUid) {
                                option = <option value={user.colUid} selected="selected">{user.userName}</option>
                            } else {
                                option = <option value={user.colUid}>{user.userName}</option>
                            }
                            optionsArray.push(option);
                        });
                    }
                    teacherObj = <Col span={24}>
                        <select className="lessonTeamTeacher course_n">
                            {optionsArray}
                        </select>
                        {/*<Select defaultValue={videoUser}>
                            {optionsArray}
                        </Select>*/}
                    </Col>;
                }
                // defaultValue={moment({liveTime}, dateFullFormat)}
                // value={moment({liveTime}, dateFullFormat)}
                var timeObj = <Col span={4}>
                    <Col span={24}>
                        <DatePicker
                            key={lessonNum}
                            defaultValue={moment(liveTime, dateFullFormat)}
                            className="lessonTime"
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            placeholder="Select Time"
                            onChange={_this.lessonTimeOnChange}
                            onOk={_this.lessonTimeOnOk}
                        />
                    </Col>
                </Col>;
                var lessonJson = {lessonNum, teacherObj, timeObj, videoNameObj};
                lessonArray.push(lessonJson);
                _this.setState({lessonArray});
            })
        }
        /*if(isTeam==1){
            //团队

        }else{
            //个人
        }*/
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
                if (isEmpty(this.state.teamId) == false) {
                    this.getTeamUserOptions(this.state.teamId);
                }
                _this.setState({"stepNum": 1});
                break;
        }
    },
    /**
     * 添加课程目录
     */
    addLesson() {
        var _this = this;
        var maxSequence = this.getMaxSequenceFromCourseInfoJson();
        var videoNumBeforeAdd = this.state.videoNum;
        if (this.state.isSeries == "2" && videoNumBeforeAdd == 1 || this.state.isSeries == "4" && videoNumBeforeAdd == 1) {
            //单节课
            message.error("单节课只能排课一次,无法继续添加课程目录!");
            return;
        }
        var lessonNum = parseInt(maxSequence) + 1;
        var videoNameObj = <Col span={8}>
            <Input id={lessonNum} value="" onChange={this.lessonTitleOnChange} className="noom_input"/>
        </Col>;
        var teacherObj;
        if (this.state.isTeam == 1) {
            teacherObj = <span>{this.state.cloudClassRoomUser.userName}</span>;
        } else {
            teacherObj = <Col span={24}>
                <select className="lessonTeamTeacher course_n">
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
        var uploadList = <Col span={3} className="class_right create_upload"
        >
            <WeiClassUploadComponents
                upLoadNumber={lessonNum}
                callBackParent={_this.weiClassUpload}
                beforeUploadBack={_this.beforeUploadBack}
                noom={_this.state.weifileList}
            />
        </Col>;

        var videoStatus = 1;//未直播
        // var videoJson=courseInfoJson.videos
        var lessonJson = {
            lessonNum,
            teacherObj,
            timeObj,
            videoNameObj,
            uploadList,
            videoStatus,
            'delete': false,
            "squence": lessonNum
        };
        lessonArray.push(lessonJson);
        var newVideoNum = parseInt(videoNumBeforeAdd) + 1;
        courseInfoJson.videoNum = newVideoNum;
        var videoJson = {"squence": lessonNum}
        videoJsonArray.push(videoJson);
        courseInfoJson.videos = videoJsonArray;
        this.setState({lessonArray, "videoNum": newVideoNum});
    },

    /**
     * 从存放数据的courseInfoJson.videos中获取最大的sequence号
     */
    getMaxSequenceFromCourseInfoJson() {
        var maxSequence = 0;
        var length = courseInfoJson.videos.length;
        var lastVideo = courseInfoJson.videos[length - 1];
        if (isEmpty(lastVideo) == false) {
            maxSequence = lastVideo.squence;
            // maxSequence = courseInfoJson.videos.length
        }
        return maxSequence;
    },

    lessonTimeOnChange(squence,value, dateString) {
        var liveTime = dateString;
        var videoJson = {squence, liveTime,videoStatus: 1, 'delete': false};
        this.buildVideosArray(videoJson);
        lessonArray.forEach(function (lessonJson) {
            var squenceInArray = lessonJson.squence;
            if (squenceInArray == squence) {
                lessonJson.liveTime = liveTime;
            }
        });
        var removeVideo = courseInfoJson.videos;
        for (let i = 0; i < removeVideo.length; i++) {
            var lesson = removeVideo[i];
            var squenceInArray = lesson.squence;
            if (squenceInArray == squence) {
                lesson.liveTime = liveTime;
                break;
            }
        }
        this.setState({liveTime: liveTime});
    },

    lessonTimeOnOk(value) {
        console.log('onOk: ', value);
    },
    /**
     * 删除章节时，回调的函数
     */
    removeLesson(removeSequence, index) {
        // var num = parseInt(index) + 1;
        // var num = parseInt(removeSequence);
        // var loseTime = $(".ant-calendar-range-picker")[num].value;
        // this.setState({loseTime, loseTimeIndex: index});

        for (var i = 0; i < lessonArray.length; i++) {
            var lessonJson = lessonArray[i];
            if (lessonJson.squence == removeSequence) {
                lessonArray.splice(i, 1);
                break;
            }
        }
        //点击删除时；将输入的值进行遍历，并删除其值，不存在空值
        var removevideo = courseInfoJson.videos;
        for (let i = 0; i < removevideo.length; i++) {
            var lesson = removevideo[i];
            var squence = lesson.squence;
            // var lessonId  = lesson.id;

            if (squence == removeSequence) {
                removevideo.splice(i, 1);
                break;
            }
        }

        lessonArray.forEach(function (lessonObj) {
            if (lessonObj.lessonNum > removeSequence) {
                lessonObj.lessonNum -= 1;
            }
        });

        var videoNumBeforeRemove = this.state.videoNum;
        var newVideoNum = parseInt(videoNumBeforeRemove) - 1;
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
        } else if (courseInfoJson.isFree == 2 && courseInfoJson.money == 0) {
            message.error("收费课程请输入课程费用");
            checkResult = false;
        } else if (isEmpty(courseInfoJson.courseTypeId)) {
            message.error("请选择课程科目");
            checkResult = false;
        } else if (isEmpty(courseInfoJson.courseClass)) {
            message.error("请选择授课年级");
            checkResult = false;
        } else if (courseInfoJson.classTypeOnChange == 1 && isEmpty(isSeries)) {
            message.error("单人授课时,请选择课程类型");
            checkResult = false;
            [moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]
        } else if (courseInfoJson.classTypeOnChange == 2 && isEmpty(this.state.teamId)) {
            message.error("团队授课时,请选择团队名称");
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
        var lessonTimeTagArray = $(".ant-calendar-range-picker");
        var arr = $('.noom_input');
        courseInfoJson.videoNum = arr.length;
        /*var userId;

        if(this.state.isTeam==1) {
            //发布者ＩＤ 单人授课时为人员id　团队授课时为团队id
            userId = this.state.cloudClassRoomUser.colUid;
        }else{
            userId = this.state.teamId;
        }*/
        for (var i = 0; i < arr.length; i++) {
            var videoJson = {};
            var currentId = arr[i].id;
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
            if (this.state.isWeiClass) {
                videoJson.videoStatus = courseInfoJson.videos[i].videoStatus;
                videoJson.userID = teacher;
                videoJson.liveTime = new Date(time).valueOf();
                videoJson.squence = currentId;
                videoJson.courseId = courseInfoJson.id;
                videoJson.url = courseInfoJson.videos[i].url;
                videoJson.remark = courseInfoJson.videos[i].remark;

            } else {
                videoJson.videoStatus = courseInfoJson.videos[i].videoStatus;
                videoJson.squence = currentId;
                videoJson.courseId = courseInfoJson.id;
                videoJson.userID = teacher;
                videoJson.liveTime = new Date(time).valueOf();
            }

            if (videoJson.squence == 1) {
                courseInfoJson.startTime = videoJson.liveTime;
            }
            //todo 课程结束时间的规则应该修正为videos数组中，经过时间排序后，最后的一个时间
            if (videoJson.squence == arr.length) {
                courseInfoJson.endTime = videoJson.liveTime;
            }
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
        this.updateCourse();
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
        if (isEmpty(lessonImage) == false) {
            var fileJson = {
                uid: Math.random(),
                url: lessonImage,
            }
            fileList.splice(0);
            fileList.push(fileJson);
        }
        if (isEmpty(isRemoved) == false && isRemoved == "removed") {
            lessonImage = "";
        }
        //题目图片答案的图片来源
        courseInfoJson.image = lessonImage;
    },

    /**
     * 编辑课程页面的章节名称改变响应函数
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
        var videoJson = {squence, name, videoStatus: 1, 'delete': false};
        this.buildVideosArray(videoJson, "title");
        // var lessonArray = this.state.lessonArray;
        lessonArray.forEach(function (lessonJson) {
            var squenceInArray = lessonJson.squence;
            var videoName = lessonJson.videoName;
            if (squenceInArray == squence) {
                lessonJson.videoName = name;
            }
        });
        var removeVideo = courseInfoJson.videos;
        for (let i = 0; i < removeVideo.length; i++) {
            var lesson = removeVideo[i];
            var squenceInArray = lesson.squence;
            if (squenceInArray == squence) {
                lesson.name = name;
                break;
            }
        }
        this.setState({value: name});
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
                    everyVideoJson.courseId = videoJson.courseId;
                    everyVideoJson.userID = videoJson.userID;
                    everyVideoJson.url = videoJson.url;
                    everyVideoJson.remark = videoJson.remark;
                }
                everyVideoJson.liveTime = videoJson.liveTime;
                everyVideoJson.videoStatus = videoJson.videoStatus;
                isExistSameVideo = true;
                break;
            }
        }

        if (isExistSameVideo == false) {
            videoJsonArray.push(videoJson);
        }
        courseInfoJson.videos = videoJsonArray;
    },

    teamTeacherSelectOnChange(value) {
        console.log(value);
    },

    isWeiClass(e) {
        this.setState({isWeiClass: e.target.checked});
    },

    isShowClass(e) {
        this.setState({isShowClass: e.target.checked});
        if (e.target.checked) {
            //钩中展示课
            courseInfoJson.showCourse = 1;
        } else {
            courseInfoJson.showCourse = 0;
        }
    },

    removeWeiClass() {

    },

    uploadOnclick(i) {
        uploadClickNum = i;
    },

    /**
     * 微课上传完成的回调
     * @param e
     */
    weiClassUpload(e, index) {
        console.log('上传完成的回调');
        courseInfoJson.videos.forEach(function (v, i) {
            if (v.squence == index) {
                v.url = e.response;
                v.remark = e.name;
            }
        });

    },

    /**
     * 微课上传之前的回调
     * @param e
     */
    beforeUploadBack(e) {
        console.log(e);
        console.log('微课上传之前的回调');

        var weiClassName = {
            name: e.name,
            uid: e.uid
        };
        var weifileList = [
            weiClassName
        ];
        // this.setState({weifileList});
        //设置this.state.weifileList
    },


    /**
     * 勾选是否为测试课的回调
     */
    isTestClass(e) {
        this.setState({isTestClass: e.target.checked});
        if (e.target.checked) {
            courseInfoJson.test = "test";
        } else {
            courseInfoJson.test = "";
        }
    },

    /*
    知识点modal 框
     */
    showSelectKnowledgeModal(){
        this.setState({selectKnowledgeModalIsShow:true})
    },

    closeSelectKnowledgeModal(tags){
        var _this = this;
        console.log("close:"+tags);
         _this.state.tags.splice(0);
        if(isEmpty(tags)==false){
            tags.forEach(function (tag) {
                _this.state.tags.push(tag);
            })
        }
        _this.setState({"selectKnowledgeModalIsShow":false});
    },


    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        //获取时间框的值
        if (isEmpty(_this.state.loseTimeIndex) == false) {
            var loseTimeIndex = _this.state.loseTimeIndex + 1
            $(".ant-calendar-range-picker")[loseTimeIndex].value = _this.state.loseTime;
        }
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
        // 测试课标签是否隐藏
        var isShowTestClass = null;
        if (isEmpty(this.state.test) == false) {
            isShowTestClass =
                <Row>
                    <Checkbox onChange={this.isTestClass} checked={this.state.isTestClass} className="upexam_le_datika">是否为测试课</Checkbox>
                </Row>
        } else {
            isShowTestClass = null;
        }

        if (this.state.stepNum == 0) {
            saveButton = "";
            classStepStatus = "";
            preButton = <Button disabled onClick={this.changeStep.bind(this, "pre")}>上一步</Button>;
            nextButton = <Button onClick={this.changeStep.bind(this, "next")}>下一步</Button>;
            var classRow = null;
            var subjectTitle = "课程分类";
            if(isEmpty(this.state.courseClass)==false && this.state.courseClass != "29"){
                classRow = <Row>
                    <Col span={4}>授课年级：</Col>
                    <Col span={18}>
                        <Select defaultValue={this.state.courseClass} value={this.state.courseClass}
                                style={{width: 120}} disabled={this.state.LessionIsUpdateDisable}
                                onChange={this.classLevelSelectOnChange}>
                            {this.state.classOptionArray}
                        </Select>
                    </Col>
                </Row>;
                subjectTitle = "课程科目";
            }
            stepPanel = <div>
                <Row>
                    <Col span={4}>课程名称：</Col>
                    <Col span={18}>
                        <Input disabled={this.state.LessionIsUpdateDisable} value={this.state.courseName}
                               onChange={this.courseNameOnChange}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>是否免费：</Col>
                    <Col span={18}>
                        <RadioGroup onChange={this.classIsFreeOnChange} value={this.state.isFree}>
                            <Radio style={radioStyle} value={1} className="line_block">
                                免费
                            </Radio>
                            <Radio style={radioStyle} value={2} className="line_block">
                                收费
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
                            <Radio disabled={this.state.updateDisabled} style={radioStyle} value={1}
                                   className="line_block">
                                不限人数
                            </Radio>
                            <Radio disabled={this.state.updateDisabled} style={radioStyle} value={2}
                                   className="line_block">
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
                    <Col span={4}>{subjectTitle}：</Col>
                    <Col span={18}>
                        <Select defaultValue={[this.state.defaultSubjectSelected]}
                                value={this.state.defaultSubjectSelected} style={{width: 120}}
                                onChange={this.courseSelectOnChange} disabled={this.state.LessionIsUpdateDisable}>
                            {this.state.subjectOptionArray}
                        </Select>
                    </Col>
                </Row>
                {classRow}
                {/*<Row>
                    <Col span={4}>授课年级：</Col>
                    <Col span={18}>
                        <Select defaultValue={this.state.courseClass} value={this.state.courseClass}
                                style={{width: 120}} disabled={this.state.LessionIsUpdateDisable}
                                onChange={this.classLevelSelectOnChange}>
                            {this.state.classOptionArray}
                        </Select>
                    </Col>
                </Row>*/}
                <Row>
                    <Col span={4}>授课形式：</Col>
                    <Col span={18} style={{height: 160}}>
                        <RadioGroup onChange={this.classTypeOnChange} value={this.state.isTeam}>
                            <Radio style={radioStyle} value={1} disabled={this.state.updateDisabled}>单人授课</Radio>
                            {/*<Row style={{width: 420}}>*/}
                                {/*<Col span={24} style={{marginLeft: 22}}>选择课程类型：{this.state.isSeriesStr}</Col>*/}
                                {/*<Col span={16}>
									<Select defaultValue={this.state.isSeries} value={this.state.isSeries} style={{ width: 120 }} disabled={this.state.isSeriesDisabled} onChange={this.courseTypeSelectOnChange}>
										<Option value="1">系列课</Option>
										<Option value="2">单节课</Option>
									</Select>
								</Col>*/}
                            {/*</Row>*/}
                            <Radio style={radioStyle} value={2} disabled={this.state.updateDisabled}>
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
                    <Checkbox onChange={this.isShowClass} defaultChecked={false} disabled={this.state.updateDisabled}
                              checked={this.state.isShowClass} className="upexam_le_datika">是否为展示课</Checkbox>
                </Row>
                <Row>
                    <Checkbox onChange={this.isWeiClass} defaultChecked={false} disabled={this.state.updateDisabled}
                              checked={this.state.isWeiClass} className="upexam_le_datika">是否为微课</Checkbox>
                </Row>

                {isShowTestClass}
                {/*<Row>*/}
                {/*<Col span={4}>授课时间：</Col>*/}
                {/*<Col span={18}>*/}
                {/*<RangePicker defaultValue={this.state.classTimeRange} value={this.state.classTimeRange}*/}
                {/*format={dateFormat} onChange={this.classTimeOnChange} />*/}
                {/*</Col>*/}
                {/*</Row>*/}

                <Row>
                    <Col span={4}>课程封面：</Col>
                    <Col span={18}>
                        <ImageAnswerUploadComponents fileList={fileList}
                                                     callBackParent={this.getLessonImageList}
                                                     updateClassObj={this.state.updateClassObj}
                        >
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
                        var deleteDisable = lessonJson.deleteDisable;
                        var videoName = lessonJson.videoName;
                        var InputObj = <Input id={lessonJson.squence} value={videoName}
                                              onChange={_this.lessonTitleOnChange} className="noom_input"/>;

                        var lessonRowObj = <Row>
                            <Col span={3}>第{lessonJson.lessonNum}课时</Col>
                            {/*{lessonJson.videoNameObj}*/}
                            <Col span={8}>{InputObj}</Col>
                            <Col span={4} className="class_right"> {lessonJson.teacherObj}</Col>
                            {/*{lessonJson.timeObj}*/}

                            <Col span={4} className="class_right">

                            </Col>
                            {lessonJson.uploadList}
                            <Col span={2}>
                                <Button icon="delete" className="create_upload_btn"
                                    // disabled={deleteDisable}
                                        onClick={this.removeLesson.bind(this, lessonJson.squence, i)}></Button>
                            </Col>
                            {/*知识点*/}
                            <Col span={24} className="knowledgePoint">
                                <span className="font-14">知识点：</span><Button className="ding_modal_top" onClick={this.showSelectKnowledgeModal}>选择知识点333</Button>
                            </Col>
                        </Row>;
                        everyLessonArray.push(lessonRowObj);
                    }
                }
                stepPanel = <div>
                    <Row>
                        <Col span={4}>总&nbsp;&nbsp;课&nbsp;&nbsp;时：</Col>
                        <Col span={20}>
                            <Input value={this.state.videoNum} disabled={this.state.updateDisabled}
                                   onChange={this.classTimesOnChange}/>
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
                            <Checkbox disabled={this.state.isShowseclect} defaultChecked={this.state.isShowseclect}
                                      onChange={this.publishClassAtNow}>立即发布</Checkbox>
                        </Col>
                    </Row>
                </div>;
            } else {
                if (typeof(this.state.lessonArray) != "undefined") {
                    for (var i = 0; i < this.state.lessonArray.length; i++) {
                        var lessonJson = this.state.lessonArray[i];
                        var deleteDisable = lessonJson.deleteDisable;
                        var videoNameObj = lessonJson.videoNameObj;
                        var videoName = lessonJson.videoName;

                        var InputObj = <Input id={lessonJson.squence} value={videoName}
                                              onChange={_this.lessonTitleOnChange} className="noom_input"/>;
                        var liveTime = lessonJson.liveTime;
                        if(isEmpty(liveTime)){
                            liveTime = getLocalTime(new Date().valueOf());
                        }
                        var timeObj = <Col span={4}>
                            <DatePicker
                                defaultValue={moment(liveTime, dateFullFormat)}
                                className="lessonTime"
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder="Select Time"
                                onChange={_this.lessonTimeOnChange.bind(_this,lessonJson.squence)}
                                onOk={_this.lessonTimeOnOk}
                            />
                        </Col>;
                        var lessonRowObj = <Row>
                            <Col span={4} className="add_left">第{lessonJson.lessonNum}课时</Col>
                            <Col span={8}>{InputObj}</Col>
                            <Col span={4}> {lessonJson.teacherObj}</Col>
                            {timeObj}
                            <Col span={4}>
                                <Button icon="delete" className="create_upload_btn"
                                    // disabled={deleteDisable}
                                        onClick={this.removeLesson.bind(this, lessonJson.squence, i)}></Button>
                            </Col>
                        </Row>;
                        everyLessonArray.push(lessonRowObj);
                    }
                }
                stepPanel = <div>
                    <Row>
                        <Col span={4}>总&nbsp;&nbsp;课&nbsp;&nbsp;时：</Col>
                        <Col span={20}>
                            <Input value={this.state.videoNum} disabled={this.state.updateDisabled}
                                   onChange={this.classTimesOnChange}/>
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
                            <Checkbox disabled={this.state.isShowseclect} defaultChecked={this.state.isShowseclect}
                                      onChange={this.publishClassAtNow}>立即发布</Checkbox>
                        </Col>
                    </Row>
                </div>;
            }
            // <Col span={4}>第{lessonNum}课时</Col>
        }
        ;

        return (
            <div>
                <div className="modal_steps">
                    <Steps current={this.state.stepNum}>
                        <Step title="课程信息" icon={<Icon type="credit-card"/>}/>
                        <Step title="设置课表" icon={<Icon type="smile-o"/>}/>
                    </Steps>
                </div>
                {stepPanel}
                {/*<div>
                    <Row>
                        <Col span={24}>
                            {preButton}
                            {nextButton}
                            {saveButton}
                        </Col>
                    </Row>
                </div>*/}
                <KnowledgePointModal isShow={this.state.selectKnowledgeModalIsShow}  initTags={this.state.tags}
                                      closeSelectKnowledgeModal={this.closeSelectKnowledgeModal}></KnowledgePointModal>
            </div>
        );
    },
});

export default UpdateClassComponents;

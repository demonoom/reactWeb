import React, {PropTypes} from 'react';
import {Card, Radio, Row, Col, Button, Icon, message, Steps, Modal, Form, Pagination, Select, Input} from 'antd';
import {doWebService_CloudClassRoom, TEACH_LIVE_URL} from '../../utils/CloudClassRoomURLUtils';
import {getPageSize} from '../../utils/Const';
import {getLocalTime, formatYMD, formatHM, formatNoSecond} from '../../utils/utils';
import {isEmpty, cutString} from '../../utils/utils';
import ConfirmModal from '../ConfirmModal';
import CreateClassComponents from './CreateClassComponents';
import UpdateClassComponents from './UpdateClassComponents';

const RadioGroup = Radio.Group;
const Step = Steps.Step;
const Search = Input.Search;
var whereJson = {};
var courseInfoJson = {};
var cardArray = [];
const AntMulitiClassComponents = React.createClass({

    getInitialState() {
        return {
            currentPage: 1,
            classFliterValue: "1",  //全部、已发布、未发布
            fliterValue: '0',     //全部、直播课、微课
            isSeries: '',
            classPlayDetailModalVisible: false
        };
    },

    componentDidMount() {
        var _this = this;
        //控制显示的是单节课还是系列课
        var isSeries = _this.props.isSeries;
        var courseClass = _this.props.courseClass;
        var initPageNo = 1;
        this.setState({isSeries, courseClass, currentPage: initPageNo});
        this.getCourseListBySeries(isSeries, courseClass, initPageNo);
    },

    componentWillReceiveProps(nextProps) {
        var isSeries = nextProps.isSeries;
        var courseClass = nextProps.courseClass;
        var initPageNo = 1;
        var classFliterValue = this.state.classFliterValue;
        var fliterValue = this.state.fliterValue;
        classFliterValue = "1";
        fliterValue = "0";
        this.setState({isSeries, courseClass, currentPage: initPageNo, classFliterValue, fliterValue});
        this.getCourseListBySeries(isSeries, courseClass, initPageNo);
    },

    getCourseListBySeries(isSeries, courseClass, initPageNo) {
        this.findCourseByAccountWeb(initPageNo, isSeries, '1', courseClass);
    },

    /**
     * 获取普通课的课程列表
     */
    findCourseByAccountWeb(pageNo, isSeries, is_publish, courseClass) {
        var _this = this;
        var cloudClassRoomUser = JSON.parse(sessionStorage.getItem("cloudClassRoomUser"));
        var param = {
            "method": 'findCourseByAccountWeb',
            "pageNo": pageNo,
            "course_class": courseClass,
            "isseries": '',
            "coursetypeid": '',
            "numPerPage": getPageSize(),
            "is_publish": '0',
            "userId": cloudClassRoomUser.colUid
        };
        if (isEmpty(isSeries) == false) {
            param.isseries = isSeries;
        }
        if (isEmpty(is_publish) == false) {
            param.is_publish = is_publish;
        }
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var pager = ret.pager;
                cardArray.splice(0);
                if (isEmpty(response) == false) {
                    response.forEach(function (course) {
                        _this.buildEveryCard(course, cardArray);
                    });
                } else {
                    var cardObj = <Card className="noDataTipImg">
                        <div>
                            <Icon type="frown-o"/><span>&nbsp;&nbsp;暂无数据</span>
                        </div>
                    </Card>;
                    cardArray.push(cardObj);
                }
                _this.setState({cardArray, total: pager.rsCount});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    buildEveryCard(row, cardArray) {
        var _this = this;
        var id = row.id;
        var courseName = row.courseName;
        var isFree = row.isFree;
        var money = row.money;
        var content;
        if (isEmpty(row.content) == false) {
            content = cutString(row.content, 100);
        } else {
            content = row.content;
        }
        var courseTypeName = row.courseType.name;
        var image = row.image;
        var videoNum = row.videoNum;
        var startTime = formatYMD(row.startTime);
        var endTime = formatYMD(row.endTime);
        var createTime = formatNoSecond(row.createTime);
        var videosArray = row.videos;
        var nameTotal = [];
        videosArray.forEach(function (videoArrayItem) {
            var knowledgeArray = videoArrayItem.knowledgeVideos;
            for (var k = 0; k < knowledgeArray.length; k++) {
                var knowledgeEvery = knowledgeArray[k];
                var knowledgeNameArray = knowledgeEvery.knowledgeInfo.knowledgeName;
                nameTotal.push(knowledgeNameArray + '、');
            }
        })
        var newNameTotal = [nameTotal[0]];
        for (var i = 1; i < nameTotal.length; i++) {
            if (newNameTotal.indexOf(nameTotal[i]) == -1) {
                newNameTotal.push(nameTotal[i])
            }
        }
        var studentNum = row.studentNum;
        var videoLiTagArray = [];
        var videoLiArray = [];
        var firstLiveTime;
        if (isEmpty(videosArray) == false) {
            firstLiveTime = formatNoSecond(videosArray[0].liveTime);
        }
        var isPublish = row.isPublish;
        var isPublishStr;
        var optButtons;
        var isSeries = row.isSeries;
        var endTime;
        if (isEmpty(isSeries) || isSeries == "2") {
            endTime = null;
        } else {
            endTime = <Col span={24}><span className="series_gray_le">结束时间：</span><span
                className="series_gray_ri">{endTime}</span></Col>;
        }
        switch (isPublish) {
            case "1":
                isPublishStr = "已发布";
                //出现删除、详情等按钮
                // if(studentNum==0){
                //     optButtons=<div>
                //         <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑" onClick={_this.editClass.bind(_this,row)}></Button></Col>
                //         <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情" onClick={_this.getClassDetail.bind(_this,row)}></Button></Col>
                //
                //     </div>;
                // }
                if (isSeries == '3' || isSeries == '4') {
                    if (money == 0) {
                        optButtons = <div>
                            {/*<Col span={24}><Button icon="play-circle-o" className="exam-particulars_title liveing_color" title="直播"*/}
                            {/*onClick={_this.getClassPlayDetail.bind(_this, row)}></Button></Col>*/}
                            <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑"
                                                   onClick={_this.editClass.bind(_this, id)}></Button></Col>
                            <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情"
                                                   onClick={_this.getClassDetail.bind(_this, row)}></Button></Col>
                            <Col span={24}><Button icon="delete" className="exam-particulars_title" title="删除"
                                                   disabled={false}
                                                   onClick={_this.showConfirmDrwaModal.bind(_this, id)}></Button></Col>

                        </div>;
                    } else {
                        optButtons = <div>
                            {/*<Col span={24}><Button icon="play-circle-o" className="exam-particulars_title liveing_color" title="直播"*/}
                            {/*onClick={this.getClassPlayDetail.bind(_this, row)}></Button></Col>*/}
                            <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑"
                                                   onClick={_this.editClass.bind(_this, id)}></Button></Col>
                            <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情"
                                                   onClick={_this.getClassDetail.bind(_this, row)}></Button></Col>
                            <Col span={24}><Button icon="delete" className="exam-particulars_title" title="删除"
                                                   disabled={true}
                                                   onClick={_this.showConfirmDrwaModal.bind(_this, id)}></Button></Col>

                        </div>;
                    }
                } else {
                    if (money == 0) {
                        optButtons = <div>
                            <Col span={24}><Button icon="play-circle-o" className="exam-particulars_title liveing_color"
                                                   title="直播"
                                                   onClick={_this.getClassPlayDetail.bind(_this, row)}></Button></Col>
                            <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑"
                                                   onClick={_this.editClass.bind(_this, id)}></Button></Col>
                            <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情"
                                                   onClick={_this.getClassDetail.bind(_this, row)}></Button></Col>
                            <Col span={24}><Button icon="delete" className="exam-particulars_title" title="删除"
                                                   disabled={false}
                                                   onClick={_this.showConfirmDrwaModal.bind(_this, id)}></Button></Col>

                        </div>;
                    } else {
                        optButtons = <div>
                            <Col span={24}><Button icon="play-circle-o" className="exam-particulars_title liveing_color"
                                                   title="直播"
                                                   onClick={this.getClassPlayDetail.bind(_this, row)}></Button></Col>
                            <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑"
                                                   onClick={_this.editClass.bind(_this, id)}></Button></Col>
                            <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情"
                                                   onClick={_this.getClassDetail.bind(_this, row)}></Button></Col>
                            <Col span={24}><Button icon="delete" className="exam-particulars_title" title="删除"
                                                   disabled={true}
                                                   onClick={_this.showConfirmDrwaModal.bind(_this, id)}></Button></Col>

                        </div>;
                    }
                }
                break;
            case "2":
                isPublishStr = "未发布";
                optButtons = <div>
                    <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情"
                                           onClick={_this.getClassDetail.bind(_this, row)}></Button></Col>
                    <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑"
                                           onClick={_this.editClass.bind(_this, id)}></Button></Col>
                    <Col span={24}><Button icon="check-circle-o" className="exam-particulars_title" title="发布"
                                           onClick={_this.showConfirmPushModal.bind(_this, id)}></Button></Col>
                    <Col span={24}><Button icon="delete" className="exam-particulars_title" title="删除"
                                           onClick={_this.showConfirmDrwaModal.bind(_this, id)}></Button></Col>
                </div>;
                break;
            case "3":
                isPublishStr = "已删除";
                optButtons = <div>
                    <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情"
                                           onClick={_this.getClassDetail.bind(_this, row)}></Button></Col>
                    {/*<Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑" onClick={_this.editClass.bind(_this,row)}></Button></Col>*/}
                    <Col span={24}><Button icon="check-circle-o" className="exam-particulars_title" title="发布"
                                           onClick={_this.showConfirmPushModal.bind(_this, id)}></Button></Col>
                </div>;
                break;
        }

        var publisher_id = row.publisher_id;
        var publisher = row.publisher;
        var videos = row.videos;
        var users = row.users;
        var userSpanArray = [];
        if (isEmpty(users) == false) {
            users.forEach(function (user) {
                var userName = user.userName;
                var userSpanObj = <span className="info_school_s">{userName}</span>;
                userSpanArray.push(userSpanObj);
            });
        }
        if (isSeries == "3" || isSeries == "4") {
            //微课
            var cardObj = <Card key={id}>
                <Row>
                    <Col span={4}>
                        <img alt="example" width="100%" src={image}/>
                    </Col>
                    <Col span={18}>
                        <Row className="details_cont">
                            <Row>
                                <Col span={24}>
                                    <span
                                        className="font_gray_33 submenu_left_hidden upexam_float width_area">{courseName}</span>
                                    <span className="series_recall upexam_float margin_left ">{isPublishStr}</span>
                                    <span className="series_recall upexam_float margin_left ">{courseTypeName}</span>
                                    <span className="series_recall upexam_float margin_left ">微课</span>
                                </Col>
                            </Row>
                            <Col span={24} className="price"><span className="c-jg price_between">￥{money}</span><span
                                className="price_between gray_line"></span><span
                                className=" price_between font-14">共{videoNum}课时</span></Col>
                            <Col span={24}><span className="series_gray_le">主讲老师：</span><span
                                className="series_gray_ri">{userSpanArray}</span></Col>
                            <Col span={24}><span className="series_gray_le">创课时间：</span><span
                                className="series_gray_ri">{createTime}
                        </span></Col>
                            <Col span={24}><span className="series_gray_le">知识点：</span><span
                                className="series_gray_ri">{newNameTotal}</span>
                            </Col>
                            <Col span={24}><span className="series_gray_le">课程概述：</span><span
                                className="series_gray_ri">{content}</span></Col>
                        </Row>
                    </Col>
                    <Col span={2}>
                        <Row className="knowledge_ri">
                            {optButtons}
                        </Row>
                    </Col>
                </Row>
            </Card>;
        } else {
            //直播课
            var cardObj = <Card key={id}>
                <Row>
                    <Col span={4}>
                        <img alt="example" width="100%" src={image}/>
                    </Col>
                    <Col span={18}>
                        <Row className="details_cont">
                            <Row>
                                <Col span={24}>
                                    <span
                                        className="font_gray_33 submenu_left_hidden upexam_float width_area">{courseName}</span>
                                    <span className="series_recall upexam_float margin_left ">{isPublishStr}</span>
                                    <span className="series_recall upexam_float margin_left ">{courseTypeName}</span>
                                </Col>
                            </Row>
                            <Col span={24} className="price"><span className="c-jg price_between">￥{money}</span><span
                                className="price_between gray_line"></span><span
                                className=" price_between font-14">共{videoNum}课时</span></Col>
                            <Col span={24}><span className="series_gray_le">主讲老师：</span><span
                                className="series_gray_ri">{userSpanArray}</span></Col>
                            <Col span={24}><span className="series_gray_le">开始时间：</span><span
                                className="series_gray_ri">{firstLiveTime}</span></Col>
                            {endTime}
                            {/*<Col span={24}><span className="series_gray_le">排课时间：</span><span*/}
                            {/*className="series_gray_ri">{firstLiveTime}</span>*/}
                            {/*</Col>*/}
                            {/*<Col span={24}><span className="series_gray_le">知识点：</span><span*/}
                            {/*className="series_gray_ri">{newNameTotal}</span></Col>*/}
                            <Col span={24}><span className="series_gray_le">课程概述：</span><span
                                className="series_gray_ri">{content}</span></Col>
                        </Row>
                    </Col>
                    <Col span={2}>
                        <Row className="knowledge_ri">
                            {optButtons}
                        </Row>
                    </Col>
                </Row>
            </Card>;
        }

        // var cardObj = <Card key={id}>
        //     <Row>
        //         <Col span={4}>
        //             <img alt="example" width="100%" src={image} />
        //         </Col>
        //         <Col span={18}>
        //             <Row className="details_cont">
        //                 <Row>
        //                     <Col span={21} className="font_gray_33 submenu_left_hidden">{courseName}</Col>
        //                     <Col span={3} className="series_recall right_ri">{isPublishStr}</Col>
        //                 </Row>
        //                 <Col span={24} className="price"><span className="c-jg price_between">￥{money}</span><span className="price_between gray_line"></span><span className=" price_between font-14">共{videoNum}课时</span></Col>
        //                 <Col span={24}><span className="series_gray_le">科&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;目：</span><span className="series_gray_ri">{courseTypeName}</span></Col>
        //                 <Col span={24}><span className="series_gray_le">主讲老师：</span><span className="series_gray_ri">{userSpanArray}</span></Col>
        //                 <Col span={24}><span className="series_gray_le">开始时间：</span><span className="series_gray_ri">{startTime}</span></Col>
        //                 {endTime}
        //                 <Col span={24}><span className="series_gray_le">排课时间：</span><span className="series_gray_ri">{firstLiveTime}
        //                 </span></Col>
        //                 <Col span={24}><span className="series_gray_le">课程概述：</span><span className="series_gray_ri">{content}</span></Col>
        //         </Row>
        //         </Col>
        //         <Col span={2}>
        //             <Row className="knowledge_ri">
        //                 {optButtons}
        //             </Row>
        //         </Col>
        //     </Row>
        // </Card>;
        cardArray.push(cardObj);
    },

    /**
     * 查看课程详情
     * @param classId
     */
    getClassDetail(classObj) {
        var isPublish = classObj.isPublish;
        var isPublishStr;
        switch (isPublish) {
            case "1":
                isPublishStr = "已发布";
                break;
            case "2":
                isPublishStr = "未发布";
                break;
            case "3":
                isPublishStr = "已删除";
                break;
        }
        var users = classObj.users;
        var userSpanArray = [];
        users.forEach(function (user) {
            var userName = user.userName;
            var userSpanObj = <li>{userName}</li>;
            userSpanArray.push(userSpanObj);
        });
        var startTime = formatYMD(classObj.startTime);
        var endTime = formatYMD(classObj.endTime);
        var courseTime = formatHM(classObj.courseTime);
        var createTime = formatNoSecond(classObj.createTime);
        var videosArray = classObj.videos;
        var videoLiTagArray = [];
        var videoLiArray = [];
        var isSeries = classObj.isSeries;
        if (isEmpty(videosArray) == false) {
            videosArray.forEach(function (video) {
                var liveTimeStr = formatNoSecond(video.liveTime);
                if (isSeries == "3" || isSeries == "4") {
                    var videoLi = <li className="course_section_info">
                        <span className="name">{video.name}</span>
                        <span className="cont">{video.user.userName}</span>
                    </li>;
                    videoLiArray.push(videoLi);
                } else {
                    var videoLi = <li className="course_section_info">
                        <span className="name">{video.name}</span>
                        <span className="cont">{video.user.userName}</span>
                        <span className="time1">{liveTimeStr}</span>
                    </li>;
                    videoLiTagArray.push(videoLi);
                }


            });
        }
        // console.log("getClassDetail classId:" + classObj.courseName);

        var endTime;

        if (isEmpty(isSeries) || isSeries == "2") {
            endTime = null;
        } else {
            endTime = <Col span={24} className="ant-form-item">
                <span className="series_gray_le">结束时间：</span>
                <span className="series_gray_ri">{endTime}</span>
            </Col>;
        }

        if (isSeries == "3" || isSeries == "4") {
            var classDetailPanel = <Card>
                <Row>
                    <Col span={24}>
                        <img alt="example" width="100%" src={classObj.image}/>
                    </Col>
                    <Col span={24}>
                        <Row className="modal_cloud_info">
                            <Row className="upexam_botom_ma">
                                <Col span={21} className="font_gray_33">{classObj.courseName}</Col>
                                <Col span={3} className="series_recall right_ri">{isPublishStr}</Col>
                            </Row>
                            <Col span={24} className="price ant-form-item">
                                <span className="c-jg price_between" id="picr">￥{classObj.money}</span>
                                <span className="price_between gray_line"></span>
                                <span className=" price_between font-14">共{classObj.videoNum}课时</span>
                            </Col>
                            <Col span={24} className="ant-form-item">
                                <span className="series_gray_le">科&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;目：</span>
                                <span className="series_gray_ri">{classObj.courseType.name}</span>
                            </Col>
                            <Col span={24} className="ant-form-item">
                                <span className="series_gray_le">年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级：</span>
                                <span className="series_gray_ri">{classObj.courseClass}</span>
                            </Col>
                            <Col span={24} className="ant-form-item">
                                <span className="series_gray_le">主讲老师：</span>
                                <span className="series_gray_ri">{userSpanArray}</span>
                            </Col>

                            <Col span={24} className="ant-form-item">
                                <span className="series_gray_le">创课时间：</span>
                                <span className="series_gray_ri">{createTime}</span>
                            </Col>
                            <Col span={24} className="ant-form-item">
                                <span className="series_gray_le">排课时间：</span>
                                <ul>
                                    <li className="course_section">
                                        <div className="course_section_title">
                                            <span className="name">章节名称</span>
                                            <span className="cont">授课老师</span>
                                        </div>
                                    </li>
                                    {videoLiArray}
                                </ul>
                            </Col>
                            <Col span={24}>
                                <span className="series_gray_le">课程概述：</span>
                                <span className="series_gray_ri">{classObj.content}</span>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>;
        } else {
            var classDetailPanel = <Card>
                <Row>
                    <Col span={24}>
                        <img alt="example" width="100%" src={classObj.image}/>
                    </Col>
                    <Col span={24}>
                        <Row className="modal_cloud_info">
                            <Row className="upexam_botom_ma">
                                <Col span={21} className="font_gray_33">{classObj.courseName}</Col>
                                <Col span={3} className="series_recall right_ri">{isPublishStr}</Col>
                            </Row>
                            <Col span={24} className="price ant-form-item">
                                <span className="c-jg price_between" id="picr">￥{classObj.money}</span>
                                <span className="price_between gray_line"></span>
                                <span className=" price_between font-14">共{classObj.videoNum}课时</span>
                            </Col>
                            <Col span={24} className="ant-form-item">
                                <span className="series_gray_le">课程分类：</span>
                                <span className="series_gray_ri">{classObj.courseType.name}</span>
                            </Col>
                            {/*<Col span={24} className="ant-form-item">
                                <span className="series_gray_le">年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级：</span>
                                <span className="series_gray_ri">{classObj.courseClass}</span>
                            </Col>*/}
                            <Col span={24} className="ant-form-item">
                                <span className="series_gray_le">主讲老师：</span>
                                <span className="series_gray_ri">{userSpanArray}</span>
                            </Col>

                            <Col span={24} className="ant-form-item">
                                <span className="series_gray_le">开始时间：</span>
                                <span className="series_gray_ri">{startTime}</span>
                            </Col>
                            {endTime}
                            <Col span={24} className="ant-form-item">
                                <span className="series_gray_le">排课时间：</span>
                                <ul>
                                    <li className="course_section">
                                        <div className="course_section_title">
                                            <span className="name">章节名称</span>
                                            <span className="cont">授课老师</span>
                                            <span className="cont">授课时间</span>
                                        </div>
                                    </li>
                                    {videoLiTagArray}
                                </ul>
                            </Col>
                            <Col span={24}>
                                <span className="series_gray_le">课程概述：</span>
                                <span className="series_gray_ri">{classObj.content}</span>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>;
        }


        this.setState({classDetailModalVisible: true, classDetailPanel});

    },
    /**
     * 更新课程信息
     */
    updateCourse() {
        var _this = this;
        var param = {
            "method": 'updateCoursePublish',
            "data": JSON.stringify(courseInfoJson),
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (response) {
                    message.success("课程信息修改成功");
                }
                _this.findCourseByAccountWeb(_this.state.currentPage, _this.state.isSeries, _this.state.classFliterValue, _this.state.courseClass);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 显示删除操作确认窗口
     * @param classId
     */

    showConfirmDrwaModal(classId) {
        this.setState({classId, isDisabled: true});
        this.refs.confirmDrawModal.changeConfirmModalVisible(true);
    },


    /**
     * 显示删除操作确认窗口
     * @param classId
     */
    showConfirmPushModal(classId) {
        this.setState({classId});
        this.refs.confirmPushModal.changeConfirmModalVisible(true);
    },

    /**
     * 删除课程
     * @param classId
     */
    withDrawClass() {
        courseInfoJson.id = this.state.classId;
        courseInfoJson.isPublish = 3;
        this.closeConfirmDrawModal();
        this.updateCourse();
    },

    /**
     * 发布课程
     * @param classId
     */
    publishClass() {
        courseInfoJson.id = this.state.classId;
        courseInfoJson.isPublish = 1;
        this.closeConfirmPushModal();
        this.updateCourse();
    },

    /**
     * 编辑课程
     * @param classId
     */
    editClass(updateClassId) {
        // console.log("editClass classId:"+classId);
        var _this = this;
        var cloudClassRoomUserObj = JSON.parse(sessionStorage.getItem("cloudClassRoomUser"));
        var param = {
            "method": 'findCourseByCourseId',
            "id": updateClassId,
            "publisher_id": cloudClassRoomUserObj.colUid
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                _this.setState({updateClassObj: response});
                _this.setState({"updateClassModalVisible": true, "isChangeStep": false, stepDirect: ''});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 课程直播
     * @param liveObj（直播对象，普通课程为当前课程，单节课为选定的章节）
     */
    openLive(liveObj, liveType) {
        //0:课程   1 章节  targetType
        var originTime = liveObj.liveTime;
        //获取当前时间 时间戳
        var rightTime = Date.parse(new Date());
        var _this = this;
        var param = {
            "method": 'findVideoById',
            "id": liveObj.id,
        };
        if (originTime > rightTime) {
            message.warning('未到开课时间');
            return;
        }
        //在执行ajax请求前，打开一个空白的新窗口
        var newTab = window.open('about:blank');
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var videoStatus = response.videoStatus;
                if (isEmpty(videoStatus) == false && videoStatus == 3) {
                    _this.setState({"tipModalVisible": true});
                    newTab.close();
                    return;
                }
                var userId = sessionStorage.getItem("ident");
                var targetType = "";
                var targetId = "";
                var title = "";
                var requestUrl = TEACH_LIVE_URL;
                if (liveType == "singleClass") {
                    //单节课（可以直接用课程开课）
                    targetType = 0;
                    targetId = liveObj.id;
                    title = liveObj.courseName;
                } else {
                    //普通课程播放的是具体章节，courseObj代表章节
                    targetType = 1;
                    targetId = liveObj.id;
                    title = liveObj.name;
                }
                requestUrl += userId + "/" + targetType + "/" + targetId + "/" + title;
                // window.open(requestUrl);
                //将之前打开的新窗口重定向到当前指定的路径上（目的：解决在ajax中打开新窗口被拦截的问题）
                newTab.location.href = requestUrl;
            },
            onError: function (error) {
                message.error(error);
                newTab.close();
            }
        });
    },

    /*
    已发布课程点击播放
     */
    getClassPlayDetail(classObj) {
        var _this = this;
        var videosArray = classObj.videos;
        var cloudClassRoomUser = JSON.parse(sessionStorage.getItem("cloudClassRoomUser"));
        var userId = cloudClassRoomUser.colUid;
        var videoLiTagArray = [];
        var startTime = formatYMD(classObj.startTime);
        var originTime = classObj.startTime;
        //获取当前时间 时间戳
        var rightTime = Date.parse(new Date());
        var isSerises = classObj.isSeries
        if (isSerises == '3' || isSerises == '4') {
            //微课
            if (isEmpty(videosArray) == false) {
                videosArray.forEach(function (video) {
                    //播放按钮
                    var playButton;
                    if (video.userID == userId && video.videoStatus != "3") {
                        playButton = <Button icon="play-circle-o" className="exam-particulars_title" title="直播"
                                             onClick={_this.openLive.bind(_this, video, "mulitiClass")}></Button>;
                    }
                    var liveTimeStr = formatNoSecond(video.liveTime);
                    var videoLi = <li className="course_section_info">
                        <span className="name">{video.name}</span>
                        <span className="cont">{video.user.userName}</span>
                        <span className="time1"></span>
                        <span className="cont3">
                            {playButton}
                    </span>
                    </li>;
                    videoLiTagArray.push(videoLi);
                });
            }
            var classDetailPanel = <Card>
                <Row>
                    <Col span={24}>
                        <Row className="modal_cloud_info">
                            <Row className="upexam_botom_ma">
                                <Col span={21} className="font_gray_33">{classObj.courseName}</Col>
                            </Row>
                            <Col span={24} className="ant-form-item">
                                <span className="series_gray_le">排课时间：</span>
                                <ul>
                                    <li className="course_section">
                                        <div className="course_section_title">
                                            <span className="name">章节名称</span>
                                            <span className="cont">授课老师</span>
                                            <span className="cont"></span>
                                            <span className="cont3">操作</span>
                                        </div>
                                    </li>
                                    {videoLiTagArray}
                                </ul>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>;
        } else {
            if (isEmpty(videosArray) == false) {
                videosArray.forEach(function (video) {
                    //播放按钮
                    var playButton;
                    if (video.userID == userId && video.videoStatus != "3") {
                        playButton = <Button icon="play-circle-o" className="exam-particulars_title" title="直播"
                                             onClick={_this.openLive.bind(_this, video, "mulitiClass")}></Button>;
                    }
                    var liveTimeStr = formatNoSecond(video.liveTime);
                    var videoLi = <li className="course_section_info">
                        <span className="name">{video.name}</span>
                        <span className="cont">{video.user.userName}</span>
                        <span className="time1">{liveTimeStr}</span>
                        <span className="cont3">
                            {playButton}
                    </span>
                    </li>;
                    videoLiTagArray.push(videoLi);
                });
            }
            var classDetailPanel = <Card>
                <Row>
                    <Col span={24}>
                        <Row className="modal_cloud_info">
                            <Row className="upexam_botom_ma">
                                <Col span={21} className="font_gray_33">{classObj.courseName}</Col>
                            </Row>
                            <Col span={24} className="ant-form-item">
                                <span className="series_gray_le">排课时间：</span>
                                <ul>
                                    <li className="course_section">
                                        <div className="course_section_title">
                                            <span className="name">章节名称</span>
                                            <span className="cont">授课老师</span>
                                            <span className="cont">授课时间</span>
                                            <span className="cont3">操作</span>
                                        </div>
                                    </li>
                                    {videoLiTagArray}
                                </ul>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>;
        }
        if (originTime > rightTime) {
            this.setState({classPlayDetailModalVisible: false, classDetailPanel});
            message.warning('未到开课时间');
        } else {
            this.setState({classPlayDetailModalVisible: true, classDetailPanel});
        }

    },
    /*
    关闭直播 modal
     */
    classPlayDetailModalHandleCancel() {
        this.setState({classPlayDetailModalVisible: false});
    },

    showCreateClassModal() {
        this.setState({"createClassModalVisible": true});
    },

    createClassModalHandleCancel() {
        this.refs.createClassComponent.changeStep("pre");
        this.refs.createClassComponent.initCreatePage(this.state.isSeries);
        this.setState({"createClassModalVisible": false, "isChangeStep": false, stepDirect: ''});
    },
    /**
     * 课程数据过滤 radio
     * @param e
     */
    fliterOnChange(e) {
        var targetValue = e.target.value;
        this.setState({
            isSeries: targetValue,
            fliterValue: targetValue
        })
        this.findCourseByAccountWeb(this.state.currentPage, targetValue, this.state.classFliterValue, this.state.courseClass);
    },

    /*
    select 数据筛选 已发布 未发布 全部
     */
    slectFilterOnChange(value) {
        this.setState({classFliterValue: value});
        this.findCourseByAccountWeb(this.state.currentPage, this.state.isSeries, value, this.state.courseClass);
    },

    pageOnChange(page) {
        this.findCourseByAccountWeb(page, this.state.isSeries, this.state.classFliterValue, this.state.courseClass);
        this.setState({
            currentPage: page,
        });
    },

    courseAddOk() {
        this.setState({"createClassModalVisible": false, "isChangeStep": false, stepDirect: ''});
        var courseClass = "";
        if (isEmpty(this.state.isSeries)) {
            //实景课的课程列表
            courseClass = '29';
        } else {
            courseClass = this.state.courseClass;
        }
        this.findCourseByAccountWeb(this.state.currentPage, this.state.isSeries, this.state.classFliterValue, courseClass);
    },

    classDetailModalHandleCancel() {
        this.setState({classDetailModalVisible: false});
    },
    /**
     * 编辑课程窗口关闭函数
     */
    updateClassModalHandleCancel() {
        this.setState({updateClassModalVisible: false, "isChangeStep": true, stepDirect: 'pre'});
        this.refs.updateClassComponents.changeStep('pre');
    },
    /**
     * 编辑完成后的处理
     */
    courseUpdateOk() {
        this.setState({"updateClassModalVisible": false, "isChangeStep": true, stepDirect: ''});
        this.findCourseByAccountWeb(this.state.currentPage, this.state.isSeries, this.state.classFliterValue, this.state.courseClass);
    },

    changeStep(direct, optSource) {
        this.setState({"stepDirect": direct, "isChangeStep": true});
        switch (optSource) {
            case "save":
                this.refs.createClassComponent.changeStep(direct);
                break;
            case "update":
                this.refs.updateClassComponents.changeStep(direct);
                break;
        }

    },

    saveClassInfo(optSource) {
        switch (optSource) {
            case "save":
                this.refs.createClassComponent.saveClassInfo();
                break;
            case "update":
                this.refs.updateClassComponents.saveClassInfo();
                break;
        }

    },
    /**
     * 关闭发布操作确认Modal
     */
    closeConfirmPushModal() {
        this.setState({"classId": ''});
        this.refs.confirmPushModal.changeConfirmModalVisible(false);
    },
    /**
     * 关闭删除操作确认Modal
     */
    closeConfirmDrawModal() {
        this.setState({"classId": ''});
        this.refs.confirmDrawModal.changeConfirmModalVisible(false);
    },

    tipModalHandleCancel(){
        this.setState({"tipModalVisible":false,"classDetailModalVisible":false});
        this.getCourseList(this.state.currentPage);
    },
    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var updateButtons;
        var saveButtons;

        if (isEmpty(this.state.stepDirect) || this.state.stepDirect == "pre") {
            saveButtons = [
                <Button onClick={this.changeStep.bind(this, "next", "save")}>下一步</Button>,
                <Button onClick={this.createClassModalHandleCancel}>关闭</Button>
            ];
            var updateButtons = [
                <Button onClick={this.changeStep.bind(this, "next", "update")}>下一步</Button>,
                <Button onClick={this.updateClassModalHandleCancel}>关闭</Button>
            ];
        } else if (this.state.stepDirect == "next") {
            saveButtons = [
                <Button onClick={this.changeStep.bind(this, "pre", "save")}>上一步</Button>,
                <Button onClick={this.saveClassInfo.bind(this, "save")}>提交</Button>,
                <Button onClick={this.createClassModalHandleCancel}>关闭</Button>
            ];
            var updateButtons = [
                <Button onClick={this.changeStep.bind(this, "pre", "update")}>上一步</Button>,
                <Button onClick={this.saveClassInfo.bind(this, "update")}>提交</Button>,
                <Button onClick={this.updateClassModalHandleCancel}>关闭</Button>
            ];
        }

        return (
            <div className="favorite_scroll series_courses">
                <div className="clearfix">
                    <div>
                        <RadioGroup value={this.state.fliterValue} onChange={this.fliterOnChange}
                                    className="series_choose">
                            <Radio value="0">全部</Radio>
                            <Radio value="1">直播课</Radio>
                            <Radio value="3">微课</Radio>
                        </RadioGroup>
                        {/*<Input placeholder="请输入课程名"/>*/}
                        <Select value={this.state.classFliterValue} className='select_publish'
                                onChange={this.slectFilterOnChange}>
                            {/*<Option value="0">全部</Option>*/}
                            <Option value="1">已发布</Option>
                            <Option value="2">未发布</Option>
                        </Select>
                        <div className="details">
                            {this.state.cardArray}
                        </div>
                    </div>

                    <Pagination total={this.state.total} pageSize={getPageSize()} current={this.state.currentPage}
                                onChange={this.pageOnChange}/>
                </div>
                <Modal className="modal_course" title="创建课程" visible={this.state.createClassModalVisible}
                       onCancel={this.createClassModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={saveButtons}
                       width={800}
                >
                    <div className="space">
                        <CreateClassComponents ref="createClassComponent" isSeries={this.state.isSeries}
                                               onSaveOk={this.courseAddOk}></CreateClassComponents>
                    </div>
                </Modal>

                <Modal className="modal_classDetail" title="课程详情" visible={this.state.classDetailModalVisible}
                       onCancel={this.classDetailModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={[
                           <Button onClick={this.classDetailModalHandleCancel}>关闭</Button>
                       ]}
                >
                    <div className="space">
                        {this.state.classDetailPanel}
                    </div>
                </Modal>

                <Modal className="modal_course" title="编辑课程" visible={this.state.updateClassModalVisible}
                       onCancel={this.updateClassModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={updateButtons}
                       width={800}
                >
                    <div className="space">
                        <UpdateClassComponents ref="updateClassComponents" isChangeStep={this.state.isChangeStep}
                                               updateClassObj={this.state.updateClassObj}
                                               onSaveOk={this.courseUpdateOk}></UpdateClassComponents>
                    </div>
                </Modal>

                <ConfirmModal ref="confirmPushModal"
                              title="确定要发布该课程?"
                              onConfirmModalCancel={this.closeConfirmPushModal}
                              onConfirmModalOK={this.publishClass}
                ></ConfirmModal>

                <ConfirmModal ref="confirmDrawModal"
                              title="确定要删除该课程?"
                              onConfirmModalCancel={this.closeConfirmDrawModal}
                              onConfirmModalOK={this.withDrawClass}
                ></ConfirmModal>
                <Modal className="modal_classDetail" title="直播章节" visible={this.state.classPlayDetailModalVisible}
                       onCancel={this.classPlayDetailModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={[
                           <Button onClick={this.classPlayDetailModalHandleCancel}>关闭</Button>
                       ]}
                >
                    <div className="space">
                        {this.state.classDetailPanel}
                    </div>
                </Modal>

                <Modal
                    visible={this.state.tipModalVisible}
                    title="课程状态"
                    onCancel={this.tipModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[]}>
                    <div className="font_center">
                        当前课程已经直播过，稍后请选择其他章节再次开启直播，谢谢！
                    </div>
                </Modal>
            </div>
        );
    },
});

export default AntMulitiClassComponents;

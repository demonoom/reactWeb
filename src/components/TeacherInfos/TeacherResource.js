import React, {PropTypes} from 'react';
import { Breadcrumb, Icon} from 'antd';
import TeacherAllCourseWare from '../TeacherInfos/TeacherAllCourseWare';
import TeacherAllSubjects from '../TeacherInfos/TeacherAllSubjects';


const TeacherResource = React.createClass({

    getInitialState() {
        return {
            currentIdent: 0,
            currentTeachScheduleId: '',
            currentSubjectId: '',
            currentOptType: '',
            defaultActiveKey: '课件',
            activeKey: '课件',
            subjectParams: '',
            breadcrumbArray: [],
            currentKnowledgeName: '',
            dataFilter: 'self',
            subjectDataFilter: 'self',
            currentMenuChildrenCount: -1,
            toolbarExtenderDisplay: false
        };
    },

    showpanle(obj){
        LP.Start(obj);
    },

    render() {
        var mainComponent;
        var breadMenuTip;
        if (this.props.resouceType == "getCourseWares") {
            mainComponent = <TeacherAllCourseWare onPreview={ this.showpanle } ref="courseWare"/>;
            breadMenuTip = "我的资源";
        } else if (this.props.resouceType == "getSubjects") {
            mainComponent = <TeacherAllSubjects ref="teacherAllSubjects"></TeacherAllSubjects>;
            breadMenuTip = "我的题目";
        }
        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">{breadMenuTip}</Breadcrumb.Item>
                </Breadcrumb>
                {mainComponent}
            </div>
        );
    },
});

export default TeacherResource;

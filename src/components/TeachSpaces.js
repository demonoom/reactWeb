import React from  'react';
import {Row, Col, Tabs} from 'antd';
import LessonPlans from './LessonPlans';
import ResourcesCenter from './ResourcesCenter';
import LessonPlanMenus from './LessonPlanMenus';
import KnowledgeMenuComponents from './KnowledgeMenuComponents';
import HomeWorkMenu from './HomeWorkMenu';
import HomeWorkTabComponents from './HomeWorkTabComponents';
import moment from 'moment';
import StudyEvaluateMenu from './StudyEvaluateMenu';
import StudyEvaluateTabComponents from './StudyEvaluateTabComponents';
import ExamMenu from './exam/ExamMenu';
import ExamPagerTabComponents from './exam/ExamPagerTabComponents';
import ExamPagerTableComponents from './exam/ExamPagerTableComponents';
const TabPane = Tabs.TabPane;
// 推荐在入口文件全局设置 locale
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import {createStore} from 'redux';

const store = createStore(function () {
});

class TeachSpaces extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            refData: null,
            collapse: true,
            activeMiddleMenu: 'sub1',
            currentKey: this.props.currentItem,
            openKeysStr: '',
            locale: 'zh-cn',
            showArgs: ''
        }
        this.middleComponent;
        this.tabComponent;
        this.getLessonPlans = this.getLessonPlans.bind(this);
        this.getStudyEvaluate = this.getStudyEvaluate.bind(this);
        this.getResourcesCenter = this.getResourcesCenter.bind(this);
        this.getTeacherHomeWork = this.getTeacherHomeWork.bind(this);
        this.callBackKnowledgeMenuBuildBreadCrume = this.callBackKnowledgeMenuBuildBreadCrume.bind(this);
    }


    componentWillMount() {
        var userIdent = sessionStorage.getItem("ident");
        if (!userIdent) {
            location.hash = "login";
        }
    }

    //获取老师的已布置作业列表
    getTeacherHomeWork(optType) {
        this.refs.homeWorkTabComponents.getTeacherHomeWork(optType);
    }

    getStudyEvaluate(optType) {
        this.refs.studyEvaluateTabComponents.getStudyEvaluate();
    }

    callBackKnowledgeMenuBuildBreadCrume(menuText, menuLevel, menuId, openKeysStr) {
        return this.refs.knowledgeMenuComponents.bulidBreadCrumbArray(menuText, menuLevel, menuId, openKeysStr);

    }

    /**
     * 获取单个试卷的信息，用来完成试卷信息的修改操作
     * 需要切换视图到试卷修改页面
     * @param key
     */
    getExamPagerInfo(subjectInfoJson) {
        this.refs.examPagerTabComponents.getExamPagerInfo(subjectInfoJson);
        // this.setState({activeKey:'修改试卷',currentOpt:'updateExamPager',"updateSubjectInfo":subjectInfoJson});
    }



    // 资源库
    getResourcesCenter(optContent, breadCrumbArray) {

        var optContentArray = optContent.split("#");
        var childrenCount = optContentArray[3];
        sessionStorage.setItem("lastClickMenuChildrenCount", parseInt(childrenCount));
        if (optContentArray[1] != "bySubjectId") {
            this.refs.resourcesCenter.buildBreadcrumb();
        } else {
            this.refs.resourcesCenter.buildBreadcrumb(breadCrumbArray, childrenCount);
        }
        this.refs.resourcesCenter.getTeachPlans(optContent);
    }


    // 备课计划的课件资源
    getLessonPlans(optContent, breadCrumbArray) {


        var optContentArray = optContent.split("#");
        var childrenCount = optContentArray[3];
        let obj = {optContent: optContent, breadCrumbArr: breadCrumbArray ? breadCrumbArray : 0};
        this.setState({refData: obj});
    }




    render() {

        //根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件


        switch (this.props.currentItem) {

            default : // teachTimes

                // 备课计划 LessonPlan  Schedule
                this.middleComponent = <LessonPlanMenus callbackParent={this.getLessonPlans }/>;
                this.tabComponent = <LessonPlans  refData={this.state.refData} />;
                break;
            case 'KnowledgeResources':
                // 知识库
                this.middleComponent = <KnowledgeMenuComponents callbackParent={this.getResourcesCenter }/>;
                this.tabComponent = <ResourcesCenter ref='resourcesCenter' />;
                break;
            case 'homeWork':
                // 布置作业，家庭作业
                //    middleComponent = <HomeWorkMenu callbackParent={this.getTeacherHomeWork}/>
                this.tabComponent = <HomeWorkTabComponents ref="homeWorkTabComponents"/>;
                break;
            case 'studyEvaluate':
                // 学习评价
                //    middleComponent = <StudyEvaluateMenu callbackParent={this.getStudyEvaluate}/>
                this.tabComponent = <StudyEvaluateTabComponents ref="studyEvaluateTabComponents"/>;
                break;
            case 'examination':
                // 组卷
                // middleComponent =  <ExamPagerTableComponents ref="examPagerTable" callBackParent={this.getExamPagerInfo} />;
                this.tabComponent = <ExamPagerTabComponents ref="examPagerTabComponents"/>;
                break;
            case 'teachingAdmin':
                // 教学管理
                // 沿用上次的内容
                break;

        }


        return (
            <Row>
                <Col span={5}>
                    {this.middleComponent}
                </Col>
                <Col span={19}>
                    <div className="ant-layout-container">
                        <div className="ant-layout-content">
                            {this.tabComponent}
                        </div>
                    </div>
                </Col>
            </Row>
        );
    }
}
;
export default TeachSpaces;

  
import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon} from 'antd';
import {Menu, Dropdown} from 'antd';
import CourseWareComponents from './CourseWareComponents';
import SubjectTable from './SubjectTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import CourseWareUploadComponents from './CourseWareUploadComponents';
import SubjectUploadByTextboxio from './SubjectUploadByTextboxio';

const TabPane = Tabs.TabPane;

class LessonPlans extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
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
            courseWareParams: null,
            currentMenuChildrenCount: -1,
            toolbarExtenderDisplay: false

        }

        this.breadcrumbChildren = null;
        this.onChange = this.onChange.bind(this);
    }


    componentWillMount() {
      
        if (this.props.refData) {
            this.buildBreadcrumb(this.props.refData.optContent.split("#"));
        } else {
            this.buildBreadcrumb();
        }

        this.getTeachPlans();
    }


    componentWillReceiveProps(nextProps) {
       let obj = nextProps || this.props.refData ? this.props.refData : null;
        if (!obj)   return;

        this.buildBreadcrumb(obj.optContent.split("#"));
        this.getTeachPlans(obj.optContent);
    }


    getTeachPlans(optContent) {
      
        optContent = optContent || this.props.refData ? this.props.refData.optContent : null;
        if (!optContent)   return;

      
        var optContentArray = optContent.split("#");
        var teachScheduleId = optContentArray[0];
        var optType = optContentArray[1];
        var knowledgeName = optContentArray[2];
        var pageNo = 1;
debugger
        let params={
            ident: sessionStorage.getItem("ident"),
            teachScheduleId: teachScheduleId,
            optType: optType,
            pageNo: pageNo,
            knowledgeName: knowledgeName,
            dataFilter: this.state.dataFilter,
            comeFrom: null,
        }

        this.setState({
            activeKey: '课件',
            currentKnowledgeName: knowledgeName,
            currentTeachScheduleId: teachScheduleId,
            currentOptType: optType,
            courseWareParams: params,
            subjectParams: sessionStorage.getItem("ident") + "#" + teachScheduleId + "#" + 1 + "#" + optType + "#" + knowledgeName + "#" + this.state.dataFilter

        });
    }

    onChange(activeKey) {
      
        if (activeKey == "题目") {
            this.setState({activeKey: '题目'});
            var subjectParams = sessionStorage.getItem("ident") + "#" + this.state.currentTeachScheduleId + "#" + 1 + "#" + this.state.currentOptType + "#" + this.state.currentKnowledgeName + "#" + this.state.subjectDataFilter;
            this.setState({subjectParams:subjectParams});
        } else {

            let params={
                ident: sessionStorage.getItem("ident"),
                teachScheduleId: this.state.currentTeachScheduleId,
                optType: this.state.currentOptType,
                pageNo: 1,
                knowledgeName: this.state.currentKnowledgeName,
                dataFilter: this.state.currentKnowledgeName,
                comeFrom: this.state.dataFilter,
            }
            debugger
            this.setState({activeKey: '课件',courseWareParams: params});
        }
    }

    showModal() {
        this.refs.useKnowledgeComponents.showModal();
    }

    breadClick(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var idStr = target.id;
        var keyArray = idStr.split("*");
        var menuId = keyArray[0];
        var menuLevel = keyArray[1];
        var openKeysStr = keyArray[2];
        var optContent = keyArray[0] + "#" + "bySubjectId" + "#" + target.textContent;
        this.getTeachPlans(optContent);
        var breadCrumbArray = this.props.callBackKnowledgeMenuBuildBreadCrume(target.textContent, menuLevel, menuId, openKeysStr);
        this.buildBreadcrumb(breadCrumbArray);
    }

    //生成面包屑导航
    buildBreadcrumb(breadcrumbArray, childrenCount) {


        if (childrenCount) {
            this.setState({currentMenuChildrenCount: childrenCount});
        }


        if (!breadcrumbArray || !breadcrumbArray.length) {
            breadcrumbArray = [];
        } else {
            this.setState({currentMenuChildrenCount: breadcrumbArray[3]});
        }

        let startNav = [{
            hrefLink: '#/MainLayout',
            hrefText: "首页",
            menuId: 'indexlink',
            menuLevel: 0,
            openKeysStr: this.menuId
        }, {
            hrefLink: '#/MainLayout',
            hrefText: "备课计划",
            menuId: 'resourcesLink',
            menuLevel: 1,
            openKeysStr: this.menuId
        }];
        breadcrumbArray = startNav.concat(breadcrumbArray);

        this.breadcrumbChildren = breadcrumbArray.map((e, i) => {
            let keyref = e.menuId + "*" + e.menuLevel + "*" + e.openKeysStr;
           let htm =  <Breadcrumb.Item key={keyref}><a id={keyref}>{e.hrefText}</a></Breadcrumb.Item>;
            return htm;
        });

        this.setState({activeKey: '课件', breadcrumbArray: breadcrumbArray});

        if (toolbarKey != "KnowledgeResources") {
            this.setState({currentOptType: "bySchedule"});
        } else {
            this.setState({currentOptType: "bySubjectId"});
        }
    }




    /**
     * 课件tab名称右侧的DropDownMenu点击响应处理函数
     * @param key 被点击menu item的key
     */
    menuItemOnClick({key}) {
        
        var clickKey = `${key}`;
        if (this.state.activeKey == "课件") {
            this.setState({dataFilter: clickKey});
            let params={
                ident: sessionStorage.getItem("ident"),
                teachScheduleId: this.state.currentTeachScheduleId,
                optType: this.state.currentOptType,
                pageNo: 1,
                knowledgeName: this.state.currentKnowledgeName,
                dataFilter: clickKey,
                comeFrom: this.state.dataFilter,
            }
            debugger
            this.setState({activeKey: '课件',courseWareParams: params});
        } else {
            this.setState({subjectDataFilter: clickKey});
            var subjectParams = sessionStorage.getItem("ident") + "#" + this.state.currentTeachScheduleId + "#" + 1 + "#" + this.state.currentOptType + "#" + this.state.currentKnowledgeName + "#" + clickKey;
            this.setState({subjectParams:subjectParams});
        }
    }


    /**
     * 课件上传成功后的回调函数
     */
    courseUploadCallBack() {
      
        if (this.state.activeKey == "题目") {
            var subjectParams = sessionStorage.getItem("ident") + "#" + this.state.currentTeachScheduleId + "#" + 1 + "#" + this.state.currentOptType + "#" + this.state.currentKnowledgeName + "#" + this.state.subjectDataFilter + "#fromUpload";
            this.setState({subjectParams:subjectParams});
        } else {
            let params={
                ident: sessionStorage.getItem("ident"),
                teachScheduleId: this.state.currentTeachScheduleId,
                optType: this.state.currentOptType,
                pageNo: 1,
                knowledgeName: this.state.currentKnowledgeName,
                dataFilter: this.state.dataFilter,
                comeFrom: "fromUpload",
            }
debugger
            this.setState({activeKey: '课件',courseWareParams: params});
        }
    }


    render() {
        var tabPanel;
        var subjectTabPanel;
        var toolbarExtra = null;
        const menu = (
            <Menu onClick={this.menuItemOnClick}>
                <Menu.Item key="self">只看自己</Menu.Item>
                <Menu.Item key="other">查看他人</Menu.Item>
            </Menu>
        );


        switch (this.state.currentOptType) {
            case 'bySubjectId':
                tabPanel =
                    <TabPane key="课件" tab={<span>我的资源<Dropdown overlay={menu} trigger={['click']} className='del_right'>
                            <a className="ant-dropdown-link icon_filter" href="#">
                                <Icon type="down-circle-o"/></a></Dropdown></span>}>
                        <CourseWareComponents params={this.state.courseWareParams} />
                    </TabPane>;

                subjectTabPanel =
                    <TabPane key="题目" tab={<span>我的题目<Dropdown overlay={menu} trigger={['click']} className='del_right'>
                <a className="ant-dropdown-link icon_filter" href="#"><Icon
                    type="down-circle-o"/></a></Dropdown></span>}>
                        <SubjectTable   params={this.state.subjectParams}/>
                    </TabPane>;
                break;


            case 'bySchedule':
                tabPanel = <TabPane tab="我的资源" key="课件"><CourseWareComponents params={this.state.courseWareParams}  /></TabPane>;
                subjectTabPanel =
                    <TabPane tab="我的题目" key="题目"><SubjectTable   params={this.state.subjectParams}/></TabPane>
                break;


        }


        if (this.state.currentOptType == "bySubjectId" && sessionStorage.getItem("lastClickMenuChildrenCount") == 0 && sessionStorage.getItem("lastClickMenuId") != null) {
            toolbarExtra = <div className="ant-tabs-right">
                <CourseWareUploadComponents courseUploadCallBack={this.courseUploadCallBack} params={this.state.subjectParams}/>
                <SubjectUploadByTextboxio courseUploadCallBack={this.courseUploadCallBack} params={this.state.subjectParams}/>
            </div>;
        }


        return (
            <div>
                <UseKnowledgeComponents ref="useKnowledgeComponents" />
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                    { this.breadcrumbChildren}
                </Breadcrumb>
				 <div className="favorite_scroll">
                <Tabs
                    hideAdd
                    onChange={this.onChange}
                    onEdit={this.onEdit}
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={toolbarExtra}
                    transitionName=""  //禁用Tabs的动画效果
                >
                    {tabPanel}
                    {subjectTabPanel}
                </Tabs>
				</div>
            </div>
        );
    }
}
;

export default LessonPlans;

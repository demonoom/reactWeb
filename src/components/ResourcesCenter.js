import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon} from 'antd';
import {Menu, Dropdown} from 'antd';
import CourseWareComponents from './CourseWareComponents';
import SubjectTable from './SubjectTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import CourseWareUploadComponents from './CourseWareUploadComponents';
import SubjectUploadComponent from './subjectManager/SubjectUploadComponent';

const TabPane = Tabs.TabPane;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;


class ResourcesCenter extends React.Component{


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
            currentMenuChildrenCount: -1,
            toolbarExtenderDisplay: false

        }

        this.breadcrumbChildren = null;
        this.onChange = this.onChange.bind(this);
        this.showContent = this.showContent.bind(this);
        this.getTeachPlans = this.getTeachPlans.bind(this);
        this.showModal = this.showModal.bind(this);
        this.buildBreadcrumb= this.buildBreadcrumb.bind(this);
        this.menuItemOnClick = this.menuItemOnClick.bind(this);
        this.courseUploadCallBack = this.courseUploadCallBack.bind(this);
        this.render = this.render.bind(this);
    }


    componentWillMount(){
        this.buildBreadcrumb();
       // this.showContent();
    }


    showContent(args){

        let obj = args || this.props.showArgs;
        let refo = {};
        if (!obj){
            refo.optContent = sessionStorage.getItem("lastClickMenuId") + "#" + "bySubjectId" + "#" + sessionStorage.getItem("lastClickMenuName") + "#" + childrenCount;
        }else{
            refo = JSON.parse(obj);
        }
        var optContentArray = refo.optContent.split("#");
        var childrenCount = optContentArray[3];

        this.buildBreadcrumb(refo.breadCrumbArray, childrenCount);
        this.getTeachPlans(refo.optContent);

    }


    getTeachPlans(optContent){

        optContent = optContent || this.props.data;

        var optContentArray = optContent.split("#");
        var optType = optContentArray[1];
        var knowledgeName = optContentArray[2];
        var teachScheduleId = optContentArray[0];
        var pageNo = 1;
        this.setState({
            activeKey: '课件',
            currentKnowledgeName: knowledgeName,
            currentOptType: optType,
            currentTeachScheduleId: teachScheduleId,
            subjectParams: sessionStorage.getItem("ident") + "#" + teachScheduleId + "#" + 1 + "#" + optType + "#" + knowledgeName + "#" + this.state.dataFilter
        });
        this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"), teachScheduleId, optType, pageNo, knowledgeName, this.state.dataFilter);
        let param = {
            ident: sessionStorage.getItem("ident"),
            teachScheduleId : teachScheduleId,
            optType : optType,
            pageNo : pageNo,
            knowledgeName : knowledgeName,
            dataFilter :  this.state.dataFilter

        }
    }

    onChange(activeKey) {
        
        if (activeKey == "题目") {
            var subjectParams = sessionStorage.getItem("ident") + "#" + this.state.currentTeachScheduleId + "#" + 1 + "#" + this.state.currentOptType + "#" + this.state.currentKnowledgeName + "#" + this.state.subjectDataFilter;
            this.setState({subjectParams:subjectParams,activeKey: '题目'});
        } else {
            this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"), this.state.currentTeachScheduleId, this.state.currentOptType, 1, this.state.currentKnowledgeName, this.state.dataFilter);
            this.setState({activeKey: '课件'});
        }
    }

    showModal () {
        this.refs.useKnowledgeComponents.showModal();
    }

    breadClick(e){
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

        this.buildBreadcrumb(breadCrumbArray);
    }

    //生成面包屑导航
    buildBreadcrumb (breadcrumbArray, childrenCount) {

        if (childrenCount) {
            this.setState({currentMenuChildrenCount: childrenCount});
        }

        if (!breadcrumbArray || !breadcrumbArray.length) {
            breadcrumbArray = [];
        }

        let startNav = [
            {hrefLink: '#/MainLayout', hrefText: "首页", menuId: 'indexlink', menuLevel: 0, openKeysStr: this.menuId},
            {hrefLink: '#/MainLayout', hrefText: "知识库", menuId: 'resourcesLink', menuLevel: 1, openKeysStr: this.menuId}
        ];

        breadcrumbArray = startNav.concat(breadcrumbArray);

        this.breadcrumbChildren = breadcrumbArray.map((e, i) => {
            return <Breadcrumb.Item key={e.menuId}><a
                id={e.menuId + "*" + e.menuLevel + "*" + e.openKeysStr}>{e.hrefText}</a></Breadcrumb.Item>
        });

        this.setState({breadcrumbArray: breadcrumbArray, activeKey: '课件'});
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
    menuItemOnClick ({key}) {
        var clickKey = `${key}`;
        if (this.state.activeKey == "课件") {
            this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"), this.state.currentTeachScheduleId, this.state.currentOptType, 1, this.state.currentKnowledgeName, clickKey);
            this.setState({dataFilter: clickKey});
        } else {
            var subjectParams = sessionStorage.getItem("ident") + "#" + this.state.currentTeachScheduleId + "#" + 1 + "#" + this.state.currentOptType + "#" + this.state.currentKnowledgeName + "#" + clickKey;
            this.setState({subjectParams:subjectParams,subjectDataFilter: clickKey});
        }
    }

    /**
     * 课件上传成功后的回调函数
     */
    courseUploadCallBack(){
        if (this.state.activeKey == "题目") {
            var subjectParams = sessionStorage.getItem("ident") + "#" + this.state.currentTeachScheduleId + "#" + 1 + "#" + this.state.currentOptType + "#" + this.state.currentKnowledgeName + "#" + this.state.subjectDataFilter + "#fromUpload";
            this.setState({subjectParams:subjectParams});
        } else {
            this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"), this.state.currentTeachScheduleId, this.state.currentOptType, 1, this.state.currentKnowledgeName, this.state.dataFilter, "fromUpload");
        }
    }


    render() {

        var tabPanel;
        var subjectTabPanel;
        var toolbarExtra = null;

        const menu = (
            <Menu onClick={this.menuItemOnClick}>
                <MenuItemGroup key="subjectCreator">
                    <Menu.Item key="self">只看自己</Menu.Item>
                    <Menu.Item key="other">查看他人</Menu.Item>
                </MenuItemGroup>
            </Menu>
        );

        const subjectMenu = (
            <Menu onClick={this.menuItemOnClick}>
                <MenuItemGroup key="subjectCreator" className="resource_bg_c" title="题目创建者">
                    <Menu.Item key="self" className="resource_bg_w">只看自己</Menu.Item>
                    <Menu.Item key="other" className="resource_bg_w">查看他人</Menu.Item>
                </MenuItemGroup>
                <MenuItemGroup key="subjectOwner" className="resource_bg_c" title="题目归属者">
                    <Menu.Item key="school">只看本校</Menu.Item>
                    <Menu.Item key="all">查看全部</Menu.Item>
                </MenuItemGroup>
            </Menu>
        );

        switch (this.state.currentOptType) {
            case 'bySubjectId':
                tabPanel =
                    <TabPane key="课件" tab={<span>课件<Dropdown overlay={menu} trigger={['click']} className='del_right'>
                            <a className="ant-dropdown-link icon_filter" href="#">
                                <Icon type="down-circle-o"/></a></Dropdown></span>}>
                        <CourseWareComponents ref="courseWare"  />
                    </TabPane>;

                subjectTabPanel =
                    <TabPane key="题目" tab={<span>题目<Dropdown overlay={subjectMenu} trigger={['click']} className='del_right'>
                <a className="ant-dropdown-link icon_filter" href="#"><Icon
                    type="down-circle-o"/></a></Dropdown></span>}>
                        <SubjectTable   params={this.state.subjectParams}/></TabPane>;
                break;


            case 'bySchedule':
                tabPanel = <TabPane tab="课件" key="课件">
                    <CourseWareComponents ref="courseWare"/>
                </TabPane>;
                subjectTabPanel =
                    <TabPane tab="题目" key="题目">
                        <SubjectTable   params={this.state.subjectParams}/>
                    </TabPane>
                break;


        }


        if (this.state.currentOptType == "bySubjectId" && sessionStorage.getItem("lastClickMenuChildrenCount") == 0 && sessionStorage.getItem("lastClickMenuId") != null) {
            toolbarExtra = <div className="talk_ant_btn1_1">
                <CourseWareUploadComponents courseUploadCallBack={this.courseUploadCallBack} params={this.state.subjectParams}/>
                <SubjectUploadComponent courseUploadCallBack={this.courseUploadCallBack} params={this.state.subjectParams}/>
            </div>;
        }


        return (
            <div>
                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                    {this.breadcrumbChildren}
                </Breadcrumb>
				<div className="favorite_scroll">
                <Tabs
                    hideAdd
                    onChange={this.onChange}
                    onEdit={this.onEdit}
                    animated={false}
                    ref="mainTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={toolbarExtra}
                    transitionName=""
                >
                    {tabPanel}
                    {subjectTabPanel}
                </Tabs>
            </div>
			</div>
        );
    }
};

export default ResourcesCenter;

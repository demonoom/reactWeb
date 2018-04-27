import React, {PropTypes} from 'react';
import { Dropdown, Menu, Tabs, Breadcrumb, Icon, message, Button, Pagination,Row,Col} from 'antd';
import CourseWareComponents from './CourseWareComponents';
import SubjectTable from './SubjectTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import CourseWareUploadComponents from './CourseWareUploadComponents';
import SubjectUploadByTextboxio from './SubjectUploadByTextboxio';
import TeachingComponents from '../components/TeachingComponents';
import {doWebService} from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
import ConfirmModal from './ConfirmModal';

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
            toolbarExtenderDisplay: false,
            currentMenu: 'goSchool',
            currentPage: 1,
            contentData: null,
            show: 1,
            lessonCount: 0,
            menuList: [],
            selectedKey: '',
            delScheduleId: '',
        }

        this.children = null;
        this.showModal = this.showModal.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.getLessonMenu = this.getLessonMenu.bind(this);
        this.menuItemOnClick = this.menuItemOnClick.bind(this);
        this.buildMenuChildren = this.buildMenuChildren.bind(this);
        this.deleteTeachSchedule = this.deleteTeachSchedule.bind(this);
        this.showDelScheduleConfirmModal = this.showDelScheduleConfirmModal.bind(this);
        this.onChange = this.onChange.bind(this);
        this.breadcrumbChildren = null;
    }


    componentWillMount() {
        this.getLessonMenu(this.state.currentPage);
    }



    getTeachPlans(optContent) {


        optContent = optContent || this.state.contentData;

        var optContentArray = optContent.split("#");
        var teachScheduleId = optContentArray[0];
        var optType = optContentArray[1];
        var knowledgeName = optContentArray[2];
        var pageNo = 1;

        let params = {
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

    onChange2(activeKey) {

        if (activeKey == "题目") {
            this.setState({activeKey: '题目'});
            var subjectParams = sessionStorage.getItem("ident") + "#" + this.state.currentTeachScheduleId + "#" + 1 + "#" + this.state.currentOptType + "#" + this.state.currentKnowledgeName + "#" + this.state.subjectDataFilter;
            this.setState({subjectParams: subjectParams});
        } else {

            let params = {
                ident: sessionStorage.getItem("ident"),
                teachScheduleId: this.state.currentTeachScheduleId,
                optType: this.state.currentOptType,
                pageNo: 1,
                knowledgeName: this.state.currentKnowledgeName,
                dataFilter: this.state.currentKnowledgeName,
                comeFrom: this.state.dataFilter,
            }

            this.setState({activeKey: '课件', courseWareParams: params});
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
        //  var breadCrumbArray = this.props.callBackKnowledgeMenuBuildBreadCrume(target.textContent, menuLevel, menuId, openKeysStr);
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
            let htm = <Breadcrumb.Item key={keyref}><a id={keyref}>{e.hrefText}</a></Breadcrumb.Item>;
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
            let params = {
                ident: sessionStorage.getItem("ident"),
                teachScheduleId: this.state.currentTeachScheduleId,
                optType: this.state.currentOptType,
                pageNo: 1,
                knowledgeName: this.state.currentKnowledgeName,
                dataFilter: clickKey,
                comeFrom: this.state.dataFilter,
            }
            this.setState({activeKey: '课件', courseWareParams: params});
        } else {
            this.setState({subjectDataFilter: clickKey});
            var subjectParams = sessionStorage.getItem("ident") + "#" + this.state.currentTeachScheduleId + "#" + 1 + "#" + this.state.currentOptType + "#" + this.state.currentKnowledgeName + "#" + clickKey;
            this.setState({subjectParams: subjectParams});
        }
    }


    /**
     * 课件上传成功后的回调函数
     */
    courseUploadCallBack() {

        if (this.state.activeKey == "题目") {
            var subjectParams = sessionStorage.getItem("ident") + "#" + this.state.currentTeachScheduleId + "#" + 1 + "#" + this.state.currentOptType + "#" + this.state.currentKnowledgeName + "#" + this.state.subjectDataFilter + "#fromUpload";
            this.setState({subjectParams: subjectParams});
        } else {
            let params = {
                ident: sessionStorage.getItem("ident"),
                teachScheduleId: this.state.currentTeachScheduleId,
                optType: this.state.currentOptType,
                pageNo: 1,
                knowledgeName: this.state.currentKnowledgeName,
                dataFilter: this.state.dataFilter,
                comeFrom: "fromUpload",
            }

            this.setState({activeKey: '课件', courseWareParams: params});
        }
    }

    getLessonMenu(pageNo) {
        let _this = this;
        var param = {
            "method": 'getTeachScheduls',
            "ident": sessionStorage.getItem("ident"),
            "pageNo": pageNo || 1
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                let List = [];
                ret.response.forEach(function (e) {
                    var scheduleId = e.colTsId;
                    var courseName = e.colTitle;
                    var courseTimes = 0;//当值为0时，系统不显示具体的子菜单数量（即菜单上无徽标显示）
                    List.push([scheduleId, courseName, courseTimes]);
                });
                _this.setState({menuList: List, lessonCount: ret.pager.rsCount});
                _this.buildMenuChildren();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }



    handleClick(e) {

        this.setState({currentMenu: '' + e.key, openSubMenu: e.key});
        var optContent = e.key + "#" + "bySchedule";
        // this.props.callbackParent(optContent);

    }


    /**
     * 备课计划名称右侧的DropDownMenu点击响应处理函数
     * @param key 被点击menu item的key
     */
    menuItemOnClick2({key}) {
        var clickKey = `${key}`;
        var keyArray = clickKey.split("#");
        if (keyArray.length == 2) {
            //修改
            this.showModal('edit', clickKey);
        } else {
            //删除
            this.showDelScheduleConfirmModal(clickKey);
        }
    }

    /**
     * 构建备课计划菜单对象
     * @param menuList 菜单对象值的数组
     */
    buildMenuChildren(menuList) {

        menuList = menuList || this.state.menuList;

        this.children = menuList.map((e, i) => {

            const menu = (
                <Menu onClick={this.menuItemOnClick}>
                    <Menu.Item key={e[0] + "#" + e[1]} className="popup_i_icon"><Icon className="icon_right"
                                                                                      type="edit"/>修改</Menu.Item>
                    <Menu.Item key={e[0]} className="popup_i_icon"><Icon className="icon_right"
                                                                         type="delete"/>删除</Menu.Item>
                </Menu>
            );
            if (i == 0) {

                var optContentObj = e;
                optContentObj.optType = 'bySchedule';
                this.setState({contentData: optContentObj,currentMenu: '' + e[0]});
                //div显示的内容过长时，使用title提示
                if (e[1].length > 10) {
                    return <Menu.Item key={e[0]} >
                        <div title={e[1]} className="submenu_left_hidden title_1">{e[1]}</div>
                        <Dropdown overlay={menu} trigger={['click']} className='del_right'><i
                            className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
                    </Menu.Item>
                } else {
                    return <Menu.Item key={e[0]} style={{backgroundColor: '#e5f2fe'}}>
                        <div className="submenu_left_hidden">{e[1]}</div>
                        <Dropdown overlay={menu} trigger={['click']} className='del_right'><i
                            className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
                    </Menu.Item>
                }
            } else {
                if (e[1].length > 10) {
                    return <Menu.Item key={e[0]}>
                        <div title={e[1]} className="submenu_left_hidden">{e[1]}</div>
                        <Dropdown overlay={menu} trigger={['click']} className='del_right'><i
                            className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
                    </Menu.Item>
                } else {
                    return <Menu.Item key={e[0]}>
                        <div className="submenu_left_hidden">{e[1]}</div>
                        <Dropdown overlay={menu} trigger={['click']} className='del_right'><i
                            className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
                    </Menu.Item>
                }

            }

        });
    }

    onChange(page) {
        this.getLessonMenu(page);
        this.setState({
            currentPage: page,
        });
    }


    /**
     * 删除备课计划
     * @param key 被删除备课计划的id
     */
    deleteTeachSchedule() {
        let _this = this;
        var sids = this.state.delScheduleId;
        var param = {
            "method": 'deleteTeachSchedules',
            "ident": sessionStorage.getItem("ident"),
            "sids": sids
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("备课计划删除成功");
                } else {
                    message.error("备课计划删除失败");
                }
                _this.closeDelScheduleConfirmModal();
                _this.getLessonMenu(_this.state.currentPage);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 新增和修改备课计划的弹窗
     * @param optType 操作方式  add/edit,通过该值区分是新增操作还是修改操作
     * @param editSchuldeId 如果是修改操作，则该值为被修改备课计划的id，不能为空
     */
    showModal(optType, editSchuldeId) {
        optType = (optType == "edit" ? "edit" : "add");
        this.refs.teachingComponents.showModal(optType, editSchuldeId);
    }


    handleMenu() {
        this.getLessonMenu(this.state.currentPage);
    }


    showDelScheduleConfirmModal(scheduleId) {
        this.setState({"delScheduleId": scheduleId});
        this.refs.delScheduleConfirmModal.changeConfirmModalVisible(true);
    }

    closeDelScheduleConfirmModal() {
        this.refs.delScheduleConfirmModal.changeConfirmModalVisible(false);
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
                tabPanel = <TabPane key="课件" tab={<span>我的资源<Dropdown overlay={menu} trigger={['click']} className='del_right'>
                            <a className="ant-dropdown-link icon_filter" href="#">
                                <Icon type="down-circle-o"/></a></Dropdown></span>}>
                    <CourseWareComponents params={this.state.courseWareParams}/>
                </TabPane>;

                subjectTabPanel =
                    <TabPane key="题目" tab={<span>我的题目<Dropdown overlay={menu} trigger={['click']} className='del_right'>
                <a className="ant-dropdown-link icon_filter" href="#"><Icon
                    type="down-circle-o"/></a></Dropdown></span>}>
                        <SubjectTable params={this.state.subjectParams}/>
                    </TabPane>;
                break;


            case 'bySchedule':
                tabPanel = <TabPane tab="我的资源" key="课件"><CourseWareComponents params={this.state.courseWareParams}/></TabPane>;
                subjectTabPanel =
                    <TabPane tab="我的题目" key="题目"><SubjectTable params={this.state.subjectParams}/></TabPane>
                break;


        }


        if (this.state.currentOptType == "bySubjectId" && sessionStorage.getItem("lastClickMenuChildrenCount") == 0 && sessionStorage.getItem("lastClickMenuId") != null) {
            toolbarExtra = <div className="ant-tabs-right">
                <CourseWareUploadComponents
                    courseUploadCallBack={this.courseUploadCallBack}
                    params={this.state.subjectParams}/>
                <SubjectUploadByTextboxio
                    courseUploadCallBack={this.courseUploadCallBack}
                    params={this.state.subjectParams}/>
            </div>;
        }


        return ( <Row>
                <Col span={5}>
                    <ConfirmModal ref="delScheduleConfirmModal"
                                  title="确定要删除该备课计划?"
                                  onConfirmModalCancel={this.closeDelScheduleConfirmModal}
                                  onConfirmModalOK={this.deleteTeachSchedule}
                    />
                    <div className="menu_til"><Button type="primary" icon="plus-circle" onClick={this.showModal}
                                                      className='add_study-d add_study-d-le1'>添加备课计划</Button></div>
                    <TeachingComponents ref="teachingComponents" callbackParent={this.handleMenu}/>
                    <Menu ref="middleMenu" onClick={this.handleClick}
                          className="cont_t2"
                          defaultOpenKeys={['' + this.state.currentMenu]}
                          openKeys={['' + this.state.currentMenu]}
                          selectedKeys={['' + this.state.currentMenu]}
                          mode="inline"
                    >
                        {this.children}
                    </Menu>
                    <Pagination size="small"
                                total={this.state.lessonCount}
                                pageSize={getPageSize()}
                                current={this.state.currentPage}
                                onChange={this.onChange}/>
                </Col>
                <Col span={19}>
                    <div className="ant-layout-container">
                        <UseKnowledgeComponents ref="useKnowledgeComponents"/>
                        <Breadcrumb separator=">">
                            <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                            { this.breadcrumbChildren}
                        </Breadcrumb>
                        <Tabs
                            hideAdd
                            animated={false}
                            onChange={this.onChange2}
                            activeKey={this.state.activeKey}
                            defaultActiveKey={this.state.defaultActiveKey}
                            tabBarExtraContent={toolbarExtra}
                            transitionName=""  //禁用Tabs的动画效果
                        >
                            {tabPanel}
                            {subjectTabPanel}
                        </Tabs>
                    </div>
                </Col>
            </Row>
        );
    }
}


export default LessonPlans;

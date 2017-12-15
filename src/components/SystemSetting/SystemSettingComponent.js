import React from 'react';
import {Row, Col, Tabs} from 'antd';
import moment from 'moment';

const TabPane = Tabs.TabPane;
import SchoolGroupMenu from '../../components/schoolGroupSetting/SchoolGroupMenu';
import SchoolGroupSettingComponents from '../../components/schoolGroupSetting/SchoolGroupSettingComponents';
import FlowSettingComponent from '../../components/flowSetting/FlowSettingComponent';
import {isEmpty} from '../../utils/utils';
import AttendanceSettingComponents from '../../components/Attendance/AttendanceSettingComponents';
import Attendance from '../../components/Attendance/Attendance';
import Role from '../../components/role/Role';
import RoleSettingComponents from '../../components/role/RoleSettingComponents';
// 推荐在入口文件全局设置 locale
import 'moment/locale/zh-cn';

moment.locale('zh-cn');
import {createStore} from 'redux';

const store = createStore(function () {
});

class SystemSettingComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            refData: null,
            collapse: true,
            activeMiddleMenu: 'sub1',
            currentKey: this.props.currentItem,
            openKeysStr: '',
            locale: 'zh-cn',
            showArgs: '',
            selectedId: ''
        }
        this.middleComponent;
        this.tabComponent;
        this.getSubGroup = this.getSubGroup.bind(this);
        this.sendFirstId = this.sendFirstId.bind(this);
        this.changeGroupTab = this.changeGroupTab.bind(this);
        this.editRoleComplete = this.editRoleComplete.bind(this);
        this.changeSchoolGroupSettingCom = this.changeSchoolGroupSettingCom.bind(this);
        this.sendDefaultId = this.sendDefaultId.bind(this);
        this.addSubGroupComplete = this.addSubGroupComplete.bind(this);
        this.attendanceSettingClick = this.attendanceSettingClick.bind(this);
        this.mapShow = this.mapShow.bind(this);
        this.roleGroupClick = this.roleGroupClick.bind(this);
        this.sendDefaultSelected = this.sendDefaultSelected.bind(this);
    }


    componentWillMount() {
        var userIdent = sessionStorage.getItem("ident");
        if (!userIdent) {
            location.hash = "login";
        }
    }

    componentWillReceiveProps(nextProps) {
        if (isEmpty(nextProps.postPos) == false) {
            this.setState({postPos: nextProps.postPos});
        }
    }

    /**
     * 获取当前用户的组织根节点(学校)
     * @param structureId
     * @param structure
     */
    getSubGroup(structureId, structure) {
        this.setState({structureId, rootStructure: structure});
    }

    sendFirstId(firstId, firstName) {
        console.log(firstId);
        this.setState({firstId: firstId});
        this.setState({firstName: firstName});
    }

    changeGroupTab(activeMenu, beActive, selectedKeys, papaKey) {
        this.props.changeTab(activeMenu, beActive, selectedKeys);
        if (activeMenu == "role") {
            this.setState({selectedId: selectedKeys});
        } else {
            this.setState({selectedStructureId: selectedKeys});
        }
        this.setState({papaKey: papaKey, activeMenu});
    }

    /**
     * 系统设置中的角色修改操作的回调
     * @param roleId
     * @param roleName
     */
    editRoleComplete(roleId, roleName, refresh) {
        var selectedId = roleId + "," + roleName;
        this.setState({selectedId});
        this.refs.schoolGroupMenu.initMenuInfo(refresh);
    }

    /**
     * 组织架构添加子部门的回调
     */
    addSubGroupComplete() {
        this.refs.schoolGroupMenu.initMenuInfo();
    }

    changeSchoolGroupSettingCom(currentItem, selectedRoleMenuId, selectedRoleKeyPath) {
        // this.setState({"selectedId":selectedKey});
        if (isEmpty(this.refs.schoolGroupSettingComponents) == false) {
            if (currentItem == "role") {
                this.refs.schoolGroupSettingComponents.changeRightComponent(selectedRoleMenuId, selectedRoleKeyPath, currentItem);
            } else {
                // this.setState({structureId:selectedRoleMenuId,rootStructure:selectedRoleKeyPath});
                this.refs.schoolGroupSettingComponents.changeRightComponent(selectedRoleMenuId, selectedRoleKeyPath, currentItem);
            }
        }
    }

    attendanceSettingClick(key) {
        //根据key值去区分考勤右侧显示什么内容
        this.setState({attendanceKey: key})
    }

    sendDefaultId(defaultId) {
        this.setState({defaultId});
    }

    mapShow() {
        this.props.mapShow();
    }

    roleGroupClick(id) {
        this.setState({roleGroupClick:id})
    }

    sendDefaultSelected(key) {
        this.setState({sendDefaultSelected:key})
    }

    render() {
        //系统设置页面渲染 根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
        switch (this.props.currentItem) {

            default : // teachTimes

                // 组织架构 部门管理 LessonPlan  Schedule
                this.middleComponent = <SchoolGroupMenu ref="schoolGroupMenu" callbackParent={this.getSubGroup}
                                                        rootStructure={this.state.rootStructure}
                                                        changeTab={this.changeGroupTab}
                                                        currentItem={this.props.currentItem}
                                                        sendFirstId={this.sendFirstId}
                                                        onGhostMenuClick={this.changeSchoolGroupSettingCom}
                                                        sendDefaultId={this.sendDefaultId}
                />;
                this.tabComponent = <SchoolGroupSettingComponents structureId={this.state.structureId}
                                                                  selectedId={this.state.selectedId}
                                                                  rootStructure={this.state.rootStructure}
                                                                  currentItem={this.props.currentItem}
                                                                  onEditComplete={this.editRoleComplete}
                                                                  papaKey={this.state.papaKey}
                                                                  firstId={this.state.firstId}
                                                                  defaultId={this.state.defaultId}
                                                                  ref="schoolGroupSettingComponents"
                                                                  addSubGroupComplete={this.addSubGroupComplete}
                ></SchoolGroupSettingComponents>;
                break;
            case 'systemFlow':
                // 审批流程
                this.tabComponent = <FlowSettingComponent></FlowSettingComponent>;
                break;
            case 'noomkaoqing':
                //考勤打卡
                this.middleComponent = <AttendanceSettingComponents
                    attendanceSettingClick={this.attendanceSettingClick}
                />;
                this.tabComponent = <Attendance
                    attendanceChoose={this.state.attendanceKey}
                    mapShow={this.mapShow}
                    postPos={this.state.postPos}
                />;
                break;
            case 'noomjuese':
                //角色
                this.middleComponent = <RoleSettingComponents
                                            roleGroupClick={this.roleGroupClick}
                                            sendDefaultSelected={this.sendDefaultSelected}
                                        />
                this.tabComponent = <Role
                                        roleGroupClick={this.state.roleGroupClick}
                                        sendDefaultSelected={this.state.sendDefaultSelected}
                                    />;
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
export default SystemSettingComponent;

  
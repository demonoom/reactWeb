import React from  'react';
import {Row, Col, Tabs} from 'antd';
import moment from 'moment';
const TabPane = Tabs.TabPane;
import SchoolGroupMenu from '../../components/schoolGroupSetting/SchoolGroupMenu';
import SchoolGroupSettingComponents from '../../components/schoolGroupSetting/SchoolGroupSettingComponents';
import FlowSettingComponent from '../../components/flowSetting/FlowSettingComponent';
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
        this.changeGroupTab = this.changeGroupTab.bind(this);
        this.editRoleComplete = this.editRoleComplete.bind(this);
    }


    componentWillMount() {
        var userIdent = sessionStorage.getItem("ident");
        if (!userIdent) {
            location.hash = "login";
        }
    }

    /**
     * 获取当前用户的组织根节点(学校)
     * @param structureId
     * @param structure
     */
    getSubGroup(structureId,structure){
        this.setState({structureId,rootStructure:structure});
    }

    changeGroupTab(activeMenu, beActive, selectedKeys){
        // alert(selectedKeys);
        this.props.changeTab(activeMenu, beActive, selectedKeys);
        this.setState({selectedId: selectedKeys});
    }

    editRoleComplete(roleId,roleName){
        var selectedId = roleId+","+roleName;
        this.setState({selectedId});
        this.refs.schoolGroupMenu.initMenuInfo();
    }

    render() {
        console.log("1111");
        //系统设置页面渲染 根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
        switch (this.props.currentItem) {

            default : // teachTimes

                // 组织架构 部门管理 LessonPlan  Schedule
                this.middleComponent = <SchoolGroupMenu ref="schoolGroupMenu" callbackParent={this.getSubGroup} rootStructure={this.state.rootStructure} changeTab={this.changeGroupTab} currentItem = {this.props.currentItem}/>;
                this.tabComponent = <SchoolGroupSettingComponents structureId={this.state.structureId}
                                                                  selectedId={this.state.selectedId}
                                                                  rootStructure={this.state.rootStructure}
                                                                  currentItem = {this.props.currentItem}
                                                                  onEditComplete={this.editRoleComplete}
                ></SchoolGroupSettingComponents>;
                break;
            /*case 'systemRole':
                // 组织架构  角色管理
                this.middleComponent = <SchoolGroupMenu callbackParent={this.getSubGroup}/>;
                this.tabComponent = <SchoolGroupSettingComponents structureId={this.state.structureId} rootStructure={this.state.rootStructure}></SchoolGroupSettingComponents>;
                break;
            case 'schoolGroupSetting':
                // 组织架构 部门管理
                this.middleComponent = <SchoolGroupMenu callbackParent={this.getSubGroup}/>;
                this.tabComponent = <SchoolGroupSettingComponents structureId={this.state.structureId} rootStructure={this.state.rootStructure}></SchoolGroupSettingComponents>;
                break;
             */
            case 'systemFlow':
                // 审批流程
                //this.middleComponent = <SchoolGroupMenu callbackParent={this.getSubGroup}/>;
                this.tabComponent = <FlowSettingComponent></FlowSettingComponent>;
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

  
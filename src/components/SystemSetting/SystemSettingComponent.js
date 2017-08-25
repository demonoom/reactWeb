import React from  'react';
import {Row, Col, Tabs} from 'antd';
import moment from 'moment';
const TabPane = Tabs.TabPane;
import SchoolGroupMenu from '../../components/schoolGroupSetting/SchoolGroupMenu';
import SchoolGroupSettingComponents from '../../components/schoolGroupSetting/SchoolGroupSettingComponents';
import FlowSettingComponent from '../../components/flowSetting/FlowSettingComponent';
import {isEmpty} from '../../utils/utils';
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

    sendFirstId(firstId,firstName){
        console.log(firstId);
        // console.log(firstName);
        this.setState({firstId:firstId});
        this.setState({firstName:firstName});
    }
    changeGroupTab(activeMenu, beActive, selectedKeys, papaKey){
        this.props.changeTab(activeMenu, beActive, selectedKeys);
        if(activeMenu=="role"){
            this.setState({selectedId: selectedKeys});
        }else{
            this.setState({selectedStructureId: selectedKeys});
        }
        this.setState({papaKey: papaKey,activeMenu});
    }

    editRoleComplete(roleId,roleName){
        var selectedId = roleId+","+roleName;
        this.setState({selectedId});
        this.refs.schoolGroupMenu.initMenuInfo();
    }

    changeSchoolGroupSettingCom(currentItem,selectedRoleMenuId,selectedRoleKeyPath){
        // this.setState({"selectedId":selectedKey});
        if(isEmpty(this.refs.schoolGroupSettingComponents)==false){
            if(currentItem=="role"){
                this.refs.schoolGroupSettingComponents.changeRightComponent(selectedRoleMenuId,selectedRoleKeyPath);
            }else{
                //this.setState({selectedStructureId: selectedKeys});
            }

        }
    }

    render() {
        // console.log("1111");
        //系统设置页面渲染 根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
        switch (this.props.currentItem) {

            default : // teachTimes

                // 组织架构 部门管理 LessonPlan  Schedule
                this.middleComponent = <SchoolGroupMenu ref="schoolGroupMenu" callbackParent={this.getSubGroup}
                                                        rootStructure={this.state.rootStructure}
                                                        changeTab={this.changeGroupTab}
                                                        currentItem = {this.props.currentItem}
                                                        sendFirstId={this.sendFirstId}
                                                        onGhostMenuClick={this.changeSchoolGroupSettingCom}
                />;
                this.tabComponent = <SchoolGroupSettingComponents structureId={this.state.structureId}
                                                                  selectedId={this.state.selectedId}
                                                                  rootStructure={this.state.rootStructure}
                                                                  currentItem = {this.props.currentItem}
                                                                  onEditComplete={this.editRoleComplete}
                                                                  papaKey={this.state.papaKey}
                                                                  firstId={this.state.firstId}
                                                                  ref="schoolGroupSettingComponents"
                ></SchoolGroupSettingComponents>;
                break;
            case 'systemFlow':
                // 审批流程
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

  
/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Icon, Radio, Button, Row, Col, message,Tree} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
const RadioGroup = Radio.Group;
const TreeNode = Tree.TreeNode;

class MemberSettingModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow:false,
            memberInfo:'',
            checkedKeys:[],
            treeData: [
                { title: 'Expand to load', key: '0' },
                { title: 'Expand to load', key: '1' },
                { title: 'Tree Node', key: '2', isLeaf: true },
            ],
        };
        this.closeMemberSettingModal = this.closeMemberSettingModal.bind(this);
    }

    componentDidMount() {
        var _this = this;
    }

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        var memberInfo = nextProps.memberInfo;
        this.setState({isShow,memberInfo});
    }

    /**
     * 关闭学校设置窗口
     */
    closeMemberSettingModal() {
        this.setState({"isShow": false});
        this.props.onCancel();
    }

    /**
     * 确定完成操作
     */
    handleOk() {
        this.updateStructureChatGroupOwner();
    }

    /**
     * 组织架构树组件选中响应函数
     * @param selectedKeys
     * @param info
     */
    onSelect = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };
    /**
     * 组织架构树组件勾选响应函数
     * @param checkedKeys
     * @param info
     */
    onCheck = (checkedKeys, info) => {
        console.log(checkedKeys);
        console.log(info.checkedNodes[0].key);
        this.setState({checkedKeys:checkedKeys})
    };


    renderTreeNodes = (data) => {
        return data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode title={item.title} key={item.key} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode {...item} dataRef={item} />;
        });
    }

    render() {
        var _this = this;
        return (
            <Modal
                title="员工部门设置"
                visible={this.state.isShow}
                width={540}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                onCancel={this.closeMemberSettingModal}
                onOk={this.handleOk}
                className="schoolgroup_modal"
            >
                <div className="modal_register_main">
                    <Row className="ant_row">
                        <Col span={4} className="schoolgroup_modal_col6">
                            姓名：
                        </Col>
                        <Col span={8}>
                            {this.state.memberInfo.userName}
                        </Col>
                        <Col span={4} className="schoolgroup_modal_col6">
                            手机号：
                        </Col>
                        <Col span={8}>
                            {this.state.memberInfo.phoneNumber}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Tree
                                /*checkable //是否支持选中
                                defaultExpandedKeys={['0-0-0', '0-0-1']}  //默认展开指定的树节点
                                defaultSelectedKeys={['0-0-0', '0-0-1']}  //默认选中的树节点
                                defaultCheckedKeys={['0-0-0', '0-0-1']}   //默认选中复选框的树节点
                                checkedKeys={this.state.checkedKeys}
                                onSelect={this.onSelect}
                                onCheck={this.onCheck}
                                checkStrictly={true}*/
                                loadData={_this.onLoadData}
                            >
                                {/*<TreeNode title="parent 1" key="0-0">
                                    <TreeNode title="parent 1-0" key="0-0-0">
                                        <TreeNode title="leaf0" key="0-0-0-0"/>
                                        <TreeNode title="leaf1" key="0-0-0-1"/>
                                    </TreeNode>
                                    <TreeNode title="parent 1-1" key="0-0-1">
                                        <TreeNode title={<span style={{color: '#08c'}}>s1</span>} key="0-0-1-1"/>
                                        <TreeNode title={<span style={{color: '#08c'}}>s2</span>} key="0-0-1-2"/>
                                        <TreeNode title={<span style={{color: '#08c'}}>s3</span>} key="0-0-1-3"/>
                                    </TreeNode>
                                </TreeNode>*/}
                            </Tree>
                        </Col>
                    </Row>
                </div>
            </Modal>
        );
    }

}

export default MemberSettingModal;

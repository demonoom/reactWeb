/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Icon, Input, Button, Row, Col,message} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';

class AddSubGroupModal extends React.Component {

  constructor(props) {
    super(props);
    var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    this.state = {
      loginUser : loginUser,
      isShow: false,
      parentGroup:'',  //部门信息
      subGroupName:'',   //下级部门名称
    };
    this.closeAddSubGroupModal = this.closeAddSubGroupModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.addRoleGroup = this.addRoleGroup.bind(this);
    this.subGroupNameChange = this.subGroupNameChange.bind(this);
  }

  componentDidMount(){
    var _this = this;
    var isShow = _this.props.isShow;
    this.setState({isShow});
  }

  componentWillReceiveProps(nextProps) {
    var isShow = nextProps.isShow;
    var parentGroup = nextProps.parentGroup;
    var parentGroupName="";
    var parentId = "";
    if(isEmpty(parentGroup)==false){
      parentGroupName = parentGroup.name;
      parentId = parentGroup.id;
    }
    this.setState({isShow,parentGroup,parentGroupName,parentId});
  }

  /**
   * 添加角色组
   */
  addRoleGroup(){
    let _this = this;
    var param = {
      "method": 'createStructrureRoleGroup',
      "operateUserId": _this.state.loginUser.colUid,
      "roleName":_this.state.subGroupName,
    };
      var length = param.roleName.length;
      if(length == 0){
        message.error('角色组名称不能为空');
      }else {
          doWebService(JSON.stringify(param), {
              onResponse: function (ret) {
                  if(ret.msg=="调用成功" && ret.success==true){
                      message.success("角色组添加成功");
                      _this.closeAddSubGroupModal();
                      _this.props.addRoleGroupComplete();
                      _this.state.subGroupName = '';
                  }
              },
              onError: function (error) {
                  message.error(error);
              }
          });
      }
  }


  /**
   * 关闭学校设置窗口
   */
  closeAddSubGroupModal(){
    this.setState({"isShow":false});
    this.props.closeModel();
  }

  /**
   * 确定完成操作
   */
  handleOk(){
    this.addRoleGroup();
  }

  subGroupNameChange(e){
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    var subGroupName = target.value;
    this.setState({subGroupName});
  }

  render() {
    return (
      <Modal
        title="添加角色组"
        visible={this.state.isShow}
        width={440}
        transitionName=""  //禁用modal的动画效果
        closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
        maskClosable={false} //设置不允许点击蒙层关闭
        onCancel={this.closeAddSubGroupModal}
        onOk={this.handleOk}
        className="schoolgroup_modal"
      >
        <div className="modal_register_main">
          <Row className="ant_row">
            <Col span={7} className="framework_m_l">
              <span className="c_from_icon">*</span>角色组名称：
            </Col>
            <Col span={16} className="framework_m_r">
              <Input placeholder="必填" value={this.state.subGroupName} onChange={this.subGroupNameChange}/>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  }

}

export default AddSubGroupModal;

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
    this.addSubGroup = this.addSubGroup.bind(this);
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
   * 添加下级部门
   */
  addSubGroup(){
    let _this = this;
    var param = {
      "method": 'createStucture',
      "operateUserId": _this.state.loginUser.colUid,
      "name":_this.state.subGroupName,
      "parentId":_this.state.parentId
    };
    doWebService(JSON.stringify(param), {
      onResponse: function (ret) {
          if(ret.msg=="调用成功" && ret.success==true){
              message.success("部门添加成功");
              _this.closeAddSubGroupModal();
          }
          _this.props.callbackParent(_this.state.parentId);
      },
      onError: function (error) {
        message.error(error);
      }
    });
  }


  /**
   * 关闭学校设置窗口
   */
  closeAddSubGroupModal(){
    this.setState({"isShow":false});
  }

  /**
   * 确定完成操作
   */
  handleOk(){
    this.addSubGroup();
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
        title="学校设置"
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
            <Col span={6}>
              部门名称：
            </Col>
            <Col span={18}>
              <Input placeholder="必填" value={this.state.subGroupName} onChange={this.subGroupNameChange}/>
            </Col>
          </Row>
          <Row className="ant_row">
            <Col span={6}>
              上级部门：
            </Col>
            <Col span={18}>
              {this.state.parentGroupName}
            </Col>
          </Row>
        </div>
      </Modal>
    );
  }

}

export default AddSubGroupModal;

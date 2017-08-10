/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Icon, Radio, Button, Row, Col,message} from 'antd';
const RadioGroup = Radio.Group;
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';

class GroupSettingModal extends React.Component {

  constructor(props) {
    super(props);
    var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    this.state = {
      loginUser : loginUser,
      isShow: false,
      schoolName:'',  //学校名称
      ownerName:'',   //群主名称
      ownerId:''    //群主id
    };
    this.closeGroupSettingModal = this.closeGroupSettingModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.onOwnerChange = this.onOwnerChange.bind(this);
    this.getChatGroupById = this.getChatGroupById.bind(this);
  }

  componentDidMount(){
    var _this = this;
    var ownerName="";
    var schoolName = "";
    var chatGroupId ="";
    var structureId="";
    var rootStructure = _this.props.rootStructure;
    if(isEmpty(rootStructure) == false){
      schoolName = rootStructure.schoolName;
      chatGroupId = rootStructure.chatGroupId;
      structureId = rootStructure.id;
      var chatGroup = rootStructure.chatGroup;
      var owner = chatGroup.owner;
      if(isEmpty(owner) == false){
        ownerName = owner.userName;
      }
    }
    this.getChatGroupById(chatGroupId);
    var isShow = _this.props.isShow;
    this.setState({isShow,schoolName,ownerName,structureId});
  }

  componentWillReceiveProps(nextProps) {
    var ownerName="";
    var schoolName = "";
    var chatGroupId ="";
    var structureId="";
    var rootStructure = nextProps.rootStructure;
    if(isEmpty(rootStructure) == false){
      schoolName = rootStructure.schoolName;
      chatGroupId = rootStructure.chatGroupId;
      structureId = rootStructure.id;
      var chatGroup = rootStructure.chatGroup;
      var owner = chatGroup.owner;
      if(isEmpty(owner) == false){
        ownerName = owner.userName;
      }
    }
    this.getChatGroupById(chatGroupId);
    var isShow = nextProps.isShow;
    this.setState({isShow,schoolName,ownerName,structureId});
  }

  /**
   * 根据群id获取群对象
   * @param chatGroupId 群id
   */
  getChatGroupById(chatGroupId){
    let _this = this;
    var param = {
      "method": 'getChatGroupById',
      "chatGroupId": chatGroupId,
    };
    doWebService(JSON.stringify(param), {
      onResponse: function (ret) {
        var response = ret.response;
        if(isEmpty(response)==false){
          var members = response.members;
          var ownerId = response.ownerId;
          var memberRadioObjArray=[];
          if(isEmpty(members)==false){
            members.forEach(function (member) {
                var memberId = member.colUid;
                var memberName = member.userName;
                var radioObj = <Radio value={memberId}>{memberName}</Radio>;
                memberRadioObjArray.push(radioObj);
            });
          }
          _this.setState({memberRadioObjArray,ownerId});
        }
      },
      onError: function (error) {
        message.error(error);
      }
    });
  }

  /**
   * 更改组织架构群对应的群主
   * @param chatGroupId 群id
   */
  updateStructureChatGroupOwner(){
    let _this = this;
    var param = {
      "method": 'updateStructureChatGroupOwner',
      "operateUserId": _this.state.loginUser.colUid,
      "structureId":_this.state.structureId,
      "ownerId":_this.state.ownerId
    };
    doWebService(JSON.stringify(param), {
      onResponse: function (ret) {
        if(ret.msg=="调用成功" && ret.success == true){
          message.success("群主设置成功！");
          _this.closeGroupSettingModal();
        }
      },
      onError: function (error) {
        message.error(error);
      }
    });
  }

  /**
   * 关闭学校设置窗口
   */
  closeGroupSettingModal(){
    this.setState({"isShow":false});
  }

  /**
   * 确定完成操作
   */
  handleOk(){
    this.updateStructureChatGroupOwner();
  }

  /**
   * 群主单选按钮组选项改变的响应
   */
  onOwnerChange(e){
    this.setState({
      ownerId: e.target.value,
    });
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
        onCancel={this.closeGroupSettingModal}
        onOk={this.handleOk}
        className="schoolgroup_modal"
      >
        <div className="modal_register_main">
          <Row className="ant_row">
            <Col span={6} className="schoolgroup_modal_col6">
              学校名称：
            </Col>
            <Col span={18}>
              {this.state.schoolName}
            </Col>
          </Row>
          <Row className="ant_row">
            <Col span={6} className="schoolgroup_modal_col6">
              群主：
            </Col>
            <Col span={18}>
              {this.state.ownerName}
            </Col>
          </Row>
          <Row className="ant_row">
            <Col span={6} className="schoolgroup_modal_col6">
              更换群主：
            </Col>
            <Col span={18}>
              <RadioGroup onChange={this.onOwnerChange} value={this.state.ownerId}>
                  {this.state.memberRadioObjArray}
              </RadioGroup>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  }

}

export default GroupSettingModal;

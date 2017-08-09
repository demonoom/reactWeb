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
    this.state = {
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
    var rootStructure = _this.props.rootStructure;
    if(isEmpty(rootStructure) == false){
      schoolName = rootStructure.schoolName;
      chatGroupId = rootStructure.chatGroupId;
      var chatGroup = rootStructure.chatGroup;
      var owner = chatGroup.owner;
      if(isEmpty(owner) == false){
        ownerName = owner.userName;
      }
    }
    var isShow = _this.props.isShow;
    this.setState({isShow,schoolName,ownerName});
  }

  componentWillReceiveProps(nextProps) {
    var ownerName="";
    var schoolName = "";
    var chatGroupId ="";
    var rootStructure = nextProps.rootStructure;
    if(isEmpty(rootStructure) == false){
      schoolName = rootStructure.schoolName;
      chatGroupId = rootStructure.chatGroupId;
      var chatGroup = rootStructure.chatGroup;
      var owner = chatGroup.owner;
      if(isEmpty(owner) == false){
        ownerName = owner.userName;
      }
    }
    var isShow = nextProps.isShow;
    this.setState({isShow,schoolName,ownerName});
  }

  /**
   * 根据部门id获取部门成员
   * @param operateUserId
   * @param structureId
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
      >
        <div className="modal_register_main">
          <Row className="ant_row">
            <Col span={24}>
              学校名称:{this.state.schoolName}
            </Col>
          </Row>
          <Row className="ant_row">
            <Col span={24}>
              群主:{this.state.ownerName}
            </Col>
          </Row>
          <Row className="ant_row">
            <Col span={24}>
              <span>更换群主：</span>
              <RadioGroup onChange={this.onOwnerChange} value={this.state.ownerId}>
                <Radio value={1}>A</Radio>
                <Radio value={2}>B</Radio>
                <Radio value={3}>C</Radio>
                <Radio value={4}>D</Radio>
              </RadioGroup>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  }

}

export default GroupSettingModal;

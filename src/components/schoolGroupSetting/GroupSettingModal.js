/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Icon, Radio, Button, Row, Col,message,Input} from 'antd';
const RadioGroup = Radio.Group;
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
/**
 * 部门设置
 */
class GroupSettingModal extends React.Component {

  constructor(props) {
    super(props);
    var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    this.state = {
      loginUser : loginUser,
      isShow: false,
      parentGroup:'',  //部门信息
    };
    this.closeGroupSettingModal = this.closeGroupSettingModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.getChatGroupById = this.getChatGroupById.bind(this);
    this.getStructureById = this.getStructureById.bind(this);
  }

  componentDidMount(){
    var _this = this;
    var isShow = _this.props.isShow;
    this.setState({isShow});
  }

  componentWillReceiveProps(nextProps) {
    var isShow = nextProps.isShow;
    //部门设置时，获取部门信息
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
   * 获取当前用户的组织根节点
   * @param operateUserId
   * @param structureId
   */
  getStructureById(structureId){
    let _this = this;
    var param = {
      "method": 'getStructureById',
      "operateUserId": _this.state.loginUser.colUid,
      "structureId": structureId,
    };
    doWebService(JSON.stringify(param), {
      onResponse: function (ret) {
        var parentGroup = ret.response;
        _this.setState({parentGroup});

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
            <Col span={24}>
              部门名称:<Input placeholder="部门名称" />
            </Col>
          </Row>
          <Row className="ant_row">
            <Col span={24}>
              部门主管:
            </Col>
          </Row>
          <Row className="ant_row">
            <Col span={24}>
              <span>上级部门：</span>

            </Col>
          </Row>
          <Row className="ant_row">
            <Col span={24}>
              群主设置:
            </Col>
          </Row>
        </div>
      </Modal>
    );
  }

}

export default GroupSettingModal;

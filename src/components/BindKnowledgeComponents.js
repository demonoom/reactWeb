import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';
import { Menu, Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
import { doWebService } from '../WebServiceHelper';

var bindKnowledge;
var options=new Array();
const BindKnowledgeComponents = React.createClass({

  getInitialState() {
    bindKnowledge = this;
    return {
      visible:false,
      selectedKnowledge:'',
      defaultSelected:[],
    };
  },

  getLessonMenu(){
    var param = {
      "method":'getAllKnowledgePoints',
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        var optionContent;
        ret.response.forEach(function (e) {
          optionContent={value: e.id,
            label: e.content};
          var childrendArray = new Array();
          for(var i=0;i<e.children.length;i++){
            var child = e.children[i];
            var childrenContent = {value: child.id,label: child.content}
            childrendArray.push(childrenContent);
          }
          optionContent.children=childrendArray;
          options.push(optionContent);
        });
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  //修改备课计划
  bindPointForTeacher(){
    if(bindKnowledge.state.selectedKnowledge==null || bindKnowledge.state.selectedKnowledge==""){
      alert("请选择具体的知识点完成绑定");
      bindKnowledge.props.callbackParent();
      bindKnowledge.setState({ visible: false });
    }else{
      var param = {
        "method":'bindPointForTeacher',
        "userId":sessionStorage.getItem("ident"),
        "pointId":bindKnowledge.state.selectedKnowledge
      };
      doWebService(JSON.stringify(param), {
        onResponse : function(ret) {
          console.log(ret.msg);
          if(ret.msg=="调用成功" && ret.response==true){
            alert("知识点绑定成功");
          }else{
            alert("知识点绑定失败");
          }
          bindKnowledge.props.callbackParent();
          bindKnowledge.setState({ visible: false });
        },
        onError : function(error) {
          alert(error);
        }
      });
    }
  },

  showModal() {
    this.getLessonMenu();
    bindKnowledge.setState({visible: true,defaultSelected:[]});
  },

  handleCallbackParent: function(val){
    bindKnowledge.props.callbackParent();
    bindKnowledge.setState({ visible: false });
  },

  handleCancel(e) {
    bindKnowledge.setState({ visible: false,defaultSelected:[] });
  },

  cascaderOnChange(value, selectedOptions) {
    console.log("value:"+value, selectedOptions);
    bindKnowledge.setState({defaultSelected:value});
    if(value.length>=2){
      bindKnowledge.setState({selectedKnowledge:value[1]});
    }else{
      bindKnowledge.setState({selectedKnowledge:value[0]});
    }
  },

  render() {
    return (
        <Modal
            visible={bindKnowledge.state.visible}
            title="知识点"
            onCancel={bindKnowledge.handleCancel}
            className="modol_width"
            transitionName=""  //禁用modal的动画效果
            footer={[
              <Button type="primary" htmlType="submit" className="login-form-button" onClick={bindKnowledge.bindPointForTeacher}  >确定</Button>,
              <Button type="ghost" htmlType="reset" className="login-form-button" onClick={bindKnowledge.handleCancel} >取消</Button>
            ]}
        >
          <Row>
              <Col span={6} className="right_look">知识点：</Col>
              <Col span={14}>
                <Cascader
                    ref="knowledgeSelect" className="knowledge_inp"
                    options={options}
                    onChange={bindKnowledge.cascaderOnChange}
                    value={this.state.defaultSelected}
                    placeholder="请选择知识点"
                    showSearch
                />
              </Col>
          </Row>

        </Modal>
    );
  },
});
export  default BindKnowledgeComponents;


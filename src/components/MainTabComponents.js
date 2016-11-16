import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb,Button,Radio } from 'antd';
import CourseWareComponents from './CourseWareComponents';
import SubjectTable from './SubjectTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import RichEditorComponents from './RichEditorComponents';
import SubjectUploadTabComponents from './SubjectUploadTabComponents';




const TabPane = Tabs.TabPane;
//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
  var count =5;
  var rs = confirm("确定要删除这"+count+"条记录吗？");
}


var mt;
const MainTabComponents = React.createClass({

  getInitialState() {
    return {
        currentIdent:0,
        currentTeachScheduleId:'',
        currentSubjectId:'',
        currentOptType:'',
    };
  },
    getTeachPlans(optContent){
        //alert("main :"+teachScheduleId);
        var optContentArray = optContent.split("#");
        var teachScheduleId = optContentArray[0];
        var optType =optContentArray[1];
        //alert(teachScheduleId+"------"+optType);

        this.refs.courseWare.getTeachPlans("23836",teachScheduleId,optType);
        this.setState({currentOptType:optType});
        this.setState({currentTeachScheduleId:teachScheduleId});
    },

  onChange(activeKey) {
      alert(activeKey+"==="+this.refs.subTable);
      alert(this.state.currentOptType+"----"+this.state.currentTeachScheduleId);
      if(activeKey=="题目"){
          this.refs.subTable.getSubjectData("23836",this.state.currentTeachScheduleId,1,this.state.currentOptType);
      }
    //this.setState({ activeKey });
  },

    showModal:function () {
        this.refs.useKnowledgeComponents.showModal();
    },


  render() {
    return (
      <div>
          <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
          <Breadcrumb>
		       <img className="adress_icon" src={require('./images/adress.png')} />
              <Breadcrumb.Item>首页</Breadcrumb.Item>
              <Breadcrumb.Item><a href="">数学</a></Breadcrumb.Item>
              <Breadcrumb.Item><a href="">小学</a></Breadcrumb.Item>
              <Breadcrumb.Item>一年级上</Breadcrumb.Item>
              <Breadcrumb.Item>分一分 认识图形</Breadcrumb.Item>
          </Breadcrumb>
        <Tabs
          hideAdd
          onChange={this.onChange}
          /*type="editable-card"     启用该属性，会使Tab上带有删除的图标*/
          onEdit={this.onEdit}
          tabBarExtraContent={<div className="ant-tabs-right"><Button type="primary" icon="share-alt" onClick={this.showModal}></Button><SubjectUploadTabComponents></SubjectUploadTabComponents><span className="toobar"><Button type="primary" icon="delete" onClick={deleteConfirm}  ></Button></span></div>}
        >
          {/*{this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>
            {pane.content}
          </TabPane>)}*/}
            <TabPane tab="课件" key="课件"><CourseWareComponents ref="courseWare"/></TabPane>
            <TabPane tab="题目" key="题目"><SubjectTable  ref="subTable"/></TabPane>
        </Tabs>
      </div>
    );
  },
});

export default MainTabComponents;

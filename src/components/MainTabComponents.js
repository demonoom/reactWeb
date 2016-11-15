import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import CourseWareComponents from './CourseWareComponents';
import SubjectTable from './SubjectTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import RichEditorComponents from './RichEditorComponents';
import SubjectUploadTabComponents from './SubjectUploadTabComponents';




const TabPane = Tabs.TabPane;
//const operations = <div><Button type="primary" icon="share-alt" onClick={showModal}></Button><SubjectUploadTabComponents></SubjectUploadTabComponents><Button type="primary" icon="delete" onClick={deleteConfirm}></Button></div>;

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
    };
  },
    getTeachPlans(optContent){
        //alert("main :"+teachScheduleId);
        var optContentArray = optContent.split("#");
        var teachScheduleId = optContentArray[0];
        var optType =optContentArray[1];
        //alert(teachScheduleId+"------"+optType);
        this.refs.courseWare.getTeachPlans("23836",teachScheduleId,optType);
        this.setState({currentTeachScheduleId:teachScheduleId});
    },

  onChange(activeKey) {
      console.log(activeKey+"==="+this.refs.subTable);
      if(activeKey=="题目"){
          this.refs.subTable.getSubjectData("23836",this.state.currentTeachScheduleId,1);
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
        <Tabs
          hideAdd
          onChange={this.onChange}
          /*type="editable-card"     启用该属性，会使Tab上带有删除的图标*/
          onEdit={this.onEdit}
          tabBarExtraContent={<div><Button type="primary" icon="share-alt" onClick={this.showModal}></Button><SubjectUploadTabComponents></SubjectUploadTabComponents><Button type="primary" icon="delete" onClick={deleteConfirm}></Button></div>}
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

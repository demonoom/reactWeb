import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import CourseWareComponents from './CourseWareComponents';
import SubjectTable from './SubjectTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import RichEditorComponents from './RichEditorComponents';
import SubjectUploadTabComponents from './SubjectUploadTabComponents';




const TabPane = Tabs.TabPane;
const operations = <div className="ant-tabs-right"><UseKnowledgeComponents ></UseKnowledgeComponents><SubjectUploadTabComponents ></SubjectUploadTabComponents><Button type="primary" icon="delete" onClick={deleteConfirm} style={{display:'inline-block', margin:'0 0 0 12px'}}></Button></div>;

//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
  var count =5;
  var rs = confirm("确定要删除这"+count+"条记录吗？");
}



const MainTabComponents = React.createClass({
  getInitialState() {
    return {

    };
  },
    getTeachPlans(teachScheduleId){
        //alert("main :"+teachScheduleId);
        this.refs.courseWare.getTeachPlans("23836",teachScheduleId);
    },

  onChange(activeKey) {
    this.setState({ activeKey });
  },
  render() {
    return (
      <div>
        <Tabs
          hideAdd
          onChange={this.onChange}
          /*type="editable-card"     启用该属性，会使Tab上带有删除的图标*/
          onEdit={this.onEdit}
          tabBarExtraContent={operations}
        >
          {/*{this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>
            {pane.content}
          </TabPane>)}*/}
            <TabPane tab="课件" key="课件"><CourseWareComponents ref="courseWare"/></TabPane>
            <TabPane tab="题目" key="题目"><SubjectTable/></TabPane>
        </Tabs>
      </div>
    );
  },
});

export default MainTabComponents;

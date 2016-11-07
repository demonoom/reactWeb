import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import CourseWareComponents from './CourseWareComponents';
import SubjectTable from './SubjectTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import RichEditorComponents from './RichEditorComponents';
import SubjectUploadTabComponents from './SubjectUploadTabComponents';




const TabPane = Tabs.TabPane;
const operations = <div><UseKnowledgeComponents></UseKnowledgeComponents><SubjectUploadTabComponents></SubjectUploadTabComponents><Button type="primary" icon="delete" onClick={deleteConfirm}></Button></div>;

//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
  var count =5;
  var rs = confirm("确定要删除这"+count+"条记录吗？");
}

const tabNameArray = [
  {
    title: '课件',
    content: <div>
      <CourseWareComponents/>
    </div>,
    key:'key001'   /*Tab的key值，根据key的不同对Tab进行区分*/
  },
  {
    title: '题目',
    content: <SubjectTable/>,
    key:'2'
  },{
    title: 'rich',
    content: <div>
      <RichEditorComponents value="Test" id="content" width="800" height="200" disabled={false}/>
    </div>,
    key:'3'
  },
];

const MainTabComponents = React.createClass({
  getInitialState() {
    this.newTabIndex = 0;
    const panes = tabNameArray;
    return {
      activeKey: panes[0].key,
      panes,
    };
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
          activeKey={this.state.activeKey}
          /*type="editable-card"     启用该属性，会使Tab上带有删除的图标*/
          onEdit={this.onEdit}
          tabBarExtraContent={operations}
        >
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>
            {pane.content}
          </TabPane>)}
        </Tabs>
      </div>
    );
  },
});

export default MainTabComponents;

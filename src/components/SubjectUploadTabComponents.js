import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import { Modal} from 'antd';
import { Slider } from 'antd';
import RichEditorComponents from './RichEditorComponents';
const RadioGroup = Radio.Group;


const TabPane = Tabs.TabPane;

/*滑动输入框数据范围定义*/
const marks = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: {
    style: {
      color: 'red',
    },
    label: <strong></strong>,
  },
};

const RadioSelect = React.createClass({
  getInitialState() {
    return {
      value: 1,
    };
  },
  onChange(e) {
    console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
    });
  },
  render() {
    return (
      <RadioGroup onChange={this.onChange} value={this.state.value}>
        <Radio key="a" value={1}>A</Radio>
        <Radio key="b" value={2}>B</Radio>
        <Radio key="c" value={3}>C</Radio>
        <Radio key="d" value={4}>D</Radio>
      </RadioGroup>
    );
  },
});

/*单选题面板*/
const SingleSelectPanel = React.createClass({
  getInitialState() {
    return {
    };
  },
  render() {
    return (
      <div style={{height:200}}>
        难度：易&nbsp;<Slider marks={marks} defaultValue={3} step={1} max={7} min={1}/>&nbsp;难<br/>
        题目：<RichEditorComponents value="Test" id="content" width="800" height="200" disabled={false}/>
        答案：<RadioSelect/>
      </div>
    );
  },
});

/*弹出窗口的面板组*/
const tabNameArray = [
  {
    title: '单选题',
    content: <SingleSelectPanel></SingleSelectPanel>,
    key:'key001'   /*Tab的key值，根据key的不同对Tab进行区分*/
  },
  {
    title: '多选题',
    content: 1111,
    key:'2'
  },{
    title: '判断题',
    content: <div>
      12123
    </div>,
    key:'3'
  },{
    title: '简答题',
    content: <div>
      12123
    </div>,
    key:'4'
  },{
    title: '材料题',
    content: <div>
      12123
    </div>,
    key:'5'
  },
];

const SubjectTabComponents = React.createClass({
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
          onEdit={this.onEdit}
        >
          {this.state.panes.map(pane => <TabPane tab={pane.title} key={pane.key}>
            {pane.content}
          </TabPane>)}
        </Tabs>
      </div>
    );
  },
});


const SubjectUploadTabComponents = React.createClass({
  getInitialState() {
    return {
      loading: false,
      visible: false,
    };
  },
  showModal() {
    this.setState({
      visible: true,
    });
  },
  handleOk() {
    // this.setState({ loading: true });
    // setTimeout(() => {
    //   this.setState({ loading: false, visible: false });
    // }, 3000);
    this.setState({ visible: false });
  },
  handleCancel() {
    this.setState({ visible: false });
  },

  handleEmail: function(val){
    this.props.callbackParent(val);
    //this.setState({lessonCount: val});
  },

  render() {
    return (
      <div className="toobar">

        <Button type="primary" onClick={this.showModal} >题目</Button>
        <Modal
          visible={this.state.visible}
          title="添加题目"
          width="616"
          onCancel={this.handleCancel}
          footer={[

          ]}
        >
          <SubjectTabComponents></SubjectTabComponents>
        </Modal>
      </div>
    );
  },
});

export default SubjectUploadTabComponents;

import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox,Table } from 'antd';
import { DatePicker } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

var assignHomeWork;
var classList = [];
var scheduleData = [];
var subjectData = [];
var scheduleColumns = [ {
  title: '教学进度',
  dataIndex: 'scheduleName',
},
];

var subjectColumns = [ {
  title: '内容',
  dataIndex: 'content'
}, {
  title: '题型',
  className:'ant-table-selection-topic',
  dataIndex: 'subjectType',
  filters: [{
    text: '单选题',
    value: '单选题',
  }, {
    text: '多选题',
    value: '多选题',
  }, {
    text: '判断题',
    value: '判断题',
  }, {
    text: '简答题',
    value: '简答题',
  }, {
    text: '材料题',
    value: '材料题',
  },],
  onFilter: (value, record) => record.subjectType.indexOf(value) === 0,
},
];

// const plainOptions = [{label:'xx',value:1}];
var plainOptions = [];
var defaultCheckedList = [];
var sids="";
var clazzIds="";
var dateTime = "";
const AssignHomeWorkComponents = Form.create()(React.createClass({

  getInitialState() {
    assignHomeWork = this;
    //alert(this.props.editSchuldeId);
    return {
      visible: false,
      optType:'add',
      editSchuldeId:this.props.editSchuldeId,
      classCount:0,
      selectedRowKeys: [],  // Check here to configure the default column
      loading: false,
      scheduleCount:0,
      checkedList: defaultCheckedList,
      indeterminate: true,
      checkAll: false,
      selectedSubjectKeys:[],
      subjectCount:0,
      subjectModalVisible:false,
      totalSubjectCount:0,
      currentScheduleId:0,
    };
  },

  doWebService : function(data,listener) {
    var service = this;
    //this.WEBSERVICE_URL = "http://192.168.2.103:8080/Excoord_For_Education/webservice";
    this.WEBSERVICE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
    if (service.requesting) {
      return;
    }
    service.requesting = true;
    $.post(service.WEBSERVICE_URL, {
      params : data
    }, function(result, status) {
      service.requesting = false;
      if (status == "success") {
        listener.onResponse(result);
      } else {
        listener.onError(result);
      }
    }, "json");
  },

  publishHomeworkSubject(ident,sids,clazzIds,dateTime){
    var param = {
      "method":'publishHomeworkSubject',
      "ident":ident,
      "sids":sids,
      "clazzIds":clazzIds,
      "dateTime":dateTime
    };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        // alert(ret.msg);
        // console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response==true){
            alert("作业布置成功");
        }else{
            alert("作业布置失败");
        }
        assignHomeWork.props.callbackParent();
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    var ident=sessionStorage.getItem("ident");
    // sids="";
    // clazzIds="";
    // dateTime = "";
    // alert(sids+"\n"+clazzIds+"\n"+dateTime);
    assignHomeWork.publishHomeworkSubject(ident,sids,clazzIds,dateTime);
  },
  /*handleCancel() {
   assignHomeWork.setState({ visible: false });
  },*/
  handleCancel(e) {
    assignHomeWork.props.callbackParent();
  },
  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  },

  componentDidMount(){
      assignHomeWork.getTeacherClasses(sessionStorage.getItem("ident"));
      // assignHomeWork.getScheduleList();
  },

  //日期控件值改变时，获取当前选择的日期（第一个参数表示的是时间戳，第二个是YYYY-MM-dd格式的日期）
  assignDateOnChange(date, dateString) {
    dateTime = ""+date;
    console.log("assignDate:"+date, dateString);
  },

  getTeacherClasses(ident){
    var param = {
      "method":'getTeacherClasses',
      "ident":ident,
    };

    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        var response = ret.response;
        response.forEach(function (e) {
          console.log("getTeacherClasses:"+e);
          var classArray = e.split("#");
          var classId = classArray[0];
          var className = classArray[1];
          classList.push({label:className,value:classId})
        });
        assignHomeWork.getScheduleList();
        assignHomeWork.setState({classCount:classList.length});
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  classListOnChange:function (checkedValues) {
    console.log('checked = ', checkedValues);
    clazzIds="";
    for(var i=0;i<checkedValues.length;i++){
        var checkedValue=checkedValues[i];
        if(i!=checkedValues.length-1){
          clazzIds+=checkedValue+",";
        }else{
          clazzIds+=checkedValue;
        }
    }
    //
  },

  //获取老师名下的教学进度
  getScheduleList(){
    var param = {
      "method":'getTeachScheduleByIdent',
      "ident":sessionStorage.getItem("ident")
    };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        ret.response.forEach(function (e) {
          var scheduleArray = e.split("#");
          var scheduleId = scheduleArray[0];
          var courseName = scheduleArray[1];
          scheduleData.push({
            key:scheduleId,
            scheduleName:courseName,
            scheduleOpt:'',
          });
        });
        // alert("scheduleData.length:"+scheduleData.length);
        assignHomeWork.setState({scheduleCount:scheduleData.length});
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  onScheduleSelectChange(selectedRowKeys) {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    var scheduleId = selectedRowKeys.key;
    subjectData=[];
    assignHomeWork.getSubjectDataBySchedule(sessionStorage.getItem("ident"),scheduleId,1);
    assignHomeWork.setState({ selectedRowKeys });
    assignHomeWork.setState({ currentScheduleId:scheduleId});
  },

  subjectListOnChange(checkedList) {
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
      checkAll: checkedList.length === plainOptions.length,
    });
  },
  subjectListOnCheckAllChange(e) {
    assignHomeWork.setState({
      checkedList: e.target.checked ? defaultCheckedList : [],
      indeterminate: e.target.checked,
      checkAll: e.target.checked,
    });
  },

  //根据教学进度获取题目列表
  getSubjectDataBySchedule:function (ident,ScheduleOrSubjectId,pageNo) {
    // alert("getSubjectDataBySchedule:"+ident+"==="+ScheduleOrSubjectId);
    var param = {
      "method":'getClassSubjects',
      "ident":ident,
      "teachScheduleId":ScheduleOrSubjectId,
      "pageNo":pageNo
    };

    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("getSubjectDataMSG:"+ret.msg);
        var response = ret.response;
        response.forEach(function (e) {
          console.log("eeeeee:"+e);
          var key = e.sid;
          var content=<article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.shortContent}}></article>;
          var subjectType=e.typeName;
          subjectData.push({
            key: key+"#"+e.shortContent,
            content: content,
            subjectType:subjectType,
          });
          var pager = ret.pager;
          assignHomeWork.setState({totalSubjectCount:parseInt(pager.pageCount)*15});
        });
      },
      onError : function(error) {
        alert(error);
      }

    });
  },

  //题目表格行被选中时获取被选中项目
  onSubjectTableSelectChange(selectedSubjectKeys) {
    console.log('subject selectedRowKeys changed: ', selectedSubjectKeys);
    assignHomeWork.buildSubjectCheckList(selectedSubjectKeys);
    this.setState({ selectedSubjectKeys });
  },

  buildSubjectCheckList(selectedSubjectKeys){
    plainOptions=[];
    //defaultCheckedList = [];
    var i = 0;
    sids="";
    selectedSubjectKeys.forEach(function (e) {
        var subjectArray = e.split("#");
        defaultCheckedList.push(subjectArray[0]);
        plainOptions.push({label:<article id='contentHtml' className='content content_2' dangerouslySetInnerHTML={{__html: subjectArray[1]}} ></article>,value:subjectArray[0]});
        i++;
        if(i!=selectedSubjectKeys.length){
          sids+=subjectArray[0]+",";
        }else{
          sids+=subjectArray[0];
        }
    });
    assignHomeWork.setState({ checkedList:defaultCheckedList,checkAll:true });
  },

  //移除所有已选择的题目
  removeAllSelectedSubject(){
    /*plainOptions.forEach(function (e) {
        alert(e.value);
    })*/
    if(assignHomeWork.state.checkAll==true){
        plainOptions=[];
        defaultCheckedList=[];
        assignHomeWork.setState({selectedSubjectKeys:[]});
        assignHomeWork.setState({ checkedList:defaultCheckedList});
    }else{
        for(var i=0;i<plainOptions.length;i++){
            var checkedListJson = plainOptions[i];
            if(assignHomeWork.removeCheckedList(checkedListJson.value)){
              plainOptions.splice(i,1);
            }
        }
        var selectedKeys=[];
        for(var i=0;i<plainOptions.length;i++){
          var checkedListJson = plainOptions[i];
          selectedKeys.push(checkedListJson.value)
          defaultCheckedList.push(checkedListJson.value);
        }
        assignHomeWork.setState({selectedSubjectKeys:selectedKeys});
        assignHomeWork.setState({ checkedList:defaultCheckedList});
    }
  },

  removeCheckedList(checkedValue){
      for(var i=0;i<assignHomeWork.state.checkedList;i++){
          if(checkedValue==assignHomeWork.state.checkedList[i]){
              return true;
          }
      }
      return false;
  },


  showSubjectModal() {
    assignHomeWork.setState({
      subjectModalVisible: true,
    });
  },
  subjectModalHandleOk() {
    console.log('Clicked OK');
    assignHomeWork.setState({
      subjectModalVisible: false,
    });
  },
  subjectModalHandleCancel(e) {
    console.log(e);
    assignHomeWork.setState({
      subjectModalVisible: false,
    });
  },
  //设置禁用今天之前的日期
/*  disabledDate(current) {
    return current && current.valueOf() < Date.now();
  },*/

  pageOnChange(pageNo) {
    console.log(pageNo);
    assignHomeWork.getSubjectDataBySchedule(sessionStorage.getItem("ident"),assignHomeWork.state.currentScheduleId,pageNo);
    this.setState({
      currentPage: pageNo,
    });
  },


  render() {
    const { getFieldDecorator } = assignHomeWork.props.form;
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
    };


    const { loading, selectedSubjectKeys } = assignHomeWork.state;
    const subjectRowSelection = {
      selectedRowKeys:selectedSubjectKeys,
      onChange: assignHomeWork.onSubjectTableSelectChange,
    };
    const hasSelected = selectedSubjectKeys.length > 0;

    return (
        <div>
		 
          <Form vertical onSubmit={assignHomeWork.handleSubmit} className="homework">
		   <div className="ant-collapse ant-modal-footer">
            <FormItem
                {...formItemLayout}
                label={(
                    <span className="date_tr">
              日期&nbsp;
            </span>
                )}
                hasFeedback
            >
              {getFieldDecorator('assignDate')(
                  <span><DatePicker onChange={assignHomeWork.assignDateOnChange} /></span>
              )}
            </FormItem>

            <FormItem
                {...formItemLayout}
                label={(
                    <span className="date_tr">
              班级&nbsp;
            </span>
                )}
                hasFeedback
            >
              {getFieldDecorator('classList')(
                  <CheckboxGroup options={classList} onChange={assignHomeWork.classListOnChange}/>
              )}
            </FormItem>

            <FormItem
                {...formItemLayout}
                label={(
                    <span className="date_tr">
              题目&nbsp;
            </span>
                )}
                hasFeedback
            >
              {getFieldDecorator('scheduleList')(
                  <div>
                    {/*                <Row>
                     <Col span={24}>已选择题目</Col>
                     </Row>*/}
                    <Row>
                      <Col span={24}>
                        <div>
                          <Button type="primary" onClick={assignHomeWork.showSubjectModal}><Icon type="check-circle-o" />选择题目</Button>
                          <div className="class_bo">
                            <Checkbox
                                indeterminate={assignHomeWork.state.indeterminate}
                                onChange={assignHomeWork.subjectListOnCheckAllChange}
                                checked={assignHomeWork.state.checkAll}
                            >
                              Check all  <Button onClick={assignHomeWork.removeAllSelectedSubject}>删除已选题目</Button>
                            </Checkbox>
                          </div>
                          <br />
                          <CheckboxGroup options={plainOptions} defaultValue={assignHomeWork.state.checkedList} value={assignHomeWork.state.checkedList} onChange={assignHomeWork.subjectListOnChange} />
                        </div>
                      </Col>
                    </Row>
                  </div>
              )}
            </FormItem>
		</div>

            <FormItem className="ant-pagination">
              <Button type="primary" htmlType="submit" className="login-form-button class_right" >
                保存
              </Button>
              <Button type="primary" htmlType="reset" className="login-form-button" onClick={this.handleCancel} >
                取消
              </Button>
            </FormItem>

          </Form>
	
		  
          <Modal title="选择题目" className="choose_class" visible={assignHomeWork.state.subjectModalVisible}
                 onCancel={assignHomeWork.subjectModalHandleCancel}
                 footer={[

                   <Button key="return" type="primary" size="large" onClick={assignHomeWork.subjectModalHandleCancel}>确定</Button>,

                   <Button key="ok" type="ghost" size="large" onClick={assignHomeWork.subjectModalHandleCancel}>确定</Button>,

                 ]}
          >
              <Row>
                <Col span={7}><Table size="small" onRowClick={assignHomeWork.onScheduleSelectChange} selectedRowKeys={assignHomeWork.selectedRowKeys} columns={scheduleColumns}  dataSource={scheduleData} scroll={{ y: 300}}/></Col>
                <Col span={17} className="col17_le">
                  <div>
                    <Table rowSelection={subjectRowSelection} columns={subjectColumns} dataSource={subjectData} pagination={{ total:assignHomeWork.state.totalSubjectCount,pageSize: 15,onChange:assignHomeWork.pageOnChange }}  scroll={{ y: 300}}/>
                  </div>
                </Col>
              </Row>
          </Modal>
        </div>
    );
  },
}));
export  default AssignHomeWorkComponents;


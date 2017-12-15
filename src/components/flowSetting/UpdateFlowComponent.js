import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox,message} from 'antd';
import {isEmpty} from '../../utils/utils';
import FormBuilderComponent from './FormBuilderComponent';
import FlowBuilderComponent from './FlowBuilderComponent';
import {doWebService} from '../../WebServiceHelper';
const Step = Steps.Step;
var formBuilder;
const UpdateFlowComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            stepNum:0,
            formData:'[]',
        };
    },

    componentDidMount(){
        console.log("procDefId:"+this.props.procDefId);
        this.getFlowProcessDefinitionById(this.props.procDefId);
    },

    /**
     * 获取流程分组及其分组下的流程列表
     */
    getFlowProcessDefinitionById(procDefId) {
        let _this = this;
        var param = {
            "method": 'getFlowProcessDefinitionById',
            "procDefId": procDefId,
            "userId": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg + "===" + ret.response);
                if (ret.msg == "调用成功" && ret.success == true) {
                    console.log("response:"+ret.response);
                    //_this.buildFlowGroupSpan(ret.response);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    /**
     * 创建新审批
     * @param nextProps
     */
    componentWillReceiveProps(nextProps){

    },

    initCreatePage(){

    },

    changeStep(stepDirect){
        var _this = this;
        var formData = null;
        if(isEmpty(_this.refs.formDataComponent)==false){
            formData = _this.refs.formDataComponent.getFormData();
        }else{
            formData = _this.state.formData;
        }
        switch(stepDirect){
            case "pre":
                _this.setState({"stepNum":0,formData});
                break;
            case "next":
                _this.setState({"stepNum":1,formData});
                break;
        }
    },

    /**
     * 判断是否可以执行下一步操作,是否可以进入下一步对应的页面
     * 如果当前页面的表单已经设置,则返回true可以进入下一步,否则停留在当前页,提示错误
     * @returns {boolean}
     */
    canBeNextStep(){
        var canBeNext=true;
        var formData = this.refs.formDataComponent.getFormData();
        var formDataObjArray = JSON.parse(formData);
        if(isEmpty(formDataObjArray)==true || formDataObjArray.length==0){
            message.error("请先设置流程审批的表单");
            canBeNext = false;
        }else{
            //是否存在必选的元素
            var isExistRequired=false;
            for(var i=0;i<formDataObjArray.length;i++){
                var formData = formDataObjArray[i];
                var required = formData.required;
                if(required==true){
                    isExistRequired = true;
                    break;
                }
            }
            if(isExistRequired==false){
                message.error("请至少选择一个必填的表单元素，谢谢！");
                canBeNext = false;
            }
        }
        return canBeNext;
    },

    getFormDefindData(){
        return this.state.formData;
    },

    /**
     * 实现流程的部署
     * 流程部署的数据分别来源于两个面板，需要将两个面板中的数据构建成json完成数据保存
     */
    getProcessDefinitionJson(){
        var processDefinitionJson = this.refs.flowBuilderComponent.getProcessDefinitionBaseJson();
        processDefinitionJson.flowCreator=this.state.loginUser;
        //processDefinitionJson.flowFormDefineList = this.state.formData;
        return processDefinitionJson;
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var stepPanel;
        if(this.state.stepNum==0){
            stepPanel = <FormBuilderComponent ref="formDataComponent" formData = {this.state.formData}></FormBuilderComponent>;
        }else{
            stepPanel=<FlowBuilderComponent ref="flowBuilderComponent" formData = {this.state.formData}></FlowBuilderComponent>;
        }

        return (
            <div >
                <div className="modal_steps">
					<Steps current={this.state.stepNum} >
						<Step title="表单设置" icon={<Icon type="credit-card" />} />
						<Step title="审批流程设置" icon={<Icon type="smile-o" />} />
					</Steps>
				</div>
                {stepPanel}
            </div>
        );
    },
});

export default UpdateFlowComponent;

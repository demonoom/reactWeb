import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox,message} from 'antd';
import {isEmpty} from '../../utils/utils';
import FormBuilderComponent from './FormBuilderComponent';
import FlowBuilderComponent from './FlowBuilderComponent';
const Step = Steps.Step;
var formBuilder;
const CreateFlowComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            stepNum:0,
            formData:'[]',
        };
    },

    componentDidMount(){

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
        switch(stepDirect){
            case "pre":
                _this.setState({"stepNum":0});
                break;
            case "next":
                var formData = _this.refs.formDataComponent.getFormData();
                _this.setState({"stepNum":1,formData});
                break;
        }
    },

    // getFormData(){
    //     //alert(formBuilder.actions.getData('json'));
    // },
    /**
     * 判断是否可以执行下一步操作,是否可以进入下一步对应的页面
     * 如果当前页面的表单已经设置,则返回true可以进入下一步,否则停留在当前页,提示错误
     * @returns {boolean}
     */
    canBeNextStep(){
        var canBeNext=true;
        // var formData = formBuilder.actions.getData('json');
        // var formDataObj = JSON.parse(formData);
        // if(isEmpty(formDataObj)==false || formDataObj.length!=0){
        //     canBeNext = true;
        // }
        return canBeNext;
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var stepPanel;
        if(this.state.stepNum==0){
            stepPanel = <FormBuilderComponent ref="formDataComponent"></FormBuilderComponent>;
        }else{
            stepPanel=<FlowBuilderComponent></FlowBuilderComponent>;
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

export default CreateFlowComponent;

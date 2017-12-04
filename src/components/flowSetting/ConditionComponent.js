import React, {PropTypes} from 'react';
import {
    Tabs, Breadcrumb, Icon, Card, Button, Row, Col, Steps,
    Input, Select, Radio, DatePicker, Checkbox, message,InputNumber,Modal
} from 'antd';
import {isEmpty} from '../../utils/utils';
import {doWebService} from '../../WebServiceHelper';
import ApprovalComponent from './ApprovalComponent';

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const departmentLevelChildren = [];
var stepObjArray=[];
//准备发送到后台创建流程使用的审批节点数据(审批节点的顺序以数组索引顺序为依据)
var approvalJsonArray=[];

const ConditionComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            formDataOptions: [], //备选的审批条件字段
            conditionalSymbolArray:[],   //条件符号的集合，如大于，大于等于，等内容
            approvalUserOptionArray:[], //条件审批人的列表
            conditionalSymbolJsonArray:[],
        };
    },

    componentDidMount() {
        var formData = this.props.formData;
        var approvalJsonArray = this.props.approvalJsonArray;
        console.log("approvalJsonArray------>" + approvalJsonArray);
        this.initConditionComponent();
        this.buildFormDataOptions(formData);
        this.getTeahcerBySchoolId();
        this.buildApprovalUserOptions(approvalJsonArray);
    },

    componentWillReceiveProps(nextProps) {
        console.log("nextPropscondi------>" + nextProps.formData);
        this.buildFormDataOptions(nextProps.formData);
        this.buildApprovalUserOptions(nextProps.approvalJsonArray);
    },

    componentDidUpdate() {

    },

    /**
     * 根据学校id,获取当前学校下的所有老师信息,并据此构建下拉列表选项
     */
    getTeahcerBySchoolId() {
        let _this = this;
        var param = {
            "method": 'getTeahcerBySchoolId',
            "school": this.state.loginUser.schoolId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg + "===" + ret.response);
                if (ret.msg == "调用成功" && ret.success == true) {
                    _this.buildTeacherOptions(ret.response);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 创建审批人分组的下拉列表选项
     */
    buildTeacherOptions(response) {
        var _this = this;
        var teacherUserObjArray = [];
        var teacherOptionArray = [];
        var i = 0;
        var defaultSelectedTeacherId = -1;
        response.forEach(function (response) {
            var user = response.user;
            var colAccount = user.colAccount;
            var colUid = user.colUid;
            var userName = user.userName + "(" + colAccount + ")";
            var optionObj = <Option value={colUid}>{userName}</Option>
            teacherOptionArray.push(optionObj);
            teacherUserObjArray.push(user);
            if (i == 0) {
                defaultSelectedTeacherId = colUid;
            }
            i++;
        });
        _this.setState({teacherOptionArray, defaultSelectedTeacherId, teacherUserObjArray});
    },

    /**
     * 审批人类型改变的响应
     */
    approvalTypeOnChange(e) {
        var selectedDepartmentLevel = "1";
        if (e.target.value == 1) {
            this.getRolesBySchoolId();
        } else if (e.target.value == 2) {
            if (departmentLevelChildren[0].key != 0) {
                var levelName = "直接主管";
                departmentLevelChildren.splice(0, 0, <Option key={0}>{levelName}</Option>);
                selectedDepartmentLevel = "0";
            }
        } else if (e.target.value == 3) {
            if (departmentLevelChildren[0].key == 0) {
                departmentLevelChildren.splice(0, 1);
                selectedDepartmentLevel = "1";
            }
        }
        this.setState({
            approvalTypeValue: e.target.value, selectedDepartmentLevel
        });
    },

    /**
     * 用户列表选中响应函数
     * @param value
     */
    userSelectHandleChange(value) {
        console.log(`selected ${value}`);
        var selectedUser = null;
        var teacherUserObjArray = this.state.teacherUserObjArray;
        for (var i = 0; i < teacherUserObjArray.length; i++) {
            var user = teacherUserObjArray[i];
            if (value == user.colUid) {
                selectedUser = user;
                break;
            }
        }
        var conditionalValueJson = {conditionField:"assignOfStarter",conditionalValue:selectedUser};
        this.buildConditionalValueJsonArray(conditionalValueJson);
    },

    /**
     * 通过json的形式,获取审批人的设置信息
     * json格式预定如下:
     * {approvalType:0,approval:te23836}
     */
    getConditionInfoByJson() {
        var flowApprovalUsers=[];
        var approvalJsonArray = this.state.approvalJsonArray;
        var isError = this.checkSubmitForm();
        if(isError==true){
            return;
        }
        for(var i=0;i<approvalJsonArray.length;i++){
            var approvalJson = approvalJsonArray[i];
            var approvalType = approvalJson.approvalType;
            var approval = approvalJson.approval;
            var approvalManagerVariables=approvalJson.approvalManagerVariables;
            var approvalRoleVariables=approvalJson.approvalRoleVariables;
            var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
            var currentApprovalTypeValue = approvalJson.currentApprovalTypeValue;
            var ifManagerNullFillType = approvalJson.ifManagerNullFillType;
            var userJson = {"approvalUser":approval,"approvalType":approvalType,"approvalManagerVariables":approvalManagerVariables,
                "approvalRoleVariables":approvalRoleVariables,"flowApprovalUserRule":flowApprovalUserRule,"currentApprovalTypeValue":currentApprovalTypeValue,
                "ifManagerNullFillType":ifManagerNullFillType,"approvalStarterVariables":approvalJson.approvalStarterVariables
            }
            flowApprovalUsers.push(userJson);
        }
        //todo 需要在返回数据之前，先做条件的有效性判断，包括条件表达式是否有选择，值是否为空，对应的审批人是否选择
        var conditionInfoJson = {flowConditionalSymbolList:this.state.conditionalSymbolJsonArray,selectedApprovalUser:this.state.selectedApprovalUser,flowApprovalUsers:flowApprovalUsers};
        return conditionInfoJson;
    },

    /**
     * 检查要提交的表单内容，包括审批条件和对应审批人是否选择
     * 审批条件要判断是否选择了条件表达式和条件值
     * @returns {boolean}
     */
    checkSubmitForm(){
        var isError = false;
        if(isEmpty(approvalJsonArray) || approvalJsonArray.length==0){
            message.error("请至少选择符合条件的审批人");
            isError = true;
        }
        if(isEmpty(this.state.conditionalSymbolJsonArray) || this.state.conditionalSymbolJsonArray.length==0){
            message.error("请至少设定一个审批条件");
            isError = true;
        }else if(isEmpty(this.state.conditionalSymbolJsonArray) == false ){
            this.state.conditionalSymbolJsonArray.forEach(function (conditionSymbol) {
                var conditionValue;
                if(isEmpty(conditionSymbol.conditionField)==false){
                    var conditionFieldArray = conditionSymbol.conditionField.split("#");
                    if(conditionFieldArray[1]=="checkbox-group"){
                        conditionValue = conditionSymbol.conditionalValues;
                    }else{
                        conditionValue = conditionSymbol.conditionalValue
                    }
                }
                if(isEmpty(conditionSymbol.conditionField) || isEmpty(conditionSymbol.conditionalSymbol) || isEmpty(conditionValue)){
                    message.error("审批条件存在空值，请检查");
                    isError = true;
                }
            })
        }

        return isError;
    },

    /**
     * 初始化组件
     */
    initConditionComponent(){
        // conditionalSymbolJsonArray.splice(0);
        // departmentLevelChildren.splice(0);
        stepObjArray.splice(0);
        approvalJsonArray.splice(0);
        this.setState({
            conditionTagArray: [],
            formDataOptions: [],
            conditionFields: '',
            conditionalSymbolArray: [],
            approvalUserOptionArray: [],
            selectedApprovalUser: '',
            //teacherOptionArray: [],
            defaultSelectedTeacherId:'',
            teacherUserObjArray:[],
            approvalTypeValue:'',
            selectedDepartmentLevel:'',
            conditionalSymbolJsonArray:[],
            stepObjArray:[],
            approvalJsonArray:[]
        });
    },

    /**
     * 可用条件选项改变的响应函数
     */
    formDataOptionOnChange(checkedValues) {
        console.log('checked = ', checkedValues);
        //todo 暂时屏蔽多条件设置，后期放开该功能，以便支持条件的并且操作
        /*if(checkedValues.length>1){
            message.error("请勿同时选择多个条件，谢谢！");
            return;
        }*/
        var formDataOptions = this.state.formDataOptions;
        this.setState({conditionFields:checkedValues});
        this.buildConditonTagArray(formDataOptions,checkedValues);
        this.updateConditionalSymbolJsonArray(checkedValues);
    },

    /**
     * 构建备选条件字段的复选框选项数组
     */
    buildFormDataOptions(formData) {
        var formDefineList = JSON.parse(formData);
        // var formDataOptions = [{label: '发起人', value: 'assignOfStarter',type:'select'}];
        var formDataOptions = [];
        formDefineList.forEach(function (formDefine) {
            // if (formDefine.required == true && (formDefine.type !='file' || formDefine.type !='file')) {
            if (formDefine.required == true && formDefine.type !='file' && formDefine.type !="header" ) {
                var optionJson = {label: formDefine.label, value: formDefine.label,type:formDefine.type,values:formDefine.values};
                formDataOptions.push(optionJson);
            }
        });
        this.setState({formDataOptions});
    },

    /**
     * 构建条件审批人对应的下拉列表
     */
    buildApprovalUserOptions(approvalJsonArray){
        var approvalUserOptionArray = [];
        if(isEmpty(approvalJsonArray)==false){
            //循环从1开始，过滤掉审批流程中的第一个人，因为第一个人不需要设置条件，第一个人采用的是默认流程
            //todo 后期考虑第一个人的业务处理方式
            for(var i=1;i<approvalJsonArray.length;i++){
                var approvalJson = approvalJsonArray[i];
                var approvalType = approvalJson.approvalType;
                var approval = approvalJson.approval;
                var approvalManagerVariables=approvalJson.approvalManagerVariables;
                var approvalRoleVariables=approvalJson.approvalRoleVariables;
                var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
                var approvalUserOption;
                switch (approvalType) {
                    case 0:
                        //选定具体用户
                        var optionValue=approval.colUid+",0";
                        approvalUserOption = <Option value={optionValue}>{approval.userName}</Option>;
                        break;
                    case 1:
                        //选定指定的角色
                        var optionValue=approvalRoleVariables.id+",1";
                        approvalUserOption = <Option value={optionValue}>{approvalRoleVariables.name}</Option>;
                        break;
                    case 2:
                        //主管审批规则
                        var approvalLevel = flowApprovalUserRule.approvalLevel;
                        var levelType = flowApprovalUserRule.levelType;
                        var approvalUserKey = levelType+"#"+approvalLevel+",2";
                        var approvalShowName = ""
                        if(approvalLevel==0){
                            approvalShowName = "直接主管";
                        }else{
                            approvalShowName = "第"+approvalLevel+"级主管";
                        }
                        approvalUserOption = <Option value={approvalUserKey}>{approvalShowName}</Option>;
                        break;
                    case 3:
                        //主管审批规则(向上)
                        break;
                    case 4:
                        //选定审批人为流程发起人
                        var optionValue=approvalJson.approvalStarterVariables+",4";
                        approvalUserOption = <Option value={optionValue}>发起人自己</Option>;
                        break;
                }
                approvalUserOptionArray.push(approvalUserOption);
            }
        }
        this.setState({approvalUserOptionArray});
    },

    /**
     * 构建条件符号的下拉列表选项
     */
    buildConditionalSymbol(conditionField){
        var conditionalSymbolArray=[];
        var conditionFieldArray = conditionField.split("#");
        var equalsSymbol = <Option value={conditionField+'#等于'}>等于</Option>;
        conditionalSymbolArray.push(equalsSymbol);
        //只有数字的内容才允许使用大于、小于类的比较
        if(isEmpty(conditionFieldArray) == false && conditionFieldArray[1]=="number"){
            var unEqualsSymbol = <Option value={conditionField+'#不等于'}>不等于</Option>;
            var greaterSymbol = <Option value={conditionField+'#大于'}>大于</Option>;
            var lessSymbol = <Option value={conditionField+'#小于'}>小于</Option>;
            var greaterEqualsSymbol = <Option value={conditionField+'#大于等于'}>大于等于</Option>;
            var lessEqualsSymbol = <Option value={conditionField+'#小于等于'}>小于等于</Option>;
            // var middleEqualsSymbol = <Option value={conditionField+'#介于'}>介于(两个数之间)</Option>;
            conditionalSymbolArray.push(unEqualsSymbol);
            conditionalSymbolArray.push(greaterSymbol);
            conditionalSymbolArray.push(lessSymbol);
            conditionalSymbolArray.push(greaterEqualsSymbol);
            conditionalSymbolArray.push(lessEqualsSymbol);
        }
        // conditionalSymbolArray.push(lessEqualsSymbol);
        // this.setState({conditionalSymbolArray});
        return conditionalSymbolArray;
    },

    /**
     * 构建页面上的可用的条件字段
     */
    buildConditonTagArray(formDataOptions,checkedValues){
        var _this = this;
        var conditionTagArray = [];
        checkedValues.forEach(function(checkedValue){
            for(var i=0;i<formDataOptions.length;i++){
                var formDataJson = formDataOptions[i];
                if(formDataJson.value == checkedValue){
                    var conditionTag = null;
                    if(formDataJson.value == "assignOfStarter"){
                        conditionTag = <Row className="conditions_top2">
                            <Col span={4} className="line_h_30">发起人</Col>
                            <Col span={20} className="line_h_30">
                                <Select
                                    allowClear={true}
                                    showSearch
                                    style={{width: 130}}
                                    placeholder="请输入搜索条件"
                                    optionFilterProp="children"
                                    onChange={_this.userSelectHandleChange}
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    className="framework_m_r"
                                >
                                    {_this.state.teacherOptionArray}
                                </Select>
                            </Col>
                        </Row>;
                    }else{
                        var conditionalSymbolArray = _this.buildConditionalSymbol(formDataJson.label+"#"+formDataJson.type);
                        if(formDataJson.type=="text" || formDataJson.type=="textarea"){
                            var tagId = formDataJson.label + "#" + formDataJson.type;
                            conditionTag = <Row>
                                <Col span={4} className="line_h_30">{formDataJson.label}</Col>
                                <Col span={7} className="line_h_30">
                                    <Select
                                        defaultValue={_this.state.defaultConditionSymbolValue}
                                        style={{width: 130}}
                                        onChange={_this.conditionalSymbolHandleChange}
                                        className="framework_m_r"
                                    >
                                        {conditionalSymbolArray}
                                    </Select>
                                </Col>
                                <Col span={10} className="line_h_30">
                                    <Input id={tagId} onChange={_this.conditionValueOnChange}/>
                                </Col>
                            </Row>;
                        }if(formDataJson.type=="number"){
                            var tagId = formDataJson.label + "#" + formDataJson.type;
                            conditionTag = <Row>
                                <Col span={4} className="line_h_30">{formDataJson.label}</Col>
                                <Col span={7} className="line_h_30">
                                    <Select
                                        style={{width: 130}}
                                        onChange={_this.conditionalSymbolHandleChange}
                                        className="framework_m_r"
                                    >
                                        {conditionalSymbolArray}
                                    </Select>
                                </Col>
                                <Col span={10} className="line_h_30">
                                    <InputNumber id={tagId}  onChange={_this.formDataInputNumberOnChange.bind(_this,tagId)} />
                                </Col>
                            </Row>;
                        }else if(formDataJson.type=="select"){
                            var optionsArray = [];
                            formDataJson.values.forEach(function (formDataValue) {
                                var label = formDataValue.label;
                                var value = formDataValue.label+"#"+formDataJson.value+"#"+formDataJson.type;
                                var optionObj = <Option value={value}>{label}</Option>;
                                optionsArray.push(optionObj);
                            })
                            conditionTag = <Row>
                                <Col span={4} className="line_h_30">{formDataJson.label}</Col>
                                <Col span={7} className="line_h_30">
                                    <Select
                                        style={{width: 130}}
                                        onChange={_this.conditionalSymbolHandleChange}
                                        className="framework_m_r"
                                    >
                                        {conditionalSymbolArray}
                                    </Select>
                                </Col>
                                <Col span={10} className="line_h_30">
                                    <Select
                                        style={{width: 130}}
                                        onChange={_this.formDataSelectOptionsOnChange}
                                        className="framework_m_r"
                                    >
                                        {optionsArray}
                                    </Select>
                                </Col>
                            </Row>;
                        }else if("checkbox-group"==formDataJson.type){
                            var optionsArray = [];
                            formDataJson.values.forEach(function (formDataValue) {
                                var label = formDataValue.label;
                                var value = formDataValue.label+"#"+formDataJson.value+"#"+formDataJson.type;
                                var optionObj = { label: label, value: value };
                                optionsArray.push(optionObj);
                            })
                            conditionTag = <Row>
                                <Col span={4} className="line_h_30">{formDataJson.label}</Col>
                                <Col span={7} className="line_h_30">
                                    <Select
                                        style={{width: 130}}
                                        onChange={_this.conditionalSymbolHandleChange}
                                        className="framework_m_r"
                                    >
                                        {conditionalSymbolArray}
                                    </Select>
                                </Col>
                                <Col span={10} className="line_h_30">
                                    <CheckboxGroup options={optionsArray} onChange={_this.formDataCheckGroupOnChange}/>
                                </Col>
                            </Row>;
                        }else if("radio-group" == formDataJson.type){
                            var optionsArray = [];
                            formDataJson.values.forEach(function (formDataValue) {
                                var label = formDataValue.label;
                                var value = formDataValue.label+"#"+formDataJson.value+"#"+formDataJson.type;
                                // var optionObj = { label: label, value: value };
                                var radioObj = <Radio value={value}>{label}</Radio>;
                                optionsArray.push(radioObj);
                            })
                            conditionTag = <Row>
                                <Col span={4} className="line_h_30">{formDataJson.label}</Col>
                                <Col span={7} className="line_h_30">
                                    <Select
                                        style={{width: 130}}
                                        onChange={_this.conditionalSymbolHandleChange}
                                        className="framework_m_r"
                                    >
                                        {conditionalSymbolArray}
                                    </Select>
                                </Col>
                                <Col span={10} className="line_h_30">
                                    <RadioGroup onChange={_this.formDataRadioGroupOnChange}>
                                        {optionsArray}
                                    </RadioGroup>
                                </Col>
                            </Row>;
                        }else if("date" == formDataJson.type){
                            var tagId = formDataJson.label+"#"+formDataJson.type;
                            conditionTag = <Row>
                                <Col span={4} className="line_h_30">{formDataJson.label}</Col>
                                <Col span={7} className="line_h_30">
                                    <Select
                                        style={{width: 130}}
                                        onChange={_this.conditionalSymbolHandleChange}
                                        className="framework_m_r"
                                    >
                                        {conditionalSymbolArray}
                                    </Select>
                                </Col>
                                <Col span={10} className="line_h_30">
                                    <DatePicker onChange={_this.formDatePickerOnChange.bind(_this,tagId)} />
                                </Col>
                            </Row>;
                        }

                    }
                    conditionTagArray.push(conditionTag);
                }
            }
        });
        _this.setState({conditionTagArray});
    },

    /**
     * 生成的下拉列表改变时的响应函数
     */
    formDataSelectOptionsOnChange(value) {
        console.log(`formDataSelectOptionsOnChange selected ${value}`);
        var formDataSelectOptionArray = value.split("#");
        var formDataSelectOptionValue = formDataSelectOptionArray[0];
        var conditionField = formDataSelectOptionArray[1];
        var formDataType = formDataSelectOptionArray[2];
        conditionField = conditionField + "#" + formDataType;
        console.log("conditionField:" + conditionField + ",formDataSelectOptionValue:" + formDataSelectOptionValue);
        var conditionalValueJson = {conditionField:conditionField,conditionalValue:formDataSelectOptionValue};
        this.buildConditionalValueJsonArray(conditionalValueJson);
    },

    /**
     * 生成的数字输入框内容改变响应函数
     * @param value
     */
    formDataInputNumberOnChange(tagId,value){
        var conditionalValueJson = {conditionField:tagId,conditionalValue:value};
        this.buildConditionalValueJsonArray(conditionalValueJson);
    },

    /**
     * 复选框表单改变响应函数
     */
    formDataCheckGroupOnChange(checkedValues) {
        console.log('checked = ', checkedValues);
        var checkGroupValues=[];
        var conditionField;
        var formDataType;
        checkedValues.forEach(function (checkedValue) {
            //选项 1#复选框组#checkbox-group
            var checkedValueArray = checkedValue.split("#");
            var formDataSelectOptionValue = checkedValueArray[0];
            conditionField = checkedValueArray[1];
            formDataType = checkedValueArray[2];
            conditionField = conditionField + "#" + formDataType;
            checkGroupValues.push(formDataSelectOptionValue);
        })
        var conditionalValueJson = {conditionField:conditionField,conditionalValues:checkGroupValues};
        this.buildConditionalValueJsonArray(conditionalValueJson);
    },

    /**
     * 生成的表单中，单选按钮组改变响应函数
     */
    formDataRadioGroupOnChange(e) {
        console.log("currentApprovalTypeValue"+e.target.value);
        var formDataRadioGroupOptionArray = e.target.value.split("#");
        var formDataSelectOptionValue = formDataRadioGroupOptionArray[0];
        var conditionField = formDataRadioGroupOptionArray[1];
        var formDataType = formDataRadioGroupOptionArray[2];
        conditionField = conditionField + "#" + formDataType;
        var conditionalValueJson = {conditionField:conditionField,conditionalValue:formDataSelectOptionValue};
        this.buildConditionalValueJsonArray(conditionalValueJson);
    },

    /**
     * 生成的表单中，日期组件改变响应函数
     */
    formDatePickerOnChange(tagId, date, dateString) {
        console.log(date, dateString,tagId);
        var conditionalValueJson = {conditionField:tagId,conditionalValue:dateString};
        this.buildConditionalValueJsonArray(conditionalValueJson);
    },

    /**
     * 条件符号改变的响应函数
     */
    conditionalSymbolHandleChange(value) {
        console.log(`conditionalSymbolHandleChange selected ${value}`);
        var conditionalSymbolArray = value.split("#");
        var conditionField = conditionalSymbolArray[0];
        var conditionFieldType = conditionalSymbolArray[1];
        var conditionalSymbol = conditionalSymbolArray[2];
        var conditionalSymbolJson = {conditionField:conditionField+"#"+conditionFieldType,conditionalSymbol:conditionalSymbol};
        this.buildConditionalSymbolJsonArray(conditionalSymbolJson);
    },

    /**
     * 创建所有的条件符号的对应数组
     */
    buildConditionalSymbolJsonArray(conditionalSymbolJson){
        var isExist = false;
        for(var i=0;i<this.state.conditionalSymbolJsonArray.length;i++){
            var currentConditonSymbol = this.state.conditionalSymbolJsonArray[i];
            if(currentConditonSymbol.conditionField == conditionalSymbolJson.conditionField){
                //找到对应的审批条件,使用新的条件符号进行替换
                currentConditonSymbol.conditionalSymbol = conditionalSymbolJson.conditionalSymbol;
                isExist = true;
                break;
            }
        }
        if(isExist == false){
            this.state.conditionalSymbolJsonArray.push(conditionalSymbolJson);
        }
    },

    /**
     * 条件值改变的响应函数
     */
    conditionValueOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var conditionalValue = target.value;
        var conditionField = target.id;
        var conditionalValueJson = {conditionField:conditionField,conditionalValue:conditionalValue};
        this.buildConditionalValueJsonArray(conditionalValueJson);
    },

    /**
     * 构建条件表达式的值
     * @param conditionalSymbolJson
     */
    buildConditionalValueJsonArray(conditionalValueJson){
        var isExist = false;
        for(var i=0;i<this.state.conditionalSymbolJsonArray.length;i++){
            var currentConditonSymbol = this.state.conditionalSymbolJsonArray[i];
            if(currentConditonSymbol.conditionField == conditionalValueJson.conditionField){
                /*
                找到对应的审批条件,使用新的条件值进行替换
                如果是复选框、下拉列表等，使用currentConditonSymbol.conditionalValues进行替换
                 */
                var conditionFieldInfoArray = conditionalValueJson.conditionField.split("#");
                var conditionFieldType = conditionFieldInfoArray[1];
                if(conditionFieldType == "checkbox-group"){
                    currentConditonSymbol.conditionalValues = conditionalValueJson.conditionalValues;
                }else{
                    currentConditonSymbol.conditionalValue = conditionalValueJson.conditionalValue;
                }
                if("assignOfStarter" == conditionalValueJson.conditionField){
                    currentConditonSymbol.conditionalSymbol = "等于";
                }
                isExist = true;
                break;
            }
        }
        if(isExist == false){
            if("assignOfStarter" == conditionalValueJson.conditionField){
                conditionalValueJson.conditionalSymbol = "等于";
            }
            this.state.conditionalSymbolJsonArray.push(conditionalValueJson);
        }
    },

    /**
     * 更新条件结构数组
     */
    updateConditionalSymbolJsonArray(checkedValues) {
        var newArray = [];
        checkedValues.forEach(function (checkedValue) {
            for (var i = 0; i < this.state.conditionalSymbolJsonArray.length; i++) {
                var currentConditonSymbol = this.state.conditionalSymbolJsonArray[i];
                if (currentConditonSymbol.conditionField == checkedValue) {
                    newArray.push(currentConditonSymbol);
                    break;
                }
            }
        })
        //todo 选择多个条件时，应该形成条件的并且关系
        //conditionalSymbolJsonArray = newArray;
        this.state.conditionalSymbolJsonArray.addAll(newArray);
    },

    /**
     * 当前条件符合时的审批人选项
     */
    approvalUserHandleChange(value) {
        console.log(`conditionalSymbolHandleChange selected ${value}`);
        this.setState({selectedApprovalUser:value});
    },

    /**
     * 设置审批人窗口关闭
     */
    approvalModalHandleCancel(){
        this.setState({approvalModalVisible:false});
    },

    /**
     * 移除审批数据
     * @param removeKey
     */
    removeApprovalData(removeKey){
        this.removeApprovalStep(removeKey);
        this.removeApprovalJsonArray(removeKey);
    },

    /**
     * 移除审批节点
     */
    removeApprovalStep(removeKey){
        var stepObjArray = this.state.stepObjArray;
        for(var i=0;i<stepObjArray.length;i++){
            var stepObj = stepObjArray[i];
            if(stepObj.props.id==removeKey){
                stepObjArray.splice(i,1);
                break;
            }
        }
        this.setState({stepObjArray});
    },

    /**
     * 移除流程审批Json数据
     * 数据应该包括用户id,用户类型(单个用户/角色用户)
     */
    removeApprovalJsonArray(removeKey){
        for(var i=0;i<approvalJsonArray.length;i++){
            var approvalJson = approvalJsonArray[i];
            var approvalType = approvalJson.approvalType;
            switch (approvalType){
                case 0:
                    //指定用户审批
                    if(approvalJson.approval.colUid==removeKey){
                        approvalJsonArray.splice(i,1);
                        break;
                    }
                    break;
                case 1:
                    //角色审批
                    var approvalRoleVariables = approvalJson.approvalRoleVariables;
                    if(approvalRoleVariables.id==removeKey){
                        approvalJsonArray.splice(i,1);
                        break;
                    }
                    break;
                case 2:
                    //部门主管审批
                    var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
                    var approvalUserKey = flowApprovalUserRule.levelType+"#"+flowApprovalUserRule.approvalLevel;
                    if(approvalUserKey==removeKey){
                        approvalJsonArray.splice(i,1);
                        break;
                    }
                    break;
                case 3:
                    break;
                case 4:
                    //发起人自己审批
                    var approvalStarterVariables = approvalJson.approvalStarterVariables;
                    if(approvalStarterVariables==removeKey){
                        approvalJsonArray.splice(i,1);
                        break;
                    }
                    break;
            }
        }
    },

    /**
     * 添加审批人到审批节点
     */
    addApprovalToStep(){
        var approvalJson = this.refs.approvalComponent.getApprovalInfoByJson();
        console.log(approvalJson);
        var approvalType = approvalJson.approvalType;
        var approvalTypeStr = "";
        var approvalNameDiv;
        var stepObj;
        switch(approvalType){
            case 0:
                //选定具体用户
                approvalNameDiv=<div >{approvalJson.approval.userName}</div>;
                approvalTypeStr= "";
                //stepObj = <Step id={approvalJson.approval} status="process" title={approvalNameDiv} description={approvalTypeStr} icon={<Icon type="user" />} />;
                stepObj = <div id={approvalJson.approval.colUid} >
                    <div className="approval_steps_w">
                        <Icon type="user" />
                        {approvalNameDiv}
                        <Icon type="close" className="close" onClick={this.removeApprovalData.bind(this,approvalJson.approval.colUid)} />
                    </div>
                    <Icon type="arrow-right" className="approval_right_arrow" />
                </div>;
                break;
            case 1:
                //选定指定的角色
                approvalNameDiv=<div>{approvalJson.approvalRoleVariables.name}</div>;
                approvalTypeStr= "";
                //stepObj = <Step id={approvalJson.approvalRoleVariables.id} status="process" title={approvalNameDiv} description={approvalTypeStr} icon={<Icon type="user" />} />;
                stepObj = <div id={approvalJson.approvalRoleVariables.id} >
                    <div className="approval_steps_w">
                        <Icon type="user" />
                        {approvalNameDiv}
                        <Icon type="close" className="close"  onClick={this.removeApprovalData.bind(this,approvalJson.approvalRoleVariables.id)} />
                    </div>
                    <Icon type="arrow-right"  className="approval_right_arrow" />
                </div>;
                break;
            case 2:
                //主管审批规则
                var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
                var approvalLevel = flowApprovalUserRule.approvalLevel;
                var levelType = flowApprovalUserRule.levelType;
                var approvalUserKey = levelType+"#"+approvalLevel;
                var approvalShowName = ""
                if(approvalLevel==0){
                    approvalShowName = "直接主管";
                }else{
                    approvalShowName = "第"+approvalLevel+"级主管";
                }
                //部门主管-指定一级(包括直接主管的选项,直接主管的level为0)
                approvalNameDiv=<div >{approvalShowName}</div>;
                approvalTypeStr= "";
                //stepObj = <Step id={approvalUserKey} status="process" title={approvalNameDiv} description={approvalTypeStr} icon={<Icon type="user" />} />;
                stepObj = <div id={approvalUserKey} >
                    <div className="approval_steps_w">
                        <Icon type="user" />
                        {approvalNameDiv}
                        <Icon type="close"  className="close" onClick={this.removeApprovalData.bind(this,approvalUserKey)}  />
                    </div>
                    <Icon type="arrow-right" className="approval_right_arrow" />
                </div>;
                break;
            case 3:
                //主管审批规则
                var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
                var approvalLevel = flowApprovalUserRule.approvalLevel;
                var levelType = flowApprovalUserRule.levelType;
                var approvalUserKey = levelType+"#"+approvalLevel;
                var approvalShowName = ""
                approvalShowName = "从直接主管到发起人向上的第"+approvalLevel+"级主管";
                //部门主管-连续多级
                approvalNameDiv=<div>{approvalShowName}</div>;
                approvalTypeStr= "";
                /* stepObj = <Step id={approvalUserKey} status="process" title={approvalNameDiv} description={approvalTypeStr} icon={<Icon type="user" />} />;*/
                stepObj = <div id={approvalUserKey}  >
                    <div className="approval_steps_w">
                        <Icon type="user" />
                        {approvalNameDiv}
                        <Icon type="close"  className="close" onClick={this.removeApprovalData.bind(this,approvalUserKey)}  />
                    </div>
                    <Icon type="arrow-right" className="approval_right_arrow" />
                </div>;
                break;
            case 4:
                //选定审批人为流程发起人
                approvalNameDiv=<div>发起人自己</div>;
                approvalTypeStr= "";
                stepObj = <div id={approvalJson.approvalStarterVariables} >
                    <div className="approval_steps_w">
                        <Icon type="user" />
                        {approvalNameDiv}
                        <Icon type="close"  className="close"  onClick={this.removeApprovalData.bind(this,approvalJson.approvalStarterVariables)}  />
                    </div>
                    <Icon type="arrow-right" className="approval_right_arrow" />
                </div>;
                break;
        }
        stepObjArray.push(stepObj);
        approvalJsonArray.push(approvalJson);
        this.setState({stepObjArray,approvalJsonArray});
        this.approvalModalHandleCancel();
    },

    /**
     * 添加流程步骤
     */
    addFlowStep(){
        this.setState({approvalModalVisible:true});
    },


    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {



        return (
            <div className="conditions_group">
                <Row>
                    <Col span={24}>
                        请选择用来区分审批流程的条件字段<span className="red_danger">（只有必填字段才可以参与条件设置）</span>：
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                    <CheckboxGroup options={this.state.formDataOptions}
                                   value={this.state.conditionFields}
                                   onChange={this.formDataOptionOnChange}/>
                    </Col>
                </Row>
                <hr className="conditions_top"></hr>
                <Row>
                    <Col span={24}>当审批同时满足以下条件时</Col>
                </Row>
                <Row className="conditions_row_2">
                    {this.state.conditionTagArray}
                </Row>
                <hr className="conditions_top"></hr>
                <Row>
                    <Col span={4} className="line_h_30">对应审批人</Col>
                    <Col span={20}>
                        {/*<Select
                            allowClear={true}
                            style={{width: 130}}
                            onChange={this.approvalUserHandleChange}
                            className="framework_m_r"
                            value = {this.state.selectedApprovalUser}
                        >
                            {this.state.approvalUserOptionArray}
                        </Select>*/}
                        <div className="approval_steps approval_steps_flow">
                            {this.state.stepObjArray}
                        </div>
                        <Button className="upexam_float" icon="plus-circle" onClick={this.addFlowStep}></Button>
                    </Col>
                </Row>

                <Modal title="设置审批人" visible={this.state.approvalModalVisible}
                       onCancel={this.approvalModalHandleCancel}
                       onOk={this.addApprovalToStep}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       width="600px"
                       className="builder_modal"
                >
                    <div className="space">
                        <ApprovalComponent ref="approvalComponent"></ApprovalComponent>
                    </div>
                </Modal>

            </div>
        );
    },
});

export default ConditionComponent;

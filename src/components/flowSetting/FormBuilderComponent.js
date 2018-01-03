import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox,message} from 'antd';
import {isEmpty} from '../../utils/utils';
const Step = Steps.Step;
var formBuilder;
var formDataCache="";
const FormBuilderComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        formDataCache = this.props.formData;
        this.buildFormDataComponent();
        return {
            loginUser : loginUser,
            formData:[],
        };
    },

    componentWillUnMount(){
        formDataCache = "";
        this.setState({formData:[]});
    },

    initFormData(){
        formDataCache = "";
        this.setState({formData:[]});
        if(isEmpty(formBuilder)==false){
            formBuilder.actions.clearFields();
        }
    },

    /**
     * 获取form表单的元素
     * @returns {*}
     */
    getFormData(){
        var formData = formBuilder.actions.getData('json');
        return formData;
    },

    /**
     * 创建FormData组件
     */
    buildFormDataComponent(){
        var _this = this;
        var options = {
            i18n: {
                locale: 'zh-CN'
            },
            //controlPosition: 'left', //设置可拖拽元素的显示位置
            disableFields: ['autocomplete', 'hidden', 'paragraph', 'button'],  //设置不显示给用户的表单元素
            disabledAttrs: [
                'className', 'access', 'name',
                'max', 'maxlength', 'min', 'inline', 'other', 'toggle', 'description',
                'multiple', 'subtype'
            ],  //设置不显示给用户的元素属性
            disabledActionButtons: ['data', 'clear', 'save', 'Remove Element'],  //设置不显示给用户的操作按钮
            editOnAdd: false
        };
        if(isEmpty(formBuilder)==false && isEmpty(formDataCache)==false){
            options = {
                i18n: {
                    locale: 'zh-CN'
                },
                //controlPosition: 'left', //设置可拖拽元素的显示位置
                disableFields: ['autocomplete', 'hidden', 'paragraph', 'button'],  //设置不显示给用户的表单元素
                disabledAttrs: [
                    'className', 'access', 'name',
                    'max', 'maxlength', 'min', 'inline', 'other', 'toggle', 'description',
                    'multiple', 'subtype'
                ],  //设置不显示给用户的元素属性
                disabledActionButtons: ['data', 'clear', 'save', 'Remove Element'],  //设置不显示给用户的操作按钮
                editOnAdd: false,
                formData:formDataCache
            };
        }

        jQuery(function ($) {
            'use strict'
            var fbTemplate = document.getElementById('fb-editor');
            formBuilder = $(fbTemplate).formBuilder(options);
        });
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <div>操作提示：<span className="red_danger">请至少选择一个必填的表单项目</span></div>
                <div className="form_set row-t-f">
                    <div id="fb-editor"></div>
                </div>
            </div>
        );
    },
});

export default FormBuilderComponent;

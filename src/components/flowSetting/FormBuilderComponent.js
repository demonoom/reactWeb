import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox,message} from 'antd';
import {isEmpty} from '../../utils/utils';
const Step = Steps.Step;
var formBuilder;
const FormBuilderComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            formData:'[]',
        };
    },

    componentDidMount(){
       // $("#fb-editor").formBuilder();
       // $(document.getElementById('fb-editor')).formBuilder();
       /* const attrs = [
            'access',   //角色
            'className',    //样式名称
            'description',  //帮助文字
            'inline',   //显示在一行
            'label',    //文本标签
            'max',  //最大值
            'maxlength',    //最大长度
            'min',  //最小值
            'multiple', //是否允许上传多个文件
            'name', //控件名称
            'options',  //控件的选项
            'other',    //其他??
            'placeholder',  //文本框中的提示文字
            'required', //是否必填项,打红色*
            'rows',    //文本域的行数
            'step',
            'style',
            'subtype',  //元素的格式(如:按钮的submit/reset等)
            'toggle',
            'value'
        ]*/
        this.buildFormDataComponent();
    },

    componentWillReceiveProps(nextProps){
        console.log("wwwwwwwww");
    },

    componentDidUpdate(){
    },

    initFormData(formData){
        $(document).ready(function () {
            formBuilder.actions.setData(formData);
        })
        this.setState({formData});
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
        jQuery(function($) {
            'use strict'
            var options = {
                i18n: {
                    locale: 'zh-CN'
                },
                //controlPosition: 'left', //设置可拖拽元素的显示位置
                disableFields: ['autocomplete','hidden','paragraph','number','button'],  //设置不显示给用户的表单元素
                disabledAttrs: [
                    'className','access','name','required',
                    'max','maxlength','min','inline','other','toggle','description',
                    'multiple','subtype'
                ],  //设置不显示给用户的元素属性
                disabledActionButtons: ['data','clear','save','Remove Element'],  //设置不显示给用户的操作按钮
                editOnAdd: false
            };
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
            <div className="form_set">
                <div id="fb-editor"></div>
            </div>
        );
    },
});

export default FormBuilderComponent;

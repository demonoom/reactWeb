import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Table, Icon, Modal} from 'antd';

var map;
var point;

const AddShiftPosModel = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            changeShiftIsShow: false,
            isShow: false,
            flag: false,
        };
    },

    componentDidMount() {

    },

    componentWillReceiveProps(nextProps) {
        this.setState({isShow: nextProps.isShow});
    },

    componentDidUpdate() {
        if (this.state.isShow && !this.state.flag) {
            this.showMap();
        }
        document.getElementById('search-map').innerHTML = '<div id="r-result">请输入:<input type="text" id="suggestId" size="20" value="百度" style="width:150px;" /></div>\n' +
            '<div id="searchResultPanel" class="noom_map"></div>';
    },

    /**
     * 确定的回调
     */
    handleOk() {
        alert('确定');
    },

    /**
     * 关闭model的回调
     */
    closeChangeShiftModal() {
        this.setState({
            isShow: false,
        });
        this.props.closeModel();
        console.log(map);
        // map.centerAndZoom("西安", 12);
    },

    showMap() {

        function G(id) {
            return document.getElementById(id);
        }

        map = new BMap.Map("l-map");
        var geoc = new BMap.Geocoder();
        map.centerAndZoom("西安", 12);                   // 初始化地图,设置城市和地图级别。

        // point = map.Point(120.391655,36.067588);  // 创建点坐标
        // map.centerAndZoom(point, 15);

        map.enableScrollWheelZoom();   //启用滚轮放大缩小，默认禁用
        map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用

        map.addEventListener("click", function (e) {
            var pt = e.point;
            /*坐标  经纬度*/
            alert(pt.lng + "," + pt.lat);
            geoc.getLocation(pt, function (rs) {
                var addComp = rs.addressComponents;
                /*逆解析，获取详细地址*/
                alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
            });
        });
        this.setState({flag: true});

        var ac = new BMap.Autocomplete(    //建立一个自动完成的对象
            {
                "input": "suggestId"
                , "location": map
            });

        ac.addEventListener("onhighlight", function (e) {  //鼠标放在下拉列表上的事件
            var str = "";
            var _value = e.fromitem.value;
            var value = "";
            if (e.fromitem.index > -1) {
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

            value = "";
            if (e.toitem.index > -1) {
                _value = e.toitem.value;
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
            G("searchResultPanel").innerHTML = str;
        });

        var myValue;
        ac.addEventListener("onconfirm", function (e) {    //鼠标点击下拉列表后的事件
            var _value = e.item.value;
            myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
            G("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;

            setPlace();
        });

        function setPlace() {
            map.clearOverlays();    //清除地图上所有覆盖物
            function myFun() {
                var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
                map.centerAndZoom(pp, 18);
                map.addOverlay(new BMap.Marker(pp));    //添加标注
            }

            var local = new BMap.LocalSearch(map, { //智能搜索
                onSearchComplete: myFun
            });
            local.search(myValue);
        }
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        return (
            <Modal
                // visible={this.state.isShow}
                visible={this.state.isShow}
                width={680}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                onCancel={this.closeChangeShiftModal}
                onOk={this.handleOk}
                className="schoolgroup_modal"
            >
                <div className="modal_register_main" id="noom_map">
                    <div id="l-map" style={{height: 368}}>

                    </div>
                </div>
                <div id="search-map">

                </div>
            </Modal>
        );
    }
});

export default AddShiftPosModel;

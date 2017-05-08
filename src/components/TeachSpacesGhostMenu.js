/**
 * Created by devnote on 17-4-17.
 */
import {Menu, Icon, Row, Col} from 'antd';
import React, {PropTypes} from 'react';

class GhostMenu extends React.Component {

    constructor(props) {
        super(props);
    }



    // toggle
    toggleGhostMenu(event) {
        event = event || window.event;
        event.preventDefault();
        event.stopPropagation();
        this.props.toggleGhostMenu();
    }


    render() {

        return (
            <div className={this.props.visible ? 'ghostMenu ghostMenuShow' : 'ghostMenu ghostMenuHide' } onClick={event => { this.props.toggleGhostMenu({visible:false}); }} >
                <div className="headler" onClick={event => { this.toggleGhostMenu(event); }}><Icon type="left" /></div>
                <div className="menu_til">教学空间</div>
                <ul className="first">
                    <li ><Icon type="book" />备课</li>
                    <li className="multi">
                        <ul className="second">
                            <li  onClick={ event=>{this.props.changeTabEvent('teachTimes')}} >备课计划</li>
                            <li onClick={ event=>{ debugger; this.props.changeTabEvent('KnowledgeResources')}} >资源库</li>
                        </ul>
                    </li>
                    <li><Icon type="file-text" />作业</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event=>{this.props.changeTabEvent('homeWork')}}>布置作业</li>
                        </ul>
                    </li>
                    <li><Icon type="area-chart" />分析评价</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event=>{this.props.changeTabEvent('studyEvaluate')}}>学情分析</li>
                        </ul>
                    </li>
                    <li><Icon type="exception" />考试系统</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event=>{this.props.changeTabEvent('examination')}}>组卷</li>
                        </ul>
                    </li>
                </ul>
            </div>
        );
    }

}

export default GhostMenu;
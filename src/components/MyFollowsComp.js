/**
 * Created by madapeng on 17-4-5.
 */
import {Tabs, Breadcrumb, Icon,message,Card,Button} from 'antd';
import React from 'react';
import {doWebService} from '../WebServiceHelper';
import PersonCenterComponents from './antGroup/PersonCenterComponents';
import MyFollows from './MyFollows';

class MyFollowsComp extends React.Component {

    constructor(props) {
        super(props);
        this.state = { // define this.state in constructor
            ident: this.props.userid || sessionStorage.getItem("ident"),
            listVisible: true,
            antGroupTabResouceType:'personCenter',
            antGroupTabVisible:false
        };
            this.htmlTemplet={}
    }


    detailed(dataa){
       debugger
        this.setState({listVisible:false});
        this.setState({antGroupTabVisible:true});
       this.refs.antGroup;

     };
    componentWillMount(){


    }


    render() {

        return (
            <div>
                <MyFollows showdetails={this.detailed.bind(this)} visibile={this.state.listVisible} />
                <AntGroupTabComponents ref="antGroup"  resouceType={this.state.antGroupTabResouceType} visibile={this.state.antGroupTabVisible} />
            </div>
        );
    }
}

export default MyFollowsComp;

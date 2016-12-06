import React from 'react';


const ProgressBar = React.createClass({

    render() {
        return (
            <div style={{backgroundColor:'gray',heigth:8,width:'100%'}}>
                <div id="pro" style={{width:'20%',height:5,backgroundColor:'green'}}></div>
            </div>
        );
    }

});
export default ProgressBar;




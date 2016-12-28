import React from 'react';


const ProgressBar = React.createClass({

    render() {
        return (
            <div className="progress_bar">
                <div id="pro" className="progress_thumb" style={{width:'60%'}}></div>
            </div>
        );
    }

});
export default ProgressBar;




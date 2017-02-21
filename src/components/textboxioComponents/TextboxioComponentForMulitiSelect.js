import React from 'react';

var TextboxioComponentForMulitiSelect = React.createClass({
  componentDidMount(){
    mytextareaMulitiEditor = textboxio.replace('#myMulitiTextarea',defaultConfig);
  },
  render : function(){
    return (
      <div>
        <div id="myMulitiTextarea" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForMulitiSelect;

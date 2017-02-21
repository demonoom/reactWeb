import React from 'react';

var TextboxioComponentForSingle = React.createClass({
  componentDidMount(){
    mytextareaSingleEditor = textboxio.replace('#mytextarea',defaultConfig);
  },
  render : function(){
    return (
      <div>
        <div id="mytextarea" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForSingle;

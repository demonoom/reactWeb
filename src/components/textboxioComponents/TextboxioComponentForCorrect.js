import React from 'react';

var TextboxioComponentForCorrect = React.createClass({
  componentDidMount(){
    mytextareaCorrectEditor = textboxio.replace('#myCorrectTextarea',defaultConfig);
  },
  render : function(){
    return (
      <div>
        <div id="myCorrectTextarea" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForCorrect;

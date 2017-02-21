import React from 'react';

var TextboxioComponentForAnswer = React.createClass({
  componentDidMount(){
    mytextareaAnswerEditor = textboxio.replace('#myAnswerTextarea',defaultConfig);
  },
  render : function(){
    return (
      <div>
        <div id="myAnswerTextarea" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForAnswer;

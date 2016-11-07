import React, { PropTypes } from 'react';
import { Card, Col, Row,Checkbox } from 'antd';

function onChange(e) {
  console.log(`checked = ${e.target.checked}`);
}

const CourseWareComponents = (props) => {
  return (
    <div style={{ background: '#ECECEC', padding: '30px' }}>
      <Row>
        <Col span="8">
          <Card bordered={true}>
            <div className="custom-image">
              <img alt="example" width="100%" height="150px" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />
              <div className="custom-card">
                题目：<h3>荒漠化的防治</h3>
                <p>上传者：叶练</p>
                <p>类型：PPT</p>
                <p>时间：2016-1-1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <Checkbox onChange={onChange}></Checkbox></p>

              </div>
            </div>
          </Card>
        </Col>
        <Col span="8">
          <Card  bordered={true}>
            <div className="custom-image">
              <img alt="example" width="100%" height="150px" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />
              <div className="custom-card">
                题目：<h3>荒漠化的防治</h3>
                <p>上传者：叶练</p>
                <p>类型：PPT</p>
                <p>时间：2016-1-1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <Checkbox onChange={onChange}></Checkbox></p>
              </div>
            </div>
          </Card>
        </Col>
        <Col span="8">
          <Card  bordered={true}>
            <div className="custom-image">
              <img alt="example" width="100%" height="150px" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />
              <div className="custom-card">
                题目：<h3>荒漠化的防治</h3>
                <p>上传者：叶练</p>
                <p>类型：PPT</p>
                <p>时间：2016-1-1 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <Checkbox onChange={onChange}></Checkbox></p>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

CourseWareComponents.propTypes = {
};

export default CourseWareComponents;

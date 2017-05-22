import React, { PropTypes } from 'react';
import { Router, Route } from 'dva/router';
import MainLayout from './routes/MainLayout';
import StudentMainLayout from './routes/StudentMainLayout';
import Login from './routes/Login';

export default function({ history }) {
    return (
        <Router history={history}>
            <Route path="/"           component={Login} />
            <Route path="/MainLayout" component={MainLayout} />
            <Route path="/StudentMainLayout" components={StudentMainLayout}/>
            <Route path="/login" component={Login}/>
            <Route path="/LittleAntWeb" component={Login}/>
        </Router>
    );
};

import React, { PropTypes } from 'react';
import { Router, Route } from 'dva/router';
import MainLayout from './routes/MainLayout';
import Login from './routes/Login';

export default function({ history }) {
    return (
        <Router history={history}>
            <Route path="/LittleAntWeb" component={Login} />
            <Route path="/MainLayout" component={MainLayout} />
            <Route path="/login" component={Login}/>
        </Router>
    );
};

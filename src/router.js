import React, { PropTypes } from 'react';
import { Router, Route, IndexRoute, Link } from 'dva/router';
import IndexPage from './routes/IndexPage';
import Products from './routes/Products';
import Buttons from './routes/Buttons';
import Btns from './routes/btnTest'
import MainLayout from './routes/MainLayout';
import Login from './routes/Login';

export default function({ history }) {
    return (
        <Router history={history}>
            <Route path="/" component={Login} />
           {/* <Route path="/" component={IndexPage} />*/}
            <Route path="/products" component={Products} />
            <Route path="/buttons" component={Buttons} />
            <Route path="/btnTest" component={Btns} />
            <Route path="/MainLayout" component={MainLayout} />
            <Route path="/login" component={Login}/>
        </Router>
    );
};

import React, {PropTypes} from 'react';
//国际化
import {IntlProvider, addLocaleData} from 'react-intl';
import {FormattedMessage} from 'react-intl';
import zh from 'react-intl/locale-data/zh';
import en from 'react-intl/locale-data/en';

const MaaeeLogo = (props) => {
    return (
        <div>
            {/*<img src={require('./images/maaee.png')} className="logo_layout"/>*/}
            <img src={require('./images/logoSmall.png')} className="logo_layout"/>
            <div  className="logoFont">
                <FormattedMessage
                id='teachingPlatform'
                description='小蚂蚁移动教学平台'
                defaultMessage='小蚂蚁移动教学平台'
                />
            </div>
        </div>

    );
};

MaaeeLogo.propTypes = {};

export default MaaeeLogo;

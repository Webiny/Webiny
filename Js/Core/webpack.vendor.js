const Webiny = require('webiny/lib/webiny');
const path = require('path');
const DllBootstrapPlugin = require('./Lib/Webpack/DllBootstrapPlugin');

module.exports = (config) => {
    config.resolve.alias['webiny-lodash'] = path.resolve(Webiny.projectRoot(), 'Apps/Webiny/Js/Core/Vendors/Lodash');
    config.resolve.alias['bluebird'] = 'bluebird/js/browser/bluebird.core.js';

    config.entry['vendor'] = [
        'jquery',
        'bootstrap-sass',
        'bluebird',
        'react',
        'react-dom',
        'react-dom/server',
        'react-transition-group',
        'classnames',
        'immutable',
        'baobab',
        'js-cookie',
        'ismobilejs',
        'webiny-lodash',
        'moment',
        'history',
        'jquery-deparam',
        'platform',
        './Webiny',
        './Bootstrap'
    ];

    config.plugins.push(new DllBootstrapPlugin({module: './Bootstrap'}));

    return config;
};

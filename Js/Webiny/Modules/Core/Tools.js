class Tools {

    createUID() {
        const delim = '-';

        function s4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return s4() + s4() + delim + s4() + delim + s4() + delim + s4() + delim + s4() + s4() + s4();
    }

    keys(obj) {
        if (obj instanceof Array) {
            return [...obj.keys()];
        }
        return Object.keys(obj);
    }

    toSlug(str) {
        const trimmed = _.trim(str);
        const url = trimmed.replace(/[^a-z0-9-\/]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
        if (url.length) {
            return url;
        }

        return null;
    }

    getAppsSettings() {
        const settings = [];
        _.each(Webiny.Apps, app => {
            _.each(app.Backend.modules, module => {
                _.each(module.settings, s => {
                    settings.push(s);
                });
            });
        });
        return settings;
    }

    getAppsMenus() {
        const menus = {};
        _.each(Webiny.Apps, app => {
            _.each(app.Backend.modules, module => {
                _.each(module.menus, menu => {
                    menus[menu.key] = menu;
                });
            });
        });

        return _.values(menus);
    }
}

export default new Tools;

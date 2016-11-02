import Webiny from 'Webiny';

class BasePlugin {
    constructor() {
        this.name = '';
        this.config = {};
        this.editor = null;
    }

    ui(call, ...params) {
        if (call.indexOf(':') < 0) {
            return Webiny.Ui.Dispatcher.get(call);
        }
        return Webiny.Ui.Dispatcher.createSignal(this, call, params);
    }

    isDisabled() {
        return this.editor.getPreview();
    }

    setConfig(config) {
        this.config = config;
        return this;
    }

    setEditor(editor) {
        this.editor = editor;
        return this;
    }

    getEditConfig() {
        return {};
    }

    getPreviewConfig() {
        return this.getEditConfig();
    }
}

export default BasePlugin;
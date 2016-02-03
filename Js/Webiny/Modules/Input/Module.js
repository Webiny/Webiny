import Webiny from 'Webiny';
import Input from './Input';

class Module extends Webiny.Module {

    constructor(app) {
        super(app);
        Webiny.Ui.Components.Input = Input;
    }
}

export default Module;
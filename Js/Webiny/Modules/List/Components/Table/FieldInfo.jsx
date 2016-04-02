import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;

class FieldInfo extends Webiny.Ui.Component {

    constructor(props) {
        super(props);

        this.state = {
            showInfo: false
        };

        this.bindMethods('showInfo,hideInfo');
    }

    showInfo() {
        this.setState({showInfo: true});
    }

    hideInfo() {
        this.setState({showInfo: false});
    }
}

FieldInfo.defaultProps = {
    renderer: function renderer() {
        const info = (
            <a onClick={this.showInfo} href="javascript:void(0);">
                <span className="icon icon-info"></span>
            </a>
        );

        const modal = (
            <Ui.Modal.Dialog show={this.state.showInfo} onHide={this.hideInfo}>
                <Ui.Modal.Header title={this.props.title}/>
                <Ui.Modal.Body children={this.props.children}/>
                <Ui.Modal.Footer>
                    <Ui.Button label="Close" onClick={this.hideInfo}/>
                </Ui.Modal.Footer>
            </Ui.Modal.Dialog>
        );

        return (
            <webiny-field-info>
                {info}
                {modal}
            </webiny-field-info>
        );
    }
};

export default FieldInfo;
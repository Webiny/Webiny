import BaseComponent from '/Core/Base/BaseComponent';

class Input extends BaseComponent {

	getFqn(){
		return 'Core.View.Input';
	}

	getInitialState(){
		var state = {
			labelCss: {
				"control-label": true,
				"col-sm-2": true
			},
			inputCss: {
				"col-sm-10": this.props.grid == 12,
				"col-sm-4": this.props.grid == 6
			}
		}
		return state;
	}

	getDefaultProperties(){
		return {
			disabled: false,
			placeholder: '',
			label: '',
			grid: 12
		}
	}


}

export default Input;

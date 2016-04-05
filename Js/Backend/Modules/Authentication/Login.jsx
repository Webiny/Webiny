import Webiny from 'Webiny';

class Login extends Webiny.Ui.View {

    render() {
        return (
            <Webiny.Ui.Views.Login api="/core/users" onSuccess="Dashboard" tokenName="webiny-token"/>
        );
    }
}

export default Login;
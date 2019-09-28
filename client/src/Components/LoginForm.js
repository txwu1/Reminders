import React from 'react';
import './style.css';
import ErrorMessage from './ErrorMessage';

class LoginForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {  cancelMethod: this.props.cancelMethod,
                        email: "",
                        password: "",
                        displayErrorMessage: false,
                        errorMessage: ""
                    };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.clearForm = this.clearForm.bind(this);
    }

    handleChange(event){
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({[name]: value});
    }

    handleSubmit(event){
        event.preventDefault();
        // validate info
        if (this.state.password.length < 8){
            console.log(this.state.password);
            this.setState({displayErrorMessage: true,
                            errorMessage: "Password must be at least 8 characters long"});
        }

        const data = 
        {
            email: this.state.email,
            password: this.state.password,
        };

        // post request
        fetch("/api/login", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async (res) => {
            if (res.status === 401) {
                throw new Error("Incorrect login information.");
            }
            return res.json()
        })
        .then(res => {
            this.clearForm();
            this.props.setUserLoggedIn();
        })
        .catch(err => {
            console.log(err.message);
            let msg = err.message;
            this.setState({displayErrorMessage: true,
                errorMessage: msg + " Please try again."});
        });
    }

    clearForm(){
        this.formRef.reset();
        this.setState({
            email: "",
            password: "",
            displayErrorMessage: false,
            errorMessage: ""
        });
    }

    handleCancel(event){
        event.persist();
        this.setState(
            {
                displayErrorMessage: false,
                errorMessage: ""
            },
            () => {
                this.clearForm();
                this.state.cancelMethod(event);
            }
        );
    }

    render(){
        return(
            <div className="bgc-createAccount py-2">
            <div className="container-fluid mx-auto my-2 mw-550 text-center border rounded bgc-white">
                <div>
                    <h1 className="header-createAccount mt-2">Login To Your Account</h1>
                </div>
                <ErrorMessage display={this.state.displayErrorMessage} message={this.state.errorMessage}/>
                <div className="mx-3 mb-3 mt-4">
                <form ref={(el) => {this.formRef = el;}} onSubmit={this.handleSubmit}>
                    <div className="form-group text-left">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" className="form-control" onChange={this.handleChange} required/>
                    </div>
                    <div className="form-group text-left">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" className="form-control" onChange={this.handleChange} minLength="8" required/>
                    </div>
                    <div className="my-2">
                        <button className={"btn btn-success p-2 mx-2"}>Login</button>
                        <button className={"btn btn-danger p-2 mx-2"} onClick={this.handleCancel}>Cancel</button>
                    </div>
                </form>
                </div>
            </div>
            </div>
            );
    }
}

export default LoginForm;
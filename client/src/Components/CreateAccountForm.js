import React from 'react';
import './style.css';
import ErrorMessage from './ErrorMessage';

class CreateAccountForm extends React.Component{
    constructor(props){
        super(props);
        this.state = {  cancelMethod: this.props.cancelMethod,
                        email: "",
                        password: "",
                        emailReceive: "",
                        phoneNumber: "",
                        displayErrorMessage: false,
                        errorMessage: ""
                    }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.clearForm = this.clearForm.bind(this);
    }

    handleChange(event){
        const target = event.target;
        const value = target.value;
        let name = target.name;
        if (name.split("-").length > 1){
            name = name.split("-")[0] + name.split("-")[1].charAt(0).toUpperCase() + name.split("-")[1].slice(1);
        }
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
            emailReceive: this.state.emailReceive,
            phoneNumber: this.state.phoneNumber
        };

        // post request
        fetch("/api/createAccount", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(async (res) => {
            if (res.status >= 400 && res.status < 600) {
                let err = await res.json();
                throw new Error(await err.err);
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
            emailReceive: "",
            phoneNumber: "",
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
                    <h1 className="header-createAccount mt-2">Create Account</h1>
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
                    <div className="form-group text-left">
                        <label htmlFor="email-receive">Receiving Email Address (For Notifications)</label>
                        <input type="email" name="email-receive" className="form-control" onChange={this.handleChange} placeholder="Leave empty if same as primary email" />
                    </div>
                    <div className="form-group text-left">
                        <label htmlFor="phone-number">Phone Number</label>
                        <input type="tel" name="phone-number" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" className="form-control" onChange={this.handleChange} placeholder="ex: 111-111-1111"/>
                    </div>
                    <div className="my-2">
                        <button className={"btn btn-success p-2 mx-2"}>Create Account</button>
                        <button className={"btn btn-danger p-2 mx-2"} onClick={this.handleCancel}>Cancel</button>
                    </div>
                </form>
                </div>
            </div>
            </div>
            );
    }
}

export default CreateAccountForm;
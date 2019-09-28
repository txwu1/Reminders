import React from 'react';
import './style.css';
import LoginForm from './LoginForm';
import CreateAccountForm from './CreateAccountForm';

class LoginButton extends React.Component{
    constructor(props){
      super(props);

      this.state = {isLoggedIn: this.props.userLoggedIn,
                    displayLogIn: false,
                    displayCreateAccount: false
                  };
      this.displayLogInForm = this.displayLogInForm.bind(this);
      this.displayCreateAccount = this.displayCreateAccount.bind(this);
      this.returnToButton = this.returnToButton.bind(this);
      this.handleLogout = this.handleLogout.bind(this);
    }
  
    displayLogInForm(e){
      e.preventDefault();
      this.setState({displayLogIn: true});
    }

    displayCreateAccount(e){
      e.preventDefault();
      this.setState({displayCreateAccount: true});
    }
  
    returnToButton(e){
      e.preventDefault();
      this.setState({displayLogIn: false, displayCreateAccount: false});
    }

    componentDidUpdate(prevProps, prevState){
      if (prevProps.userLoggedIn !== this.props.userLoggedIn){
          console.log("login status changed for login button");
          this.setState({isLoggedIn: this.props.userLoggedIn});
          if (this.props.userLoggedIn){
            this.setState({displayLogIn: false, displayCreateAccount: false})
          }
      }
    }

    handleLogout(){
      fetch("/api/logout", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "same-origin"
      })
      .then(async (res) => {
        if (res.status >= 400 && res.status < 600) {
            let err = await res.json();
            throw new Error(await err.err);
        }
        return res.json()
      })
      .then(res => {
        console.log(res);
        this.props.setUserLoggedOut();
      })
      .catch(err => {
          console.log(err.message);
      });
    }
  
    render(){
      if (this.state.displayLogIn){
        return(
          <LoginForm setUserLoggedIn={this.props.setUserLoggedIn} cancelMethod={this.returnToButton}/>
        );
      } else if (this.state.displayCreateAccount){
        return(
          <CreateAccountForm setUserLoggedIn={this.props.setUserLoggedIn} cancelMethod={this.returnToButton}/>
        );
      } else {
        if (this.state.isLoggedIn){
            return (
              <div className="container-fluid text-center my-2 mx-auto">
                <button className="btn btn-secondary mx-2"><i className="fas fa-cog mr-1"></i>Settings</button>
                <button className="btn btn-info mx-2" onClick={this.handleLogout}><i className="fas fa-sign-out-alt mr-1"></i>Log Out</button>
              </div>
            );
        } else {
            return (
              <div className="container-fluid text-center">
                <button className={"btn btn-warning p-btn-lg mx-2 " + this.props.mt} onClick={this.displayLogInForm}>Log In</button>
                <button className={"btn btn-info p-btn-lg mx-2 " + this.props.mt} onClick={this.displayCreateAccount}>Sign Up</button>
              </div>
            );
        }
      }
    }
  }

export default LoginButton;
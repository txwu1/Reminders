import React from 'react';
import './App.css';
import MainContainer from './Components/MainContainer';
import LoginButton from './Components/LoginButton';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {userLoggedIn: false};
    this.setUserLoggedIn = this.setUserLoggedIn.bind(this);
    this.setUserLoggedOut = this.setUserLoggedOut.bind(this);
  }

  componentDidMount(){
    fetch("/api/userLoggedIn")
    .then((res) => {return res.json()})
    .then(
      (res) => {
        console.log(res);
        console.log("fetch processed");
        this.setState({userLoggedIn: res.loggedIn});
      },
      (error) => {
        console.log(error);
      }
    );
  }

  setUserLoggedIn(){
    this.setState({userLoggedIn: true});
  }

  setUserLoggedOut(){
    this.setState({userLoggedIn: false});
  }

  render(){
    return (
      <div>
        <Header />
        <LoginButton setUserLoggedIn={this.setUserLoggedIn} setUserLoggedOut={this.setUserLoggedOut} userLoggedIn={this.state.userLoggedIn} mt="mt-2"/>
        <MainContainer isLoggedIn={this.state.userLoggedIn}/>
      </div>
    );
  }
}

function Header(props){
  return (
    <div className="container-fluid px-0">
      <div className="container-fluid px-0"></div>
      <div className="container-fluid py-4 px-0 header-container text-center">
        <h1>REMINDERS</h1>
        <p>Quick and easy way to remind yourself of your friends' birthdays</p>
      </div>
    </div>
  );
}

export default App;

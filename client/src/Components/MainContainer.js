import React from 'react';
import './style.css';
import AddReminder from './AddReminder';
import ReminderDisplay from './ReminderDisplay';

class MainContainer extends React.Component{
    constructor(props){
        super(props);
  
        this.state = { isLoggedIn: this.props.isLoggedIn,
                    };
    }

    componentDidUpdate(prevProps, prevState){
        if (prevProps.isLoggedIn !== this.props.isLoggedIn){
            console.log("login status changed for main container");
            this.setState({isLoggedIn: this.props.isLoggedIn});
        }
    }

    render(){
        if (this.state.isLoggedIn){
            return(
                <div className="mw-800 mx-auto my-4">
                    <div className="container-fluid px-0 mx-auto border rounded border-secondary">
                        <AddReminder />
                        <ReminderDisplay />
                    </div>
                </div>
            );
        } else {
            return("");
        }
    }
}

export default MainContainer;
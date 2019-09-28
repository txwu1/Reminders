import React from 'react';
import './style.css';
import Reminder from './Reminder';

class ReminderDisplay extends React.Component{
    constructor(props){
        super(props);
  
        this.state = {  isLoggedIn: false,
                        displayData: null
                    };
        this.getReminders = this.getReminders.bind(this);
    }

    componentDidMount(){
        this.getReminders();
    }

    getReminders(){
        fetch("/api/getReminders")
        .then(async (res) => {
            if (res.status >= 400 && res.status < 600) {
                let err = await res.json();
                throw new Error(await err.err);
            }
            return res.json()
        })
        .then(res => {
            console.log(res.data);
            this.setState({displayData: res.data});
        })
        .catch(err => {
            console.log(err.message);
        });
    }

    render(){
        return(
            <div className="m-4">
                <div className="container-fluid px-0 mx-auto">
                    <div className="text-center">
                        <h2>Reminders</h2>
                    </div>
                    <ReminderList refresh={this.getReminders} reminders={this.state.displayData} />
                </div>
            </div>
        );
    }
}

function ReminderList(props){
    let reminders = props.reminders;
    if (reminders && reminders.length > 0){
        const listItems = reminders.map((reminder) =>
            <Reminder refresh={props.refresh} key={reminder.id} id={reminder.id} data={reminder.data}/>
        );
        return (
            <table className="table">
                <thead>
                    <tr className="reminder-table-head">
                        <th scope="col">Name</th>
                        <th scope="col">Event Date</th>
                        <th scope="col"># Days Before</th>
                        <th scope="col"><i className="fas fa-redo pointer" onClick={props.refresh}></i></th>
                    </tr>
                </thead>
                <tbody>
                    {listItems}
                </tbody>
            </table>
        );
    } else {
        return(
            <div>
                <h3>No Reminders to display</h3>
            </div>
        );
    }
}

export default ReminderDisplay;
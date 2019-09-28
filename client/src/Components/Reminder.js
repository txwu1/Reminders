import React from 'react';
import './style.css';

class Reminder extends React.Component{
    constructor(props){
        super(props);
  
        this.state = {
                        editState: false,
                        name: this.props.data.name,
                        eventDay: this.props.data.eventDay,
                        eventMonth: this.props.data.eventMonth,
                        maxDays: getMaxDays(this.props.data.eventMonth),
                        daysBefore: this.props.data.daysBefore,
                        originalData: null
                    };
        this.toggleEditState = this.toggleEditState.bind(this);
        this.deleteReminder = this.deleteReminder.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps, prevState){
        if (prevProps.data !== this.props.data){
            this.setState({
                name: this.props.data.name,
                eventDay: this.props.data.eventDay,
                eventMonth: this.props.data.eventMonth,
                maxDays: getMaxDays(this.props.data.eventMonth),
                daysBefore: this.props.data.daysBefore
            });
        }
    }


    handleChange(e){
        const target = e.target;
        const name = target.name;

        let daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (name === "eventMonth"){
            let month = target.value;

            if (month === ""){
                this.setState({
                    eventMonth: month,
                    maxDays: 31
                });
            } else {
                if (month < 1){
                    month = 1;
                } else if (month > 12){
                    month = 12;
                }

                let day = this.state.eventDay > daysInMonth[month - 1] ? daysInMonth[month - 1] : this.state.eventDay;

                this.setState({
                    eventMonth: month,
                    eventDay: day,
                    maxDays: daysInMonth[month - 1]
                });
            }
        } else if (name === "eventDay"){
            let month = this.state.eventMonth;
            let value = target.value;

            if (value === ""){
                // don't do anything
            }
            else if (value < 1){
                value = 1;
            } else if( value > daysInMonth[month - 1]){
                value = daysInMonth[month - 1];
            }

            this.setState({
                eventDay: value
            });
        } else if (name === "daysBefore"){
            let value = target.value;

            if (value === ""){
                // don't do anything
            }
            else if (value < 1){
                value = 1;
            } else if( value > 90){
                value = 90;
            }

            this.setState({
                daysBefore: value
            });
        } else {
            this.setState({[name]: target.value});
        }
    }

    handleSubmit(e){
        e.preventDefault();

        let data = {
            id: this.props.id,
            name: this.state.name,
            eventMonth: this.state.eventMonth,
            eventDay: this.state.eventDay,
            daysBefore: this.state.daysBefore
        };

        fetch("/api/updateReminder", {
            method: "PATCH",
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
            console.log("nice");
            this.toggleEditState();
            this.props.refresh();
        })
        .catch(err => {
            console.log(err.message);
        });
    }

    toggleEditState(){
        let editState = !this.state.editState;
        // before editting, save curr data, else put back original data
        if (editState){
            let data = {
                name: this.state.name,
                eventMonth: this.state.eventMonth,
                eventDay: this.state.eventDay,
                daysBefore: this.state.daysBefore,
            };
            this.setState({ originalData: data,
                            editState: editState
            });
        } else {
            this.setState({
                name: this.state.originalData.name,
                eventMonth: this.state.originalData.eventMonth,
                eventDay: this.state.originalData.eventDay,
                daysBefore: this.state.originalData.daysBefore,
                editState: editState,
                originalData: null
            });
        }
    }

    deleteReminder(){
        console.log("attempting to delete reminder");
        let data = {
            id: this.props.id
        }
        // call delete
        fetch("/api/deleteReminder", {
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
            console.log("nice");
            this.props.refresh();
        })
        .catch(err => {
            console.log(err.message);
        });
    }

    render(){
        if (!this.state.editState){
            let dayString = this.state.eventDay < 10 ? ("0" + this.state.eventDay) : this.state.eventDay;
            return(
                <tr className="align-items-center reminder-table-body">
                    <th>{this.state.name}</th>
                    <th>{this.state.eventMonth}/{dayString}</th>
                    <th>{this.state.daysBefore}</th>
                    <th scope="row">
                        <button className="btn btn-success" onClick={this.toggleEditState}>Edit</button>
                        <button className="btn btn-failure" onClick={this.deleteReminder}>Delete</button>
                    </th>
                </tr>
            );
        } else {
            return(
                <tr className="align-items-center reminder-table-body">
                    <th><input type="text" name="name" value={this.state.name} onChange={this.handleChange} minLength="1" required/></th>
                    <th>
                    <input type="number" min="1" max="12" name="eventMonth" value={this.state.eventMonth} className="text-center" onChange={this.handleChange} title="Month" placeholder="MM" required/>
                            <input type="number" min="1" max={this.state.maxDays} name="eventDay" value={this.state.eventDay}  className="text-center" onChange={this.handleChange} title="Day" placeholder="DD" required/>
                    </th>
                    <th><input type="number" name="daysBefore" min="1" max="90" value={this.state.daysBefore} className="text-center" onChange={this.handleChange} title="1 to 90" required/></th>
                    <th scope="row">
                        <button className="btn btn-success mr-2" onClick={this.handleSubmit}>Update</button>
                        <button className="btn btn-failure" onClick={this.toggleEditState}>Cancel</button>
                    </th>
                </tr>
            );
        }
    }
}

let getMaxDays = function(month){
    let daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonth[month - 1];
}

export default Reminder;
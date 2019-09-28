import React from 'react';
import './style.css';

class AddReminder extends React.Component{
    constructor(props){
        super(props);
  
        this.state = {  isLoggedIn: false,
                        name: "",
                        eventMonth: "",
                        eventDay: "",
                        maxDays: 31,
                        daysBefore: "",
                        collapse: true
                    };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
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
            name: this.state.name,
            eventMonth: this.state.eventMonth,
            eventDay: this.state.eventDay,
            daysBefore: this.state.daysBefore
        };

        fetch("/api/addReminder", {
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
            this.setState({
                name: "",
                eventMonth: "",
                eventDay: "",
                maxDays: 31,
                daysBefore: ""
            });
        })
        .catch(err => {
            console.log(err.message);
        });
    }

    toggleCollapse(){
        let collapse = this.state.collapse ? false : true;
        this.setState({collapse: collapse});
    }

    render(){
        if (this.state.collapse){
            return(
                <div className="my-2 mx-4">
                    <div className="text-center header-addReminder border rounded border-secondary pointer" onClick={this.toggleCollapse}> 
                        <p className="my-0 py-2">ADD A REMINDER</p>
                    </div>
                </div>
            );
        } else {
            return(
                <div className="m-4">
                    <div className="text-center header-addReminder pointer" onClick={this.toggleCollapse}>
                        <h1>ADD A REMINDER</h1>
                    </div>
                    <div className="container-fluid px-0 mx-auto border rounded border-secondary">
                        <div className="mx-3 mb-3 mt-4">
                        <form ref={(el) => {this.formRef = el;}} onSubmit={this.handleSubmit}>
                            <div className="form-group text-left row mx-auto px-0">
                                <div className="col-1 d-flex align-items-center mx-0 px-0">
                                    <label htmlFor="name" className="mb-0">Name:</label>
                                </div>
                                <div className="col mx-auto">
                                    <input type="text" name="name" value={this.state.name} className="w-100" onChange={this.handleChange} minLength="1" required/>
                                </div>
                            </div>
                            <div className="row mx-auto px-0">
                            <div className="form-group text-left col-5 mx-auto px-0">
                                <label htmlFor="eventMonth">Date of Event:</label>
                                <input type="number" min="1" max="12" name="eventMonth" value={this.state.eventMonth} className="ml-2 text-center" onChange={this.handleChange} title="Month" placeholder="MM" required/>
                                <input type="number" min="1" max={this.state.maxDays} name="eventDay" value={this.state.eventDay}  className="text-center" onChange={this.handleChange} title="Day" placeholder="DD" required/>
                            </div>
                            <div className="form-group text-left col mx-auto px-0">
                                <label htmlFor="daysBefore">Select how many days before to send reminder:</label>
                                <input type="number" name="daysBefore" min="1" max="90" value={this.state.daysBefore} className="ml-2 text-center" onChange={this.handleChange} title="1 to 90" required/>
                            </div>
                            </div>
                            <div className="my-2">
                                <button className={"btn btn-success p-2 mx-2"}>Add Reminder</button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default AddReminder;
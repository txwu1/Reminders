import React from 'react';
import './style.css';

class ErrorMessage extends React.Component{
    constructor(props){
        super(props);
        this.state = {  display: this.props.display,
                        message: this.props.message};
    }

    componentDidUpdate(prevProps, prevState){
        if (prevProps.display !== this.props.display){
            this.setState(this.props);
        }
    }

    render(){
        if (this.state.display){
            return(
                <div className="container-fluid mx-auto px-0 text-center border border-danger rounded bgc-white mw-400">
                    <p className="my-0 py-2"><i className="fas fa-info-circle mr-2"></i>{this.state.message}</p>
                </div>
            );
        } else {
            return(
                ""
            );
        }
    }
}

export default ErrorMessage;
import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CaliforniaCalc from './components/CaliforniaCard/Card';

class App extends Component {
  constructor() {
    super();
    this.state = {
      buttonClicked: false,
      cards: [
        {
          index: 0,
          delete: false
        }
      ]
    }
  }

  addCard = () => {
    var cards = this.state.cards.slice();
    if (cards.length < 5) {
      cards.push({
        index: cards.length,
        delete: false
      });
      this.setState({cards: cards});
    }
    else {
      document.getElementById("signUpbtnCal").click();
      document.querySelector(".signupForm__title").innerHTML =
        "<span>Need to calculate for multiple staff?</span><span>Sign up below to start your 14-day free trial</span>";
    }
  }

  handleAdd = (event) => {
    this.addCard();
    event.preventDefault();
    return;
  }

  toggleButton = (event) => {
    this.setState({buttonClicked: true});
    event.preventDefault();
    return;
  }

  onChildChange = (action, index) => {
    var cards = this.state.cards.slice();
    if (action === "delete") {
      cards.splice(index,1);
    }
    this.setState({cards: cards});
  }

  createCalcs = () => {
    return this.state.cards.map((values, i)=> {
      return(
        <CaliforniaCalc
        key={values.index}
        index={i} id={i}
        buttonClicked={this.state.buttonClicked}
        delete={values.delete}
        callbackFromParent = {(action,index) => this.onChildChange(action, i)} />
      )
    })
  }

  render() {
    return (
      <div className="california-container row">
        <div className="cali-containers">
          {this.createCalcs()}
        </div>
        <div className="col-sm-12 margin-top-3">
          <div className="row">
            <div className="col-6 add-employees">
              <a onClick={this.handleAdd}>+ Add employee</a>
            </div>
            <div className="col-6 calculate-pay">
              <a onClick={this.toggleButton}>Calculate pay rates</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

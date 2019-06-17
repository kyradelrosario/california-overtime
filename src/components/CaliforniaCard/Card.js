import React, { Component } from 'react';
import Moment from 'react-moment';
declare var analytics: any;

class CaliforniaCalc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      employeeName: '',
      hourlyRate: 0.00,
      startDate: '',
      hideOpen: false,
      allHours: 0,
      totalHourlyPay: "0.00",
      totalOvertimePay: "0.00",
      totalDoubletimePay: "0.00",
      totalPay: "0.00",
      workedConsecutive: false,
      dates: [
        '--',
        '--',
        '--',
        '--',
        '--',
        '--',
        '--'
      ],
      start: [
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      end: [
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ],
      totalHours: [
        "0.0",
        "0.0",
        "0.0",
        "0.0",
        "0.0",
        "0.0",
        "0.0",
      ]
    }

  }

  addClose = (event) => {
    event.preventDefault();
    var hideOpen = !this.state.hideOpen;
    this.setState({hideOpen: hideOpen});
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value})
  }

  handleRateChange = (event) => {
    var inputKeyCode = event.keyCode ? event.keyCode : event.which;

    if (inputKeyCode != null) {
        if (inputKeyCode == 45) event.preventDefault();
    }

    var hourlyRate = event.target.value;

    if(event.target.value > 9999999999) {
      hourlyRate = 9999999999;
    }
    else if (event.target.value < 0) {
      hourlyRate = 0;
    }


    var start = this.state.start;
    var end = this.state.end;
    this.handleMajorCalculator(start,end,hourlyRate);
  }

  handleStartTimeChange = (event) => {
    var start = this.state.start;
    start[parseInt(event.target.name)] = event.target.value;
    var end = this.state.end;
    var hourlyRate = this.state.hourlyRate;
    this.handleMajorCalculator(start,end,hourlyRate);
  }

  handleClose = (event) => {
    event.preventDefault();
    this.props.callbackFromParent('delete', this.props.index);
  }

  handleEndTimeChange = (event) => {
    var end = this.state.end;
    end[parseInt(event.target.name)] = event.target.value;
    var start = this.state.start;
    var hourlyRate = this.state.hourlyRate;
    this.handleMajorCalculator(start,end,hourlyRate);
  }

  handleMajorCalculator = (start,end,hourlyRate) => {
    var totalHours = this.calculateHours(start,end);
    var allHours = this.calculateAllHours(totalHours);

    var totalHourlyPay = 0.0;
    var totalOvertimePay = 0.0;
    var totalDoubletimePay = 0.0;
    var totalPay = 0.0;

    var workedConsecutive = this.findWorkedConsecutive(totalHours);

    var allPay = this.calculatePay(totalHours, hourlyRate, workedConsecutive);

    totalHourlyPay = allPay.totalHourlyPay;
    totalOvertimePay = allPay.totalOvertimePay;
    totalDoubletimePay = allPay.totalDoubletimePay;
    totalPay = allPay.totalPay;

    if(workedConsecutive) {
      var Pay = this.findSeventhPay(totalHours[6], totalOvertimePay, totalDoubletimePay, hourlyRate);
      totalOvertimePay = Pay.totalOvertimePay;
      totalDoubletimePay = Pay.totalDoubletimePay;
      totalPay = totalOvertimePay + totalDoubletimePay + totalHourlyPay;
    }

    totalHourlyPay = Math.round((totalHourlyPay) * 100)/100;
    totalOvertimePay = Math.round((totalOvertimePay) * 100)/100;
    totalDoubletimePay = Math.round((totalDoubletimePay) * 100)/100;
    totalPay = Math.round((totalPay) * 100)/100;

    this.setState({
      start: start,
      end: end,
      hourlyRate: hourlyRate,
      totalHours: totalHours,
      allHours: allHours,
      workedConsecutive: workedConsecutive,
      totalHourlyPay: totalHourlyPay,
      totalOvertimePay: totalOvertimePay,
      totalDoubletimePay: totalDoubletimePay,
      totalPay: totalPay
    })
  }

  handleDateChange = (event) => {
    var dateString = event.target.value;
    var dates = [];

    for(var i = 0; i<7;i++) {
      var date1 = new Date(dateString);
      date1.setDate(date1.getDate()+i);
      var dd = date1.getDate();
      var mm = date1.getMonth()+1;
      var yyyy = date1.getFullYear();
      dates.push(dd+'/'+mm+'/'+yyyy);
    }

    this.setState({
      [event.target.name]: event.target.value,
      dates: dates
      })

  }

  calculateHours = (startTimes, endTimes) => {
    var totalHours = this.state.totalHours;

    for(var i=0; i<startTimes.length; i++) {
      if(startTimes[i] != "" && endTimes[i] != "") {
        totalHours[i] = this.timeDifference(startTimes[i], endTimes[i])
      }
    }

    return totalHours;
  }

  calculateAllHours = (totalHours) => {
    var allHours = 0;
    for(var i=0; i<totalHours.length; i++) {
      var totalHour = parseFloat(totalHours[i]);
      allHours += totalHour;
    }

    return allHours;
  }

  calculatePay = (totalHours, hourlyRate, seventhTrue) => {
    var Pay = {
      totalHourlyPay: 0.00,
      totalOvertimePay: 0.00,
      totalDoubletimePay: 0.00,
      totalPay: 0.00
    }

    var workHours = 40;
    var hoursCount = 0;
    var overtimeHours = 0;

    hourlyRate = parseFloat(hourlyRate);

    var limit= 7;
    if(seventhTrue) {
      limit = 6;
    }

    for(var i = 0; i < limit; i++) {
      var totalHour = parseFloat(totalHours[i]);
      if(hoursCount <= 40) {
        hoursCount += totalHour;
        if(hoursCount <= 40) {
          if(totalHour >= 12) {
            var doubleTimeHours = totalHour - 12;
            Pay.totalHourlyPay += 8*hourlyRate;
            Pay.totalOvertimePay += 4*(hourlyRate*1.5);
            Pay.totalDoubletimePay += doubleTimeHours*(hourlyRate*2);
          }
          else if(totalHour>= 8) {
            var overtimeHours = totalHour - 8;
            Pay.totalHourlyPay += 8*hourlyRate;
            Pay.totalOvertimePay += overtimeHours*(hourlyRate*1.5);
          }
          else {
            Pay.totalHourlyPay += totalHour*hourlyRate;
          }
        }
        else {
          var overtimeDiff = hoursCount - 40;
          var normalHours = totalHour - overtimeDiff;
          if(totalHour >=12) {
            var doubleTimeHours = totalHour - 12;
            Pay.totalDoubletimePay += doubleTimeHours*(hourlyRate*2);
            overtimeDiff = overtimeDiff - doubleTimeHours;
            Pay.totalOvertimePay += overtimeDiff*(hourlyRate*1.5);
            Pay.totalHourlyPay += normalHours*hourlyRate;
          }
          else {
            Pay.totalOvertimePay += overtimeDiff*(hourlyRate*1.5);
            Pay.totalHourlyPay += normalHours*hourlyRate;
          }
        }
      }
      else {
        if(totalHour >=12) {
          var doubleTimeHours = totalHour - 12;
          Pay.totalDoubletimePay += doubleTimeHours*(hourlyRate*2);
          Pay.totalOvertimePay += 12*(hourlyRate*1.5);
        }
        else {
          Pay.totalOvertimePay += totalHour*(hourlyRate*1.5);
        }
      }
    }

    Pay.totalPay = Pay.totalHourlyPay + Pay.totalOvertimePay + Pay.totalDoubletimePay;

    return Pay;
  }

  findWorkedConsecutive = (totalHours) => {
    var workedConsecutive = true;
    for(var i=0; i<6; i++) {
      if(parseFloat(totalHours[i]) <= 0) {
        workedConsecutive = false;
      }
    }

    return workedConsecutive;
  }

  findSeventhPay = (sevenHours, totalOvertimePay, totalDoubletimePay, hourlyRate) => {
    var Pay = {
      totalOvertimePay: parseFloat(totalOvertimePay),
      totalDoubletimePay: parseFloat(totalDoubletimePay)
    }
    sevenHours = parseFloat(sevenHours);

    hourlyRate = parseFloat(hourlyRate);

    if(sevenHours > 0) {
      if(sevenHours > 8) {
        var doubleTimeHours = sevenHours - 8;
        Pay.totalDoubletimePay += Math.round((doubleTimeHours * (hourlyRate * 2)) * 100)/100;
        Pay.totalOvertimePay +=  Math.round((8 * (hourlyRate * 1.5)) * 100)/100;
      }
      else {
        Pay.totalOvertimePay += Math.round((sevenHours * (hourlyRate * 1.5)) * 100)/100;
      }
    }

    console.log(Pay.totalPay)

    return Pay;
  }

  timeDifference = (start,end) => {
    start = start.split(":");
    end = end.split(":");
    var startDate = new Date(0, 0, 0, start[0], start[1], 0);
    var endDate = new Date(0, 0, 0, end[0], end[1], 0);
    var diff = endDate.getTime() - startDate.getTime();
    var hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    var minutes = Math.floor(diff / 1000 / 60);

    if (hours < 0)
       hours = hours + 24;

    var time = (hours <= 9 ? "" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes;
    time = time.split(":");
    var hour = time[0];
    var mins = Math.round((time[1]/60) * 100);
    return hour+"."+mins;
  }

  render() {
    return(
      <div className="california-calc col-sm-12">

        <div className="row row-pad-3">

          <div className="col-sm-12">
            <div className="row icons">
              <div class="col-12">
                <a onClick={this.addClose}><span className={`dashicons ${this.state.hideOpen ? 'dashicons-arrow-down-alt2': 'dashicons-arrow-up-alt2'}`}></span></a>
                <a onClick={this.handleClose}><span className="dashicons dashicons-no"></span></a>
              </div>
            </div>
          </div>
          <div className="col-sm-12">
            <div className="row">
              <div className="col-md-4 col-sm-12">
                <div className="row input-header"><span className="h3">Employee Name</span></div>
                <div className="row"><input type="text" name="employeeName" placeholder="Employee Name" onChange={this.handleChange} className="calc-input" /></div>
              </div>
              <div className="col-md-4 col-6">
                <div className="row input-header"><span className="h3">Hourly Rate</span></div>
                <div className="row small-input left"><div className="dollar-input"><input type="number" onChange={this.handleRateChange} min="0" name="hourlyRate" placeholder="0.00" className="calc-input" value={this.state.hourlyRate} /></div></div>
              </div>
              <div className="col-md-4 col-6">
                <div className="row input-header"><span className="h3">Week Start Date</span></div>
                <div className="row small-input right"><input type="date" onChange={this.handleDateChange} name="startDate" min="1970-01-02" max="3000-01-02" className="calc-input calendar-input"/></div>
              </div>
            </div>
          </div>

          <div className={`open col-sm-12 ${this.state.hideOpen ? 'close': ''}`}>
            <div class="row open-void">
              <div className="col-lg-12 col-3">
                <div className="row my-flex-row date-margin bottom-margin">
                  <div className="my-flex-col heading">
                    <span className="h3">Date</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="date-header">{this.state.dates[0]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="date-header">{this.state.dates[1]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="date-header">{this.state.dates[2]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="date-header">{this.state.dates[3]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="date-header">{this.state.dates[4]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="date-header">{this.state.dates[5]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="date-header">{this.state.dates[6]}</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-12 col-3 margin-8px">
                <div className="row my-flex-row time-ranges bottom-margin">
                  <div className="my-flex-col heading">
                    <span className="h3-light-grey">Start</span>
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="0" onChange={this.handleStartTimeChange}  className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="1" onChange={this.handleStartTimeChange}  className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="2" onChange={this.handleStartTimeChange}  className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="3" onChange={this.handleStartTimeChange}  className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="4" onChange={this.handleStartTimeChange}  className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="5" onChange={this.handleStartTimeChange}  className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="6" onChange={this.handleStartTimeChange}  className="calc-input" />
                  </div>
                </div>
              </div>

              <div className="col-lg-12 col-3 margin-8px">
                <div className="row my-flex-row time-ranges bottom-margin">
                  <div className="my-flex-col heading">
                    <span className="h3-light-grey">End</span>
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="0" onChange={this.handleEndTimeChange} className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="1" onChange={this.handleEndTimeChange} className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="2" onChange={this.handleEndTimeChange} className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="3" onChange={this.handleEndTimeChange} className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="4" onChange={this.handleEndTimeChange} className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="5" onChange={this.handleEndTimeChange} className="calc-input" />
                  </div>
                  <div className="my-flex-col">
                    <input type="time" placeholder="--:-- --" name="6" onChange={this.handleEndTimeChange} className="calc-input" />
                  </div>
                </div>
              </div>

              <div className="col-lg-12 col-3">
                <div className="row my-flex-row time-ranges bottom-margin">
                  <div className="my-flex-col heading">
                    <span className="h3-light-grey">Hours</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="hours-result">{this.state.totalHours[0]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="hours-result">{this.state.totalHours[1]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="hours-result">{this.state.totalHours[2]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="hours-result">{this.state.totalHours[3]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="hours-result">{this.state.totalHours[4]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="hours-result">{this.state.totalHours[5]}</span>
                  </div>
                  <div className="my-flex-col">
                    <span className="hours-result">{this.state.totalHours[6]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="row row-pad-3 total-cont">
          <div className="row m-row-fix">
            <div className="col-lg-3">
              <div className="row results-marg-20">
                <div className="col-md-12 col-6 pay-head">
                  <span className="h2">Total Hourly Pay</span>
                </div>
                <div className="col-md-12 col-6 pay-total">
                  <span className={`pay-result ${this.props.buttonClicked ? 'bold': ''}`}>${this.props.buttonClicked ? this.state.totalHourlyPay : "0.00"}</span>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="row results-marg-20">
                <div className="col-md-12 col-6 pay-head">
                  <span className="h2">Total Overtime Pay</span>
                </div>
                <div className="col-md-12 col-6 pay-total">
                  <span className={`pay-result ${this.props.buttonClicked ? 'bold': ''}`}>${this.props.buttonClicked ? this.state.totalOvertimePay : "0.00"} </span>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="row results-marg-20">
                <div className="col-md-12 col-6 pay-head">
                  <span className="h2">Total Double Time Pay</span>
                </div>
                <div className="col-md-12 col-6 pay-total">
                  <span className={`pay-result ${this.props.buttonClicked ? 'bold': ''}`}>${this.props.buttonClicked ? this.state.totalDoubletimePay : "0.00"}</span>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="row results-marg-20">
                <div className="col-lg-12 col-6 pay-head">
                  <span className="h2">Total Pay</span>
                </div>
                <div className="col-lg-12 col-6 pay-total">
                  <span className={`pay-result ${this.props.buttonClicked ? 'bold': ''}`}>${this.props.buttonClicked ? this.state.totalPay : "0.00"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default CaliforniaCalc

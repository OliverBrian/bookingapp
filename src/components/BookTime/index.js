import React, { Component } from "react";
import { Spinner } from "react-mdl";
import { compose } from "recompose";
import { AuthUserContext, withAuthorization } from "../Session";
import { withFirebase } from "../Firebase";
import {
  Form,
  CustomButton,
  CustomButton2,
  StyledLabel,
  LoadingDiv
} from "./styles";

import "react-mdl/extra/material.css";
import "react-mdl/extra/material.js";
import { DataSnapshot } from "@firebase/database";

const BookTime = props => (
  <div>
    <BookTimeComplete {...props} />
  </div>
);

const times = [
  "07:00-08:00",
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00"
];

const returnFalseTimes = () =>
  Object.assign({}, ...times.map(item => ({ [item]: false })));

class BookTimeBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bookDate: this.props.bookDate,
      time: returnFalseTimes(),
      reservedTime: returnFalseTimes(),
      loading: false,
      username: [],
      isInvited: {},
      desc: ""
    };
  }

  componentDidMount(authUser) {
    this.setState({ loading: true });
    this.props.firebase.users().on("value", snapshot => {
      const userObj = Object.values(snapshot.val());
      const map1 = userObj.map(function(userO) {
        return userO.username;
      });
      this.setState({ mapeusernames: map1 });
    });

    this.props.firebase
      .bookedEventDateTimes()
      .child(this.props.groupRoom)
      .child(this.props.bookDate)
      .child("time")
      .on("value", snapshot => {
        const bookedObject = snapshot.val();
        if (bookedObject) {
          const bookedList = bookedObject;
          // convert booked list from snapshot
          this.setState({ time: bookedList });
          this.setState({ reservedTime: {} });
        } else {
          this.setState({ time: {}, loading: false });
        }
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.groupRoom !== prevProps.groupRoom ||
      this.props.bookDate !== prevProps.bookDate
    ) {
      this.setState({ loading: true });
      /*       this.props.firebase
        .events()
        .child(this.props.groupRoom)
        .child(this.state.eventUid)
        .set({
          eventUid: this.state.eventUid
        }); */
      this.props.firebase
        .bookedEventDateTimes()
        .child(this.props.groupRoom)
        .child(this.props.bookDate)
        .child("time")
        .on("value", snapshot => {
          const bookedObject = snapshot.val();
          if (bookedObject) {
            const bookedList = bookedObject;
            // convert booked list from snapshot
            this.setState({ time: bookedList, loading: false });
            this.setState({ reservedTime: {} });
          } else {
            this.setState({ time: {}, loading: false });
          }
        });
    }
  }

  componentWillUnmount() {
    this.props.firebase
      .bookedEventDateTimes()
      .child(this.props.groupRoom)
      .child(this.props.bookDate)
      .off();
    this.props.firebase.users().off();
  }

  componentWillReceiveProps() {
    this.setState({ loading: true });
    this.props.firebase
      .bookedEventDateTimes()
      .child(this.props.groupRoom)
      .child(this.props.bookDate)
      .child("time")
      .on("value", snapshot => {
        const bookedObject = snapshot.val();
        if (bookedObject) {
          const bookedList = bookedObject;
          // convert booked list from snapshot
          this.setState({ time: bookedList, loading: false });
        } else {
          this.setState({ time: returnFalseTimes(), loading: false });
        }
      });
  }
  onChangeCheckbox = name => {
    this.setState(prevState => ({
      reservedTime: {
        ...prevState.reservedTime,
        [name]: !prevState.reservedTime[name]
      }
    }));
  };

  getValueInput(evt) {
    const inputValue = evt.target.value;
    this.setState({ input: inputValue });
    this.filterNames(inputValue);
  }

  writeDesc(event) {
    const inputValue = event.target.value;
    this.setState({ desc: inputValue });
  }

  filterNames(inputValue) {
    const { mapeusernames } = this.state;
    if (inputValue.length === 0) {
      this.setState({ username: [] });
    } else {
      this.setState({
        username: mapeusernames.filter(usernames =>
          usernames.includes(inputValue)
        )
      });
    }
  }

  pushToInvited = (event, user) => {
    var { isInvited } = this.state;
    const invitees = Object.keys(isInvited);
    if (invitees.length === 0 || !invitees.includes(user)) {
      isInvited[user] = true;
      this.setState({ isInvited });
      event.preventDefault();
    } else {
      console.log("User already booked");
    }
  };

  deleteInvited = key => {
    const { isInvited } = this.state;
    delete isInvited[key];
    this.setState({ isInvited });
  };

  sendToDB = (event, authUser) => {
    if (Object.keys(this.state.reservedTime).length) {
      const newObj = Object.assign(
        {},
        { ...this.state.time },
        { ...this.state.reservedTime }
      );
      this.props.firebase
        .bookedEventDateTimes()
        .child(this.props.groupRoom)
        .child(this.props.bookDate)
        .set({ time: { ...newObj } });
      event.preventDefault();

      //****** */TAAAA BOOOOORT??????********//
      /*       this.props.firebase
        .events()
        .child(this.props.groupRoom)
        .push({
          date: this.props.bookDate,
          host: authUser.uid,
          time: { ...newObj },
          isInvited: { ...this.state.isInvited },
          description: this.state.desc
        }); */
      const test = this.props.firebase
        .events()
        .child(this.props.groupRoom)
        .push({
          date: this.props.bookDate,
          host: authUser.uid,
          time: { ...newObj },
          isInvited: { ...this.state.isInvited },
          description: this.state.desc
        }).key;
      this.props.firebase
        .events()
        .child(this.props.groupRoom)
        .child(test)
        .update({
          eventUid: test
        });

      //****** */TAAAA BOOOOORT??????********//
      /*    const test = ref.push().key;
      console.log(test); */
      /*       console.log(newKey); */
      /*       var eventUidRef = this.props.firebase
        .events()
        .child(this.props.groupRoom)
        .push({
          date: this.props.bookDate,
          host: authUser.uid,
          time: { ...newObj },
          isInvited: { ...this.state.isInvited },
          description: this.state.desc
        });
      var eventUid = ref.eventUidRef.key; */

      this.setState({ isInvited: {}, desc: "", username: [] });
      event.preventDefault();
    } else {
      alert("You haven't booked any time slots for you event");
      event.preventDefault();
    }
  };

  render() {
    const { close, bookDate, groupRoom } = this.props;
    const { loading, username } = this.state;
    const isInvitedKeys = Object.keys(this.state.isInvited);
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <React.Fragment>
            {loading ? (
              <LoadingDiv>
                Loading ...
                <Spinner singleColor />
              </LoadingDiv>
            ) : (
              <Form>
                <button onClick={close}>Close</button>
                <br />
                <h2>
                  Date: <p>{bookDate}</p>
                </h2>
                <h2>
                  Room: <p>{groupRoom}</p>
                </h2>
                <br />
                {times
                  .filter(time => !this.state.time[time])
                  .map(time => (
                    <MyInput
                      key={time}
                      name={time}
                      time={this.state.time}
                      onChangeCheckbox={this.onChangeCheckbox}
                    />
                  ))}
                <label>
                  <br />
                  <h4>Invite user:</h4>

                  {username
                    .filter(user => user.length > 0)
                    .map(user => (
                      <CustomButton2
                        name={user}
                        key={user}
                        onClick={event => this.pushToInvited(event, user)}
                      >
                        {user}
                      </CustomButton2>
                    ))}

                  <input
                    id="searchUser"
                    type="text"
                    name="name"
                    placeholder="Search for users to invite."
                    onChange={evt => this.getValueInput(evt)}
                  />
                </label>
                <h4>Uninvite user:</h4>
                {isInvitedKeys.map(key => (
                  <CustomButton
                    name={key}
                    key={key}
                    onClick={() => this.deleteInvited(key)}
                  >
                    {key}
                  </CustomButton>
                ))}
                <br />
                <br />
                <textarea
                  id="descriptionInput"
                  type="textarea"
                  name="description"
                  value={this.state.desc}
                  onChange={event => this.writeDesc(event)}
                />
                <br />
                <input
                  type="submit"
                  value="Submit"
                  onClick={event => this.sendToDB(event, authUser)}
                />
              </Form>
            )}
          </React.Fragment>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

export const MyInput = ({ name, time, onChangeCheckbox }) => (
  <React.Fragment>
    <StyledLabel>
      <input
        type="checkbox"
        name={name}
        onChange={() => onChangeCheckbox(name)}
        checked={time[{ name }]}
      />
      {name}
    </StyledLabel>
  </React.Fragment>
);

const condition = authUser => !!authUser;

const BookTimeComplete = withFirebase(BookTimeBase);

export default compose(withAuthorization(condition))(BookTime);

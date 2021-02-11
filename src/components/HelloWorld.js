import React from "react";

const props = {
  className: "container",
  children: "hello world",
};
/* ========================
 @props | Object
==========================*/
const message = (props) => {
  return <div>{props.msg}</div>;
};
const AlmostNg = (props) => {
  return <div>{props.children}</div>;
};
function Message({ message }) {
  if (!message) {
    return <div>No message</div>;
  }
  return <div>{message}</div>;
}

// function tick () {
//   const time = new Date().toLocaleTimeString()
//   const el = <div>It is { time }</div>
//   const el2 = (
//     <div>
//       It is <input type="text" value={time}/>
//       It is <input type="text" value={time}/>
//     </div>
//   )
//  // ReactDOM.render(el2, document.getElementById('app') )
// }

const Box = function ({ style, className = "", ...rest }) {
  // const className = 'box box--small'
  let styling = {
    backgroundColor: "transparent",
    border: "3px solid #eee",
    padding: 20,
    fontSize: "2em",
  };
  // const props = {
  //   style: styling,
  //   className
  // }
  return (
    <div
      className={`box ${className}`}
      style={{ ...styling, ...style }}
      {...rest}
    ></div>
  );
};

const ButtonHello = ({ txt }) => {
  return (
    <div>
      <button>{txt}</button>
    </div>
  );
};
function SayHello(props) {
  return (
    <div>
      Hello {props.firstName} {props.lastName}
    </div>
  );
}
const PropTypes = {
  string: function (props, propName, componentName) {
    if (typeof props[propName] !== "string") {
      return new Error("hey, not a string dude");
    }
  },
};

SayHello.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string,
};
const element = (
  <main {...props} className={`big ${this.nightMode ? "night-mode" : ""}`}>
    {message({ msg: "hello world" })}
    {message({ msg: "goodbye dreams" })}
    {React.createElement(message, { msg: "I love you, Sara" })}
    <AlmostNg children="My daughter is everything to me." />
    <AlmostNg> My family is love</AlmostNg>
    <Message message={null} />

    <div className="action-bar">
      <Box
        className="box--small"
        style={{ backgroundColor: "lightBlue", fontSize: "1em" }}
      >
        Lily Box
      </Box>
      <Box
        className="box--medium"
        style={{ backgroundColor: "pink", fontSize: "1.5em" }}
      >
        Sara Box
      </Box>
      <Box
        className="box--large"
        style={{ backgroundColor: "orange", fontSize: "2em" }}
      >
        David Box
      </Box>
    </div>

    <ButtonHello txt="hello" />

    <SayHello firstName={"David"} lastName={"Pham"} />
  </main>
);
class HelloWorld extends React.Component {
  constructor(props) {
    super(props);
    var time = new Date();
    var isNight = time.toLocaleString("en-US", {
      hour: "numeric",
      hour12: false,
    });
    this.nightMode = isNight >= 19; // 7pm
  }
  render() {
    return element;
  }
}

export default HelloWorld;

import React from "react";
import Button from "./components/Buttons/Btn";

class Showcase extends React.Component {
  render() {
    return (
      <div className="action-bar">
        {this.props.data.map((button) => {
          return (
            <Button
              className={`btn btn-${button.style}`}
              key={button.id}
              onClick={() => console.log(button)}
            >
              {button.label}
            </Button>
          );
        })}
      </div>
    );
  }
}

export default Showcase;

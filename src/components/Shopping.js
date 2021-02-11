import React from "react";
import "./styles/Base.css";

class ShoppingList extends React.Component {
  render() {
    return (
      <div className="shopping-list">
        <h1>Shopping List for {this.props.name}</h1>
        <ul>
          <li>Bananas</li>
          <li>Eggs</li>
          <li>Pork</li>
        </ul>
      </div>
    );
  }
}

export default ShoppingList;

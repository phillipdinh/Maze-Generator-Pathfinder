import React from "react";

export default function Node(props) {
  const styles = {
    borderTopWidth: props.top ? 0 : "5px",
    borderRightWidth: props.right ? 0 : "5px",
    borderBottomWidth: props.bottom ? 0 : "5px",
    borderLeftWidth: props.left ? 0 : "5px",

    paddingTop: props.top ? "5px" : 0,
    paddingBottom: props.bottom ? "5px" : 0,
    paddingLeft: props.left ? "5px" : 0,
    paddingRight: props.right ? "5px" : 0,
  };

  function getID() {
    if (props.col == 0 && props.row == 0) {
      return "start";
    } else if (props.id == "active") {
      return "active";
    } else if (props.id == "not-active") {
      return "not-active";
    } else {
      return "finish";
    }
  }
  return (
    <div className="node" style={styles} id={getID()}>
      C:{props.col} R:{props.row}
    </div>
  );
}
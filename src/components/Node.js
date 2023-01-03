import React from "react";

export default function Node(props) {
  const styles = {
    borderTopWidth: props.top ? 0 : "2px",
    borderRightWidth: props.right ? 0 : "2px",
    borderBottomWidth: props.bottom ? 0 : "2px",
    borderLeftWidth: props.left ? 0 : "2px",

    paddingTop: props.top ? "2px" : 0,
    paddingBottom: props.bottom ? "2px" : 0,
    paddingLeft: props.left ? "2px" : 0,
    paddingRight: props.right ? "2px" : 0,
  };

  function getID() {
    if (props.col == 0 && props.row == 0) {
      return "start";
    } else if (props.col == 15 && props.row == 15) {
      return "finish";
    } else if (props.id == "active") {
      return "active";
    } else {
      return "not-active";
    }
  }
  return <div className="node" style={styles} id={getID()}></div>;
}

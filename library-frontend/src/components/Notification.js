import React from "react"

const Notification = props => {
  if (!props.notification) {
    return null
  }

  return <div>{props.notification}</div>
}

export default Notification

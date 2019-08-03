import React, { useState } from "react"

const Login = props => {
  console.log("token for login component", props.token)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const submit = async event => {
    event.preventDefault()

    const result = await props.login({
      variables: {
        username,
        password
      }
    })

    if (result) {
      const token = result.data.login.value
      props.setToken(token)
      localStorage.setItem("library-user-token", token)
    }
    console.log(
      "logged in with token",
      localStorage.getItem("library-user-token")
    )

    setUsername("")
    setPassword("")
  }

  if (!props.show) {
    return null
  }

  if (localStorage.getItem("library-user-token")) {
    return <div>You have logged in succesfully</div>
  }

  return (
    <div>
      <h2>Log in</h2>
      {console.log("username", username, "password", password)}
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            value={password}
            type="password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">log in</button>
      </form>
    </div>
  )
}

export default Login

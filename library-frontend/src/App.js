import React, { useState } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import Login from "./components/Login"
import { gql } from "apollo-boost"
import { Mutation, Query } from "react-apollo"

const CREATE_BOOK = gql`
  mutation addBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      published
      author {
        name
      }
    }
  }
`

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

const ALL_AUTHORS = gql`
  {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

const ME = gql`
  {
    me {
      username
      favoriteGenre
    }
  }
`

const App = () => {
  const [page, setPage] = useState("authors")
  const [token, setToken] = useState(localStorage.getItem("library-user-token"))

  const logout = () => {
    setToken(null)
    localStorage.clear()
  }

  console.log("token on App", token)

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <React.Fragment>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={logout}>log out</button>
          </React.Fragment>
        ) : (
          <button onClick={() => setPage("login")}>log in</button>
        )}
      </div>

      <Authors show={page === "authors"} />

      <Query query={ME}>
        {me => <Books show={page === "books"} me={me} />}
      </Query>

      <Mutation mutation={LOGIN}>
        {login => (
          <Login
            show={page === "login"}
            login={login}
            setToken={token => setToken(token)}
          />
        )}
      </Mutation>

      <Mutation
        mutation={CREATE_BOOK}
        refetchQueries={[{ query: ALL_AUTHORS }]}
      >
        {addBook => <NewBook show={page === "add"} addBook={addBook} />}
      </Mutation>
    </div>
  )
}

export default App

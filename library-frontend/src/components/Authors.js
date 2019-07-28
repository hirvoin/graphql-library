import React, { useState } from "react"
import { Query, Mutation } from "react-apollo"
import { gql } from "apollo-boost"
import EditAuthor from "./EditAuthor"

const ALL_AUTHORS = gql`
  {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`

const Authors = props => {
  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>Authors</h2>
      <Query query={ALL_AUTHORS}>
        {result => {
          if (result.loading) {
            return <div>loading...</div>
          }

          return (
            <div>
              <table>
                <tbody>
                  <tr>
                    <th />
                    <th>Born</th>
                    <th>Books</th>
                  </tr>
                  {result.data.allAuthors.map(a => (
                    <tr key={a.name}>
                      <td>{a.name}</td>
                      <td>{a.born}</td>
                      <td>{a.bookCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Mutation
                mutation={EDIT_AUTHOR}
                refetchQueries={[{ query: ALL_AUTHORS }]}
              >
                {editAuthor => <EditAuthor editAuthor={editAuthor} />}
              </Mutation>
            </div>
          )
        }}
      </Query>
    </div>
  )
}

export default Authors

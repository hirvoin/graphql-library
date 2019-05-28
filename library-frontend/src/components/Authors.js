import React, { useState } from "react"
import { Query } from "react-apollo"
import { gql } from "apollo-boost"

const ALL_AUTHORS = gql`
  {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

const Authors = props => {
  if (!props.show) {
    return null
  }
  const authors = []

  return (
    <div>
      <h2>Authors</h2>
      <Query query={ALL_AUTHORS}>
        {result => {
          if (result.loading) {
            return <div>loading...</div>
          }

          return (
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
          )
        }}
      </Query>
    </div>
  )
}

export default Authors

import React from "react"
import { Query } from "react-apollo"
import { gql } from "apollo-boost"

const ALL_BOOKS = gql`
  {
    allBooks {
      title
      published
      author {
        name
      }
    }
  }
`
const Books = props => {
  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>Books</h2>
      <Query query={ALL_BOOKS}>
        {result => {
          if (result.loading) {
            return <div>loading...</div>
          }
          return (
            <table>
              {console.log(result.data.allBooks)}
              <tbody>
                <tr>
                  <th />
                  <th>author</th>
                  <th>published</th>
                </tr>
                {result.data.allBooks.map(a => (
                  <tr key={a.title}>
                    <td>{a.title}</td>
                    <td>{a.author.name}</td>
                    <td>{a.published}</td>
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

export default Books

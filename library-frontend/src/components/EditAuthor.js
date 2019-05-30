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

const EditAuthor = props => {
  const [birthyear, setBirthyear] = useState("")
  const [author, setAuthor] = useState("")

  const submit = async event => {
    event.preventDefault()
    console.log(birthyear)
    await props.editAuthor({
      variables: { name: author, setBornTo: Number(birthyear) }
    })

    setAuthor("")
    setBirthyear("")
  }

  return (
    <div>
      <h2>Set birthyear</h2>
      <Query query={ALL_AUTHORS}>
        {result => {
          if (result.loading) {
            return <div>loading...</div>
          }
          return (
            <div>
              author
              <select onChange={({ target }) => setAuthor(target.value)}>
                <option>choose author...</option>
                {result.data.allAuthors.map(a => (
                  <option key={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
          )
        }}
      </Query>
      <form onSubmit={submit}>
        <div>
          birthyear
          <input
            value={birthyear}
            type="number"
            onChange={({ target }) => setBirthyear(target.value)}
          />
        </div>
        <button type="submit">set birthyear</button>
      </form>
    </div>
  )
}

export default EditAuthor

import React, { useState } from "react"
import { Query } from "react-apollo"
import { gql } from "apollo-boost"

const ALL_BOOKS = gql`
  {
    allBooks {
      title
      published
      genres
      author {
        name
      }
    }
  }
`

const Books = props => {
  const [genreToShow, setGenreToShow] = useState("all")
  const disctinctGenres = []
  const booksToShow = []

  const me = props.me.data.me

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
            <div>
              {console.log("genrestoshow", genreToShow)}
              <table>
                {result.data.allBooks.forEach(book => {
                  book.genres.forEach(genre => {
                    if (!disctinctGenres.includes(genre)) {
                      disctinctGenres.push(genre)
                    }
                  })
                })}
                {result.data.allBooks.forEach(book => {
                  if (book.genres.includes(genreToShow)) {
                    booksToShow.push(book)
                  }
                })}
                {console.log(result.data.allBooks, disctinctGenres)}
                <tbody>
                  <tr>
                    <th>title</th>
                    <th>author</th>
                    <th>published</th>
                  </tr>
                  {genreToShow === "all"
                    ? result.data.allBooks.map(b => (
                        <tr key={b.title}>
                          <td>{b.title}</td>
                          <td>{b.author.name}</td>
                          <td>{b.published}</td>
                        </tr>
                      ))
                    : booksToShow.map(b => (
                        <tr key={b.title}>
                          <td>{b.title}</td>
                          <td>{b.author.name}</td>
                          <td>{b.published}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
              <h3>Filter books by genre:</h3>
              <button onClick={() => setGenreToShow("all")}>all</button>
              {me ? (
                <button
                  onClick={() => setGenreToShow(props.me.data.me.favoriteGenre)}
                >
                  your favorite
                </button>
              ) : null}

              {disctinctGenres.map(genre => (
                <button key={genre} onClick={() => setGenreToShow(genre)}>
                  {genre}
                </button>
              ))}
            </div>
          )
        }}
      </Query>
    </div>
  )
}

export default Books

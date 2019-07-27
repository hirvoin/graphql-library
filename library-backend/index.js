const { ApolloServer, gql } = require("apollo-server")
const mongoose = require("mongoose")
const Book = require("./models/book")
const Author = require("./models/author")
const uuid = require("uuid/v1")

mongoose.set("useFindAndModify", false)

const MONGODB_URI =
  "mongodb://jaska123:jaska123@ds263856.mlab.com:63856/fullstack-library"

console.log("connecting to", MONGODB_URI)

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log("connected to MongoDB")
  })
  .catch(error => {
    console.log("error connection to MongoDB:", error.message)
  })

let authors = [
  {
    name: "Robert Martin",
    born: 1952
  },
  {
    name: "Martin Fowler",
    born: 1963
  },
  {
    name: "Fyodor Dostoevsky",
    born: 1821
  },
  {
    name: "Joshua Kerievsky" // birthyear not known
  },
  {
    name: "Sandi Metz" // birthyear not known
  }
]

// authors.forEach(author => {
//   // console.log(author)
//   authorToSave = new Author({ name: author.name, born: author.born })
//   console.log("author to save", authorToSave)
//   authorToSave.save().then(console.log(authorToSave.name, " saved"))
// })

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    genres: ["refactoring"]
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    genres: ["agile", "patterns", "design"]
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    genres: ["refactoring"]
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    genres: ["refactoring", "patterns"]
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    genres: ["refactoring", "design"]
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    genres: ["classic", "crime"]
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    genres: ["classic", "revolution"]
  }
]

// books.forEach(async book => {
//   const authors = await Authors.find({})
//   if (!authors.find(author => author.name === book.author)) {
//     const author = new Author({ name: book.author })
//     await author.save()
//     bookToSave = new Book({
//       title: book.title,
//       published: book.published,
//       genres: book.genres,
//       author: author
//     })
//   }
//   bookToSave = new Book({
//     title: book.title,
//     published: book.published,
//     genres: book.genres,
//     author:
//   })
//   console.log("book to save", bookToSave.title)
//   bookToSave.save().then(console.log(bookToSave.title, " saved"))
// })

const typeDefs = gql`
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]
    allAuthors: [Author!]!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book

    editAuthor(name: String!, setBornTo: Int!): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: async () => await Book.find({}),
    allAuthors: async () => await Author.find({})
  },

  Author: {
    bookCount: root => books.filter(books => books.author == root.name).length
  },

  Mutation: {
    addBook: async (root, args) => {
      console.log("args", args)
      const authorsInDb = await Author.find({})

      if (!authorsInDb.find(author => author.name === args.author)) {
        const newAuthor = new Author({ name: args.author })
        await newAuthor.save()
        const newBook = new Book({ ...args, author: newAuthor })
        console.log("new book", newBook)
        await newBook.save()
        return newBook
      }

      const newBook = new Book({ ...args })
      // console.log(newBook)
      // await newBook.save()
      return newBook
    },
    editAuthor: (root, args) => {
      const authorNames = authors.map(a => a.name)
      console.log("arg.name", args.name)
      const author = authors.find(a => a.name === args.name)
      console.log(author)
      if (!author) {
        return null
      }
      const updatedAuthor = { ...author, born: args.setBornTo }
      console.log(updatedAuthor)
      authors = authors.map(a => (a.name === args.name ? updatedAuthor : a))
      return updatedAuthor
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

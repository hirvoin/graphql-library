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
    id: ID
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
    bookCount: () => Book.countDocuments({}),
    authorCount: () => Author.countDocuments({}),
    allBooks: async (root, args) => {
      console.log(args.genre)
      if (args.genre) {
        console.log("find by genre")
        return await Book.find({ genres: args.genre }).populate("author")
      }
      console.log("find all")
      return Book.find({}).populate("author")
    },

    allAuthors: () => Author.find({})
  },

  Author: {
    bookCount: root => Book.countDocuments({ author: root })
  },

  Mutation: {
    addBook: async (root, args) => {
      const isAuthor = Author.findOne({ name: args.author })
      if (!isAuthor) {
        const newAuthor = new Author({ name: args.author })
        await newAuthor.save()
        const newBook = new Book({ ...args, author: newAuthor })
        await newBook.save()
        return newBook
      }
      const newBook = new Book({
        ...args,
        author: await Author.findOne({ name: args.author })
      })
      await newBook.save()
      return newBook
    },

    editAuthor: async (root, args) => {
      const authorToUpdate = await Author.findOne({ name: args.name })
      const updatedAuthor = await Author.findByIdAndUpdate(authorToUpdate.id, {
        born: args.setBornTo
      })
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

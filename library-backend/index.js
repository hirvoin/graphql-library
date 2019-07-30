const { ApolloServer, gql, UserInputError } = require("apollo-server")
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
    bookCount: () => Book.collection.countDocuments({}),
    authorCount: () => Author.collection.countDocuments({}),
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
      const isAuthor = await Author.findOne({ name: args.author })

      if (!isAuthor) {
        try {
          const newAuthor = new Author({ name: args.author })
          console.log("newauthor", newAuthor)
          await newAuthor.save()
        } catch (error) {
          throw new UserInputError(
            "Author name needs to consist minimum of four letters",
            {
              invalidArgs: args.author
            }
          )
        }
        try {
          const newBook = new Book({ ...args, author: newAuthor })
          await newBook.save()
          return newBook
        } catch (error) {
          throw new UserInputError(
            "Book title needs to consist minimum of two letters",
            {
              invalidArgs: args.author
            }
          )
        }
      }

      const newBook = new Book({
        ...args,
        author: await Author.findOne({ name: args.author })
      })

      try {
        await newBook.save()
      } catch (error) {
        throw new UserInputError(
          "Book title needs to consist minimum of two letters",
          {
            invalidArgs: args.author
          }
        )
      }
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

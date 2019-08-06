const {
  ApolloServer,
  gql,
  UserInputError,
  AuthenticationError,
  PubSub
} = require("apollo-server")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const Book = require("./models/book")
const Author = require("./models/author")
const User = require("./models/user")

require("dotenv").config()

mongoose.set("useFindAndModify", false)

const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET

const pubSub = new PubSub()

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
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
  }

  type Subscription {
    bookAdded: Book!
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

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }
`

const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments({}),
    allAuthors: () => Author.find({}),
    bookCount: () => Book.collection.countDocuments({}),
    allBooks: async (root, args) => {
      console.log(args.genre)
      if (args.genre) {
        console.log("find by genre")
        return await Book.find({ genres: args.genre }).populate("author")
      }
      console.log("find all")
      return Book.find({}).populate("author")
    },
    me: (root, args, context) => context.currentUser
  },

  Author: {
    bookCount: root => Book.countDocuments({ author: root })
  },

  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      console.log("authenticated")
      const isAuthor = await Author.findOne({ name: args.author })

      // creating a new book with a new author
      if (!isAuthor) {
        console.log("with new author")
        try {
          const newAuthor = new Author({ name: args.author })
          const newBook = new Book({ ...args, author: newAuthor })
          await newBook.save()
          await newAuthor.save()
          pubSub.publish("BOOK_ADDED", { bookAdded: newBook })
          return newBook
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args.author
          })
        }
      }
      // creating a new book with an existing author
      const newBook = new Book({
        ...args,
        author: await Author.findOne({ name: args.author })
      })

      try {
        await newBook.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args.author
        })
      }
      pubSub.publish("BOOK_ADDED", { bookAdded: newBook })
      return newBook
    },

    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      console.log("authenticated")
      const authorToUpdate = await Author.findOne({ name: args.name })
      const updatedAuthor = await Author.findByIdAndUpdate(
        authorToUpdate.id,
        {
          born: args.setBornTo
        },
        { new: true }
      )
      return updatedAuthor
    },

    createUser: (root, args) => {
      const newUser = new User({ ...args })
      console.log("newUser", newUser)
      try {
        newUser.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      return newUser
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== "salasana") {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      const token = { value: jwt.sign(userForToken, JWT_SECRET) }
      return token
    }
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubSub.asyncIterator(["BOOK_ADDED"])
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith("bearer")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      console.log("Authentication succesful")
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})

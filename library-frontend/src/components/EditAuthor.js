import React, { useState } from "react"

const EditAuthor = props => {
  const [birthyear, setBirthyear] = useState("")
  const [author, setAuthor] = useState("")

  return (
    <div>
      <h2>Set birthyear</h2>
      <form>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          birthyear
          <input
            value={birthyear}
            type="number"
            onChange={({ target }) => setBirthyear(target.value)}
          />
        </div>
      </form>
    </div>
  )
}

export default EditAuthor

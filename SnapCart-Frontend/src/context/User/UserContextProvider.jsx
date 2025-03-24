/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react"
import axios from 'axios'
import UserContext from "./UserContext"

const UserContextProvider = ({children}) => {

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const login = async (userCredentials) => {
    try {
      const response = await axios.post('http://localhost:8000/login', userCredentials)
      console.log(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const context = {
    isLoggedIn: isLoggedIn,
    login: login
  }

  return (
    <UserContext.Provider value={context}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContextProvider

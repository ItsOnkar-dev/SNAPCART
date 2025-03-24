import { createContext } from 'react'

const UserContext = createContext({
    isLoggedIn: false,
    login: () => {
      
    }
})

export default UserContext

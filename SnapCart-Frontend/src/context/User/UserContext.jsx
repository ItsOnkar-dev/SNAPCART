import { createContext } from 'react'

const UserContext = createContext({
    isLoggedIn: false,
    login: () => {},
    logout: () => {}
})

export default UserContext

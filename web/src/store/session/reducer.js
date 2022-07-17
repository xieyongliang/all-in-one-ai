import { CLEAR_SESSION, SET_SESSION } from './types'

const initialState = {
  isLogin: false
}

const sessionReduer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SESSION:
      return Object.assign({},
        action.session,
        { isLogin: true })

    case CLEAR_SESSION:
      return Object.assign({},
        action.session,
        { isLogin: false })  

    default:
      return state
  }
}

export default sessionReduer
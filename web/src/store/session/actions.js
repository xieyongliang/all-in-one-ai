import { CLEAR_SESSION, SET_SESSION } from './types'
import cognitoUtils from '../../lib/cognitoUtils'

export const clearSession = () => ({
    type: CLEAR_SESSION
})

// Initialise the Cognito sesson from a callback href
export function initSessionFromCallbackURI (callbackHref) {
    return async function (dispatch) {
        try {
            await cognitoUtils.parseCognitoWebResponse(callbackHref) // parse the callback URL
            var session = await cognitoUtils.getCognitoSession() // get a new session
            dispatch({ type: SET_SESSION, session })
        }
        catch(error)
        {
            console.log(error)
        }
    }
}

export const setSession = session => ({
    type: SET_SESSION,
    session
})
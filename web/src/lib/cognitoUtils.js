import { CognitoAuth } from 'amazon-cognito-auth-js/dist/amazon-cognito-auth'
import { CognitoUserPool } from 'amazon-cognito-identity-js'
import { config as AWSConfig } from 'aws-sdk'
// import appConfig from '../config/app-config.json'

import axios from 'axios'

// Creates a CognitoAuth instance
const createCognitoAuth = () => {
  	return new Promise((resolve, reject) => {
    	const HEADERS = {'Content-Type': 'application/json'};
    	axios({ method: 'GET', url: '/env' , headers: HEADERS}).then(response => {
      		if (response.status === 200) {
        		let appConfig = {
					"region": response.data.CognitoRegion,
					"userPool": response.data.UserPool,
					"userPoolBaseUri": response.data.UserPoolDomain,
					"clientId": response.data.UserPoolClient,
					"callbackUri": response.data.CallbackURL,
					"signoutUri": response.data.LogoutURL,
					"tokenScopes": [
						"openid",
						"email",
						"profile",
						response.data.LogoutURL,
					],
					"apiUri":response.data.LogoutURL
				}
				AWSConfig.region = response.data.CognitoRegion
				const appWebDomain = appConfig.userPoolBaseUri.replace('https://', '').replace('http://', '')
				const auth = new CognitoAuth({
					UserPoolId: appConfig.userPool,
					ClientId: appConfig.clientId,
					AppWebDomain: appWebDomain,
					TokenScopesArray: appConfig.tokenScopes,
					RedirectUriSignIn: appConfig.callbackUri,
					RedirectUriSignOut: appConfig.signoutUri
				})
				resolve(auth)
			} else {
				reject('createCognitoAuth Error')
			}
    	})
  	})
}

// Creates a CognitoUser instance
const createCognitoUser = () => {
  	return new Promise((resolve, reject) => {
	    createCognitoUserPool().then((pool) =>{
	    	resolve(pool.getCurrentUser())
    	})
  	})
}

// Creates a CognitoUserPool instance
const createCognitoUserPool = () => {
  	return new Promise((resolve, reject) => {
		const HEADERS = {'Content-Type': 'application/json'};
		axios({ method: 'GET', url: '/env' , headers: HEADERS}).then(response => {
			if (response.status === 200) {
				let appConfig = {
					"region": response.data.CognitoRegion,
					"userPool": response.data.UserPool,
					"userPoolBaseUri": response.data.UserPoolDomain,
					"clientId": response.data.UserPoolClient,
					"callbackUri": response.data.CallbackURL,
					"signoutUri": response.data.LogoutURL,
					"tokenScopes": [
						"openid",
						"email",
						"profile",
						response.data.LogoutURL,
					],
					"apiUri":response.data.LogoutURL
				}
				AWSConfig.region = response.data.CognitoRegion

				let userPool = new CognitoUserPool({
					UserPoolId: appConfig.userPool,
					ClientId: appConfig.clientId
				})
				resolve(userPool)
			} else {
				reject('createCognitoUserPool Error')
			}
		})
  	})
}


// Get the URI of the hosted sign in screen
const getCognitoSignInUri = () => {
	return new Promise((resolve, reject) => {
		const HEADERS = {'Content-Type': 'application/json'};
		axios({ method: 'GET', url: '/env' , headers: HEADERS}).then(response => {
			if (response.status === 200) {
				let appConfig = {
					"region": response.data.CognitoRegion,
					"userPool": response.data.UserPool,
					"userPoolBaseUri": response.data.UserPoolDomain,
					"clientId": response.data.UserPoolClient,
					"callbackUri": response.data.CallbackURL,
					"signoutUri": response.data.LogoutURL,
					"tokenScopes": [
						"openid",
						"email",
						"profile",
						response.data.LogoutURL,
					],
					"apiUri":response.data.LogoutURL
				}
				AWSConfig.region = response.data.CognitoRegion
				const signinUri = `${appConfig.userPoolBaseUri}/login?response_type=code&client_id=${appConfig.clientId}&redirect_uri=${appConfig.callbackUri}`
				resolve(signinUri)
			} else {
				reject('getCognitoSignInUri Error')
			}
		})
  	})
}

// Parse the response from a Cognito callback URI (assumed a token or code is in the supplied href). Returns a promise.
const parseCognitoWebResponse = async (href) => {
	return new Promise((resolve, reject) => {
		createCognitoAuth().then((auth)=>{
			auth.userhandler = {
					onSuccess: function (result) {
					resolve(result)
				},
				onFailure: function (err) {
					reject(new Error('Failure parsing Cognito web response: ' + err))
				}
			}
			auth.parseCognitoWebResponse(href)
		})
  	})
}

// Gets a new Cognito session. Returns a promise.
const getCognitoSession = async () => {
	return new Promise((resolve, reject) => {
    	createCognitoUser().then((cognitoUser)=>{
			cognitoUser.getSession((err, result) => {
				if (err || !result) {
					reject(new Error('Failure getting Cognito session: ' + err))
					return
				}
				const session = {
					credentials: {
						accessToken: result.accessToken.jwtToken,
						idToken: result.idToken.jwtToken,
						refreshToken: result.refreshToken.token
					},
					user: {
						userName: result.idToken.payload['cognito:username'],
						email: result.idToken.payload.email
					}
				}
				resolve(session)
			})
    	})
	})
}

// Sign out of the current session (will redirect to signout URI)
const signOutCognitoSession = () => {
	createCognitoAuth().then((auth)=>{
    	auth.signOut()
  	})
}

var cognitoApis = {
	createCognitoAuth,
  	createCognitoUser,
  	createCognitoUserPool,
  	getCognitoSession,
  	getCognitoSignInUri,
  	parseCognitoWebResponse,
  	signOutCognitoSession
}

export default cognitoApis


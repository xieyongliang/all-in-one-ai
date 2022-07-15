import { CognitoAuth } from 'amazon-cognito-auth-js/dist/amazon-cognito-auth';
import {
	CognitoUserPool,
	CognitoUser,
	AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import { config as AWSConfig } from 'aws-sdk';
// import appConfig from '../config/app-config.json'

import axios from 'axios';

// Creates a CognitoAuth instance
const createCognitoAuth = () => {
	// console.log('Enter createCognitoAuth')
	return new Promise((resolve, reject) => {
		const HEADERS = { 'Content-Type': 'application/json' };
		axios({ method: 'GET', url: '/env', headers: HEADERS }).then(
			(response) => {
				// console.log(response);
				if (response.status === 200) {
					let appConfig = {
						region: response.data.CognitoRegion,
						userPool: response.data.UserPool,
						userPoolBaseUri: response.data.UserPoolDomain,
						clientId: response.data.UserPoolClient,
						callbackUri: response.data.CallbackURL,
						signoutUri: response.data.LogoutURL,
						tokenScopes: [
							'openid',
							'email',
							'profile',
							response.data.LogoutURL,
						],
						apiUri: response.data.LogoutURL,
					};
					AWSConfig.region = response.data.CognitoRegion;
					const appWebDomain = appConfig.userPoolBaseUri
						.replace('https://', '')
						.replace('http://', '');
					const auth = new CognitoAuth({
						UserPoolId: appConfig.userPool,
						ClientId: appConfig.clientId,
						AppWebDomain: appWebDomain,
						TokenScopesArray: appConfig.tokenScopes,
						RedirectUriSignIn: appConfig.callbackUri,
						RedirectUriSignOut: appConfig.signoutUri,
					});
					resolve(auth);
				} else {
					// console.log('createCognitoAuth Error')
					reject('createCognitoAuth Error');
				}
			}
		);
	});
};

// Creates a CognitoUser instance
const createCognitoUser = () => {
	// const pool = createCognitoUserPool()
	return new Promise((resolve, reject) => {
		createCognitoUserPool().then((pool) => {
			resolve(pool.getCurrentUser());
		});
	});
};

// Creates a CognitoUserPool instance
const createCognitoUserPool = () => {
	// console.log('Enter createCognitoUserPool')
	return new Promise((resolve, reject) => {
		const HEADERS = { 'Content-Type': 'application/json' };
		axios({ method: 'GET', url: '/env', headers: HEADERS }).then(
			(response) => {
				// console.log(response);
				if (response.status === 200) {
					let appConfig = {
						region: response.data.CognitoRegion,
						userPool: response.data.UserPool,
						userPoolBaseUri: response.data.UserPoolDomain,
						clientId: response.data.UserPoolClient,
						callbackUri: response.data.CallbackURL,
						signoutUri: response.data.LogoutURL,
						tokenScopes: [
							'openid',
							'email',
							'profile',
							response.data.LogoutURL,
						],
						apiUri: response.data.LogoutURL,
					};
					AWSConfig.region = response.data.CognitoRegion;

					let userPool = new CognitoUserPool({
						UserPoolId: appConfig.userPool,
						ClientId: appConfig.clientId,
					});
					resolve(userPool);
				} else {
					// console.log('createCognitoUserPool Error')
					reject('createCognitoUserPool Error');
				}
			}
		);
	});
};

// Get the URI of the hosted sign in screen
const getCognitoSignInUri = () => {
	// console.log('Enter getCognitoSignInUri')
	return new Promise((resolve, reject) => {
		const HEADERS = { 'Content-Type': 'application/json' };
		axios({ method: 'GET', url: '/env', headers: HEADERS }).then(
			(response) => {
				// console.log(response);
				if (response.status === 200) {
					let appConfig = {
						region: response.data.CognitoRegion,
						userPool: response.data.UserPool,
						userPoolBaseUri: response.data.UserPoolDomain,
						clientId: response.data.UserPoolClient,
						callbackUri: response.data.CallbackURL,
						signoutUri: response.data.LogoutURL,
						tokenScopes: [
							'openid',
							'email',
							'profile',
							response.data.LogoutURL,
						],
						apiUri: response.data.LogoutURL,
					};
					AWSConfig.region = response.data.CognitoRegion;
					const signinUri = `${appConfig.userPoolBaseUri}/login?response_type=code&client_id=${appConfig.clientId}&redirect_uri=${appConfig.callbackUri}`;
					// console.log(signinUri)
					resolve(signinUri);
				} else {
					// console.log('getCognitoSignInUri Error')
					reject('getCognitoSignInUri Error');
				}
			}
		);
	});
};

// Parse the response from a Cognito callback URI (assumed a token or code is in the supplied href). Returns a promise.
const parseCognitoWebResponse = (href) => {
	// console.log('parseCognitoWebResponse : '+href)
	// alert(href)
	return new Promise((resolve, reject) => {
		// const auth = createCognitoAuth()
		createCognitoAuth().then((auth) => {
			// console.log(auth)
			// userHandler will trigger the promise
			auth.userhandler = {
				onSuccess: function (result) {
					// console.log('onSuccess : ' + result)
					resolve(result);
				},
				onFailure: function (err) {
					// console.log('onFailure : ' + err)
					reject(
						new Error(
							'Failure parsing Cognito web response: ' + err
						)
					);
				},
			};
			auth.parseCognitoWebResponse(href);
		});
	});
};

// Gets a new Cognito session. Returns a promise.
const getCognitoSession = () => {
	return new Promise((resolve, reject) => {
		// const cognitoUser = createCognitoUser()
		createCognitoUser().then((cognitoUser) => {
			if (!cognitoUser) {
				resolve(null);
			}
			cognitoUser?.getSession((err, result) => {
				if (err || !result) {
					reject(
						new Error('Failure getting Cognito session: ' + err)
					);
					return;
				}

				// Resolve the promise with the session credentials
				// console.debug('Successfully got session: ' + JSON.stringify(result))
				const session = {
					credentials: {
						accessToken: result.accessToken.jwtToken,
						idToken: result.idToken.jwtToken,
						refreshToken: result.refreshToken.token,
					},
					user: {
						userName: result.idToken.payload['cognito:username'],
						email: result.idToken.payload.email,
						userGroup: result.idToken.payload['cognito:groups']
					},
				};
				resolve(session);
			});
		});
	});
};

// Sign out of the current session (will redirect to signout URI)
const signOutCognitoSession = () => {
	// const auth = createCognitoAuth()
	createCognitoAuth().then((auth) => {
		auth.signOut();
	});
};

const signOutCognito = async () => {
	const userPool = await createCognitoUserPool();
	const user = userPool.getCurrentUser();
	user.signOut();
};

// Login cognito user from own login UI
const signInCognito = async (credentials) => {
	// get the user pool
	const userPool = await createCognitoUserPool();
	// get the user
	const user = new CognitoUser({
		Username: credentials?.username,
		Pool: userPool,
	});
	// creating the auth details
	const authenticationData = {
		Username: credentials?.username,
		Password: credentials?.password,
	};
	const authenticationDetails = new AuthenticationDetails(authenticationData);

	// authenticating the user
	return new Promise((resolve, reject) => {
		user.authenticateUser(authenticationDetails, {
			onSuccess: (authResult) => {
				resolve(authResult);
			},
			onFailure: (err) => {
				reject(err);
			},
			newPasswordRequired: (userAttributes) => {
				resolve({ updatePassword: true, userAttributes });
			},
		});
	});
};

const completeUpdatePassword = async (credentials, updatePwCredentials) => {
	const userPool = await createCognitoUserPool();
	const poolData = { Username: credentials?.username, Pool: userPool };

	// get the user
	const user = new CognitoUser(poolData);
	const authenticationData = {
		Username: credentials?.username,
		Password: credentials?.password,
	};
	const authenticationDetails = new AuthenticationDetails(authenticationData);
	return new Promise((resolve, reject) => {
		user.authenticateUser(authenticationDetails, {
			newPasswordRequired: (userAttributes) => {
				delete userAttributes.email_verified;
				user.completeNewPasswordChallenge(
					updatePwCredentials?.confirmPassword,
					userAttributes,
					{
						onSuccess: (res) => {
							resolve(res);
						},
						onFailure: (err) => {
							reject(err);
						},
					}
				);
			},
		});
	});
};

const getCurrentCognitoUser = async () => {
	// get the user pool
	const userPool = await createCognitoUserPool();
	return new Promise((resolve) => {
		resolve(userPool.getCurrentUser());
	});
};

const forgotPassword = async (credentials) => {
	const userPool = await createCognitoUserPool();
	const poolData = { Username: credentials?.username, Pool: userPool };
	// get the user
	const user = new CognitoUser(poolData);
	return new Promise((resolve, reject) => {
		user.forgotPassword({
			onSuccess: (data) => {
				resolve(data);
			},
			onFailure: (err) => {
				reject(err);
			},
			//Optional automatic callback
			inputVerificationCode: (data) => {
				resolve(data)
			},
		});
	});
};

const resetPassword = async (credentials) => {
	const userPool = await createCognitoUserPool();
	const poolData = { Username: credentials.username, Pool: userPool };
	const user = new CognitoUser(poolData);
	return new Promise((resolve, reject) => {
		user.confirmPassword(credentials.verificationCode, credentials.newPassword, {
			onSuccess() {
				resolve({ resetSuccess: true });
			},
			onFailure(err) {
				reject(err);
			},
		});
	});
};

export default {
	createCognitoAuth,
	createCognitoUser,
	createCognitoUserPool,
	getCognitoSession,
	getCognitoSignInUri,
	parseCognitoWebResponse,
	signOutCognitoSession,
	signInCognito,
	signOutCognito,
	getCurrentCognitoUser,
	completeUpdatePassword,
	forgotPassword,
	resetPassword
};

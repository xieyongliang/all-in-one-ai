/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
  
  Licensed under the Apache License, Version 2.0 (the "License").
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
      http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.                                                                              *
 ******************************************************************************************************************** */
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NorthStarThemeProvider from 'aws-northstar/components/NorthStarThemeProvider';
import AppLayout from './components/AppLayout';
import Home from './components/Home/index'
import IndustrialModelOverview from './components/Lists/IndustrialModel';
import IndustrialModels from './components/IndustrialModels';
import BatchAnnotationForm from './components/Forms/BatchAnnotation';
import { FunctionComponent, useEffect } from 'react';
import { IIndustrialModel } from './store/industrialmodels/reducer';
import axios from 'axios'; 
import { store } from '.';
import { Action } from './store/Actions';
import AlgorithmForm from './components/Algorithms'
import Track from './components/Scenarios/Track';
import PPE from './components/Scenarios/PPE';
import Callback from './components/Cognito/Callback';
import SignOut from './components/Cognito/SignOut';
import { logOutput } from './components/Utils/Helper';

const App : FunctionComponent = () => {
    const withLayout = (Component : any, props? : any) => {
        return (
            <AppLayout>
                <Component {...props} />
            </AppLayout>
        )
    }

    const getModels = async () => {
        var response = await axios.get(`/industrialmodel`)

        return response.data
    }

    const getEnv = async () => {
        var response = await axios.get(`/env`)

        return response.data
    }

    useEffect(() => {
        getModels().then((data) => {
            var industrialModels : IIndustrialModel[] = []
            data.forEach((item) => {
                var industrialModel : IIndustrialModel = {
                    id: item.model_id, 
                    name: item.model_name, 
                    algorithm: item.model_algorithm, 
                    description: item.model_description, 
                    icon : item.model_icon, 
                    samples: item.model_samples, 
                    extra: item.model_extra
                }
                industrialModels.push(industrialModel)
            })
            store.dispatch({ type: Action.UPDATE_INDUSTRIAL_MODELS, payload: {industrialModels : industrialModels}})
        }, (error) => {
            logOutput('error', error.response.data, undefined, error);
        });

        getEnv().then((data) => {
            var env = {};
            env['cognitoRegion'] = data.CognitoRegion;
            env['userPool'] = data.UserPool;
            env['userPoolBaseUri'] = data.userPoolBaseUri;
            env['clientId'] = data.clientId;
            env['callbackUri'] = data.callbackUri;
            env['signoutUri'] = data.signoutUri;
            env['tokenScopes'] = data.tokenScopes;
            env['logoutUri'] = data.LogoutURL;
            env['socketUri'] = data.SocketURL; 

            store.dispatch({ type: Action.UPDATE_ENV, payload: {env : env}})
        }, (error) => {
            logOutput('error', error.response.data, undefined, error);
        });
    }, [])

    return (
        <NorthStarThemeProvider>
            <Router>
                <Switch>
                    <Route sensitive={true} exact path="/scenarios/ppe">{withLayout(PPE)}</Route>
                    <Route sensitive={true} exact path="/scenarios/track">{withLayout(Track)}</Route>
                    <Route sensitive={true} exact path="/algorithms/:id">{withLayout(AlgorithmForm)}</Route>
                    <Route sensitive={true} exact path="/imodels/:id">{withLayout(IndustrialModels)}</Route>
                    <Route sensitive={true} exact path="/imodels">{withLayout(IndustrialModelOverview)}</Route>
                    <Route sensitive={true} exact path="/batchannotation">{withLayout(BatchAnnotationForm)}</Route>
                    <Route sensitive={true} exact path="/">{withLayout(Home)}</Route>                 
                    <Route sensitive={true} exact path="/callback">{withLayout(Callback)}</Route>
                    <Route sensitive={true} exact path="/signout">{withLayout(SignOut)}</Route>                                  
                </Switch>
            </Router>
        </NorthStarThemeProvider>
    );
};

export default App;
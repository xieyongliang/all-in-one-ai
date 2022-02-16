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
import Dashboard from './components/Dashboard/index'
import Case from './components/Cases'
import Yolov5 from './components/Models/Yolov5'
import PPE from './components/Scenarios/PPE';
import TrainingJobForm from './components/Forms/TrainingJob';
import ModelForm from './components/Forms/Model';
import EndpointForm from './components/Forms/Endpoint';
import RestApiForm from './components/Forms/RestApi';
import GreengrassComponentForm from './components/Forms/GreengrassComponent';
import GreengrassDeploymentForm from './components/Forms/GreengrassDeployment';
import PipelineForm from './components/Forms/Pipeline';
import TransformJobForm from './components/Forms/TransformJob';

const withLayout = (Component : any, props? : any) => {
    return (
        <AppLayout>
            <Component {...props} />
        </AppLayout>
    )
}

const App = () => {
    return (
        <NorthStarThemeProvider>
            <Router>
                <Switch>
                    <Route exact path="/form/:name/trainingjob">{withLayout(TrainingJobForm)}</Route>
                    <Route exact path="/form/:name/model">{withLayout(ModelForm)}</Route>
                    <Route exact path="/form/:name/endpoint">{withLayout(EndpointForm)}</Route>
                    <Route exact path="/form/:name/restapi">{withLayout(RestApiForm)}</Route>
                    <Route exact path="/form/:name/component">{withLayout(GreengrassComponentForm)}</Route>
                    <Route exact path="/form/:name/deployment">{withLayout(GreengrassDeploymentForm)}</Route>
                    <Route exact path="/form/:name/pipeline">{withLayout(PipelineForm)}</Route>
                    <Route exact path="/form/:name/transformjob">{withLayout(TransformJobForm)}</Route>
                    <Route exact path="/scenarios/ppe">{withLayout(PPE)}</Route>
                    <Route exact path="/model/yolov5">{withLayout(Yolov5)}</Route>
                    <Route exact path="/case/:name/demo/:type">{withLayout(Case, {'activeId':'demo'})}</Route>
                    <Route exact path="/case/:name/demo">{withLayout(Case, {'activeId':'demo'})}</Route>
                    <Route exact path="/case/:name/pipeline">{withLayout(Case,{'activeId':'pipeline'})}</Route>
                    <Route exact path="/case/:name/trainingjob">{withLayout(Case,{'activeId':'trainingjob'})}</Route>
                    <Route exact path="/case/:name/model">{withLayout(Case,{'activeId':'model'})}</Route>
                    <Route exact path="/case/:name/endpoint">{withLayout(Case,{'activeId':'endpoint'})}</Route>
                    <Route exact path="/case/:name/restapi">{withLayout(Case,{'activeId':'restapi'})}</Route>
                    <Route exact path="/case/:name/component">{withLayout(Case,{'activeId':'component'})}</Route>
                    <Route exact path="/case/:name/deployment">{withLayout(Case,{'activeId':'deployment'})}</Route>
                    <Route exact path="/case/:name/pipeline">{withLayout(Case,{'activeId':'pipeline'})}</Route>
                    <Route exact path="/">{withLayout(Dashboard)}</Route>
                </Switch>
            </Router>
        </NorthStarThemeProvider>
    );
};

export default App;

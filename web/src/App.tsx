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
import Case from './components/Models'
import Yolov5 from './components/Algorithms/Yolov5'
import PPE from './components/Scenarios/PPE';
import Overview from './components/Overview';

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
                    <Route sensitive={true} exact path="/scenario/:name">{withLayout(PPE)}</Route>
                    <Route sensitive={true} exact path="/algorithm/:name">{withLayout(Yolov5)}</Route>
                    <Route sensitive={true} exact path="/case/:name">{withLayout(Case)}</Route>
                    <Route sensitive={true} exact path="/case">{withLayout(Overview)}</Route>
                    <Route sensitive={true} exact path="/">{withLayout(Dashboard)}</Route>
                </Switch>
            </Router>
        </NorthStarThemeProvider>
    );
};

export default App;

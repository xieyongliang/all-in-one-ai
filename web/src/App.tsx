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
import Yolov5 from './components/Algorithms/Yolov5'
import PPE from './components/Scenarios/PPE';
import IndustrialModelOverview from './components/Lists/IndustrialModel';
import IndustrialModels from './components/IndustrialModels';
import { FunctionComponent, useEffect } from 'react';
import { IIndustrialModel } from './store/industrialmodels/reducer';
import axios from 'axios'; 
import { store } from '.';
import { Action } from './store/Actions';
import GluonCV from './components/Algorithms/GluonCV';
import PaddleOCR from './components/Algorithms/PaddleOCR';
import Track from './components/Scenarios/Track';
import CameraForm from './components/Forms/Camera';
import MapForm from './components/Forms/Map';
import YoutubeForm from './components/Forms/Camera/youtube';

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
                    labels: item.model_labels
                }
                industrialModels.push(industrialModel)
            })
            store.dispatch({ type: Action.UPDATE_INDUSTRIAL_MODELS, payload: {industrialModels : industrialModels}})
         }, (error) => {
             console.log(error);
         });
     }, [])

    return (
        <NorthStarThemeProvider>
            <Router>
                <Switch>
                    <Route sensitive={true} exact path="/scenarios/ppe">{withLayout(PPE)}</Route>
                    <Route sensitive={true} exact path="/scenarios/track">{withLayout(Track)}</Route>
                    <Route sensitive={true} exact path="/algorithms/yolov5">{withLayout(Yolov5)}</Route>
                    <Route sensitive={true} exact path="/algorithms/gluoncv">{withLayout(GluonCV)}</Route>
                    <Route sensitive={true} exact path="/algorithms/paddleocr">{withLayout(PaddleOCR)}</Route>
                    <Route sensitive={true} exact path="/imodels/:id">{withLayout(IndustrialModels)}</Route>
                    <Route sensitive={true} exact path="/imodels">{withLayout(IndustrialModelOverview)}</Route>
                    <Route sensitive={true} exact path="/">{withLayout(Dashboard)}</Route>
                    <Route sensitive={true} exact path="/mtr">{withLayout(CameraForm)}</Route>                    
                    <Route sensitive={true} exact path="/map">{withLayout(MapForm)}</Route>                    
                    <Route sensitive={true} exact path="/youtube">{withLayout(YoutubeForm)}</Route>                    
                </Switch>
            </Router>
        </NorthStarThemeProvider>
    );
};

export default App;
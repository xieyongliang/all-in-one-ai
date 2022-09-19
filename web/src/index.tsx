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
  import React, { Suspense } from 'react';
  import ReactDOM from 'react-dom';
  import App from './App';
  import reportWebVitals from './reportWebVitals';
  import * as serviceWorker from './serviceWorker';
  import configureStore from './configureStore';
  import {AppInitializer} from './logic/initializer/AppInitializer';
  import { Provider } from 'react-redux';
  import './i18n'
  
  export const store = configureStore();
  AppInitializer.inti();
  
  ReactDOM.render(
      <React.StrictMode>
          <Provider store={store}>
            <Suspense fallback={<div></div>}>
                <App />
            </Suspense> 
          </Provider>
      </React.StrictMode>,
      document.getElementById('root')
  );
  
  reportWebVitals();
  serviceWorker.unregister();

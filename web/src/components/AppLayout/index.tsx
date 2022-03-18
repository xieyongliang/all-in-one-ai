/** *******************************************************************************************************************
  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
  
  Licensed under the Apache License, Version 2.0 (the 'License').
  You may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  
      http://www.apache.org/licenses/LICENSE-2.0
  
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an 'AS IS' BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.                                                                              *
 ******************************************************************************************************************** */
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import AppLayoutBase from 'aws-northstar/layouts/AppLayout';
import HeaderBase from 'aws-northstar/components/Header';
import SideNavigationBase, { SideNavigationItem, SideNavigationItemType } from 'aws-northstar/components/SideNavigation';
import { connect } from 'react-redux';
import { AppState } from '../../store';
import { store } from '../..';

const AppLayout: FunctionComponent = ( {children} ) => {
    const [ itemsModels, setItemsModels ] = useState<SideNavigationItem[]>([])
    const Header = useMemo(
        () => <HeaderBase title='All-In-One AI' logoPath='/ml.jpg' />,
        []
    );

    var industrialModels = store.getState().pipeline.industrialModels

    useEffect(() => {
        var items = []
        items.push({ text: 'Overview', type: SideNavigationItemType.LINK, href: '/case' })
        store.getState().pipeline.industrialModels.forEach((item) => {
            items.push({text: item.description, type: SideNavigationItemType.LINK, href: `/case/${item.name}?tab=demo#sample`})
        })
        setItemsModels(items)
     }, [industrialModels])
 
    const SideNavigation = useMemo(() => {
        return (
            <SideNavigationBase
                header={{ text: 'Home', href: '/' }}
                items={[
                    {
                        'type': SideNavigationItemType.SECTION,
                        'text': 'Scenarios',
                        'items': [
                            { text: 'PPE Detector', type: SideNavigationItemType.LINK, href: '/scenario/ppe' },
                            { text: 'Track maintenance', type: SideNavigationItemType.LINK, href: '/scenario/ppe' }
                        ]
                    },
                    {
                        'type': SideNavigationItemType.SECTION,
                        'text': 'Industrial models',
                        'items': itemsModels
                    },
                    {
                        'type': SideNavigationItemType.SECTION,
                        'text': 'Algorithms',
                        'items': [
                            { text: 'Yolov5', type: SideNavigationItemType.LINK, href: '/algorithm/yolov5' }
                        ]
                    }
                ]}
            />
        );
    }, [itemsModels]);

    return (
        <AppLayoutBase header={Header} navigation={SideNavigation} >
            {children}
        </AppLayoutBase>
    );
};

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.pipeline.industrialModels
});

export default connect(
    mapStateToProps
)(AppLayout);

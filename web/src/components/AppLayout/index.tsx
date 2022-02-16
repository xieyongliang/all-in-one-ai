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
import { FunctionComponent, useMemo } from 'react';
import AppLayoutBase from 'aws-northstar/layouts/AppLayout';
import HeaderBase from 'aws-northstar/components/Header';
import SideNavigationBase, { SideNavigationItemType } from 'aws-northstar/components/SideNavigation';
import BreadcrumbGroup from 'aws-northstar/components/BreadcrumbGroup';

const AppLayout: FunctionComponent = ({ children }) => {
    const Header = useMemo(
        () => <HeaderBase title="All-In-One AI" logoPath="/ml.jpg" />,
        []
    );
    const Breadcrumbs = useMemo(() => <BreadcrumbGroup rootPath="Home" />, []);
    const SideNavigation = useMemo(() => {
        return (
            <SideNavigationBase
                header={{ text: 'Home', href: '/' }}
                items={[
                    {
                        "type": SideNavigationItemType.SECTION,
                        "text": "Scenarios",
                        "items": [
                            { text: 'PPE Detector', type: SideNavigationItemType.LINK, href: '/scenarios/ppe' },
                            { text: 'Track maintenance', type: SideNavigationItemType.LINK, href: '/scenarios/ppe' },
                            { text: 'Intelligent steaming videos', type: SideNavigationItemType.LINK, href: '/scenarios/ppe' },                                                        
                            { text: 'Shelf recognition', type: SideNavigationItemType.LINK, href: '/scenarios/ppe' }
                        ]
                    },
                    {
                        "type": SideNavigationItemType.SECTION,
                        "text": "Use cases",
                        "items": [
                            { text: 'Track detection', type: SideNavigationItemType.LINK, href: '/case/track/demo/sample' },
                            { text: 'Mask detection', type: SideNavigationItemType.LINK, href: '/case/mask/demo/sample' },
                            { text: 'Helmet detection', type: SideNavigationItemType.LINK, href: '/case/helmet/demo/sample' },                                                        
                            { text: 'Receipt recognition', type: SideNavigationItemType.LINK, href: '/case/receipt/demo/sample' },
                            { text: 'Insurance report recogniton', type: SideNavigationItemType.LINK, href: '/case/insurance/demo/sample' },
                        ]
                    },
                    {
                        "type": SideNavigationItemType.SECTION,
                        "text": "Models",
                        "items": [
                            { text: 'Yolov5', type: SideNavigationItemType.LINK, href: '/model/yolov5' },
                            { text: 'Paddle', type: SideNavigationItemType.LINK, href: '/model/yolov5' }
                        ]
                    }
                ]}
            ></SideNavigationBase>
        );
    }, []);

    return (
        <AppLayoutBase header={Header} navigation={SideNavigation} breadcrumbs={Breadcrumbs}>
            {children}
        </AppLayoutBase>
    );
};

export default AppLayout;

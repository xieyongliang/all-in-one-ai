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
import { FunctionComponent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import AppLayoutBase from 'aws-northstar/layouts/AppLayout';
import SideNavigationBase, { SideNavigationItem, SideNavigationItemType } from 'aws-northstar/components/SideNavigation';
import { IIndustrialModel } from '../../store/industrialmodels/reducer';
import { ALGORITHMS } from '../Data/data';
import { SCENARIOS } from '../Data/data';
import { connect } from 'react-redux';
import { AppState } from '../../store';
import { Alert, Box, Select, Stack } from 'aws-northstar';
import Header from "aws-northstar/components/Header";
import { useCookies } from 'react-cookie';
import useWebSocket from 'react-use-websocket';
import { useTranslation } from "react-i18next";
import { getLocaleDate, logOutput } from '../Utils/Helper';
import algorithmsConfig from '../Data/config.json'

interface IProps {
    industrialModels : IIndustrialModel[];
    isLogin: boolean;
    env: Object;
    children: ReactNode;
    messages: Object[];
}

const languages = [
    { label: "简体中文", value: "zh-CHS" },
    { label: "繁体中文", value: "zh-CHT" },
    { label: "English", value: "en" },
];

const AppLayout: FunctionComponent<IProps> = ( {
    industrialModels,
    isLogin,
    env,
    messages,
    children,
} ) => {
    const  { i18n } = useTranslation();
    const [ cookies, setCookie ] = useCookies();
    const [ language, setLanguage ] = useState(cookies.language !== undefined? cookies.language : 'zh-CHS')
    const [ industrialModelItems, setIndustrialModelItems ] = useState<SideNavigationItem[]>([])
    const [ algorithmsItems, setAlgorithmsItems ] = useState<SideNavigationItem[]>([])
    const [ scenariosItems, setScenariosItems ] = useState<SideNavigationItem[]>([])
  
    const onLanguageChange = (event) => {
        setLanguage(event.target.value);
    };

    const { t } = useTranslation();

    const getSocketUrl = useCallback(() => {
        return new Promise<string>((resolve) => {
            var timer = setInterval(() => {
                if(env['socketUri'] !== undefined) {
                    resolve(env['socketUri']);
                    clearInterval(timer)
                }
            }, 1000);
        });
    }, [env]);

    const { getWebSocket } = useWebSocket(getSocketUrl, {
        shouldReconnect: (closeEvent) => {
          return true;
        },
        reconnectAttempts: 10,
        reconnectInterval: 3000,
      }
    );  

    const onMessage = (event) => {
        var data = JSON.parse(event.data)

        var time = getLocaleDate(data.time);
        var type = data.status === 1 ? "success" : (data.status === 0 ? "info" : "error");       
        var description = t(`app_layout.${data.type}_task_${type}`);
        var content = `${description}`;
        if(type !== 'success')
            content += ` - ${data.message}`;
        
        logOutput(type, content, time);
    }

    if(getWebSocket() !== null)
        getWebSocket().onmessage = onMessage; 

    const AppHeader = useMemo(() => {
        return (
            <Header
                title={t('header')} 
                logoPath = '/ico/all-in-one-ai.ico'
                rightContent={
                    <Box display="flex" alignItems="center">
                        <Select
                            options = {languages}
                            selectedOption = {languages.find((item) => item.value === language)}
                            onChange={(event) => onLanguageChange(event)}
                        />
                    </Box>
                }
            />
        )
    }, [language, t]);

    useEffect(() => {
        var items = []
        items.push({ text: t('app_layout.overview'), type: SideNavigationItemType.LINK, href: '/imodels' })
        industrialModels.sort((itemModel1 : IIndustrialModel, itemModel2: IIndustrialModel) => {
            if(itemModel1.name > itemModel2.name)
                return 1;
            else if(itemModel1.name === itemModel2.name)
                return 0;
            else
                return -1;
        })
        .forEach((item) => {
            var extra = JSON.parse(item.extra)
            if(extra['visible'] === undefined || extra['visible'] === 'true')
                items.push({text: item.name, type: SideNavigationItemType.LINK, href: `/imodels/${item.id}?tab=demo#sample`})
        })
        setIndustrialModelItems(items)
     }, [industrialModels, t])

    useEffect(() => {
        var items = []
            ALGORITHMS.forEach((item) => {
                if(algorithmsConfig.algorithm !== '') {
                    if(item.value === algorithmsConfig.algorithm)
                        if(item.type === 'single')
                            items.push({text: item.label, type: SideNavigationItemType.LINK, href: `/algorithms/${item.value}`})
                }
                else {
                    if(item.type === 'single')
                        items.push({text: item.label, type: SideNavigationItemType.LINK, href: `/algorithms/${item.value}`})
                }
            })
            setAlgorithmsItems(items)
    }, [])

    useEffect(() => {
        var items = []
            SCENARIOS.forEach((item) => {
                items.push({text: t(`scenarios.${item.label}.title`), type: SideNavigationItemType.LINK, href: `/scenarios/${item.value}`})
            })
            setScenariosItems(items)
    }, [t])     
     
    useEffect(() => {
        i18n.changeLanguage(language);
        setCookie('language', language, { path: '/' });
     }, [ language, i18n, setCookie ])  
     
    const SideNavigation = useMemo(() => {
        return (
            <SideNavigationBase
                header={{ text: t('app_layout.home'), href: '/' }}
                items={[
                    {
                        'type': SideNavigationItemType.SECTION,
                        'text': t('app_layout.scenarios'),
                        'items': scenariosItems
                    },
                    {
                        'type': SideNavigationItemType.SECTION,
                        'text': t('app_layout.industrial_models'),
                        'items': industrialModelItems
                    },
                    {
                        'type': SideNavigationItemType.SECTION,
                        'text': t('app_layout.algorithms'),
                        'items': algorithmsItems
                    }
                ]}
            />
        );
    }, [industrialModelItems, algorithmsItems, scenariosItems, t]);

    return (
        <
            AppLayoutBase header={AppHeader}
            navigation={env['cognitoRegion'] === '' || env['cognitoRegion'] === undefined || isLogin ? SideNavigation : null}
        >
            <Stack>
                {
                    messages.map((message) => {
                        return (
                            <Alert type={message['type']} dismissible={true}>
                                {message['content']}
                            </Alert>
                        )
                    })  
                }
                {
                    children
                }
            </Stack>
        </AppLayoutBase>
    );
};

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels,
    isLogin: state.session.isLogin,
    env: state.general.env,
    messages: state.general.messages
});

export default connect(
    mapStateToProps
)(AppLayout);
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import ButtonDropdown from 'aws-northstar/components/ButtonDropdown';
import {Column} from 'react-table'
import { useHistory, useParams } from 'react-router-dom';
import { PathParams } from '../../Interfaces/PathParams';
import axios from 'axios';
import { getUtcDate } from '../../Utils/Helper';

interface PipelineItem {
    pipelineExecutionArn: string;
    pipelineName: string;
    pipelineExecutionStatus: string;
    creationTime: string;
    lastModifiedTime: string;
}

const PipelineList: FunctionComponent = () => {
    const [ pipelineItems, setPipelineItems ] = useState([])
    const [ loading, setLoading ] = useState(true)

    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        axios.get('/pipeline', {params : {'case': params.name}})
            .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({pipelineExecutionArn : item.PipelineExecutionArn, pipelineName: item.PipelineExperimentConfig['ExperimentName'], pipelineExecutionStatus: item.PipelineExecutionStatus, creationTime: getUtcDate(item.CreationTime), lastModifiedTime: getUtcDate(item.LastModifiedTime)})
                if(items.length === response.data.length)
                    setPipelineItems(items)
            }
            setLoading(false);
        }, (error) => {
            console.log(error);
        });
    }, [params.name]);

    const onCreate = () => {
        history.push('/case/' + params.name + '?tab=pipeline#form')
    }

    const getRowId = useCallback(data => data.pipelineExecutionArn, []);

    const columnDefinitions : Column<PipelineItem>[]= [
        {
            id: 'pipelineExecutionArn',
            width: 700,
            Header: 'Execution arn',
            accessor: 'pipelineExecutionArn',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/case/${params.name}?tab=pipeline#prop:id=${row.original.pipelineExecutionArn}`}> {row.original.pipelineExecutionArn} </a>;
                }
                return null;
            }        
        },
        {
            id: 'pipelineName',
            width: 150,
            Header: 'Name',
            accessor: 'pipelineName'
        },
        {
            id: 'pipelineExecutionStatus',
            width: 150,
            Header: 'Status',
            accessor: 'pipelineExecutionStatus',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.pipelineExecutionStatus;
                    switch(status) {
                        case 'Succeeded':
                            return <StatusIndicator  statusType='positive'>{status}</StatusIndicator>;
                        case 'Failed':
                            return <StatusIndicator  statusType='negative'>{status}</StatusIndicator>;
                        case 'Executing':
                            return <StatusIndicator  statusType='info'>{status}</StatusIndicator>;
                        case 'Stopping':
                        case 'Stopped':
                            return <StatusIndicator  statusType='warning'>{status}</StatusIndicator>;
                        default:
                            return null;
                    }
                }
                return null;
            }
        },
        {
            id: 'creationTime',
            width: 250,
            Header: 'Creation time',
            accessor: 'creationTime'
        },   
        {
            id: 'lastModifiedTime',
            width: 250,
            Header: 'Last updated',
            accessor: 'lastModifiedTime'
        }   
    ];
    
    const tableActions = (
        <Inline>
            <ButtonDropdown
                content='Action'
                    items={[{ text: 'Clone' }, { text: 'Delete' }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );

    return (
        <Table
            actionGroup={tableActions}
            tableTitle='Pipeline'
            multiSelect={false}
            columnDefinitions={columnDefinitions}
            items={pipelineItems}
            onSelectionChange={console.log}
            loading={loading}
            getRowId={getRowId}
        />
    )
}

export default PipelineList;
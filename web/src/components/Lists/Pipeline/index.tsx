import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import Table from 'aws-northstar/components/Table';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import ButtonDropdown from 'aws-northstar/components/ButtonDropdown';
import {Column} from 'react-table'
import { useHistory, useParams } from 'react-router-dom';
import { PathParams } from '../../Interfaces/PathParams';
import axios from 'axios';

interface DataType {
    execution_arn: string;
    name: string;
    status: string;
    creation_time: string;
    last_updated: string;
}

const PipelineList: FunctionComponent = () => {
    const [ items, setItems ] = useState([])
    const [ loading, setLoading ] = useState(true)

    const casename = useRef('');

    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        casename.current = params.name;
        axios.get('/pipeline', {params : {'case': params.name}})
            .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({execution_arn : item.pipeline_execution_arn, name: item.pipeline_name, status: item.execution_status, creation_time: item.creation_time, last_updated: item.last_modified_time})
            }
            setItems(items)
            setLoading(false);
        }, (error) => {
            console.log(error);
        });
    }, [params.name, items]);

    const onCreate = () => {
        history.push('/case/' + params.name + '?tab=pipeline#form')
    }

    const getRowId = useCallback(data => data.execution_arn, []);

    const columnDefinitions : Column<DataType>[]= [
        {
            id: 'execution_arn',
            width: 700,
            Header: 'Execution arn',
            accessor: 'execution_arn',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/case/${params.name}?tab=pipeline#prop:id=${row.original.execution_arn}`}> {row.original.execution_arn} </a>;
                }
                return null;
            }        
        },
        {
            id: 'name',
            width: 200,
            Header: 'Name',
            accessor: 'name'
        },
        {
            id: 'status',
            width: 100,
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.status;
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
            id: 'creation_time',
            width: 150,
            Header: 'Creation time',
            accessor: 'creation_time'
        },   
        {
            id: 'last_updated',
            width: 150,
            Header: 'Last updated',
            accessor: 'last_updated'
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
            items={items}
            onSelectionChange={console.log}
            loading={loading}
            getRowId={getRowId}
        />
    )
}

export default PipelineList;
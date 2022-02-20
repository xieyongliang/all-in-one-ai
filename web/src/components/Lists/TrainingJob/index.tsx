import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Column } from 'react-table'
import { Button, ButtonDropdown, StatusIndicator, Table } from 'aws-northstar/components';
import { Inline }  from 'aws-northstar/layouts';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';

interface TrainingJobItem {
    name: string;
    creation_time: string;
    duration: string;
    status?: string;
}

interface TrainingJobListProps {
    name: string;
}

const TrainingJobList: FunctionComponent<TrainingJobListProps> = (props) => {
    const [ items, setItems ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const casename = useRef('');

    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        casename.current = params.name;
        axios.get('/trainingjob', {params : {'case': params.name}})
            .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({name: item.trainingjob_name, status : item.status, duration: item.duration, creation_time: item.creation_time})
            }
            setItems(items);
            setLoading(false);
        }, (error) => {
            console.log(error);
        });
    }, [params.name]);


    const onCreate = () => {
        history.push(`/case/${props.name}?tab=trainingjob#form`)
    }
    
    const getRowId = React.useCallback(data => data.name, []);

    const columnDefinitions : Column<TrainingJobItem>[]= [
        {
            id: 'name',
            width: 200,
            Header: 'Name',
            accessor: 'name',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    return <a href={`/case/${params.name}?tab=trainingjob#prop:id=${row.original.name}`}> {row.original.name} </a>;
                }
                return null;
            }
        },
        {
            id: 'creation_time',
            width: 200,
            Header: 'Creation time',
            accessor: 'creation_time'
        },
        {
            id: 'duration',
            width: 200,
            Header: 'Duration',
            accessor: 'duration'
        },
        {
            id: 'status',
            width: 200,
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row  }) => {
                if (row && row.original) {
                    const status = row.original.status;
                    switch(status) {
                        case 'Completed':
                            return <StatusIndicator  statusType='positive'>{status}</StatusIndicator>;
                        case 'Failed':
                            return <StatusIndicator  statusType='negative'>{status}</StatusIndicator>;
                        case 'InProgress':
                            return <StatusIndicator  statusType='info'>{status}</StatusIndicator>;
                        case 'Stopped':
                        case 'Stopping':
                            return <StatusIndicator  statusType='warning'>{status}</StatusIndicator>;
                        default:
                            return null;
                    }
                }
                return null;
            }
        }
    ];
    
    const tableActions = (
        <Inline>
            <Button onClick={() => alert('Add button clicked')}>
                Sample code
            </Button>
            <ButtonDropdown
                content="Action"
                    items={[{ text: 'Clone' }, { text: 'Create model' }, { text: 'Stop', disabled: true }, { text: 'Add/Edit tags' }]}
            />        
            <Button variant='primary' onClick={onCreate}>
                Create
            </Button>
        </Inline>
    );
    
    return (
        <Table
            actionGroup={tableActions}
            tableTitle='Training jobs'
            multiSelect={false}
            columnDefinitions={columnDefinitions}
            items={items}
            loading={loading}
            onSelectionChange={console.log}
            getRowId={getRowId}
        />
    )
}

export default TrainingJobList;
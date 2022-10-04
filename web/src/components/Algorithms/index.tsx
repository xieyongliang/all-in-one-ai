import { FunctionComponent, useRef, useEffect, useState, useCallback } from 'react';
import cognitoUtils from '../../lib/cognitoUtils';
import { connect } from 'react-redux';
import { AppState } from '../../store';
import { ALGORITHMS, GenericAlgorithm } from '../Data/data';
import { useParams } from 'react-router-dom';
import { PathParams } from '../Interfaces/PathParams';
import { logOutput } from '../Utils/Helper';
import MarkdownViewer from 'aws-northstar/components/MarkdownViewer'

interface IProps {
    isLogin: boolean;
    env: Object;
}

const AlgorithmForm: FunctionComponent<IProps> = (
    {
        isLogin,
        env
    }) => {
    const[ width, setWidth ] = useState(0);
    const[ height, setHeight ] = useState(0); 
    const[ prevAlgorithm, setPrevAlogirthm ] = useState('');
    const[ current, setCurrent ] = useState();

    const ref = useRef(null);

    var params : PathParams = useParams();

    const handleResize = useCallback(() => {
        if(ref.current) {
            var offsetWidth = ref.current.parentElement.parentElement.parentElement.parentElement.parentElement.offsetWidth;
            var offsetHeight = ref.current.parentElement.parentElement.parentElement.parentElement.parentElement.offsetHeight;

            setHeight(offsetHeight - 2 * 20);
            setWidth(offsetWidth - 2 * 40);
        }
    },[])

    window.addEventListener('resize', handleResize);

    const handleCleanup = useCallback(() => {
        window.removeEventListener('resize', handleResize);
    },[handleResize])

    useEffect(() => {
        handleResize();
        
        if(current !== undefined && current !== null) {
            if(params.id !== 'generic' && prevAlgorithm !== params.id){
                const script = document.createElement('script');

                var reference = encodeURIComponent(ALGORITHMS.find(algorithm => algorithm.value === params.id).reference)
                script.src = `${window.location.protocol}//${window.location.host}/scripts/embed-v2.js?target=${reference}&style=default&type=markdown&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on`
                script.async = true;
                setPrevAlogirthm(params.id);
        
                while (ref.current.firstChild) {
                    ref.current.removeChild(ref.current.firstChild);
                }   
                ref.current.appendChild(script);
            }
        }

        return handleCleanup;
    }, [current, handleResize, handleCleanup, params.id, prevAlgorithm]);

    if(env['cognitoRegion'] === '' || isLogin) {   
        if(ref.current !== null && current === undefined)    
            setCurrent(ref.current);
        else if(ref.current === null && current === undefined)
            setCurrent(null)
        else if(ref.current !== null && current == null)
            setCurrent(ref.current);
        
        if(params.id === 'generic' && prevAlgorithm && prevAlgorithm !== params.id) {
            while (ref.current && ref.current.firstChild) {
                ref.current.removeChild(ref.current.firstChild);
            } 
            setPrevAlogirthm(params.id)
        }

        return (
            <div ref={ref} style={{width: width, height: height}}>
                {
                    (params.id === 'generic') && 
                    <MarkdownViewer> 
                        {GenericAlgorithm}
                    </MarkdownViewer>
                }
            </div>
        );
    }
    else {
        if(env['cognitoRegion'] !== undefined )
            cognitoUtils.getCognitoSignInUri().then(data => {
                window.location.href = data
            }).catch((error) => {
                logOutput('error', error.response.data, undefined, error);
            });
        return (<div></div>)
    }
}

const mapStateToProps = (state: AppState) => ({
    isLogin: state.session.isLogin,
    env: state.general.env
});

export default connect(
    mapStateToProps
)(AlgorithmForm);
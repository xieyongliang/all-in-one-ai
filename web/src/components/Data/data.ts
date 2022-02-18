export const COLORS : string[] = [
    '#ff3838',
    '#ff9d97',
    '#ff701f',
    '#ffb21d',
    '#cff231',
    '#48f90a',
    '#92cc17',
    '#3ddb86',
    '#1a9334',
    '#00d4bb',
    '#2c99a8',
    '#00c2ff',
    '#344593',
    '#6473ff',
    '#0018ec',
    '#8438ff',
    '#520085',
    '#cb38ff',
    '#ff95c8',
    '#ff37c7'
]

export type LabelMap = Record<CaseType, string[]>;

const TrackLabels : string[] = [
    'squat', 
    'aluminothermic weld (atw)', 
    'tri metal weld (tmw)', 
    'fishplate joint (fj)', 
    'grinding marks', 
    'head check error', 
    'insulated rail joint (irj)', 
    'flash butt weld (fbw)', 
    'corrugation', 
    'rail head anomaly' 
]

const FaceLabels : string[] = [
    'face mask',
    'No face mask'
]

export enum CaseType {
    TRACK = 'tarck',
    FACE  = 'face',
    HELMET = 'helmet',
    RECEIPT = 'receipt',
    INSURANCE = 'insurance'
}

export const LABELS : LabelMap = {
    [CaseType.TRACK] :      TrackLabels,
    [CaseType.FACE]  :      FaceLabels,
    [CaseType.HELMET]:      [],
    [CaseType.RECEIPT]:     [],
    [CaseType.INSURANCE]:   []
}
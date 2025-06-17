import React from 'react';

const FromCol = (cell) => {
    return (
        <React.Fragment>
            {cell.value}
        </React.Fragment>
    );
};

const ToCol = (cell) => {
    return (
        <React.Fragment>
            {cell.value}
        </React.Fragment>
    );
};

const DetailsCol = (cell) => {
    return (
        <React.Fragment>
            {cell.value}
        </React.Fragment>
    );
};

const TransactionID = (cell) => {
    return (
        <React.Fragment>
            {cell.value}
        </React.Fragment>
    );
};

const TypeCol = (cell) => {
    return (
        <React.Fragment>
            {cell.value}
        </React.Fragment>
    );
};

const Status = (cell) => {
    return (
        <React.Fragment>
            {cell.value === "Processing" ?
                <span className="badge bg-warning-subtle text-warning fs-11">{" "}<i className="ri-time-line align-bottom"></i>{" "}{cell.value}</span>
                :
                cell.value === "Success" ?
                    <span className="badge bg-success-subtle text-success fs-11">{" "}<i className="ri-checkbox-circle-line align-bottom"></i>{" "}{cell.value}</span>
                    : cell.value === "Failed" ?
                        <span className="badge bg-danger-subtle text-danger fs-11">{" "}<i className="ri-close-circle-line align-bottom"></i>{" "}{cell.value}</span>
                        : null
            }
        </React.Fragment>
    );
};

export { FromCol, ToCol, DetailsCol, TransactionID, TypeCol, Status };

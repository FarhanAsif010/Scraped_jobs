import React from 'react';

const DeleteJob = ({ job, onConfirm, onCancel }) => {
  const handleConfirm = () => {
    onConfirm(job.id);
  };

  return (
    <div className="delete-confirmation">
      <div className="delete-content">
        <h3>Delete Job</h3>
        <p>
          Are you sure you want to delete the job "{job.title}" at {job.company}
          ? This action cannot be undone.
        </p>
        <div className="delete-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteJob;

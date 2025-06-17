const Name = (cell) => {
  return cell.value ? cell.value : "";
};

const CreatedBy = (cell) => {
  return cell.value ? cell.value : "";
};

const APIKeys = (cell) => {
  return (
    <input type="text" className="form-control apikey-value" readOnly defaultValue={cell.value} />
  )
};

const Status = (cell) => {
  return cell.value ? cell.value : "";
};

const CreatedDate = (cell) => {
  return cell.value ? cell.value : "";
};

const ExpiryDate = (cell) => {
  return cell.value ? cell.value : "";
};

export { Name, CreatedBy, APIKeys, Status, CreatedDate, ExpiryDate };

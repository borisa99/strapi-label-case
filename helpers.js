const toLabelCase = (str) =>
  str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase().trim());

const isObjectEmpty = (objectName) => Object.keys(objectName).length === 0;

export const updateMetadatasLabel = (metadatas) => {
  const result = {};
  Object.keys(metadatas).map((key) => {
    const field = Object.assign({}, metadatas[key]);
    delete field.edit.mainField;
    delete field.list.mainField;

    if (!isObjectEmpty(field.edit)) {
      field.edit = { ...field.edit, label: toLabelCase(field.edit.label) };
    }
    if (!isObjectEmpty(field.list)) {
      field.list = { ...field.list, label: toLabelCase(field.list.label) };
    }
    result[key] = field;
  });

  return result;
};

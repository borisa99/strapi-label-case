import client from "./client.js";

const toLabelCase = (str) =>
  str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase().trim());

const isObjectEmpty = (objectName) => Object.keys(objectName).length === 0;

const updateMetadatasLabel = (metadatas) => {
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

export const generatePromises = async (type, data) => {
  const promises = [];
  Object.keys(data).map((key) => {
    const item = data[key];
    promises.push(
      client.put(`/content-manager/${type}/${item.uid}/configuration`, {
        settings: item.settings,
        layouts: item.layouts,
        metadatas: updateMetadatasLabel(item.metadatas),
      })
    );
  });
  return promises;
};

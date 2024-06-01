import client from "./SearchInitializer.js";
import dotenv from "dotenv";

dotenv.config();

const settings = {
  settings: {
    index: {
      number_of_shards: process.env.SHARDS,
      number_of_replicas: process.env.REPLICAS,
    },
  },
};

export const createIndex = async (index_name) => {
  try {
    await client.indices.create({
      index: index_name,
      body: settings,
    });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const getSearchDocument = (doc) => {
  return {
    id: doc?._id,
    sender: doc?.sender,
    text: doc?.text,
    createdOn: doc?.createdOn,
    active: doc?.active
  }
}

export const addToIndex = async (index_name, key, document) => {
  await client.index({
    id: key,
    index: index_name,
    body: document,
    refresh: true,
  });
};

export const updateAtIndex = async (index_name, key, updatedDoc) => {
  await client.update({
    index: index_name,
    id: key,
    body: {
      ...updatedDoc,
    },
  });
};

export const searchDoc = async (index_name, query) => {
  var query = {
    query: {
      ...query
    },
  };

  try {
    var response = await client.search({
      index: index_name,
      body: query,
    });
    return response.body;
  } catch {
    return null;
  }
};

export const deleteDoc = async (index_name,id) => {
    await client.delete({
        index: index_name,
        id: id,
    });
};

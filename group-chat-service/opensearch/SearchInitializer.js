import {Client} from "@opensearch-project/opensearch"

export default new Client({
  node: process.env.OPEN_SEARCH_URL,
});
import { Actor, log } from 'apify';
import { searchIndividual, searchFirm } from './brokercheck.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const {
    query: singleQuery,
    searchType: singleSearchType = 'individual',
    state: singleState,
    queries: queriesInput,
    maxResults = 10,
} = input;

// The single-query field exists so a Store visitor never has to touch the raw JSON
// "queries" editor just to check one name. It takes priority when filled in; "queries"
// is for the bulk/multi-name case.
const queries = singleQuery
    ? [{ query: singleQuery, searchType: singleSearchType, state: singleState }]
    : (queriesInput?.length ? queriesInput : []);

if (queries.length === 0) {
    throw new Error('No queries provided.');
}

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const QUERY_EVENT = 'name-searched';

for (const q of queries) {
    const { query, searchType = 'individual', state } = q;
    if (!query) {
        log.warning('Skipping query with no name', { q });
        continue;
    }

    let results = [];
    try {
        results = searchType === 'firm'
            ? await searchFirm(query, { maxResults })
            : await searchIndividual(query, { state, maxResults });
    } catch (err) {
        log.warning('BrokerCheck search failed', { query, searchType, error: err.message });
    }

    if (results.length > 0) {
        await Actor.pushData(results.map((r) => ({ query, ...r })));
    }
    await Actor.charge({ eventName: QUERY_EVENT });

    log.info('Searched BrokerCheck', { query, searchType, results: results.length });
}

await Actor.exit();

const BASE = 'https://api.brokercheck.finra.org/search';

async function fetchJson(url) {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; finra-brokercheck-lookup/0.1)' },
    });
    if (!res.ok) {
        throw new Error(`BrokerCheck request failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
}

export async function searchIndividual(query, { state, maxResults = 10 } = {}) {
    const params = new URLSearchParams({
        query,
        hl: 'true',
        nrows: String(maxResults),
        r: '25',
        wt: 'json',
    });
    if (state) params.set('state', state);

    const data = await fetchJson(`${BASE}/individual?${params.toString()}`);
    const hits = data?.hits?.hits ?? [];

    return hits.map((hit) => {
        const s = hit._source;
        return {
            type: 'individual',
            crdNumber: s.ind_source_id,
            name: [s.ind_firstname, s.ind_middlename, s.ind_lastname].filter(Boolean).join(' '),
            brokerStatus: s.ind_bc_scope ?? null,
            investmentAdviserStatus: s.ind_ia_scope ?? null,
            hasDisclosures: s.ind_bc_disclosure_fl === 'Y',
            registrationCount: s.ind_approved_finra_registration_count ?? 0,
            currentEmployments: (s.ind_current_employments ?? []).map((e) => ({
                firmName: e.firm_name,
                city: e.branch_city,
                state: e.branch_state,
            })),
            profileUrl: `https://brokercheck.finra.org/individual/summary/${s.ind_source_id}`,
        };
    });
}

export async function searchFirm(query, { maxResults = 10 } = {}) {
    const params = new URLSearchParams({
        query,
        hl: 'true',
        nrows: String(maxResults),
        r: '25',
        wt: 'json',
    });

    const data = await fetchJson(`${BASE}/firm?${params.toString()}`);
    const hits = data?.hits?.hits ?? [];

    return hits.map((hit) => {
        const s = hit._source;
        let address = null;
        try {
            address = s.firm_ia_address_details ? JSON.parse(s.firm_ia_address_details)?.officeAddress : null;
        } catch {
            address = null;
        }
        return {
            type: 'firm',
            crdNumber: s.firm_source_id,
            name: s.firm_name,
            brokerDealerStatus: s.firm_scope ?? null,
            investmentAdviserStatus: s.firm_ia_scope ?? null,
            hasDisclosures: s.firm_disclosure_fl === 'Y' || s.firm_ia_disclosure_fl === 'Y',
            branchCount: s.firm_branches_count ?? 0,
            city: address?.city ?? null,
            state: address?.state ?? null,
            profileUrl: `https://brokercheck.finra.org/firm/summary/${s.firm_source_id}`,
        };
    });
}

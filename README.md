# FINRA BrokerCheck Lookup — Broker & Firm Registration

Look up FINRA-registered brokers and investment firms by name. Get back
registration status, whether they have a disciplinary disclosure on file,
and current employment/branch details, straight from FINRA BrokerCheck.

Built for due-diligence checks before hiring a financial advisor, investor
protection research, compliance and background-check teams, and journalists
covering the wealth-management industry.

## Input

```json
{
  "query": "John Smith",
  "searchType": "individual",
  "state": "NY",
  "maxResults": 10
}
```

| Field | Type | Description |
|---|---|---|
| `query` | string | Name of the single individual or firm to look up. |
| `searchType` | string | `"individual"` or `"firm"`. |
| `state` | string | Optional two-letter state filter (individual search only). |
| `queries` | array | For looking up several names in one run: `{ "query", "searchType", "state" }`. Ignored if `query` above is filled in. |
| `maxResults` | integer | Max matches returned per name (default 10). |

## Output

```json
{
  "query": "John Smith",
  "type": "individual",
  "crdNumber": "4346806",
  "name": "JOHN T. SMITH",
  "brokerStatus": "Active",
  "investmentAdviserStatus": "Active",
  "hasDisclosures": false,
  "registrationCount": 1,
  "currentEmployments": [
    { "firmName": "FIDELITY BROKERAGE SERVICES LLC", "city": "SEATTLE", "state": "WA" }
  ],
  "profileUrl": "https://brokercheck.finra.org/individual/summary/4346806"
}
```

Firm searches return `brokerDealerStatus`, `branchCount`, `city`, and
`state` instead of employment history.

## How it works

Direct calls to the same public search endpoint that powers
brokercheck.finra.org (`api.brokercheck.finra.org/search/individual` and
`/search/firm`) — no scraping of rendered pages, no proxy, no key.

## Pricing note

Billed per **name searched**, not per result returned — searching a common
name that returns 10 matches costs the same as one that returns 1.

## Related products

- [Company Buying Signal Report](https://github.com/timmKal01/company-buying-signal-report) — hiring, tech stack, and contact signal for a company domain
- [Insider Trading Alert](https://github.com/timmKal01/insider-trading-alert) — SEC Form 4 executive buy/sell signals

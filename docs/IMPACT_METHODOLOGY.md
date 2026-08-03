# Impact methodology and reward rules

PACUL reports **estimated** impact. Nothing in the application measures emissions directly; every CO₂ figure is computed from a documented conversion factor and labelled "estimated". All factors live in [`src/config/impact-factors.ts`](../src/config/impact-factors.ts).

## Conversion factors

| Key | Metric | Value | Unit | Source | Last reviewed | Notes |
|---|---|---|---|---|---|---|
| `gridElectricity` | Grid electricity emission factor (Jawa-Madura-Bali) | 0.87 | kg CO₂ / kWh | Ministry of Energy and Mineral Resources (ESDM), Directorate General of Electricity: GHG emission factors of the electricity system ([gatrik.esdm.go.id](https://gatrik.esdm.go.id/frontend/download_index/?kode_category=emisi_pl)) | 2026-09 | Carried over from the original implementation. Published JAMALI values have ranged roughly 0.79–0.89 t CO₂/MWh depending on year and margin type; confirm the latest edition before citing externally. |
| `motorcycleTravel` | Average motorcycle travel emissions | 0.114 | kg CO₂e / km | UK DESNZ, *Greenhouse gas reporting: conversion factors*, motorbike (average) ([gov.uk](https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting)) | 2026-09 | UK fleet proxy; Indonesian motorcycles are typically smaller, so this may overestimate. Counterfactual: the trip would otherwise have been made by motorcycle. |
| `walkingStride` | Average stride length | 0.762 | m / step | Common pedometer default | 2026-09 | Used only to estimate walking distance. |

## Estimated vs. measured

| Action | Quantity | Source of quantity | CO₂e shown |
|---|---|---|---|
| Waste Sorting | kg sorted | Self-reported, capped at 10 kg | None, no defensible factor applied |
| Used Cooking Oil | litres | Self-reported, capped at 5 L | None |
| Tree Planting | trees | Self-reported, capped at 10 | None, seedlings sequester very little in year one |
| Energy Saving | kWh saved | Self-reported, capped at 100 kWh | `kWh × gridElectricity` |
| Sustainable Transportation | km | Self-reported, capped at 50 km | `km × motorcycleTravel` |
| Step Tracker | steps | Device motion sensor (simulated on desktop, clearly labelled) | `steps × stride / 1000 × motorcycleTravel` |
| Carbon Tracker | various | User entry; charts show labelled sample data | Estimated only |

The electricity **reference benchmark** in the Carbon Tracker ([`src/utils/electricityBenchmark.ts`](../src/utils/electricityBenchmark.ts)) consists of illustrative values chosen for the prototype, not official PLN or BPS statistics.

## Prototype Reward Rules

Values are set by the team for the pilot ([`src/config/green-actions.ts`](../src/config/green-actions.ts), [`src/config/eco-points.ts`](../src/config/eco-points.ts)). They are incentive design choices, not scientific values.

### Verified green actions (primary source)

| Action | EcoPoints | Daily limit |
|---|---|---|
| Waste Sorting | 40 | 2 |
| Used Cooking Oil Collection | 50 | 1 |
| Tree Planting | 80 | 2 |
| Energy Saving | 40 | 1 |
| Sustainable Transportation | 30 | 3 |

EcoPoints are not scaled by the self-reported quantity, so inflating a quantity cannot inflate the reward.

### Supporting sources (smaller, capped)

| Source | EcoPoints | Cap |
|---|---|---|
| Citizen waste report | 30 | 2 rewarded reports per day |
| Joining a challenge | 10 | once per challenge |
| Completing a challenge | 100–150 | once; progress only through verified actions |
| Step milestones 1k / 5k / 10k | 10 / 30 / 60 | once per day; none for simulated steps |
| Electricity below reference / well below | 60 / 120 | once per billing month |
| Electricity bill OCR scan | 15 | once per day |
| Footprint activity log | 5 | 3 per day |

### Levels

`level = floor(√(lifetimeEcoPoints / 100)) + 1`. Spending EcoPoints does not reduce the level.

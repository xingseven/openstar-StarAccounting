
// Basic types for the API response
type OpenErApiResponse = {
  result: string;
  time_last_update_utc: string;
  time_next_update_utc: string;
  base_code: string;
  rates: Record<string, number>;
};

// Simple fetch implementation
export async function fetchExchangeRates(base = "CNY"): Promise<Record<string, number> | null> {
  try {
    const url = `https://open.er-api.com/v6/latest/${base}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch exchange rates: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = (await res.json()) as OpenErApiResponse;
    if (data.result !== "success") {
      console.error("Exchange rate API error:", data);
      return null;
    }
    return data.rates;
  } catch (e) {
    console.error("Error fetching exchange rates:", e);
    return null;
  }
}

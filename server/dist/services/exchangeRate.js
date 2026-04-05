// Simple fetch implementation
export async function fetchExchangeRates(base = "CNY") {
    try {
        const url = `https://open.er-api.com/v6/latest/${base}`;
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Failed to fetch exchange rates: ${res.status} ${res.statusText}`);
            return null;
        }
        const data = (await res.json());
        if (data.result !== "success") {
            console.error("Exchange rate API error:", data);
            return null;
        }
        return data.rates;
    }
    catch (e) {
        console.error("Error fetching exchange rates:", e);
        return null;
    }
}

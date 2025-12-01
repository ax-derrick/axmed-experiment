const jwt = require("jsonwebtoken");

const METABASE_SITE_URL = "https://axmed.metabaseapp.com";
const METABASE_SECRET_KEY = "d71442aacb138dce2ef34a8c5f18dc710be335bb7974f04c3e9bb146d3e4f259";
const DASHBOARD_ID = 1849;
const EXPIRATION_DAYS = 7;

const exp = Math.round(Date.now() / 1000) + (EXPIRATION_DAYS * 24 * 60 * 60);

// Marketplace Data - no filter (all data)
const marketplacePayload = {
  resource: { dashboard: DASHBOARD_ID },
  params: {},
  exp
};

// My Country - filtered by country = Nigeria
const myCountryPayload = {
  resource: { dashboard: DASHBOARD_ID },
  params: { country: "Nigeria" },
  exp
};

const marketplaceToken = jwt.sign(marketplacePayload, METABASE_SECRET_KEY);
const myCountryToken = jwt.sign(myCountryPayload, METABASE_SECRET_KEY);

const hashParams = "#bordered=false&titled=false&refresh=60&downloads=false";

console.log("=".repeat(70));
console.log("METABASE EMBED TOKENS GENERATED");
console.log("=".repeat(70));

console.log("\n📊 MARKETPLACE DATA (all data):");
console.log(`${METABASE_SITE_URL}/embed/dashboard/${marketplaceToken}${hashParams}`);

console.log("\n🇳🇬 MY COUNTRY (country = Nigeria):");
console.log(`${METABASE_SITE_URL}/embed/dashboard/${myCountryToken}${hashParams}`);

console.log("\n⏰ Expires:", new Date(exp * 1000).toISOString());
console.log("=".repeat(70));

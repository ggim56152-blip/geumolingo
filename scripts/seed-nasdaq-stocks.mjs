import { drizzle } from "drizzle-orm/mysql2";
import { stocks } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

// 인기 있는 나스닥 종목들
const nasdaqStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 19000, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 41000, sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 14000, sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 19000, sector: "Consumer" },
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 87000, sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 24000, sector: "Automotive" },
  { symbol: "META", name: "Meta Platforms Inc.", price: 50000, sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", price: 24000, sector: "Entertainment" },
  { symbol: "AVGO", name: "Broadcom Inc.", price: 16000, sector: "Technology" },
  { symbol: "ASML", name: "ASML Holding N.V.", price: 64000, sector: "Technology" },
  { symbol: "AMD", name: "Advanced Micro Devices Inc.", price: 18000, sector: "Technology" },
  { symbol: "INTC", name: "Intel Corporation", price: 3500, sector: "Technology" },
  { symbol: "QCOM", name: "QUALCOMM Incorporated", price: 16500, sector: "Technology" },
  { symbol: "CSCO", name: "Cisco Systems Inc.", price: 5200, sector: "Technology" },
  { symbol: "ADBE", name: "Adobe Inc.", price: 54000, sector: "Technology" },
  { symbol: "CRM", name: "Salesforce Inc.", price: 28000, sector: "Technology" },
  { symbol: "ORCL", name: "Oracle Corporation", price: 13500, sector: "Technology" },
  { symbol: "IBM", name: "International Business Machines", price: 18000, sector: "Technology" },
  { symbol: "SAP", name: "SAP SE", price: 11000, sector: "Technology" },
  { symbol: "INTU", name: "Intuit Inc.", price: 60000, sector: "Technology" },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", price: 6500, sector: "FinTech" },
  { symbol: "SQ", name: "Block Inc.", price: 8000, sector: "FinTech" },
  { symbol: "COIN", name: "Coinbase Global Inc.", price: 10500, sector: "Cryptocurrency" },
  { symbol: "UBER", name: "Uber Technologies Inc.", price: 7500, sector: "Transportation" },
  { symbol: "LYFT", name: "Lyft Inc.", price: 1400, sector: "Transportation" },
  { symbol: "AIRB", name: "Airbnb Inc.", price: 17000, sector: "Travel" },
  { symbol: "BOOKING", name: "Booking Holdings Inc.", price: 37000, sector: "Travel" },
  { symbol: "ABNB", name: "Airbnb Inc.", price: 17000, sector: "Travel" },
  { symbol: "SPOT", name: "Spotify Technology S.A.", price: 18000, sector: "Entertainment" },
  { symbol: "DASH", name: "DoorDash Inc.", price: 13000, sector: "Delivery" },
  { symbol: "SHOP", name: "Shopify Inc.", price: 8500, sector: "E-commerce" },
  { symbol: "ETSY", name: "Etsy Inc.", price: 6500, sector: "E-commerce" },
  { symbol: "PINS", name: "Pinterest Inc.", price: 3200, sector: "Social Media" },
  { symbol: "SNAP", name: "Snap Inc.", price: 1200, sector: "Social Media" },
  { symbol: "TTD", name: "The Trade Desk Inc.", price: 9500, sector: "Advertising" },
  { symbol: "MSTR", name: "MicroStrategy Inc.", price: 28000, sector: "Software" },
  { symbol: "OKTA", name: "Okta Inc.", price: 7500, sector: "Cybersecurity" },
  { symbol: "CRWD", name: "CrowdStrike Holdings Inc.", price: 35000, sector: "Cybersecurity" },
  { symbol: "ZM", name: "Zoom Video Communications Inc.", price: 6500, sector: "Communication" },
  { symbol: "DOCU", name: "DocuSign Inc.", price: 2500, sector: "Software" },
];

async function seedStocks() {
  try {
    console.log("Starting to seed NASDAQ stocks...");

    for (const stock of nasdaqStocks) {
      await db.insert(stocks).values({
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.price * 100, // Store as cents
        description: `${stock.name} - ${stock.sector} sector`,
        sector: stock.sector,
      });
    }

    console.log(`✅ Successfully seeded ${nasdaqStocks.length} NASDAQ stocks!`);
  } catch (error) {
    console.error("❌ Error seeding stocks:", error);
    process.exit(1);
  }
}

seedStocks();

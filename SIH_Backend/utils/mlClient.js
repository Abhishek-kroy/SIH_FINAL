// Lightweight client to call the external ML credit scoring service
// Expects Node 18+ with global fetch available

const ML_PREDICT_URL = process.env.ML_PREDICT_URL || "https://sih-ml-arj1.onrender.com/predict";

// Default feature values to backfill missing inputs for ML scoring
const DEFAULT_FEATURES = {
  region: "Rural",
  household_size: 6,
  num_loans: 1,
  avg_loan_amount: 20785,
  on_time_ratio: 0.8,
  avg_days_late: 11,
  max_dpd: 33,
  num_defaults: 0,
  avg_kwh_30d: 114,
  var_kwh_30d: 128,
  seasonality_index: 1,
  avg_recharge_amount: 194,
  recharge_freq_30d: 6,
  last_recharge_days: 4,
  bill_on_time_ratio: 0.65,
  avg_bill_delay: 1,
  avg_bill_amount: 1648,
  education_level: "Secondary",
  occupation: "Agriculture",
  asset_score: 7,
};

async function callMlPredict(payload) {
  const response = await fetch(ML_PREDICT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  console.log("response", response);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`ML service error ${response.status}: ${text}`);
  }

  return await response.json();
}

// Build payload as required by the ML model from user record
function coalesce(value, fallback) {
  return value === undefined || value === null || value === "" ? fallback : value;
}

function toNumberOrDefault(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : Number(fallback);
}

function buildPayloadFromUser(user) {
  return {
    region: coalesce(user.region, DEFAULT_FEATURES.region),
    household_size: toNumberOrDefault(user.household_size, DEFAULT_FEATURES.household_size),
    num_loans: toNumberOrDefault(user.num_loans ?? (user.loanHistory?.length), DEFAULT_FEATURES.num_loans),
    avg_loan_amount: toNumberOrDefault(user.avg_loan_amount, DEFAULT_FEATURES.avg_loan_amount),
    on_time_ratio: toNumberOrDefault(user.on_time_ratio, DEFAULT_FEATURES.on_time_ratio),
    avg_days_late: toNumberOrDefault(user.avg_days_late, DEFAULT_FEATURES.avg_days_late),
    max_dpd: toNumberOrDefault(user.max_dpd, DEFAULT_FEATURES.max_dpd),
    num_defaults: toNumberOrDefault(user.num_defaults, DEFAULT_FEATURES.num_defaults),
    avg_kwh_30d: toNumberOrDefault(user.avg_kwh_30d, DEFAULT_FEATURES.avg_kwh_30d),
    var_kwh_30d: toNumberOrDefault(user.var_kwh_30d, DEFAULT_FEATURES.var_kwh_30d),
    seasonality_index: toNumberOrDefault(user.seasonality_index, DEFAULT_FEATURES.seasonality_index),
    avg_recharge_amount: toNumberOrDefault(user.avg_recharge_amount, DEFAULT_FEATURES.avg_recharge_amount),
    recharge_freq_30d: toNumberOrDefault(user.recharge_freq_30d, DEFAULT_FEATURES.recharge_freq_30d),
    last_recharge_days: toNumberOrDefault(user.last_recharge_days, DEFAULT_FEATURES.last_recharge_days),
    bill_on_time_ratio: toNumberOrDefault(user.bill_on_time_ratio, DEFAULT_FEATURES.bill_on_time_ratio),
    avg_bill_delay: toNumberOrDefault(user.avg_bill_delay, DEFAULT_FEATURES.avg_bill_delay),
    avg_bill_amount: toNumberOrDefault(user.avg_bill_amount, DEFAULT_FEATURES.avg_bill_amount),
    education_level: coalesce(user.education_level, DEFAULT_FEATURES.education_level),
    occupation: coalesce(user.occupation, DEFAULT_FEATURES.occupation),
    asset_score: toNumberOrDefault(user.asset_score, DEFAULT_FEATURES.asset_score),
  };
}

module.exports = { callMlPredict, buildPayloadFromUser };



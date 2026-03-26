import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const pageLoadTrend = new Trend("page_load_time");

// Test configuration — simulates 5000 users ramping up
export const options = {
  stages: [
    { duration: "30s", target: 50 },    // Warm up: ramp to 50 users
    { duration: "1m", target: 200 },    // Ramp to 200 users
    { duration: "1m", target: 500 },    // Ramp to 500 users
    { duration: "2m", target: 500 },    // Hold at 500 concurrent
    { duration: "1m", target: 1000 },   // Push to 1000
    { duration: "1m", target: 1000 },   // Hold at 1000
    { duration: "30s", target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"],   // 95% of requests under 3s
    http_req_failed: ["rate<0.05"],      // Less than 5% errors
    errors: ["rate<0.05"],
  },
};

const BASE_URL = __ENV.TARGET_URL || "https://staging.bookyourdance.com";

export default function () {
  // Scenario 1: Browse homepage (most common)
  group("Homepage", () => {
    const res = http.get(BASE_URL, { tags: { page: "home" } });
    pageLoadTrend.add(res.timings.duration);
    const success = check(res, {
      "homepage status 200": (r) => r.status === 200,
      "homepage loads under 3s": (r) => r.timings.duration < 3000,
    });
    errorRate.add(!success);
  });

  sleep(Math.random() * 2 + 1); // 1-3s think time

  // Scenario 2: Browse workshops listing
  group("Browse Workshops", () => {
    const res = http.get(`${BASE_URL}/workshops`, { tags: { page: "workshops" } });
    pageLoadTrend.add(res.timings.duration);
    const success = check(res, {
      "workshops status 200": (r) => r.status === 200,
      "workshops loads under 3s": (r) => r.timings.duration < 3000,
    });
    errorRate.add(!success);
  });

  sleep(Math.random() * 2 + 1);

  // Scenario 3: View a workshop detail (simulated with a random path)
  group("Workshop Detail", () => {
    // First get the workshops page to find workshop IDs
    const listRes = http.get(`${BASE_URL}/workshops`, { tags: { page: "workshops_list" } });

    // Try to extract a workshop link from the page
    const match = listRes.body.match(/\/workshops\/([a-z0-9]+)/);
    if (match) {
      const workshopRes = http.get(`${BASE_URL}/workshops/${match[1]}`, { tags: { page: "workshop_detail" } });
      pageLoadTrend.add(workshopRes.timings.duration);
      const success = check(workshopRes, {
        "workshop detail status 200": (r) => r.status === 200,
        "workshop detail loads under 3s": (r) => r.timings.duration < 3000,
      });
      errorRate.add(!success);
    }
  });

  sleep(Math.random() * 3 + 1); // 1-4s think time

  // Scenario 4: API health check
  group("API Session Check", () => {
    const res = http.get(`${BASE_URL}/api/auth/session`, { tags: { page: "api_session" } });
    const success = check(res, {
      "session API responds": (r) => r.status === 200,
      "session API under 1s": (r) => r.timings.duration < 1000,
    });
    errorRate.add(!success);
  });

  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  const med = data.metrics.http_req_duration.values.med;
  const p95 = data.metrics.http_req_duration.values["p(95)"];
  const p99 = data.metrics.http_req_duration.values["p(99)"];
  const totalReqs = data.metrics.http_reqs.values.count;
  const failRate = data.metrics.http_req_failed.values.rate;

  console.log("\n========== LOAD TEST SUMMARY ==========");
  console.log(`Total Requests:  ${totalReqs}`);
  console.log(`Median Response: ${med.toFixed(0)}ms`);
  console.log(`P95 Response:    ${p95.toFixed(0)}ms`);
  console.log(`P99 Response:    ${p99.toFixed(0)}ms`);
  console.log(`Failure Rate:    ${(failRate * 100).toFixed(2)}%`);
  console.log("========================================\n");

  return {};
}

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");

export const options = {
  stages: [
    { duration: "20s", target: 50 },
    { duration: "30s", target: 200 },
    { duration: "30s", target: 500 },
    { duration: "20s", target: 500 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<5000"],
    http_req_failed: ["rate<0.10"],
  },
};

const BASE_URL = __ENV.TARGET_URL || "https://staging.bookyourdance.com";

export default function () {
  group("Homepage", () => {
    const res = http.get(BASE_URL);
    check(res, { "home ok": (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  sleep(Math.random() * 1.5 + 0.5);

  group("Browse", () => {
    const res = http.get(`${BASE_URL}/workshops`);
    check(res, { "browse ok": (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  sleep(Math.random() * 1.5 + 0.5);

  group("Session API", () => {
    const res = http.get(`${BASE_URL}/api/auth/session`);
    check(res, { "session ok": (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  sleep(Math.random() * 1 + 0.5);
}

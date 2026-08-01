import { getApiConfig } from "@/src/lib/api/client-config";
import { isAuthFailure } from "@/src/lib/api/parse";
import { client } from "@/src/lib/api/generated/client.gen";

const UNAUTHENTICATED_PATHS = new Set([
  "/api/health",
  "/api/device-pairing",
  "/api/device-pairing/poll",
  "/api/device-pairing/approve",
]);

let unauthorizedHandler: (() => void | Promise<void>) | null = null;
let suppressUnauthorized = false;
let handlingUnauthorized = false;
let installed = false;

function isUnauthorizedPath(request: Request) {
  try {
    const pathname = new URL(request.url).pathname;
    return UNAUTHENTICATED_PATHS.has(pathname);
  } catch {
    return false;
  }
}

export function registerUnauthorizedHandler(handler: () => void | Promise<void>) {
  unauthorizedHandler = handler;
}

export async function runWithUnauthorizedSuppressed<T>(fn: () => Promise<T>): Promise<T> {
  suppressUnauthorized = true;
  try {
    return await fn();
  } finally {
    suppressUnauthorized = false;
  }
}

async function notifyUnauthorized() {
  if (handlingUnauthorized || suppressUnauthorized || !getApiConfig().apiKey || !unauthorizedHandler) {
    return;
  }

  handlingUnauthorized = true;
  try {
    await unauthorizedHandler();
  } finally {
    handlingUnauthorized = false;
  }
}

export function installAuthInterceptor() {
  if (installed) return;
  installed = true;

  client.interceptors.response.use(async (response, request) => {
    if (isAuthFailure(response) && !suppressUnauthorized && getApiConfig().apiKey && !isUnauthorizedPath(request)) {
      void notifyUnauthorized();
    }
    return response;
  });
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

// ─── Token refresh queue ───────────────────────────────────────
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  path: string;
  options: RequestOptions;
}

let failedQueue: QueueItem[] = [];

function processQueue(error: unknown) {
  const queue = failedQueue;
  failedQueue = [];

  for (const { resolve, reject, path, options } of queue) {
    if (error) {
      reject(error);
    } else {
      request(path, options).then(resolve).catch(reject);
    }
  }
}

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

// ─── Core request function ─────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  const fetchOptions: RequestInit = {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers as Record<string, string>),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const res = await fetch(path, fetchOptions);

  // ── On 401, attempt token refresh and retry ──
  if (res.status === 401) {
    if (!isRefreshing) {
      const refreshed = await attemptRefresh();

      if (refreshed) {
        processQueue(null);
        // Retry original request
        const retryRes = await fetch(path, fetchOptions);
        return handleResponse<T>(retryRes);
      }

      processQueue(new ApiError(401, "Session expired. Please log in again."));
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Session expired. Please log in again.");
    }

    // Another refresh is in progress — queue this request
    return new Promise<T>((resolve, reject) => {
      failedQueue.push({
        resolve: resolve as (value: unknown) => void,
        reject,
        path,
        options,
      });
    });
  }

  return handleResponse<T>(res);
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorData: unknown;
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: res.statusText };
    }
    const message =
      (errorData as { message?: string })?.message ?? "Request failed";
    throw new ApiError(res.status, message, errorData);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: "GET", ...options }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "POST", body, ...options }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { method: "PATCH", body, ...options }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: "DELETE", ...options }),
};

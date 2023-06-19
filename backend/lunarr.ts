/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface HandlersResponseHello {
  hello?: string;
}

export interface ModelsBelongsToCollection {
  backdrop_path?: string;
  id?: number;
  name?: string;
  poster_path?: string;
}

export interface ModelsMovieMetadata {
  adult?: boolean;
  backdrop_path?: string;
  genres?: ModelsTMDbGenre[];
  homepage?: string;
  imdb_id?: string;
  original_language?: string;
  original_title?: string;
  overview?: string;
  popularity?: number;
  poster_path?: string;
  release_date?: string;
  revenue?: number;
  runtime?: number;
  spoken_languages?: ModelsTMDbSpokenLanguage[];
  status?: string;
  tagline?: string;
  title?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;
}

export interface ModelsMovieWithFiles {
  belongs_to_collection?: ModelsBelongsToCollection;
  location?: string;
  metadata?: ModelsMovieMetadata;
  tmdb_id?: number;
}

export interface ModelsSubtitleSettings {
  enabled?: boolean;
  language?: string;
}

export interface ModelsTMDbGenre {
  id?: number;
  name?: string;
}

export interface ModelsTMDbSpokenLanguage {
  iso_639_1?: string;
  name?: string;
}

export interface ModelsTranscodingSettings {
  bitrate?: number;
  codec?: string;
  resolution?: string;
}

export interface ModelsUserAccounts {
  api_key?: string;
  current_status?: string;
  displayname?: string;
  email?: string;
  last_seen_at?: string;
  password?: string;
  role?: ModelsUserRole;
  settings?: ModelsUserSettings;
  sex?: string;
  username?: string;
}

export enum ModelsUserRole {
  UserRoleAdmin = "admin",
  UserRoleSuperuser = "superuser",
  UserRoleSubscriber = "subscriber",
}

export interface ModelsUserSettings {
  subtitle?: ModelsSubtitleSettings;
  theme?: string;
  transcoding?: ModelsTranscodingSettings;
}

export interface SchemaErrorResponse {
  message?: string;
  status?: string;
}

export interface SchemaListsResponse {
  limit?: number;
  page_current?: number;
  page_total?: number;
  results?: ModelsMovieWithFiles[];
}

export interface SchemaUserLogin {
  /**
   * @minLength 6
   * @maxLength 32
   */
  password: string;
  /**
   * @minLength 2
   * @maxLength 16
   */
  username: string;
}

export interface SchemaUserLoginResponse {
  api_key?: string;
  status?: string;
}

export interface SchemaUserSignup {
  /**
   * @minLength 1
   * @maxLength 48
   */
  displayname: string;
  email: string;
  /**
   * @minLength 6
   * @maxLength 32
   */
  password: string;
  sex?: "male" | "female" | "unknown";
  /**
   * @minLength 2
   * @maxLength 16
   */
  username: string;
}

export interface SchemaUserSignupResponse {
  message?: string;
  status?: number;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Lunarr API
 * @version 1.0
 * @contact
 *
 * Swagger for Lunarr API endpoints
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Get a list of movies based on the search query and pagination parameters.
     *
     * @tags movies
     * @name MoviesList
     * @summary Get Movie Lists
     * @request GET:/api/movies
     * @response `200` `SchemaListsResponse` OK
     * @response `400` `SchemaErrorResponse` Bad Request
     * @response `500` `SchemaErrorResponse` Internal Server Error
     */
    moviesList: (
      query?: {
        /**
         * Page number
         * @default 1
         */
        page?: number;
        /**
         * Number of movies per page
         * @default 20
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SchemaListsResponse, SchemaErrorResponse>({
        path: `/api/movies`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Stream a movie based on the TMDb ID.
     *
     * @tags movies
     * @name MoviesStreamDetail
     * @summary Stream a movie
     * @request GET:/api/movies/{tmdb_id}/stream
     * @response `200` `File` OK
     * @response `400` `SchemaErrorResponse` Bad Request
     * @response `404` `SchemaErrorResponse` Not Found
     */
    moviesStreamDetail: (tmdbId: number, params: RequestParams = {}) =>
      this.request<File, SchemaErrorResponse>({
        path: `/api/movies/${tmdbId}/stream`,
        method: "GET",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Retrieve all users.
     *
     * @tags users
     * @name UsersList
     * @summary Get All Users
     * @request GET:/api/users
     * @response `200` `(ModelsUserAccounts)[]` OK
     * @response `500` `SchemaErrorResponse` Internal Server Error
     */
    usersList: (params: RequestParams = {}) =>
      this.request<ModelsUserAccounts[], SchemaErrorResponse>({
        path: `/api/users`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve the user data for the authenticated user.
     *
     * @tags users
     * @name UsersMeList
     * @summary Get User Data
     * @request GET:/api/users/me
     * @response `200` `ModelsUserAccounts` OK
     * @response `404` `SchemaErrorResponse` Not Found
     * @response `500` `SchemaErrorResponse` Internal Server Error
     */
    usersMeList: (params: RequestParams = {}) =>
      this.request<ModelsUserAccounts, SchemaErrorResponse>({
        path: `/api/users/me`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  auth = {
    /**
     * @description Login
     *
     * @tags auth
     * @name LoginCreate
     * @summary Login
     * @request POST:/auth/login
     * @response `200` `SchemaUserLoginResponse` OK
     * @response `400` `SchemaErrorResponse` Bad Request
     */
    loginCreate: (loginReq: SchemaUserLogin, params: RequestParams = {}) =>
      this.request<SchemaUserLoginResponse, SchemaErrorResponse>({
        path: `/auth/login`,
        method: "POST",
        body: loginReq,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Creates a new user account.
     *
     * @tags auth
     * @name SignupCreate
     * @summary User Signup
     * @request POST:/auth/signup
     * @response `201` `SchemaUserSignupResponse` Created
     * @response `400` `SchemaErrorResponse` Bad Request
     * @response `500` `SchemaErrorResponse` Internal Server Error
     */
    signupCreate: (userReq: SchemaUserSignup, params: RequestParams = {}) =>
      this.request<SchemaUserSignupResponse, SchemaErrorResponse>({
        path: `/auth/signup`,
        method: "POST",
        body: userReq,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  hello = {
    /**
     * @description Hello
     *
     * @tags root
     * @name HelloList
     * @summary Hello
     * @request GET:/hello
     * @response `200` `HandlersResponseHello` OK
     */
    helloList: (params: RequestParams = {}) =>
      this.request<HandlersResponseHello, any>({
        path: `/hello`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}

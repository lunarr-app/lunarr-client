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

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, HeadersDefaults, ResponseType } from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method && this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
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
        /** Search by movie title */
        title?: string;
        /** Search by movie release year */
        year?: string;
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

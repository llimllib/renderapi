/* eslint-disable no-await-in-loop, no-constant-condition, no-param-reassign */
import { debug as Debug } from "debug";

const debug = Debug("renderapi");

const RENDER_API = "https://api.render.com/v1";

/**
 * make a GET request and return all objects from a paged endpoint
 *
 * Any parameters passed in whose values are falsy will not be passed. For
 * example, if you pass `{ limit: '15', name: undefined, id: 'bananas' }` as
 * `params`, this function will turn the param array into
 * `?limit=15&id=bananas`, omitting `name`
 *
 * @param token - a valid render API token
 * @param method - the API method to call (ex: /services)
 * @param params - an object containing GET parameters to pass
 * @returns a list of all objects in all pages of the response
 * */
export async function renderGetPaged(
  token: string,
  method: string,
  params: Record<string, string | undefined> = {},
): Promise<any[]> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }
  if (!params.limit) {
    params.limit = "100";
  }

  // remove undefined params, this lets our callers have a nicer API
  const filteredParams: Record<string, string> = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .reduce(
      (obj, [key, value]) => {
        obj[key] = value as string;
        return obj;
      },
      {} as Record<string, string>,
    );

  let objects: any[] = [];

  // fetch results until there are no more results, then return all objects
  while (true) {
    const url = `${RENDER_API}/${method}?${new URLSearchParams(filteredParams)}`;
    debug("fetching", url);
    const res = await fetch(url, {
      method: "GET",
      headers,
    });
    debug(`received ${res.statusText}`);
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(
        `Unable to fetch data from render ${res.statusText} ${process.env.RENDER_API_KEY}:\n${errorBody}`,
      );
    }

    const resultObjects = await res.json();
    if (resultObjects.length === 0) {
      break;
    }

    // https://api-docs.render.com/reference/pagination
    filteredParams.cursor = resultObjects[resultObjects.length - 1].cursor;
    objects = objects.concat(resultObjects);
  }

  return objects;
}

/**
 * make a GET request and return an object
 *
 * Any parameters passed in whose values are falsy will not be passed. For
 * example, if you pass `{ limit: '15', name: undefined, id: 'bananas' }` as
 * `params`, this function will turn the param array into
 * `?limit=15&id=bananas`, omitting `name`
 *
 * @param token - a valid render API token
 * @param method - the API method to call (ex: /services/srv-abc123456)
 * @param params - an object containing GET parameters to pass
 * @returns a list of all objects in all pages of the response
 * */
export async function renderGet(
  token: string,
  method: string,
  params: Record<string, string | string[] | undefined> = {},
): Promise<any> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  if (!params.limit) {
    params.limit = "100";
  }

  // remove undefined params and empty arrays, this lets our callers have a nicer API
  const filteredParams: Record<string, string | string[]> = Object.entries(
    params,
  )
    .filter(
      ([, value]) =>
        value !== undefined && !(Array.isArray(value) && value.length === 0),
    )
    .reduce(
      (obj, [key, value]) => {
        obj[key] = value as string | string[]; // Add type assertion here
        return obj;
      },
      {} as Record<string, string | string[]>,
    );

  const searchParams = new URLSearchParams();

  Object.entries(filteredParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // join array values with comma and add as a single parameter
      searchParams.append(key, value.join(","));
    } else {
      searchParams.append(key, value);
    }
  });

  const url = `${RENDER_API}/${method}?${searchParams.toString()}`;

  debug("fetching", url);
  const res = await fetch(url, {
    method: "GET",
    headers,
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Unable to fetch data from render ${res.statusText} ${process.env.RENDER_API_KEY}:\n${errorBody}`,
    );
  }

  return res.json();
}

/**
 * make a POST request and return the response
 *
 *
 * @param token - a valid render API token
 * @param method - the API method to call (ex: /services/srv-abc123456)
 * @param body - an object to post
 * @returns the response
 * */
export async function renderPost<T>(
  token: string,
  method: string,
  body: Record<string, string | undefined> = {},
): Promise<T> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }

  const url = `${RENDER_API}/${method}`;
  debug("Posting", url);
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Unable to fetch data from render ${res.statusText} ${process.env.RENDER_API_KEY}:\n${errorBody}`,
    );
  }

  return res.json();
}

export type PlanType =
  | "custom"
  | "free"
  | "pro_max"
  | "pro_plus"
  | "pro_ultra"
  | "pro"
  | "standard_plus"
  | "standard"
  | "starter_plus"
  | "starter";
export type ServiceType =
  | "background_worker"
  | "cron_job"
  | "private_service"
  | "static_site"
  | "web_service";

export interface StaticSiteDetails {
  buildCommand: string;
  buildPlan: PlanType;
  parentServer: {
    id: string;
    name: string;
  };
  previews: {
    generation: "off" | "on";
  };
  publishPath: string;
  url: string;
}

// TODO
export type WebServiceDetails = any;
export type BackgroundJobDetails = any;
export type CronJobDetails = any;
export type PrivateServiceDetails = any;

/** return a serviceID if the string is of ServiceID format */
export function isServiceID(s: string): s is ServiceID {
  return s.startsWith("srv-");
}
export type ServiceID = `srv-${string}`;

export function isEnvironmentID(s: string): s is EnvironmentID {
  return s.startsWith("evm-");
}
export type EnvironmentID = `evm-${string}`;

export function isCronID(s: string): s is CronID {
  return s.startsWith("crn-");
}
export type CronID = `crn-${string}`;

export function isJobID(s: string): s is JobID {
  return s.startsWith("job-");
}
export type JobID = `job-${string}`;

export function isRedisID(s: string): s is JobID {
  return s.startsWith("job-");
}
export type RedisID = `red-${string}`;

export function isPostgresID(s: string): s is JobID {
  return s.startsWith("job-");
}
export type PostgresID = `dpg-${string}`;

export interface Service {
  autoDeploy: "no" | "yes";
  branch: string;
  buildFilter: {
    ignoredPaths: string[];
    paths: string[];
  };
  createdAt: string;
  dashboardUrl: string;
  environmentId: EnvironmentID;
  id: ServiceID;
  imagePath: string;
  name: string;
  notifyOnFail: "default" | "ignore" | "notify";
  ownerId: string;
  registryCredential: {
    id: string;
    name: string;
  };
  repo: string;
  rootDir: string;
  serviceDetails:
    | BackgroundJobDetails
    | CronJobDetails
    | PrivateServiceDetails
    | StaticSiteDetails
    | WebServiceDetails;
  slug: string;
  suspended: "not_suspended" | "suspended";
  suspenders: string[];
  type: ServiceType;
  updatedAt: string;
}

export interface EnvVar {
  key: string;
  value: string;
}

export interface ServiceCursor {
  cursor: string;
  service: Service;
}

export interface EnvVarCursor {
  cursor: string;
  envVar: EnvVar;
}

export interface EnvGroupCursor {
  cursor: string;
  envGroup: EnvGroup;
}

/** return a Service given an ID
 *
 * https://api-docs.render.com/reference/retrieve-service
 */
export async function getService(
  token: string,
  serviceID: ServiceID,
): Promise<Service> {
  return renderGet(token, `/services/${serviceID}`);
}

/** return a list of Services.
 *
 * If nameFilter is given, all services will be retrieved and filtered for
 * name matches. This does not use the render filter parameter because only
 * exact matches are supported with that filter.
 *
 * https://api-docs.render.com/reference/list-services
 */
export async function getServices(
  token: string,
  nameFilter: string = "",
): Promise<Service[]> {
  const serviceObjs = (await renderGetPaged(
    token,
    "services",
  )) as ServiceCursor[];
  let services = serviceObjs.map((s) => s.service);
  if (nameFilter !== "") {
    services = services.filter((s) => s.name.match(nameFilter));
  }
  return services;
}

export async function determineService(
  apiKey: string,
  serviceIDOrName: string,
): Promise<Service> {
  if (isServiceID(serviceIDOrName)) {
    return getService(apiKey, serviceIDOrName);
  }
  // If it's not an ID, get all services and filter them by the name
  const services = await getServices(apiKey, serviceIDOrName);

  if (services.length === 0) {
    throw new Error(`No services found with ID or name ${serviceIDOrName}`);
  } else if (services.length !== 1) {
    // check for exact match for cases like "foo-prod" because things like "foo-prod-mdx" exist
    const exactMatch = services.find((s) => s.name === serviceIDOrName);
    if (exactMatch) {
      return exactMatch;
    }
    throw new Error(
      `Too many services found with ${serviceIDOrName}:\n${services.map((s) => `${s.name} (${s.id})`).join("  \n")}`,
    );
  }

  return services[0];
}

/** return the environment variables for a service
 *
 * This will only return the environment variables _directly set_ on the
 * service, not environment variables in the services' linked environment
 * groups
 */
export async function getEnvVarsForService(
  token: string,
  serviceId: ServiceID,
): Promise<EnvVar[]> {
  return (
    (await renderGetPaged(
      token,
      `services/${serviceId}/env-vars`,
    )) as EnvVarCursor[]
  ).map((e) => e.envVar);
}
export function isEnvironmentGroupID(s: string): s is EnvironmentGroupID {
  return s.startsWith("evg-");
}
export type EnvironmentGroupID = `evg-${string}`;

export interface EnvGroup {
  createdAt: string;
  environmentID: EnvironmentID;
  id: EnvironmentGroupID;
  name: string;
  ownerId: string;
  serviceLinks: { id: ServiceID; name: string; type: ServiceType }[];
  updatedAt: string;
}

export interface EnvGroupDetails extends EnvGroup {
  envVars: { key: string; value: string }[];
  secretFiles: { content: string; name: string }[];
}

/** return all environment groups
 *
 * https://api-docs.render.com/reference/list-env-groups
 */
export async function getEnvGroups(
  token: string,
  nameFilter: string = "",
): Promise<EnvGroup[]> {
  let envGroups = (
    (await renderGetPaged(token, "env-groups")) as EnvGroupCursor[]
  ).map((e) => e.envGroup);
  if (nameFilter !== "") {
    envGroups = envGroups.filter((e) => e.name.match(nameFilter));
  }
  return envGroups;
}

/** return an environment group by name
 *
 * https://api-docs.render.com/reference/retrieve-env-group
 */
export async function getEnvGroup(
  token: string,
  envGroupID: EnvironmentGroupID,
): Promise<EnvGroupDetails> {
  return renderGet(token, `env-groups/${envGroupID}`);
}

export function isRegistryCredentialID(s: string): s is EnvironmentGroupID {
  return s.startsWith("rgc-");
}
export type RegistryCredentialID = `rgc-${string}`;
export interface RegistryCredential {
  id: RegistryCredentialID;
  name: string;
  registry: string;
  updatedAt: string;
  username: string;
}

/** Return the registry credentials visible to the user
 *
 * This API call is a weird one, as the docs indicate that it's a paged API
 * call but it doesn't appear to actually be, as it doesn't return a cursor
 * envelope
 *
 * @ref https://api-docs.render.com/reference/list-registry-credentials
 */
export async function getRegistryCredentials(
  token: string,
  filter: string = "",
): Promise<RegistryCredential[]> {
  let credentials = (await renderGet(
    token,
    "registrycredentials",
  )) as RegistryCredential[];
  if (filter !== "") {
    credentials = credentials.filter((c) => c.name.match(filter));
  }
  return credentials;
}

export interface Job {
  createdAt: string;
  finishedAt: string;
  id: string;
  planId: string;
  serviceId: string;
  startCommand: string;
  startedAt: string;
  status: "failed" | "pending" | "running" | "succeeded";
}
export interface JobCursor {
  cursor: string;
  job: Job;
}

/** Return list of jobs for a service
 *
 * https://api-docs.render.com/reference/list-job
 */
export async function listJobs(
  token: string,
  itemId: CronID | ServiceID,
): Promise<Job[]> {
  return (
    (await renderGetPaged(token, `services/${itemId}/jobs`)) as JobCursor[]
  ).map((e) => e.job);
}

export type ScalingResourceID = ServiceID | RedisID | PostgresID;

export interface InstanceCount {
  labels: { value: ScalingResourceID }[];
  values: { timestamp: string; value: number }[];
}

/** Return instance count metrics for a service
 *
 * @see https://api-docs.render.com/reference/get-instance-count
 *
 * @param token - API token for authentication
 * @param resources - Resource IDs to query (service IDs, Postgres IDs, or Redis IDs).
 * @param startTime - Epoch/Unix timestamp of start of time range to return. Defaults to now() - 1 hour.
 * @param endTime - Epoch/Unix timestamp of end of time range to return. Defaults to now().
 * @param resolutionSeconds - The resolution of the returned data in seconds. Must be ≥ 30. Defaults to 60.
 * @returns Promise resolving to an array of InstanceCount objects
 */
export async function instanceCount(
  token: string,
  resources: ScalingResourceID[],
  startTime?: number,
  endTime?: number,
  resolutionSeconds?: number,
) {
  return (await renderGet(token, `metrics/instance-count`, {
    endTime: endTime?.toString(),
    resolutionSeconds: resolutionSeconds?.toString(),
    resource: resources as string[],
    startTime: startTime?.toString(),
  })) as InstanceCount[];
}

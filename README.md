# RenderAPI

A TypeScript library for interacting with the Render.com API.

## Installation

```bash
npm install renderapi
```

## Features

- Fetch services, environment variables, and environment groups
- Manage registry credentials
- Monitor jobs and instance metrics
- Support for pagination and filtering
- Type-safe interfaces for Render resources

## Usage

### Authentication

All API calls require a Render API token:

```typescript
import { getServices } from "@llimllib/renderapi";

const token = process.env.RENDER_API_KEY;
const services = await getServices(token);
```

### Services

```typescript
import {
  getServices,
  getService,
  determineService,
  ServiceID,
} from "@llimllib/renderapi";

// Get all services
const allServices = await getServices(token);

// Get services with name matching a pattern
const filteredServices = await getServices(token, "api-");

// Get a specific service by ID
const serviceId: ServiceID = "srv-abc123456";
const service = await getService(token, serviceId);

// Get a service by ID or name
const myService = await determineService(token, "my-service-name");
```

### Environment Variables

```typescript
import { getEnvVarsForService } from "@llimllib/renderapi";

// Get environment variables for a service
const envVars = await getEnvVarsForService(token, "srv-abc123456");
```

### Environment Groups

```typescript
import { getEnvGroups, getEnvGroup } from "@llimllib/renderapi";

// Get all environment groups
const allGroups = await getEnvGroups(token);

// Get environment groups with name matching a pattern
const filteredGroups = await getEnvGroups(token, "prod-");

// Get a specific environment group with variables
const groupDetails = await getEnvGroup(token, "evg-abc123456");
```

### Registry Credentials

```typescript
import { getRegistryCredentials } from "@llimllib/renderapi";

// Get all registry credentials
const credentials = await getRegistryCredentials(token);

// Filter registry credentials by name
const filteredCredentials = await getRegistryCredentials(token, "docker-");
```

### Jobs

```typescript
import { listJobs } from "@llimllib/renderapi";

// Get jobs for a service
const jobs = await listJobs(token, "srv-abc123456");
```

### Metrics

```typescript
import { instanceCount } from "@llimllib/renderapi";

// Get instance count metrics for services
const metrics = await instanceCount(
  token,
  ["srv-abc123456", "srv-def789012"],
  new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
  new Date().toISOString()
  300, // 5-minute resolution
);
```

## Type Safety

This library provides TypeScript interfaces and type guards for Render resources:

```typescript
import {
  isServiceID,
  isEnvironmentID,
  isEnvironmentGroupID,
  Service,
  EnvVar,
  EnvGroup,
} from "@llimllib/renderapi";

// Check if a string is a valid service ID
if (isServiceID(id)) {
  // id is now typed as ServiceID
}
```

## License

MIT
